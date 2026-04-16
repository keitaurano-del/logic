# Logic アプリ 開発計画

## 概要

Logic（ロジカルシンキング学習アプリ）に Supabase（Auth + DB）、Stripe（決済）、Figma（デザイン管理）、Jira（PM）を統合する開発ロードマップ。

---

## 現状の技術スタック

| 項目 | 現状 | 移行先 |
|---|---|---|
| 認証 | Firebase Auth (Email + Google) | Supabase Auth |
| データ永続化 | localStorage のみ | Supabase DB (PostgreSQL) |
| サブスクリプション | BETA_MODE=true (無効化中) | Stripe Checkout + Webhook |
| サーバー | Express (tsx) | Express + Supabase Edge Functions |
| デプロイ | Android (Play Store) | Android + Web (Vercel) |

---

## フェーズ別ロードマップ

### Phase 1 — Supabase Auth 移行（Firebase 廃止）
**期間目安: 2週間**

#### Epic: AUTH-001 Supabase Auth 導入

| Story ID | タイトル | 優先度 | 見積もり(SP) |
|---|---|---|---|
| AUTH-001-1 | Supabase プロジェクト設定・env 追加 | High | 1 |
| AUTH-001-2 | `supabase.ts` クライアント作成 (firebase.ts の代替) | High | 2 |
| AUTH-001-3 | Email/Password 認証を Supabase Auth に切り替え | High | 3 |
| AUTH-001-4 | Google OAuth を Supabase Auth に切り替え | High | 3 |
| AUTH-001-5 | LoginScreen を Supabase Auth ベースに更新 | High | 2 |
| AUTH-001-6 | `onAuthChange` → Supabase セッション管理に統合 | High | 2 |
| AUTH-001-7 | Firebase 依存コードの完全削除 | Medium | 2 |
| AUTH-001-8 | Figma: LoginScreen デザイン更新（ブランドに合わせたUIレビュー） | Medium | 1 |
| AUTH-001-9 | テスト: Email/Google ログイン E2E | High | 2 |

**完了定義:**
- Firebase SDK がコードから削除されている
- Email + Google ログインが Supabase Auth で動作する
- セッション管理がクライアント/サーバー両方で機能する

---

### Phase 2 — Supabase DB データ永続化
**期間目安: 3週間**

#### Epic: DB-001 ユーザーデータのクラウド同期

| Story ID | タイトル | 優先度 | 見積もり(SP) |
|---|---|---|---|
| DB-001-1 | Supabase テーブル設計 (users, progress, notebooks, roadmap) | High | 3 |
| DB-001-2 | RLS (Row Level Security) ポリシー設定 | High | 2 |
| DB-001-3 | progressStore → Supabase `progress` テーブルに移行 | High | 5 |
| DB-001-4 | notebookStore → Supabase `notebooks` テーブルに移行 | Medium | 3 |
| DB-001-5 | roadmapStore → Supabase `roadmap_progress` テーブルに移行 | Medium | 3 |
| DB-001-6 | aiProblemStore → Supabase `ai_problems` テーブルに移行 | Medium | 2 |
| DB-001-7 | placement/ranking → Supabase `placement_results` テーブルへ (JSONファイル廃止) | Medium | 3 |
| DB-001-8 | report-problem → Supabase `reports` テーブルへ (JSONファイル廃止) | Low | 2 |
| DB-001-9 | Figma: Profile/Ranking 画面のデザインレビュー | Low | 1 |
| DB-001-10 | オフライン→オンライン同期戦略の実装 | Medium | 5 |

**DBスキーマ:**
```sql
-- users (Supabase Auth の users と連携)
create table public.profiles (
  id uuid references auth.users primary key,
  nickname text,
  goal text,
  language text default 'ja',
  created_at timestamptz default now()
);

-- 学習進捗
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles,
  lesson_id int,
  category text,
  completed_at timestamptz,
  score int,
  created_at timestamptz default now()
);

-- ノート
create table public.notebooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles,
  content jsonb,
  updated_at timestamptz default now()
);

-- サブスクリプション (Phase 3 で使用)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text, -- 'monthly' | 'yearly' | 'free'
  status text, -- 'active' | 'canceled' | 'past_due'
  current_period_end timestamptz,
  created_at timestamptz default now()
);
```

