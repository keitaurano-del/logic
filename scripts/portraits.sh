#!/usr/bin/env bash
#
# 哲学者キャラ立ち絵 9 枚を Gemini Nano Banana で一括生成するためのワンコマンド。
# Keita の WSL ローカル想定（クラウド Claude セッションには .env が無いため実行不可）。
#
# Usage:
#   bash scripts/portraits.sh                        # 全 9 枚
#   bash scripts/portraits.sh --skip-existing        # 既存はスキップ
#   bash scripts/portraits.sh --only=socrates_neutral,nietzsche_smile
#   bash scripts/portraits.sh --concurrency=3        # 並列度を上げる（デフォルト 2）
#
# 出力: public/characters/{slug}.png （9 枚）
# モデル: gemini-2.5-flash-image (Nano Banana, 約 $0.039/枚 × 9 ≈ ¥55)
# 所要: 1〜2 分

set -euo pipefail

# logic リポ root に移動
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> 哲学者キャラ立ち絵 9 枚生成 (Gemini Nano Banana)"
echo "    repo: $REPO_ROOT"
echo

# 前提チェック: .env と GEMINI_API_KEY
if [ ! -f .env ]; then
  echo "ERROR: .env が見つかりません ($REPO_ROOT/.env)"
  echo "       GEMINI_API_KEY=... を含む .env を logic root に置いてください"
  echo "       参考: memory reference_gemini_api.md / keita.urano2@gmail.com の AI Studio"
  exit 1
fi

if ! grep -q "^GEMINI_API_KEY=" .env; then
  echo "ERROR: .env に GEMINI_API_KEY= の行が見つかりません"
  exit 1
fi

# 前提チェック: node_modules
if [ ! -d node_modules ] || [ ! -x node_modules/.bin/tsx ]; then
  echo "==> node_modules / tsx が未セットアップ。npm ci を走らせます..."
  npm ci
  echo
fi

# 既存画像の確認
mkdir -p public/characters
existing="$(find public/characters -maxdepth 1 -name '*.png' 2>/dev/null | wc -l)"
echo "==> 既存 public/characters/*.png: ${existing} 枚"
if [ "$existing" -gt 0 ]; then
  ls -1 public/characters/*.png 2>/dev/null | sed 's|^|    |'
fi
echo

# 実行
echo "==> 生成開始..."
echo
npx tsx scripts/generate-character-portraits.ts --concurrency=2 "$@"
RC=$?
echo

if [ $RC -ne 0 ]; then
  echo "ERROR: 生成スクリプトが exit code $RC で終了"
  exit $RC
fi

# 結果サマリ
generated="$(find public/characters -maxdepth 1 -name '*.png' 2>/dev/null | wc -l)"
echo "==> 結果: public/characters に ${generated} 枚 (期待値: 9)"
ls -lh public/characters/*.png 2>/dev/null | sed 's|^|    |'
echo

# 概念チェック観点
cat <<'EOF'
==> 目視チェック観点
    1. スペル: 画像下部の哲学者名が "Socrates" / "Descartes" / "Nietzsche" の正しい綴り
    2. アイデンティティ:
       - Socrates : ハゲ頭 + もじゃもじゃ白髭 + 古代ギリシャ風チュニック
       - Descartes: 肩までの黒髪 + 口髭+山羊髭 + 17 世紀の白い襟
       - Nietzsche: 巨大なセイウチ髭 + 鋭い眼光 + 19 世紀の高襟コート
    3. 表情:
       - neutral : 落ち着いた表情
       - smile   : ほんのり微笑（大笑いはNG）
       - troubled: 眉を寄せた思案顔
    4. 余計なテキストが入ってないか（hex コード・RGB 値などはNG）

==> 失敗時の対応
    特定の slug だけ崩れた場合:
      bash scripts/portraits.sh --only=<slug>,<slug>
    全部やり直したい場合:
      rm public/characters/*.png && bash scripts/portraits.sh

==> 承認後の手順
    git checkout -b feat/character-portraits
    git add public/characters/
    git commit -m "feat(roleplay): add 9 philosopher portraits via Gemini"
    git push -u origin feat/character-portraits
    # → GitHub で PR 作成
EOF
