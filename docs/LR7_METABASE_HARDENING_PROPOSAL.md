# LR-7 metabase 権限ハードニング提案（セクション6・完全版ドラフト）

> ステータス: **未適用ドラフト**。`supabase/migrations/` には置いていない（`npm run db:migrate` で自動実行されないように）。
> 適用は Keita の手動判断で。038（LR-7 本体）とは独立。
> 作成: 2026-06-14 / 根拠: 林がダッシュボード SQL と 021 を全数裏取り。

## 背景

`021_metabase_readonly.sql` で作った `metabase_readonly` ロールは現状:

- `GRANT SELECT ON ALL TABLES IN SCHEMA public`（全テーブル）
- `ALTER DEFAULT PRIVILEGES … GRANT SELECT`（将来テーブルも自動付与）
- `ALTER ROLE metabase_readonly BYPASSRLS`

→ Metabase 接続情報が漏れると **public schema の全テーブル**（日記本文・AI 会話ログ含む）が読める。

## 実際にダッシュボードが使うリレーション（6 クエリ・裏取り済み）

| ダッシュボード | 参照リレーション |
|---|---|
| 01_mrr_paying_users | `public.subscriptions` |
| 02_retention_cohort | `public.profiles`（id, created_at のみ）, `public.daily_activity` |
| 03_activity_usage | `public.study_sessions` |
| 04_placement_distribution | `public.placement_results` |
| 05_rtdn_status | `public.subscriptions` |
| 06_dau_wau_mau | `public.study_sessions`, `public.daily_activity` |

誰も使っていない高 PII テーブル: `notebooks` / `daily_journals` / `journal_assistant_conversations` / `user_settings` / `user_flashcards` / `user_wrong_answers` / `user_saved_items` / `user_roadmap_goals`。

## 設計方針

- **BYPASSRLS は維持する**（NOBYPASSRLS にしない）。
  BYPASSRLS は「行フィルタ(RLS)をスキップ」する権限で、テーブルの SELECT 権限とは別レイヤー。
  使うテーブルだけ GRANT・残りは REVOKE すれば、BYPASSRLS が付いたままでも未許可テーブルは
  table-level で permission denied になる。BYPASSRLS は許可した 5 テーブルで「全ユーザー横断集計」を
  成立させるのに必要（NOBYPASSRLS だと NOINHERIT＋auth.uid()=NULL で 0 行になり集計が壊れる）。
- **最小権限**: 全テーブル一律 SELECT を剥奪し、ダッシュボードが使うものだけに絞る。
- **profiles は view 経由**: `profiles` を丸ごと GRANT すると nickname 等まで見える。
  `metabase_users` と同じ流儀で `metabase_profiles`（id, created_at だけ）view を作り、それだけに GRANT。
  02 のクエリを view 参照に差し替える。

## 適用 SQL（ドラフト）

```sql
-- 039_metabase_least_privilege.sql（ドラフト・未適用）

-- 1) PII を出さない profiles 集計 view（id と created_at だけ）
CREATE OR REPLACE VIEW public.metabase_profiles AS
  SELECT id, created_at
  FROM public.profiles;

COMMENT ON VIEW public.metabase_profiles IS
  'Metabase 集計用の profiles view。id と created_at のみ。nickname 等の PII は出さない。';

-- 2) 全テーブル一律 SELECT を剥奪し、将来テーブルの自動付与も止める
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM metabase_readonly;

-- 3) ダッシュボードが実際に使うものだけに SELECT を付与
GRANT SELECT ON public.study_sessions    TO metabase_readonly;
GRANT SELECT ON public.placement_results TO metabase_readonly;
GRANT SELECT ON public.subscriptions     TO metabase_readonly;
GRANT SELECT ON public.daily_activity    TO metabase_readonly;
GRANT SELECT ON public.metabase_users    TO metabase_readonly;  -- 既存（domain のみ）
GRANT SELECT ON public.metabase_profiles TO metabase_readonly;  -- 新規（id, created_at のみ）

-- BYPASSRLS は変更しない（剥奪しない）。
```

## Metabase 側の手作業（02 の native query 差し替え）

`02_retention_cohort` の native query で `from public.profiles` を `from public.metabase_profiles` に1か所変更して Save するだけ。読む列は id / created_at で同じなので結果は不変。

差し替え後の 02 冒頭（該当 CTE のみ）:

```sql
with cohort_users as (
  select
    id as user_id,
    date_trunc('week', created_at)::date as cohort_week,
    created_at::date as signup_date
  from public.metabase_profiles          -- ← public.profiles から変更
  where created_at >= now() - interval '12 weeks'
),
-- 以下そのまま
```

リポ側の `supabase/sql/dashboards/02_retention_cohort.sql` も同じ1行を直しておくと整合する（このファイル自体は実行されないドキュメント兼マスター）。

## 適用順序（安全）

1. 先に Metabase 側 02 を `metabase_profiles` 参照に貼り替えて Save（view 作成前でも native query 保存は可、実行は view 作成後）。
   - 厳密にやるなら: 039 SQL の (1) view 作成だけ先に流す → 02 を view 参照に差し替え → 動作確認 → (2)(3) の REVOKE/GRANT を流す。
   - こうすると「profiles 直 GRANT を剥がす前に view が用意できている」ので、02 が一瞬たりとも壊れない。
2. 039 SQL を `npm run db:migrate` 相当（または Supabase SQL Editor）で適用。
3. 全 6 ダッシュボードをリロードして数値が出ることを確認。

## 残る任意の締め（今回スコープ外・メモ）

- `subscriptions` には Stripe customer id / Google purchase token 等が含まれる場合がある。MRR/RTDN 集計に
  トークン本体は不要なので、より厳密にやるなら `metabase_subscriptions`（status, plan, 期間, 金額のみ）view を
  作って 01/05 を差し替える手がある。今回の主目的（日記・AI会話・nickname の露出遮断）は上記で達成済み。
- `placement_results` に表示名（nickname）列がある場合は同様に view 化を検討。
