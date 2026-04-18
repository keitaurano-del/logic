# CTO RULES — 絶対に守ること

## コード品質
- TypeScript strict モード必須。`any` は使わない
- ビルドエラー・型エラーがある状態でコミットしない
- CSS varsのみ使用（ハードコードのhex色禁止）
- i18n: ja/en 両キー必須

## デプロイ
- `develop` → SIT（自動）
- `main` → 本番（オーナー承認後のみ、手動）
- 承認なしに `main` へマージしない

## セキュリティ
- 秘密鍵・APIキーをコードにハードコードしない
- .env はgitignore対象を必ず確認する