---

### Phase 3 — Stripe 本番有効化
**期間目安: 2週間**

#### Epic: STRIPE-001 課金フロー本番化

| Story ID | タイトル | 優先度 | 見積もり(SP) |
|---|---|---|---|
| STRIPE-001-1 | Stripe ダッシュボードで Product/Price 作成 (月額 ¥500, 年額 ¥3,500) | High | 1 |
| STRIPE-001-2 | Stripe Customer を Supabase user_id と紐付け | High | 3 |
| STRIPE-001-3 | Webhook エンドポイント実装 (`/api/stripe/webhook`) | High | 5 |
| STRIPE-001-4 | Webhook: `customer.subscription.updated/deleted` で Supabase subscriptions 更新 | High | 3 |
| STRIPE-001-5 | `isPremium()` を localStorage → Supabase subscriptions テーブルから取得に変更 | High | 2 |
| STRIPE-001-6 | `BETA_MODE = false` に変更、プレミアム制限を再有効化 | High | 1 |
| STRIPE-001-7 | Pricing 画面の UI を Figma でレビュー・更新 | High | 2 |
| STRIPE-001-8 | Stripe Customer Portal の有効化（プラン変更・解約） | Medium | 2 |
| STRIPE-001-9 | テスト: 決済フロー End-to-End (Stripe テストモード) | High | 3 |
| STRIPE-001-10 | 本番モードへの切り替えチェックリスト | High | 1 |

---

### Phase 4 — CI/CD 完全自動化 & デプロイ整備
**期間目安: 1週間**

#### Epic: DEVOPS-001 デプロイパイプライン整備

| Story ID | タイトル | 優先度 | 見積もり(SP) |
|---|---|---|---|
| DEVOPS-001-1 | Vercel プロジェクト設定 + env 変数投入 | High | 1 |
| DEVOPS-001-2 | GitHub Actions: Web (Vercel) 自動デプロイ追加 | High | 2 |
| DEVOPS-001-3 | 環境分離: `.env.development` / `.env.production` | High | 1 |
| DEVOPS-001-4 | Play Store Android CI/CD の最終確認 (Run #3 以降) | Medium | 1 |

---

## Figma との連携方法

1. **デザイントークン**: `src/styles/tokens.css` の変数を Figma Tokens プラグインで管理
2. **コンポーネント対応表**:
   - `src/components/Button.tsx` → Figma "Button" コンポーネント
   - `src/components/Card.tsx` → Figma "Card" コンポーネント
   - 各 Screen → Figma フレーム
3. **フロー**: Figma で修正 → Figma Dev Mode でCSS取得 → コード反映 → PR → 自動デプロイ

---

## Jira プロジェクト構成

```
Project: LOGIC
Board: Kanban (推奨) または Scrum

Epics:
├── AUTH-001: Supabase Auth 移行
├── DB-001: Supabase DB 永続化
├── STRIPE-001: Stripe 本番化
└── DEVOPS-001: CI/CD 整備

Labels: frontend, backend, design, infra, testing
```

---

## 環境変数 (追加予定)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx

# Supabase (サーバーサイド)
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Stripe (既存)
STRIPE_SECRET_KEY=xxxx
STRIPE_PRICE_MONTHLY=price_xxxx
STRIPE_PRICE_YEARLY=price_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx  ← 新規追加

# Vercel 自動デプロイ用
VERCEL_TOKEN=xxxx
```

---

## 作業開始の前提条件チェックリスト

- [ ] Supabase: Project URL と anon key を取得
- [ ] Supabase: Google OAuth プロバイダを有効化（コールバックURL設定）
- [ ] Stripe: Product と Price ID を作成
- [ ] Stripe: Webhook エンドポイント登録
- [ ] Vercel: プロジェクト作成 + GitHub 連携
- [ ] Jira: LOGIC プロジェクト作成 + Epic/Story を投入

---

最終更新: 2026-04-16
