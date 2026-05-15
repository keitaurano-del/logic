#!/usr/bin/env bash
# post-merge-otp-deploy.sh
#
# PR #169 (メール OTP ログイン) マージ後のデプロイ作業を 3 ステップで自動化するスクリプト。
#
#   Step 1: Supabase の Magic Link メールテンプレートに {{ .Token }} を埋め込む
#   Step 2: Android 内部配信 (main 自動 push) の最新ステータスを確認
#   Step 3: Render 本番デプロイ workflow を trigger
#
# Usage:
#   ./scripts/post-merge-otp-deploy.sh              # 1 → 2 → 3 を順に対話的に実行
#   ./scripts/post-merge-otp-deploy.sh 1            # Step 1 だけ
#   ./scripts/post-merge-otp-deploy.sh 2            # Step 2 だけ
#   ./scripts/post-merge-otp-deploy.sh 3            # Step 3 だけ
#
# 必要な env:
#   SUPABASE_ACCESS_TOKEN  Supabase Management API トークン (https://supabase.com/dashboard/account/tokens)
#   SUPABASE_PROJECT_REF   対象プロジェクトの ref (Dashboard URL の /project/<ref>/ 部分)
#
# 必要な CLI:
#   gh (認証済み, repo scope)
#   curl
#   jq

set -euo pipefail

REPO="keitaurano-del/logic"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}$*${NC}"; }
ok()      { echo -e "${GREEN}$*${NC}"; }
warn()    { echo -e "${YELLOW}$*${NC}"; }
err()     { echo -e "${RED}$*${NC}" >&2; }

confirm() {
  local prompt="$1"
  local ans
  read -rp "$prompt [y/N]: " ans
  [[ "$ans" == "y" || "$ans" == "Y" ]]
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    err "必要なコマンドが見つからないわ: $cmd"
    exit 1
  fi
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    err "env $name が未設定よ。設定してから再実行してね。"
    exit 1
  fi
}

