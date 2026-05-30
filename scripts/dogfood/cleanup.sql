-- =====================================================================
-- Logic Dogfooding Phase 2b — MCP 実行用 cleanup SQL
-- =====================================================================
--
-- seed.sql で投入した 20 ペルソナと従属データを安全に全削除する。
-- 起点は auth.users.raw_user_meta_data->>'is_test' = 'true'（＋ dogfood メール保険）。
--
-- 投入先: Logic 本番 project ref = yctlelmlwjwlcpcxvmgx
--
-- FK delete rule（実スキーマ確認済み 2026-05-30）:
--   CASCADE  : profiles / user_progress / user_placement / subscriptions /
--              admin_overrides 他、auth.users or profiles を ON DELETE CASCADE で参照
--              → auth.users 削除で連鎖削除される。
--   SET NULL : fermi_answers.user_id（→auth.users）, reports.user_id（→profiles）
--              → user 削除では行が残るので明示削除する。
--   FK 無し   : feedback（user_id 列なし）→ message の [DOGFOOD:] prefix で明示削除。
--
-- 冪等: 対象が無ければ 0 行削除で正常終了。何度流しても安全。
--
-- ★このファイルは「生成物」。本番への実行（DELETE）は Keita の承認を取ってから。
-- 実行順は以下のとおり（SET NULL / FK 無し → 最後に auth.users）。
-- =====================================================================

-- ---- (0) 削除前の件数確認（任意・read のみ）----
-- select count(*) as test_users from auth.users where raw_user_meta_data->>'is_test'='true';
-- select count(*) as dogfood_fermi from public.fermi_answers where question_text like '[DOGFOOD:%';
-- select count(*) as dogfood_feedback from public.feedback where message like '[DOGFOOD:%' or source='dogfood';

-- ---- (1) fermi_answers: SET NULL なので user 削除では残る。テストユーザーの行を消す ----
--      （prefix と user_id の両方で確実に。user_id がまだ生きているうちに消す）
delete from public.fermi_answers
where question_text like '[DOGFOOD:%'
   or user_id in (
     select id from auth.users where raw_user_meta_data->>'is_test' = 'true'
   );

-- ---- (2) reports: SET NULL（→profiles）。dogfood では未投入だが念のため ----
delete from public.reports
where user_id in (
  select id from auth.users where raw_user_meta_data->>'is_test' = 'true'
);

-- ---- (3) feedback: user_id 列なし。prefix / source で明示削除 ----
delete from public.feedback
where message like '[DOGFOOD:%'
   or source = 'dogfood';

-- ---- (4) auth.identities: auth.users を CASCADE で参照するが、user 削除より前に明示削除しても安全 ----
--      （万一 identities だけ残った過去状態の掃除も兼ねる。冪等）
delete from auth.identities
where user_id in (
  select id from auth.users where raw_user_meta_data->>'is_test' = 'true'
);

-- ---- (5) 最後に auth.users を削除 → profiles / user_progress / user_placement /
--          subscriptions / admin_overrides 等が CASCADE で連鎖削除される ----
delete from auth.users
where raw_user_meta_data->>'is_test' = 'true'
   or (email like 'keita.urano+%@gmail.com');   -- メール保険（is_test が欠けた行も拾う）

-- ---- (6) 削除後の検証（任意・read のみ。すべて 0 を期待）----
-- select count(*) from auth.users where raw_user_meta_data->>'is_test'='true';          -- 期待 0
-- select count(*) from public.fermi_answers where question_text like '[DOGFOOD:%';        -- 期待 0
-- select count(*) from public.feedback where source='dogfood';                            -- 期待 0
-- select count(*) from public.subscriptions where stripe_customer_id like 'dogfood_%';    -- 期待 0
-- select count(*) from public.admin_overrides where note like '[DOGFOOD:%';                -- 期待 0
