#!/bin/bash
# Logic Android リリースビルドパイプライン
# 実行: ./scripts/build-android-release.sh
# 完了時: Teams 🔨ビルド管理 に結果通知

set -e

# エラー時に Teams 通知して終了
trap 'notify_build "build" "❌ <b>Android ビルド失敗</b><br>ステップ失敗で中断しました。ログを確認してください。" "urgent" 2>/dev/null; exit 1' ERR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEAMS_SCRIPT="$SCRIPT_DIR/teams-notify.sh"

notify_build() {
  local channel="$1"
  local msg="$2"
  local importance="${3:-normal}"
  bash "$TEAMS_SCRIPT" "$channel" "$msg" "$importance" 2>/dev/null || true
}

echo "========================================="
echo " Logic Android Release Build"
echo " $(date '+%Y-%m-%d %H:%M:%S JST')"
echo "========================================="

cd "$PROJECT_DIR"

# ----------------------------------------
# Step 1: git pull
# ----------------------------------------
echo "[1/5] git pull..."
git pull origin develop 2>&1

# ----------------------------------------
# Step 2: npm build
# ----------------------------------------
echo "[2/5] npm run build..."
npm run build 2>&1

# ----------------------------------------
# Step 3: バージョンバンプ
# ----------------------------------------
echo "[3/5] bump android version..."
node scripts/bump-android-version.js 2>&1

# versionName / versionCode 取得
VERSION_NAME=$(grep 'versionName' android/app/build.gradle | head -1 | sed 's/.*versionName "\(.*\)".*/\1/' | tr -d ' ')
VERSION_CODE=$(grep 'versionCode' android/app/build.gradle | head -1 | sed 's/.*versionCode \([0-9]*\).*/\1/' | tr -d ' ')
echo "   Version: $VERSION_NAME (vc$VERSION_CODE)"

# ----------------------------------------
# Step 4: cap sync
# ----------------------------------------
echo "[4/5] cap sync android..."
npx cap sync android 2>&1

# ----------------------------------------
# Step 5: Gradle AAB ビルド
# ----------------------------------------
echo "[5/5] gradle bundleRelease..."
cd android
./gradlew bundleRelease 2>&1
cd "$PROJECT_DIR"

# AAB ファイルパス
AAB_PATH=$(find android/app/build/outputs/bundle/release -name "*.aab" | head -1)

if [ -z "$AAB_PATH" ]; then
  echo "ERROR: AAB file not found"
  notify_build "build" \
    "❌ <b>Android ビルド失敗</b><br>バージョン: $VERSION_NAME (vc$VERSION_CODE)<br>エラー: AABファイルが見つかりません<br>Clawが調査します" \
    "urgent"
  exit 1
fi

AAB_SIZE=$(du -sh "$AAB_PATH" | cut -f1)
BUILD_TIME=$(date '+%Y-%m-%d %H:%M JST')

echo ""
echo "✅ ビルド成功!"
echo "   AAB: $AAB_PATH"
echo "   サイズ: $AAB_SIZE"

# ----------------------------------------
# Teams 通知
# ----------------------------------------
notify_build "build" \
  "✅ <b>Android ビルド成功</b><br>バージョン: <b>v$VERSION_NAME (vc$VERSION_CODE)</b><br>AABサイズ: $AAB_SIZE<br>ビルド時刻: $BUILD_TIME<br><br>📋 次のステップ: 🚀リリース チャネルでリリース準備を進めてください"

notify_build "release" \
  "🆕 <b>リリース候補: v$VERSION_NAME (vc$VERSION_CODE)</b><br>Androidビルドが完了しました。<br><br>✅ SIT確認: https://logic-sit.onrender.com/<br><br>本番デプロイ・ストア提出の準備ができたら「<b>承認 ✅</b>」と返信してください"

echo ""
echo "Teams通知送信完了"
echo "AABパス: $PROJECT_DIR/$AAB_PATH"
# (末尾エラートラップ追加済み)