# ─────────────────────────────────────────────────────────────
# Step 1: Supabase Magic Link テンプレートに {{ .Token }} を埋め込む
# ─────────────────────────────────────────────────────────────
step1_supabase_template() {
  info "== Step 1: Supabase Magic Link テンプレート更新 =="
  require_cmd curl
  require_cmd jq
  require_env SUPABASE_ACCESS_TOKEN
  require_env SUPABASE_PROJECT_REF

  local api="https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth"

  info "現在の auth config を取得中..."
  local current
  current=$(curl -fsS \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    "$api")

  local current_body
  current_body=$(echo "$current" | jq -r '.mailer_templates_magic_link_content // ""')

  if [[ -n "$current_body" ]] && echo "$current_body" | grep -q '{{ \.Token }}'; then
    ok "既に {{ .Token }} が含まれてるわ。スキップ。"
    return 0
  fi

  warn "現在のテンプレート（{{ .Token }} 未含有）:"
  if [[ -z "$current_body" ]]; then
    echo "(空 — Supabase デフォルトテンプレートが使われてる)"
  else
    echo "$current_body"
  fi
  echo

  local new_body
  new_body=$(cat <<'HTML'
<h2>Logic ログイン認証コード</h2>
<p>下記の6桁コードを入力してログインしてください。</p>
<p style="font-size:28px;font-weight:700;letter-spacing:0.3em;padding:16px 24px;background:#f4f4f5;border-radius:8px;text-align:center;font-family:monospace;">{{ .Token }}</p>
<p style="color:#71717a;font-size:14px;">このコードの有効期限は 1 時間です。</p>
<p style="color:#71717a;font-size:12px;">このメールに心当たりがない場合は破棄してください。</p>
HTML
)

  warn "新しいテンプレート:"
  echo "$new_body"
  echo

  if ! confirm "適用していい？"; then
    warn "Step 1 中止。"
    return 1
  fi

  local payload
  payload=$(jq -n --arg body "$new_body" '{mailer_templates_magic_link_content: $body}')

  local response
  response=$(curl -fsS -X PATCH \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$api")

  if echo "$response" | jq -e '.mailer_templates_magic_link_content' > /dev/null 2>&1; then
    ok "✓ Supabase Magic Link テンプレート更新完了"
  else
    err "更新失敗:"
    echo "$response"
    return 1
  fi
}

# ─────────────────────────────────────────────────────────────
# Step 2: Android 内部配信ステータス確認
# ─────────────────────────────────────────────────────────────
step2_android_status() {
  info "== Step 2: Android 内部配信ステータス =="
  require_cmd gh

  info "最新の android-deploy.yml workflow runs（top 5）:"
  gh run list \
    --workflow=android-deploy.yml \
    --repo "$REPO" \
    --limit 5

  local latest
  latest=$(gh run list \
    --workflow=android-deploy.yml \
    --repo "$REPO" \
    --limit 1 \
    --json databaseId,status,conclusion \
    --jq '.[0]')

  local run_id status conclusion
  run_id=$(echo "$latest" | jq -r '.databaseId')
  status=$(echo "$latest" | jq -r '.status')
  conclusion=$(echo "$latest" | jq -r '.conclusion // "n/a"')

  echo
  info "最新 run: #${run_id} (status=${status}, conclusion=${conclusion})"

  if [[ "$status" == "in_progress" || "$status" == "queued" ]]; then
    if confirm "watch する？"; then
      gh run watch "$run_id" --repo "$REPO" --exit-status || {
        err "Android 配信 run が失敗したわ。Step 3 に進む前に確認してね。"
        return 1
      }
    fi
  elif [[ "$conclusion" != "success" ]]; then
    err "最新 run が success じゃないわ (conclusion=${conclusion})。"
    err "詳細: gh run view ${run_id} --repo ${REPO}"
    return 1
  else
    ok "✓ Android 内部配信は最新 commit で success"
  fi
}

# ─────────────────────────────────────────────────────────────
# Step 3: Render 本番デプロイ trigger
# ─────────────────────────────────────────────────────────────
step3_render_deploy() {
  info "== Step 3: Render 本番デプロイ trigger =="
  require_cmd gh

  warn "⚠️  本番 (https://logic-u5wn.onrender.com) に反映するわよ。"
  warn "    先に Step 1 (Supabase テンプレート) が完了してることを確認してね。"
  if ! confirm "trigger していい？"; then
    warn "Step 3 中止。"
    return 1
  fi

  gh workflow run deploy-production.yml \
    --repo "$REPO" \
    -f confirm=yes

  ok "✓ trigger 完了。run が生えるのを待つわ..."
  sleep 5

  local latest
  latest=$(gh run list \
    --workflow=deploy-production.yml \
    --repo "$REPO" \
    --limit 1 \
    --json databaseId \
    --jq '.[0].databaseId')

  info "最新 run: #${latest}"
  gh run list --workflow=deploy-production.yml --repo "$REPO" --limit 3

  if confirm "watch する？"; then
    gh run watch "$latest" --repo "$REPO" --exit-status || {
      err "Render デプロイ run が失敗したわ。Render Dashboard でも確認して。"
      return 1
    }
    ok "✓ Render デプロイ完了"
  fi
}

# ─────────────────────────────────────────────────────────────
# main
# ─────────────────────────────────────────────────────────────
main() {
  local target="${1:-all}"
  case "$target" in
    1)   step1_supabase_template ;;
    2)   step2_android_status ;;
    3)   step3_render_deploy ;;
    all)
      step1_supabase_template
      echo
      step2_android_status
      echo
      if confirm "Step 3 (本番デプロイ) に進む？"; then
        step3_render_deploy
      else
        warn "Step 3 はスキップ。準備できたら別途実行してね: $0 3"
      fi
      ;;
    -h|--help|help)
      sed -n '2,30p' "$0"
      ;;
    *)
      err "Unknown target: $target"
      err "Usage: $0 [1|2|3|all]"
      exit 1
      ;;
  esac
}

main "$@"
