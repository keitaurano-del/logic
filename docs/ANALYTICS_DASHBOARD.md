# Analytics Dashboard (Metabase) — Phase 1

Logic の事業 KPI を可視化する Metabase ダッシュボード。
Phase 1 では Supabase 既存テーブルだけを使った 5 ボードを立ち上げる。

## ステータス（2026-05-23 時点）

| 項目 | 状態 |
|---|---|
| Supabase read-only role migration | コード commit 済（適用は Keita 作業） |
| 5 ボード分の SQL | 全 5 ファイル commit 済 |
| Metabase Dockerfile / Render blueprint | コード commit 済 |
| Render service 作成 | **未** — Keita 操作必要（下記手順参照） |
| Metabase 初期セットアップ | **未** — service 起動後に Keita が初回ログイン |

---

## アーキテクチャ

```
┌──────────────────────┐         ┌──────────────────────┐
│ Supabase (postgres)  │         │ Metabase (Render)    │
│  ├─ public.*         │  ◀───── │  ロール: metabase_   │
│  └─ public.metabase_ │  read   │        readonly      │
│     users (view)     │  only   │  port: 3000          │
└──────────────────────┘         └──────────────────────┘
        ▲                                    ▲
        │ migration 021 で作成               │ Keita のブラウザ
        │                                    │ (Basic Auth 等で保護)
        └────────────────────────────────────┘
```

Metabase 自身のメタデータ (Question 定義、ダッシュボード config 等) も
Supabase Postgres の **別ロール `metabase_app`** （書込権限あり）で保存する。
H2 ファイルストレージは Render の ephemeral disk で消える可能性があるので避ける。

---

## アクセス情報

| 項目 | 値 |
|---|---|
| URL | https://logic-metabase.onrender.com （想定、Render service 作成時に確定） |
| ログイン方法 | Email + Password（Metabase Admin で個別発行） |
| 初期 admin email | keita.urano@gmail.com |
| 初期 admin password | 1Password「Metabase Admin」アイテム参照（service 作成後に Keita が登録） |
| 認証強化 | Render 側で Basic Auth or Cloudflare Access を被せる（後日） |

---

## 5 ボード一覧

| # | 名前 | データソース | グラフ | SQL |
|---|------|--------------|--------|-----|
| 1 | MRR / 課金者数推移 | `subscriptions` | 折れ線（時系列） | `supabase/sql/dashboards/01_mrr_paying_users.sql` |
| 2 | D1/D7/D30 残存 | `metabase_users` + `study_sessions` | 折れ線（コホート別） | `supabase/sql/dashboards/02_retention_cohort.sql` |
| 3 | Activity 別利用時間 | `study_sessions` | 横棒グラフ | `supabase/sql/dashboards/03_activity_usage.sql` |
| 4 | Placement 偏差値分布 | `placement_results` | ヒストグラム | `supabase/sql/dashboards/04_placement_distribution.sql` |
| 5 | RTDN ステータス分布 | `subscriptions.notification_type_last` | 棒グラフ + 折れ線 | `supabase/sql/dashboards/05_rtdn_status.sql` |

各 SQL の集計ロジック詳細はファイル先頭コメント参照。

### 指標の読み方

#### 1. MRR / 課金者数推移
- `mrr_jpy`: paid_monthly = 1480円, paid_yearly = 9800/12 ≒ 817円で月次正規化した合計。
- `new_paying_users`: その月に課金開始したユーザー数。
- `churned_users`: 前月 active だったが当月いなくなった分。LAG ベースの近似計算。

#### 2. D1/D7/D30 残存
- アクティブ判定は「その日に study_sessions が 1 件以上」。
- D1 < D7 < D30 と下がっていくのが通常。D7 が 20% 以下だとオンボーディング要改善。

#### 3. Activity 別利用時間
- `minutes_per_user`: 1 ユーザーあたり平均利用分。Lesson が圧倒的に多いはず。
- 想定外に低い activity（例: roleplay）は導線か体験に課題あり。

#### 4. Placement 偏差値分布
- マーケで「初心者向け」と打ち出してるなら 40-50 のボリュームが厚いはず。
- 偏差値 60+ が多すぎる場合、上級者しか定着していない可能性 → 初心者向けコンテンツ強化検討。

#### 5. RTDN ステータス分布
- `category=churn` (3 CANCELED / 12 REVOKED / 13 EXPIRED) の比率が解約率の参考指標。
- `at_risk` (5 ON_HOLD / 6 IN_GRACE_PERIOD) が増えてきたら支払い失敗の救済施策（リマインダ等）検討。

---

## Keita 操作チェックリスト

### A. Supabase 側（10 分）

