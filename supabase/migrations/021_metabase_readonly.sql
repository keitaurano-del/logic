-- 021_metabase_readonly.sql
-- 2026-05-23: Metabase 分析ダッシュボード用 read-only role
--
-- Metabase から Supabase Postgres に接続する専用ロールを作成する。
-- public schema の参照系（SELECT）のみ許可、書き込み・スキーマ変更は不可。
-- パスワードは migration には書かない。Supabase Dashboard > Database > Roles で
-- 別途設定するか、`ALTER ROLE metabase_readonly WITH PASSWORD '...'` を
-- 本番に手動適用する（password 文字列は repo に残さないこと）。
--
-- 接続文字列例:
--   postgresql://metabase_readonly:<PASSWORD>@<HOST>:6543/postgres?sslmode=require
--   ※ Connection Pooling 経由 (transaction mode、port 6543) を推奨

-- ─── role 本体 ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_readonly') THEN
    CREATE ROLE metabase_readonly LOGIN NOINHERIT;
    -- パスワードは後で ALTER ROLE で設定する。
    -- 例: ALTER ROLE metabase_readonly WITH PASSWORD 'xxxxx';
  END IF;
END $$;

-- ─── 接続権限 ─────────────────────────────────────────────────────
GRANT CONNECT ON DATABASE postgres TO metabase_readonly;
GRANT USAGE ON SCHEMA public TO metabase_readonly;

-- ─── 既存テーブル参照権限 ─────────────────────────────────────────
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO metabase_readonly;

-- ─── 将来追加されるテーブルにも自動で SELECT を付与 ───────────────
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO metabase_readonly;

-- ─── auth.users（メールアドレス等の機微情報含む） ────────────────
-- Metabase で集計に必要な最低限のカラム（id, created_at）だけを露出するため、
-- 専用 view を作って auth.users 全体への直接 SELECT は付与しない。
CREATE OR REPLACE VIEW public.metabase_users AS
  SELECT
    id,
    created_at,
    last_sign_in_at,
    -- email は domain 部分だけ抽出（個人特定性を下げる）
    split_part(email, '@', 2) AS email_domain
  FROM auth.users;

COMMENT ON VIEW public.metabase_users IS
  'Metabase 集計用のユーザービュー。email 本体は出さず domain のみ。auth.users への直接 SELECT は付与しない方針。';

GRANT SELECT ON public.metabase_users TO metabase_readonly;

-- ─── RLS は ENABLE のままにする ──────────────────────────────────
-- metabase_readonly は NOINHERIT なので、auth.uid() が NULL になり
-- RLS ポリシーの auth.uid() = user_id 系では何も見えなくなる。
-- 分析用には RLS を一時的にバイパスする必要があるため、
-- BYPASSRLS を別途付与する。これにより全ユーザーの集計が可能になる。
--
-- セキュリティ前提: metabase_readonly のパスワード管理を厳格に行う
-- (Render 環境変数のみ、漏洩時は即 ALTER ROLE で再発行)
ALTER ROLE metabase_readonly BYPASSRLS;

-- ─── サニティチェック用メタデータ ─────────────────────────────────
COMMENT ON ROLE metabase_readonly IS
  'Read-only role for Metabase analytics dashboard. BYPASSRLS enabled. See docs/ANALYTICS_DASHBOARD.md for connection details.';
