-- 038_rls_hardening.sql
-- LR-7: RLS / 権限の締め直し（データ漏洩・改ざん防止）
-- ─────────────────────────────────────────────────────────────────
-- 背景 (#38 / #39):
--   初期スキーマ (001) や 004 / 010 では、ランキング・フィードバック等の
--   テーブルに「誰でも SELECT / 誰でも INSERT」という緩い RLS ポリシーが
--   残っていた。これにより anon キーを持つクライアントが
--     - 他テーブルの内容を直接読める (placement_results: read all)
--     - 任意の行を直接 insert できる (feedback / reports / fermi_scores)
--   状態になっており、なりすまし（他人の user_id 騙り）やデータ汚染の余地があった。
--
-- 方針:
--   - これらのテーブルへの書込/読取は **すべてサーバー API (service_role) 経由**に統一する。
--     service_role キーは RLS を BYPASS するため、ポリシーを削っても API 経路は動作継続する。
--   - クライアント (browser / Capacitor) は anon キーで直接アクセスしないよう
--     既にコード側を API 経由へ切替済み（LR-7 コード変更）。本 migration はその前提で
--     DB レベルの緩いポリシーを撤去する。
--
-- 安全順序（重要）:
--   1. 先に LR-7 のコード（anon 直アクセス除去・record-score 認証束縛）をデプロイする。
--   2. その後に本 migration を `npm run db:migrate` で**手動適用**する。
--      （Render 自動デプロイでは migration は走らない設計）。
--   これにより「ポリシー撤去でクライアントが壊れる」事故を防ぐ。
--
-- 冪等性:
--   既存マイグレ (029) と同様に `DROP POLICY IF EXISTS` を使い、
--   再適用しても失敗しない形にしている。
--   service_role 用の明示的な insert/select ポリシーは作らない
--   （service_role は RLS BYPASS なのでポリシー不要。RLS デフォルト deny で
--    anon / authenticated からのアクセスを全拒否する）。

-- =====================================================================
-- 1. placement_results — 公開 SELECT を撤去（読みはサーバー service_role 経由のみ）
-- =====================================================================
-- クライアントは /api/placement/ranking・/api/placement/submit 経由のみで
-- このテーブルにアクセスしている（src 内に anon 直アクセス無し）。
-- よって「placement: read all (using(true))」を撤去しても壊れない。
DROP POLICY IF EXISTS "placement: read all" ON public.placement_results;

-- 匿名 insert（user_id null 許可）も撤去する。
-- 書込は /api/placement/submit (service_role) 経由のみに限定。
DROP POLICY IF EXISTS "placement: write own" ON public.placement_results;

COMMENT ON TABLE public.placement_results IS
  'プレースメント結果（偏差値ランキング）。読み書きは /api/placement/* (service_role) 経由のみ。'
  'anon / authenticated からの直接 SELECT / INSERT は不可 (038 migration)。';

-- =====================================================================
-- 2. reports — 匿名・無制限 INSERT を撤去（書込はサーバー service_role 経由のみ）
-- =====================================================================
-- クライアントは /api/report-problem (service_role) 経由のみで insert している。
-- 読取は /api/reports（admin secret + service_role）経由のみ（公開 select ポリシーは元々無し）。
DROP POLICY IF EXISTS "reports: insert only" ON public.reports;

COMMENT ON TABLE public.reports IS
  '問題報告。insert は /api/report-problem (service_role) 経由のみ。'
  'anon / authenticated からの直接 INSERT は不可 (038 migration)。';

-- =====================================================================
-- 3. feedback — 匿名 INSERT / 公開 SELECT を撤去（書込はサーバー service_role 経由のみ）
-- =====================================================================
-- クライアントは /api/feedback (service_role) 経由のみで insert する（LR-7 で anon 直 insert
-- フォールバックを除去済み）。読取は元々 service_role 限定ポリシーだが、API 経由 (service_role)
-- は RLS BYPASS で動くため、明示ポリシーが無くても読める。整理のため両方撤去する。
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Service role can read feedback" ON public.feedback;

COMMENT ON TABLE public.feedback IS
  'アプリ内フィードバック。insert は /api/feedback (service_role) 経由のみ。'
  'anon / authenticated からの直接 INSERT は不可 (038 migration)。';

-- =====================================================================
-- 4. fermi_scores — 公開 SELECT / 無制限 INSERT を撤去（読み書きはサーバー経由のみ）
-- =====================================================================
-- クライアントは /api/fermi/record-score（記録）・/api/fermi/ranking（参照）経由のみ。
-- record-score は LR-7 で「認証済みなら user_id をサーバー検証済み UUID に束縛」するよう
-- 修正済み（#38 なりすまし防止）。直接 insert 経路は DB レベルでも閉じる。
DROP POLICY IF EXISTS "Anyone can read fermi scores" ON public.fermi_scores;
DROP POLICY IF EXISTS "Service role can insert fermi scores" ON public.fermi_scores;

COMMENT ON TABLE public.fermi_scores IS
  'フェルミ推定スコア（ランキング）。読み書きは /api/fermi/* (service_role) 経由のみ。'
  'anon / authenticated からの直接 SELECT / INSERT は不可 (038 migration)。';

-- =====================================================================
-- 5. user_stats — RLS 有効化 ＋ 書込 service_role 限定
-- =====================================================================
-- 009 で作成された user_stats は RLS が未有効で、guest_id ベースのため
-- 誰でも任意 guest_id の XP を書き換え可能だった（#38 詐称）。
-- RLS を有効化し、明示ポリシーを作らないことで anon / authenticated からの
-- 直接アクセスを全拒否する（書込はサーバー service_role 経由のみ。
-- 該当 API があれば service_role が RLS BYPASS で動作継続する）。
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_stats IS
  'XP・ニックネームの正準ストア (guest 系)。RLS 有効化済み。'
  '書込は service_role 経由のみ。anon / authenticated からの直接アクセスは不可 (038 migration)。';

-- =====================================================================
-- 6. METABASE: 要 Keita 確認（#39 metabase_readonly の BYPASSRLS 見直し）
-- =====================================================================
-- 現状 (021_metabase_readonly):
--   metabase_readonly ロールに
--     - GRANT SELECT ON ALL TABLES IN SCHEMA public
--     - ALTER ROLE metabase_readonly BYPASSRLS
--   が付与されており、**RLS を完全にバイパスして public schema の全テーブルを読める**。
--   これには PII を含む表（profiles / notebooks(日記) / journal_* / health metrics 等）も
--   含まれ、Metabase 接続情報が漏れると全ユーザーの機微データが流出するリスクがある。
--
-- 是正の方針（推奨）:
--   (a) BYPASSRLS を剥奪し、PII を含まない集計用ビューだけに SELECT を限定する。
--   (b) 集計に必要な指標は PII 除外の専用ビュー（例: 件数・XP 集計のみ）を用意して
--       そのビューにだけ GRANT SELECT する。
--
-- ただし**この変更は Keita の Metabase ダッシュボードの既存クエリを壊す可能性が高い**ため、
-- 本 migration では実行文をコメントアウトし、適用前レビューを必須とする。
-- どのテーブル/列を Metabase が実際に参照しているかを確認してから、下記を有効化すること。
--
-- ── 推奨 GRANT（レビュー後に有効化）─────────────────────────────────
--
-- -- (1) 全テーブル一律 SELECT を剥奪し、BYPASSRLS を外す。
-- REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM metabase_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM metabase_readonly;
-- ALTER ROLE metabase_readonly NOBYPASSRLS;
--
-- -- (2) PII を含まない集計専用ビューを用意し、それだけに SELECT を付与する。
-- --     既存の public.metabase_users（email domain のみ）は維持し、追加で
-- --     ランキング/XP 等の非 PII 集計ビューを定義する想定。
-- -- 例（列は実際の Metabase ダッシュボードに合わせて調整すること）:
-- -- CREATE OR REPLACE VIEW public.metabase_fermi_score_stats AS
-- --   SELECT question_index,
-- --          count(*)        AS submissions,
-- --          round(avg(score))::int AS avg_score,
-- --          max(score)      AS max_score
-- --   FROM public.fermi_scores
-- --   GROUP BY question_index;
-- -- GRANT SELECT ON public.metabase_fermi_score_stats TO metabase_readonly;
-- -- GRANT SELECT ON public.metabase_users TO metabase_readonly;  -- 既存ビュー（domain のみ）
--
-- 判断がつくまでは BYPASSRLS / 全テーブル SELECT を**剥奪しない**（ダッシュボードを壊さない）。
-- この節は方針記述のみ。実行は Keita のレビュー後に行う。