1. Supabase Dashboard > SQL Editor で `supabase/migrations/021_metabase_readonly.sql` を実行
2. 続けて以下を実行してパスワードを設定（パスワードは 1Password に保存）:
   ```sql
   ALTER ROLE metabase_readonly WITH PASSWORD '<強いランダム文字列>';
   ```
3. Metabase 自身のメタデータ保存用 role も作成:
   ```sql
   CREATE ROLE metabase_app LOGIN PASSWORD '<別の強いランダム文字列>';
   GRANT CONNECT ON DATABASE postgres TO metabase_app;
   CREATE SCHEMA IF NOT EXISTS metabase AUTHORIZATION metabase_app;
   ```
   ※ `metabase_app` は metabase schema のみ書込み可。public は触らせない。
4. Settings > Database > Connection Pooling から接続情報をコピー:
   - Host (例: `aws-0-ap-northeast-1.pooler.supabase.com`)
   - Port: `6543`
   - Database: `postgres`

### B. Render 側（15 分）

1. Render Dashboard > New > Blueprint を選択
2. Repository: `keitaurano-del/logic`
3. Blueprint file: `infra/metabase/render.yaml`
4. 環境変数を入力:
   - `MB_DB_HOST` = (A-4 の Host)
   - `MB_DB_USER` = `metabase_app`
   - `MB_DB_PASS` = (A-3 で設定したパスワード)
   - `MB_SITE_URL` = `https://logic-metabase.onrender.com`（service 名に応じて調整）
5. Deploy を実行（初回 build に 5-8 分）
6. service URL が `https://logic-metabase-xxxx.onrender.com` で立ち上がる

### C. Metabase 初期セットアップ（10 分）

1. Service URL を開くと初期セットアップウィザードが起動
2. Admin アカウント作成: `keita.urano@gmail.com` / `<password>` (1Password 保存)
3. データソース追加（**B のメタデータ DB とは別**）:
   - Database type: PostgreSQL
   - Display name: `Logic Production`
   - Host: A-4 と同じ
   - Port: `6543`
   - Database name: `postgres`
   - Username: `metabase_readonly`
   - Password: A-2 のパスワード
   - SSL: required
4. データソース接続成功を確認

### D. 5 Question + 1 Dashboard 登録（30 分）

1. Metabase の `+ New > Question > Native Query` を開く
2. `supabase/sql/dashboards/01_mrr_paying_users.sql` を全文コピペ → 実行 → Save as Question
3. 同様に 02〜05 まで登録
4. `+ New > Dashboard` で「Logic KPI Phase 1」を作成
5. 5 つの Question を配置（推奨レイアウト: 上段に 1 と 5 / 中段に 2 と 3 / 下段に 4）
6. Auto-refresh を 1 時間に設定

### E. アクセス制御（任意・後日）

- Cloudflare Tunnel + Access で外部公開を絞る
- Metabase の Settings > Authentication でユーザー登録を admin のみに制限
- Logic Render service の env var `METABASE_BASE_URL` を追加（将来アプリ内リンクで使う場合）

---

## SQL の運用ルール

- SQL を修正したら **Git commit ＆ Metabase Question 側にも反映**を必ずセットで行う
- 集計ロジック変更時は本ドキュメントの「指標の読み方」も同期更新する
- 価格改定があった場合 `01_mrr_paying_users.sql` の CASE 式と `supabase/sql/dashboards/README.md` の表を両方更新

---

## トラブルシュート

| 症状 | 原因候補 / 対処 |
|---|---|
| `permission denied for table xxx` | `021_metabase_readonly.sql` 再実行 / `GRANT SELECT ON ...` を個別に流す |
| `auth.uid() is null` で空 | `metabase_readonly` は `BYPASSRLS` 必須。`ALTER ROLE metabase_readonly BYPASSRLS;` を再適用 |
| Render free tier が遅い | アイドルスリープ。starter プランへ昇格、または UptimeRobot で keep-alive |
| Metabase メタデータが消えた | H2 ファイル使用中の可能性。`MB_DB_TYPE=postgres` で起動しているか確認 |
| 接続できない | Connection Pooling の port は 6543（5432 ではない）、`?sslmode=require` 必須 |

---

## Phase 2 候補（参考）

Phase 1 が安定したら以下を追加する想定:

- Funnel ダッシュボード（signup → placement → 初課金）
- ARPU / LTV 推定
- Lesson 別の完了率と離脱地点
- App 内エラー率（Sentry 連携 or `logs` テーブル新設）
- A/B テスト結果集計（feature flag テーブル前提）

詳細は ceo 過去分析の Phase 2 セクション参照。
