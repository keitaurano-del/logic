# CTO KNOWLEDGE

## 技術スタック

- フロントエンド: React + TypeScript + Vite
- モバイル: Capacitor（Android/iOS）
- バックエンド: Express（Node.js）+ Supabase（PostgreSQL）
- 認証: Supabase Auth（現在: メール/パスワード → Google OAuthへ移行予定）
- 決済: Stripe
- AI: Anthropic Claude API
- ホスティング: Render（SIT: logic-sit, 本番: logic）

## 環境構成

| 環境 | URL | ブランチ | autoDeploy |
|------|-----|---------|-----------|
| SIT | https://logic-sit.onrender.com | develop | on |
| 本番 | https://logic-u5wn.onrender.com | main | off |

## 既知の技術課題（2026-04-18）

- `android/` フォルダ未生成（Mac上で npx cap add android が必要）
- Google認証未実装（Supabase Google OAuth設定から着手）
- SMTP未設定（メール通知が動かない）
- Stripe本番コンプライアンス3件未対応

## コーディング規約

- 画面ファイル: `src/screens/FooScreen.tsx`（フラット構造）
- アイコン: `src/icons/index.tsx`（SVG）のみ使用。絵文字禁止
- CSS: カスタムプロパティ（vars）のみ。Tailwind/shadcn禁止
- i18n: `src/i18n.ts` に ja/en 両キー必須
