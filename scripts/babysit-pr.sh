#!/usr/bin/env bash
# babysit-pr.sh
#
# 指定 PR の CI と merge state を確認し、すべて緑なら squash merge する。
# OpenClaw / クラウドターミナルから別セッションが状況確認 → マージするのに使う想定。
#
# Usage:
#   ./scripts/babysit-pr.sh <PR#>             # 一度だけチェック → 緑ならマージ
#   ./scripts/babysit-pr.sh <PR#> --wait      # CI 完了まで待ってからマージ (poll: 15s)
#   ./scripts/babysit-pr.sh <PR#> --check     # 状況確認のみ、マージしない
#   ./scripts/babysit-pr.sh <PR#> --no-prompt # マージ前の y/N 確認をスキップ
#
# 必要:
#   gh (認証済み, repo scope)
#   jq

set -euo pipefail

REPO="keitaurano-del/logic"
POLL_INTERVAL=15
MAX_WAIT_SEC=$((20 * 60))   # 最大20分

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${CYAN}$*${NC}"; }
ok()   { echo -e "${GREEN}$*${NC}"; }
warn() { echo -e "${YELLOW}$*${NC}"; }
err()  { echo -e "${RED}$*${NC}" >&2; }

PR="${1:-}"
MODE="once"        # once | wait | check
PROMPT=1

if [[ -z "$PR" || "$PR" == "-h" || "$PR" == "--help" ]]; then
  sed -n '2,16p' "$0"
  exit 0
fi

shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wait)      MODE="wait" ;;
    --check)     MODE="check" ;;
    --no-prompt) PROMPT=0 ;;
    *)           err "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "$1 が必要よ"; exit 1; }
}
require_cmd gh
require_cmd jq

# ─────────────────────────────────────────────────────────────
# PR の現状を 1 回 fetch
# 返り値: 0=全部 OK, 1=失敗あり, 2=実行中/待機中, 3=conflict/blocked
# ─────────────────────────────────────────────────────────────
fetch_status() {
  local data
  data=$(gh pr view "$PR" --repo "$REPO" \
    --json number,title,isDraft,mergeable,mergeStateStatus,statusCheckRollup,headRefName,headRefOid)

  echo "$data"
}

print_summary() {
  local data="$1"
  local title isDraft mergeable mergeState head
  title=$(echo "$data" | jq -r '.title')
  isDraft=$(echo "$data" | jq -r '.isDraft')
  mergeable=$(echo "$data" | jq -r '.mergeable')
  mergeState=$(echo "$data" | jq -r '.mergeStateStatus')
  head=$(echo "$data" | jq -r '.headRefName')

  echo
  info "── PR #${PR}: ${title} ──"
  echo "  head:         ${head}"
  echo "  draft:        ${isDraft}"
  echo "  mergeable:    ${mergeable}"
  echo "  mergeState:   ${mergeState}"
  echo "  checks:"
  echo "$data" | jq -r '.statusCheckRollup[]? | "    - \(.name // .context // "?"): \(.status // .state // "?")\(if .conclusion then " / " + .conclusion else "" end)"'
}

evaluate() {
  local data="$1"

  local isDraft mergeable mergeState
  isDraft=$(echo "$data" | jq -r '.isDraft')
  mergeable=$(echo "$data" | jq -r '.mergeable')
  mergeState=$(echo "$data" | jq -r '.mergeStateStatus')

  # conflict / dirty 系
  if [[ "$mergeable" == "CONFLICTING" || "$mergeState" == "DIRTY" ]]; then
    err "merge conflict があるわ。手動で解消が必要。"
    return 3
  fi

  # checks の集計
  local total in_progress failed
  total=$(echo "$data" | jq '.statusCheckRollup | length')
  in_progress=$(echo "$data" | jq '[.statusCheckRollup[]? | select((.status // .state) | IN("IN_PROGRESS","QUEUED","PENDING"))] | length')
  failed=$(echo "$data" | jq '[.statusCheckRollup[]? | select((.conclusion // .state) | IN("FAILURE","TIMED_OUT","CANCELLED","ACTION_REQUIRED","STARTUP_FAILURE"))] | length')

  if [[ "$failed" -gt 0 ]]; then
    err "CI に失敗 (${failed} 件) があるわ。"
    return 1
  fi
  if [[ "$total" -eq 0 ]]; then
    warn "CI run がまだ登録されてない。少し待つ必要あり。"
    return 2
  fi
  if [[ "$in_progress" -gt 0 ]]; then
    warn "CI 実行中 / 待機中: ${in_progress}/${total}"
    return 2
  fi

  # mergeState BLOCKED は branch protection 由来。BEHIND は base 追従が必要。
  if [[ "$mergeState" == "BLOCKED" ]]; then
    err "branch protection で BLOCKED よ。レビュー必須等の設定を確認して。"
    return 1
  fi
  if [[ "$mergeState" == "BEHIND" ]]; then
    warn "base に追従が必要 (BEHIND)。'gh pr update-branch' か手動 rebase/merge。"
    return 1
  fi
  if [[ "$isDraft" == "true" ]]; then
    warn "draft なのでマージできない。先に ready for review にする必要あり。"
    return 1
  fi

  ok "すべて緑、マージ可能"
  return 0
}

# ─────────────────────────────────────────────────────────────
# main loop
# ─────────────────────────────────────────────────────────────
elapsed=0
while true; do
  data=$(fetch_status)
  print_summary "$data"
  evaluate "$data" && state=$? || state=$?

  case "$MODE" in
    check)
      exit $state
      ;;
    once)
      if [[ $state -eq 0 ]]; then break; fi
      err "マージ条件を満たしてないわ。--wait を使うと CI 完了まで待つわよ。"
      exit $state
      ;;
    wait)
      if [[ $state -eq 0 ]]; then break; fi
      if [[ $state -ne 2 ]]; then
        err "回復不能な状態 (state=$state)。手動対応必要。"
        exit $state
      fi
      if (( elapsed >= MAX_WAIT_SEC )); then
        err "${MAX_WAIT_SEC}秒待ったけど CI 完了しなかったわ。"
        exit 124
      fi
      info "${POLL_INTERVAL}秒後に再チェック (経過: ${elapsed}s / 上限: ${MAX_WAIT_SEC}s)"
      sleep "$POLL_INTERVAL"
      elapsed=$((elapsed + POLL_INTERVAL))
      ;;
  esac
done

# ─────────────────────────────────────────────────────────────
# squash merge
# ─────────────────────────────────────────────────────────────
title=$(echo "$data" | jq -r '.title')
info "==> Squash merge: #${PR} ${title}"

if [[ "$PROMPT" -eq 1 ]]; then
  read -rp "本当にマージしていい？ [y/N]: " ans
  if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
    warn "マージ中止。"
    exit 0
  fi
fi

gh pr merge "$PR" --repo "$REPO" --squash --delete-branch=false
ok "✓ #${PR} squash merge 完了"
