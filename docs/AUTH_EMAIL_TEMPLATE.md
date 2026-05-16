# メール認証コード（OTP）テンプレ運用

Logic のメールログインは **6桁の認証コードを入力する方式（Email OTP）**。Magic Link（メール内のリンクをクリックして Web に遷移する方式）は使わない。

- クライアント側：`src/supabase.ts` の `sendEmailOtp` / `verifyEmailOtp`、UI は `src/screens/LoginScreen.tsx`
- 既に `signInWithOtp` → `verifyOtp({ type: 'email' })` の OTP コード検証 API を呼んでいるので、**コード変更は不要**

ただし Supabase の `signInWithOtp` は仕様上、**メールテンプレートの内容で Magic Link / OTP コードのどちらを送るかが決まる**。Logic では以下のテンプレ（`docs/auth-email-template-otp.html`）を Supabase ダッシュボードの「Magic Link」テンプレに適用することで、6桁コードを送る挙動にしている。

> Reference: https://supabase.com/docs/guides/auth/auth-email-passwordless#with-otp

## 1. ダッシュボードで手動適用（初回・誰でも可）

1. https://supabase.com/dashboard/project/yctlelmlwjwlcpcxvmgx/auth/templates を開く
2. テンプレ種別 **「Magic Link」** を選択
3. **Subject heading** を `Logic 認証コード` に書き換え
4. **Message body (HTML)** を `docs/auth-email-template-otp.html` の中身で全文上書き
5. `Save changes`
6. 自分のメールアドレスにテスト送信して、本文中の 6桁コードでログインできるか確認

## 2. スクリプトで自動適用（CI / 環境再現用）

Supabase Personal Access Token を発行して環境変数で渡す。

```bash
# Token 発行: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxx

# Logic 本番に適用
./scripts/update-auth-email-template.sh

# 別プロジェクト（例：staging）に適用したい場合
SUPABASE_PROJECT_REF=xxxxxxxx ./scripts/update-auth-email-template.sh
```

スクリプトの中身は Supabase Management API の
`PATCH /v1/projects/{ref}/config/auth` を叩いて、
`mailer_subjects_magic_link` と `mailer_templates_magic_link_content`
の 2 フィールドを更新するだけ。

## 3. テンプレを編集したくなったら

- HTML 本体は `docs/auth-email-template-otp.html` を直接編集
- `{{ .Token }}` プレースホルダは **絶対残す**（Supabase 側で 6桁コードに置換される）
- 編集後はもう一度 `./scripts/update-auth-email-template.sh` を流すか、ダッシュボードに貼り直す
- 利用できる変数一覧は Supabase 公式ドキュメント参照：
  https://supabase.com/docs/guides/auth/auth-email-templates

## 4. やってはいけないこと

- テンプレに `{{ .ConfirmationURL }}`（Magic Link 用 URL）を含めない
  → 含めるとユーザーがリンクをクリックして Web に飛んでしまい、アプリ側の OTP 入力 UI を経由しない
- Supabase Auth の `Enable email confirmations` は OFF にしない（パスワード認証ではなく OTP 専用にしているため）
- `signInWithOtp` 呼び出し時に `emailRedirectTo` を渡さない（`src/supabase.ts` 参照、現状未指定で正しい）
