# Deployment Guide

## 概要

このドキュメントでは、Logic アプリのデプロイ手順を説明します。

---

## Web アプリ (Vercel)

### GitHub Secrets に設定が必要な変数

GitHub リポジトリの **Settings → Secrets and variables → Actions** で以下を設定してください。

#### Supabase 関連

| Secret 名 | 説明 | 取得場所 |
|-----------|------|----------|
| `VITE_SUPABASE_URL` | Supabase プロジェクト URL | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名キー (公開可) | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable キー | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー (機密) | Supabase Dashboard → Project Settings → API |

#### Stripe 関連

| Secret 名 | 説明 | 取得場所 |
|-----------|------|----------|
| `STRIPE_SECRET_KEY` | Stripe シークレットキー | Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー | Stripe Dashboard → Developers → API keys |
| `STRIPE_PRICE_MONTHLY` | 月額プランの Price ID | Stripe Dashboard → Products |
| `STRIPE_PRICE_YEARLY` | 年額プランの Price ID | Stripe Dashboard → Products |
| `STRIPE_WEBHOOK_SECRET` | Webhook 署名シークレット | Stripe Dashboard → Developers → Webhooks |

#### Vercel 関連

| Secret 名 | 説明 | 取得場所 |
|-----------|------|----------|
| `VERCEL_TOKEN` | Vercel 認証トークン | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel 組織 ID | Vercel Dashboard → Settings → General (Team ID) |
| `VERCEL_PROJECT_ID` | Vercel プロジェクト ID | Vercel Dashboard → Project → Settings → General |

> **VERCEL_ORG_ID と VERCEL_PROJECT_ID の確認方法**
> ```bash
> npx vercel link
> cat .vercel/project.json
> # → {"orgId": "...", "projectId": "..."}
> ```

---

## Stripe Webhook の設定

### 1. Stripe CLI でローカルテスト (開発時)

```bash
stripe listen --forward-to http://localhost:3000/api/webhook/stripe
```

### 2. 本番 Webhook エンドポイントの設定

1. [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) を開く
2. **「Add endpoint」** をクリック
3. エンドポイント URL を入力:
   ```
   https://<your-vercel-domain>/api/webhook/stripe
   ```
4. 受信するイベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **「Add endpoint」** をクリックして保存
6. 作成された Webhook の **Signing secret** をコピー
7. GitHub Secrets の `STRIPE_WEBHOOK_SECRET` に設定

---

## Supabase Google OAuth コールバック URL の設定

### 1. Supabase 側の設定

1. [Supabase Dashboard → Authentication → Providers](https://supabase.com/dashboard) を開く
2. **Google** を有効化
3. Google Cloud Console から取得した `Client ID` と `Client Secret` を入力
4. **Callback URL** をコピー:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

### 2. Google Cloud Console 側の設定

1. [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) を開く
2. OAuth 2.0 クライアント ID を選択
3. **承認済みのリダイレクト URI** に以下を追加:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
4. 本番ドメインも追加 (Vercel):
   ```
   https://<your-vercel-domain>/auth/callback
   ```

### 3. Supabase URL 設定

Supabase Dashboard → Authentication → URL Configuration で以下を設定:

- **Site URL**: `https://<your-vercel-domain>`
- **Redirect URLs** に追加:
  ```
  https://<your-vercel-domain>/**
  http://localhost:5173/**
  ```

---

## Android CI/CD

### 現在の状態

Android CI/CD は `.github/workflows/android-deploy.yml` として実装済みです。

**自動デプロイのトリガー:**
- `main` ブランチへの push
- GitHub Actions の手動トリガー (`workflow_dispatch`)

**デプロイ先:** Google Play Console (内部テストトラック)

### Android 用 GitHub Secrets

| Secret 名 | 説明 |
|-----------|------|
| `ANDROID_KEYSTORE_BASE64` | Base64 エンコードされたキーストアファイル |
| `ANDROID_KEYSTORE_PASSWORD` | キーストアのパスワード |
| `ANDROID_KEY_ALIAS` | キーのエイリアス |
| `ANDROID_KEY_PASSWORD` | キーのパスワード |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Play Console サービスアカウント JSON |
| `VITE_API_BASE` | API ベース URL |

### キーストアの Base64 エンコード

```bash
base64 -w 0 android/app/logic.keystore
```

---

## ローカルでのデプロイ

```bash
# Web アプリのビルドと Vercel へのデプロイ
npm run deploy:web

# データベースマイグレーションの実行
npm run db:migrate
```

---

## デプロイフロー

```
git push origin main
       ↓
GitHub Actions が起動
       ↓
┌─────────────────────┐    ┌─────────────────────────┐
│  vercel-deploy.yml  │    │  android-deploy.yml     │
│  1. npm ci          │    │  1. npm ci              │
│  2. npm run build   │    │  2. npm run build       │
│  3. vercel --prod   │    │  3. cap sync android    │
│                     │    │  4. AAB ビルド・署名    │
│  → Vercel (Web)     │    │  5. Play Console 配信   │
└─────────────────────┘    └─────────────────────────┘
```
