#!/usr/bin/env bash
# run_dev_flow.sh — Logic 開発フロー実行スクリプト
# 使い方: ./scripts/run_dev_flow.sh "<タスク説明>"
# 例:    ./scripts/run_dev_flow.sh "SCRUM-116: Google Play Billing Library 導入"

set -euo pipefail

TASK="${1:-}"
if [ -z "$TASK" ]; then
  echo "Usage: $0 '<task description>'"
  exit 1
fi

LOGIC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE=$(date +%Y%m%d)
QA_REPORT="$LOGIC_DIR/docs/QA_REPORT_${DATE}.md"

echo "=== Logic Dev Flow ==="
echo "Task: $TASK"
echo "Date: $DATE"
echo ""

# エージェント定義ファイルを読み込む
CTO_RULES=$(cat "$LOGIC_DIR/agents/cto/RULES.md" 2>/dev/null || echo "")
CTO_KNOWLEDGE=$(cat "$LOGIC_DIR/agents/cto/KNOWLEDGE.md" 2>/dev/null || echo "")
QA_RULES=$(cat "$LOGIC_DIR/agents/qa/RULES.md" 2>/dev/null || echo "")
QA_KNOWLEDGE=$(cat "$LOGIC_DIR/agents/qa/KNOWLEDGE.md" 2>/dev/null || echo "")
REVIEWER_RULES=$(cat "$LOGIC_DIR/agents/reviewer/RULES.md" 2>/dev/null || echo "")
REVIEWER_KNOWLEDGE=$(cat "$LOGIC_DIR/agents/reviewer/KNOWLEDGE.md" 2>/dev/null || echo "")

echo "[Step 1] 実装サブエージェントを起動します..."
echo "  タスク: $TASK"
echo "  完了後: develop ブランチへ commit/push"
echo ""

echo "[Step 2] QAサブエージェントを起動します..."
echo "  SIT URL: https://logic-sit.onrender.com"
echo "  出力: $QA_REPORT"
echo ""

echo "[Step 3] レビューサブエージェントを起動します..."
echo "  入力: $QA_REPORT"
echo ""

echo "=== このスクリプトは Apollo (OpenClaw) から sessions_spawn で呼ぶこと ==="
echo "=== 直接実行ではなく、WORKFLOW.md の手順に従ってください ==="
