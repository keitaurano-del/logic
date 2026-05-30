-- =====================================================================
-- Logic Dogfooding Phase 2b — MCP 実行用 seed SQL
-- =====================================================================
--
-- 目的: service_role キーが使えない環境で、tsx seed.ts の代わりに
--       Supabase MCP（execute_sql / SQL Editor）から流して 20 ペルソナを投入する。
--
-- 投入先: Logic 本番 project ref = yctlelmlwjwlcpcxvmgx
--
-- タグ付け（personas.ts / Phase2a と整合）:
--   - auth.users.raw_user_meta_data = { is_test:true, persona:"pNN",
--       batch:"dogfood-20260530", nickname:"…" }
--   - email = dogfood+pNN@logic-test.local
--   - fermi_answers.question_text / feedback.message = "[DOGFOOD:pNN] …" prefix
--   - feedback.source = 'dogfood'（本番 KPI から除外可能に）
--   - subscriptions.stripe_customer_id = 'dogfood_pNN'（実決済なし）
--
-- 決定的 UUID:
--   user_id = extensions.uuid_generate_v5(
--               '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,   -- DNS namespace 定数
--               'logic-dogfood-20260530:pNN')
--   → 同じ persona は何度流しても同じ UUID。seed の再実行 / cleanup と一意に対応。
--
-- 冪等性:
--   - auth.users        : ON CONFLICT (id) DO NOTHING
--   - auth.identities    : ON CONFLICT (provider, provider_id) DO NOTHING
--   - profiles          : ON CONFLICT (id) DO UPDATE（handle_new_user トリガが先に骨組みを作るため上書き）
--   - user_progress     : ON CONFLICT (user_id) DO UPDATE
--   - user_placement    : ON CONFLICT (user_id) DO UPDATE
--   - subscriptions     : ON CONFLICT (user_id) DO UPDATE
--   - admin_overrides   : ON CONFLICT (user_id) DO UPDATE
--   - fermi_answers     : WHERE NOT EXISTS（serial PK・user_id 列のため prefix で重複判定）
--   - feedback          : WHERE NOT EXISTS（serial PK・user_id 列なしのため message prefix で重複判定）
--
-- トリガ注意（実スキーマ確認済み 2026-05-30）:
--   auth.users への INSERT で public.handle_new_user() が走り、
--   profiles(id, nickname=split_part(email,'@',1), language='ja') を
--   ON CONFLICT (id) DO NOTHING で先に作る。後続の profiles UPSERT が
--   nickname / occupation / birth_year / language / onboarded_at を正しい値で上書きする。
--
-- 実行単位: ペルソナ毎に `-- ===== pNN =====` で区切ってある。
--           まず p01 ブロックだけ流して検証 → 問題なければ p02..p20 を流す、が可能。
--           ヘッダ（拡張有効化）は最初に1回流すこと。
--
-- ★このファイルは「生成物」。本番への実行は Keita の承認を取ってから。
-- =====================================================================

-- ---- ヘッダ: 拡張（既に有効だが冪等に）----
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto"  with schema extensions;


-- =====================================================================
-- ===== p01 =====  佐藤ハル / free / beginner / ja
--   completed=6 fermi=3 streak=4 deviation=48  feedback=UI改善
-- =====================================================================

-- (a) auth user（決定的 UUID・email_confirm 済み・マジックリンク方針のためパスワードはダミー固定）
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) values (
  '00000000-0000-0000-0000-000000000000',
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  'authenticated', 'authenticated', 'dogfood+p01@logic-test.local',
  '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', -- ダミー固定（ログイン不使用）
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"is_test":true,"persona":"p01","batch":"dogfood-20260530","nickname":"佐藤ハル"}'::jsonb,
  false, false
) on conflict (id) do nothing;

-- (a2) identity（email provider・provider_id = user_id::text）
--   ※ auth.identities.email は generated column のため列指定しない（identity_data.email から自動生成）
insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01')::text,
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  jsonb_build_object(
    'sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01')::text,
    'email', 'dogfood+p01@logic-test.local',
    'email_verified', true, 'phone_verified', false
  ),
  'email', now(), now(), now()
) on conflict (provider, provider_id) do nothing;

-- (b1) profiles（トリガ生成の骨組みを正しい値で上書き）
insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  '佐藤ハル', 'ja', '学生', 2003, now(), now()
) on conflict (id) do update set
  nickname = excluded.nickname, language = excluded.language,
  occupation = excluded.occupation, birth_year = excluded.birth_year,
  onboarded_at = excluded.onboarded_at, updated_at = excluded.updated_at;

-- (b2) user_progress（completed=6 / streak=4 → 直近4日 / 1レッスン≒4分）
insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  '[1,2,3,4,5,6]'::jsonb,
  (select jsonb_agg(to_char((current_date - g)::date, 'YYYY-MM-DD')) from generate_series(0,3) g),
  6 * 4 * 60 * 1000, '{}'::jsonb, '{}'::jsonb, now()
) on conflict (user_id) do update set
  completed_lessons = excluded.completed_lessons, study_dates = excluded.study_dates,
  study_time_ms = excluded.study_time_ms, updated_at = excluded.updated_at;

-- (b3) user_placement（deviation=48 / correct=round(48/100*20)=10 / total=20）
insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  48, 10, 20, '[1,2,3,4,5]'::jsonb, now()
) on conflict (user_id) do update set
  deviation = excluded.deviation, correct_count = excluded.correct_count,
  total_count = excluded.total_count, recommended_lesson_ids = excluded.recommended_lesson_ids,
  completed_at = excluded.completed_at;

-- (b4) fermi_answers（3 行・question_text に [DOGFOOD:p01] prefix・冪等は prefix で判定）
insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01'),
  (current_date - (i % 4)),
  '[DOGFOOD:p01] サンプルフェルミ問題 #' || (i+1),
  ((i+1)*1000)::text,
  (i % 3 = 0),
  60 + i*10,
  40 + ((i*7) % 50),
  'ja', 'dogfood'
from generate_series(0,2) i
where not exists (
  select 1 from public.fermi_answers f
  where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p01')
    and f.question_text like '[DOGFOOD:p01]%'
);

-- (d) feedback（1 行・[DOGFOOD:p01] prefix・source=dogfood・冪等は prefix で判定）
insert into public.feedback (category, message, locale, source)
select 'UI改善',
  '[DOGFOOD:p01] 就活目的だとSPI・玉手箱・ケース面接コースが別々の場所にあって横断しづらいです。',
  'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p01]%');


-- =====================================================================
-- ===== p02 =====  田中ミオ / trial(=standard trialing) / beginner / ja
--   completed=4 fermi=2 streak=3 deviation=46  feedback=課金導線
--   ※ trial は isPaid=true 扱い → subscriptions(status=trialing) + admin_overrides
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000',
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'),
  'authenticated', 'authenticated', 'dogfood+p02@logic-test.local',
  '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"is_test":true,"persona":"p02","batch":"dogfood-20260530","nickname":"田中ミオ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02')::text,
  extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'),
  jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02')::text, 'email', 'dogfood+p02@logic-test.local', 'email_verified', true, 'phone_verified', false),
  'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'), '田中ミオ', 'ja', 'その他', 2002, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'),
  '[1,2,3,4]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,2) g), 4*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'), 46, 9, 20, '[1,2,3,4]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'),
  (current_date - (i % 3)), '[DOGFOOD:p02] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,1) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02') and f.question_text like '[DOGFOOD:p02]%');

-- trial: subscriptions(status=trialing, period_end=+7d) + admin_overrides(premium)
insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'), 'standard', 'trialing', 'dogfood_p02', 'dogfood_sub_p02', now() + interval '7 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p02'), 'premium', 'dogfood-seed', '[DOGFOOD:p02] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select '課金導線', '[DOGFOOD:p02] ジャーナルの7日トライアルの残り日数や終了予告が分かりづらく、不意に終わりそうで不安です。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p02]%');


-- =====================================================================
-- ===== p03 =====  鈴木ケンタ / free / intermediate / ja
--   completed=9 fermi=4 streak=2 deviation=53  feedback=機能追加
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), 'authenticated', 'authenticated', 'dogfood+p03@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p03","batch":"dogfood-20260530","nickname":"鈴木ケンタ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03')::text, 'email', 'dogfood+p03@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), '鈴木ケンタ', 'ja', '営業・マーケ', 1998, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), '[1,2,3,4,5,6,7,8,9]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,1) g), 9*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), 53, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03'), (current_date - (i % 2)), '[DOGFOOD:p03] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,3) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p03') and f.question_text like '[DOGFOOD:p03]%');

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p03] 週末しか使えないとストリークが途切れます。週末型でも続けられる猶予や復活の仕組みが欲しいです。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p03]%');


-- =====================================================================
-- ===== p04 =====  高橋アヤ / paid_yearly(=standard active) / advanced / ja
--   completed=22 fermi=18 streak=21 deviation=68  feedback=機能追加  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), 'authenticated', 'authenticated', 'dogfood+p04@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p04","batch":"dogfood-20260530","nickname":"高橋アヤ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04')::text, 'email', 'dogfood+p04@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), '高橋アヤ', 'ja', 'コンサルタント', 1995, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), (select jsonb_agg(n) from generate_series(1,22) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,20) g), 22*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), 68, 14, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), (current_date - (i % 21)), '[DOGFOOD:p04] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,17) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04') and f.question_text like '[DOGFOOD:p04]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), 'standard', 'active', 'dogfood_p04', 'dogfood_sub_p04', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p04'), 'premium', 'dogfood-seed', '[DOGFOOD:p04] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p04] フェルミのランキングのスコア算出基準と母数が不透明です。上位者の根拠が分かると競争心が湧きます。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p04]%');


-- =====================================================================
-- ===== p05 =====  伊藤ダイ / free / intermediate / ja
--   completed=8 fermi=5 streak=3 deviation=55  feedback=内容・説明が間違っている
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), 'authenticated', 'authenticated', 'dogfood+p05@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p05","batch":"dogfood-20260530","nickname":"伊藤ダイ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05')::text, 'email', 'dogfood+p05@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), '伊藤ダイ', 'ja', 'エンジニア・IT', 1991, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), '[1,2,3,4,5,6,7,8]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,2) g), 8*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), 55, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05'), (current_date - (i % 3)), '[DOGFOOD:p05] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,4) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p05') and f.question_text like '[DOGFOOD:p05]%');

insert into public.feedback (category, message, locale, source)
select '内容・説明が間違っている', '[DOGFOOD:p05] 一部レッスンで図解(SVG)と本文の説明が食い違っている箇所があります。図のラベルが本文と対応していません。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p05]%');


-- =====================================================================
-- ===== p06 =====  渡辺サキ / paid_monthly(=standard active) / intermediate / ja
--   completed=11 fermi=8 streak=14 deviation=57  feedback=機能追加  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), 'authenticated', 'authenticated', 'dogfood+p06@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p06","batch":"dogfood-20260530","nickname":"渡辺サキ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06')::text, 'email', 'dogfood+p06@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), '渡辺サキ', 'ja', '企画・事業開発', 2000, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), (select jsonb_agg(n) from generate_series(1,11) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,13) g), 11*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), 57, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), (current_date - (i % 14)), '[DOGFOOD:p06] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,7) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06') and f.question_text like '[DOGFOOD:p06]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), 'standard', 'active', 'dogfood_p06', 'dogfood_sub_p06', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p06'), 'premium', 'dogfood-seed', '[DOGFOOD:p06] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p06] AI問題生成の生成中の待ち時間が体感長いです。進捗表示か、生成済みのストックがあると安心します。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p06]%');


-- =====================================================================
-- ===== p07 =====  山本ジン / free / intermediate / ja
--   completed=7 fermi=3 streak=2 deviation=52  feedback=UI改善
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), 'authenticated', 'authenticated', 'dogfood+p07@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p07","batch":"dogfood-20260530","nickname":"山本ジン"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07')::text, 'email', 'dogfood+p07@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), '山本ジン', 'ja', '管理部門', 1984, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), '[1,2,3,4,5,6,7]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,1) g), 7*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), 52, 10, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07'), (current_date - (i % 2)), '[DOGFOOD:p07] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,2) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p07') and f.question_text like '[DOGFOOD:p07]%');

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p07] タブ構成と戻る導線が分かりづらく、なぜなぜ分析コースをカテゴリ名から見つけられませんでした。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p07]%');


-- =====================================================================
-- ===== p08 =====  中村リカ / free / beginner / ja
--   completed=2 fermi=1 streak=1 deviation=44  feedback=UI改善
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), 'authenticated', 'authenticated', 'dogfood+p08@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p08","batch":"dogfood-20260530","nickname":"中村リカ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08')::text, 'email', 'dogfood+p08@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), '中村リカ', 'ja', '学生', 2006, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), '[1,2]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,0) g), 2*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), 44, 9, 20, '[1,2]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08'), (current_date - (i % 1)), '[DOGFOOD:p08] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,0) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p08') and f.question_text like '[DOGFOOD:p08]%');

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p08] 哲学・東洋思想コースの導入の敷居が高く、最初の一歩が分かりませんでした。通知で復帰できると助かります。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p08]%');


-- =====================================================================
-- ===== p09 =====  小林タク / paid_monthly(=standard active) / advanced / ja
--   completed=19 fermi=10 streak=6 deviation=64  feedback=UI改善  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), 'authenticated', 'authenticated', 'dogfood+p09@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p09","batch":"dogfood-20260530","nickname":"小林タク"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09')::text, 'email', 'dogfood+p09@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), '小林タク', 'ja', 'コンサルタント', 1988, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), (select jsonb_agg(n) from generate_series(1,19) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,5) g), 19*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), 64, 13, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), (current_date - (i % 6)), '[DOGFOOD:p09] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,9) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09') and f.question_text like '[DOGFOOD:p09]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), 'standard', 'active', 'dogfood_p09', 'dogfood_sub_p09', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p09'), 'premium', 'dogfood-seed', '[DOGFOOD:p09] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p09] iPad横画面でカスタムコース作成画面のレイアウトが崩れます。Webとモバイルの同期も確認したいです。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p09]%');


-- =====================================================================
-- ===== p10 =====  加藤ノゾミ / free / intermediate / ja
--   completed=10 fermi=4 streak=2 deviation=54  feedback=機能追加
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), 'authenticated', 'authenticated', 'dogfood+p10@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p10","batch":"dogfood-20260530","nickname":"加藤ノゾミ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10')::text, 'email', 'dogfood+p10@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), '加藤ノゾミ', 'ja', '管理部門', 1997, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), '[1,2,3,4,5,6,7,8,9,10]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,1) g), 10*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), 54, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10'), (current_date - (i % 2)), '[DOGFOOD:p10] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,3) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p10') and f.question_text like '[DOGFOOD:p10]%');

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p10] 保存アイテムが増えると一覧が探しづらいです。フォルダ分けや検索・並び替えが欲しいです。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p10]%');


-- =====================================================================
-- ===== p11 =====  吉田ハヤト / free / beginner / ja
--   completed=5 fermi=6 streak=12 deviation=49  feedback=機能追加
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), 'authenticated', 'authenticated', 'dogfood+p11@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p11","batch":"dogfood-20260530","nickname":"吉田ハヤト"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11')::text, 'email', 'dogfood+p11@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), '吉田ハヤト', 'ja', 'その他', 2001, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), '[1,2,3,4,5]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,11) g), 5*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), 49, 10, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11'), (current_date - (i % 12)), '[DOGFOOD:p11] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,5) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p11') and f.question_text like '[DOGFOOD:p11]%');

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p11] 連続記録が命なので、1日抜けてもストリークが即0になるのは厳しいです。猶予や復活アイテムが欲しいです。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p11]%');


-- =====================================================================
-- ===== p12 =====  山田エリ / paid_monthly(=standard active) / intermediate / ja
--   completed=9 fermi=5 streak=4 deviation=53  feedback=バグ報告  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), 'authenticated', 'authenticated', 'dogfood+p12@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p12","batch":"dogfood-20260530","nickname":"山田エリ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12')::text, 'email', 'dogfood+p12@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), '山田エリ', 'ja', '専門職', 1993, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), '[1,2,3,4,5,6,7,8,9]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,3) g), 9*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), 53, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), (current_date - (i % 4)), '[DOGFOOD:p12] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,4) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12') and f.question_text like '[DOGFOOD:p12]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), 'standard', 'active', 'dogfood_p12', 'dogfood_sub_p12', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p12'), 'premium', 'dogfood-seed', '[DOGFOOD:p12] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select 'バグ報告', '[DOGFOOD:p12] 夜間に短時間で中断すると、学習時間の計測が途中離脱時に正しく止まらないことがあります。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p12]%');


-- =====================================================================
-- ===== p13 =====  佐々木リョウ / paid_yearly(=standard active) / intermediate / ja
--   completed=12 fermi=16 streak=18 deviation=58  feedback=UI改善  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), 'authenticated', 'authenticated', 'dogfood+p13@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p13","batch":"dogfood-20260530","nickname":"佐々木リョウ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13')::text, 'email', 'dogfood+p13@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), '佐々木リョウ', 'ja', '学生', 2005, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), (select jsonb_agg(n) from generate_series(1,12) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,17) g), 12*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), 58, 12, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), (current_date - (i % 18)), '[DOGFOOD:p13] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,15) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13') and f.question_text like '[DOGFOOD:p13]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), 'standard', 'active', 'dogfood_p13', 'dogfood_sub_p13', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p13'), 'premium', 'dogfood-seed', '[DOGFOOD:p13] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p13] ランキングの自分の順位とスコアの伸びをもっと見たいです。デイリー上限到達後の物足りなさも感じます。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p13]%');


-- =====================================================================
-- ===== p14 =====  松本カナ / free / intermediate / ja
--   completed=8 fermi=3 streak=2 deviation=54  feedback=UI改善
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), 'authenticated', 'authenticated', 'dogfood+p14@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p14","batch":"dogfood-20260530","nickname":"松本カナ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14')::text, 'email', 'dogfood+p14@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), '松本カナ', 'ja', '営業・マーケ', 1999, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), '[1,2,3,4,5,6,7,8]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,1) g), 8*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), 54, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14'), (current_date - (i % 2)), '[DOGFOOD:p14] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,2) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p14') and f.question_text like '[DOGFOOD:p14]%');

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p14] コースを途中で離脱したあと、続きに戻る導線が弱いです。おすすめも当たり外れがあります。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p14]%');


-- =====================================================================
-- ===== p15 =====  井上ソウ / paid_yearly(=standard active) / advanced / ja
--   completed=20 fermi=9 streak=7 deviation=66  feedback=機能追加  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), 'authenticated', 'authenticated', 'dogfood+p15@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p15","batch":"dogfood-20260530","nickname":"井上ソウ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15')::text, 'email', 'dogfood+p15@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), '井上ソウ', 'ja', '経営・役員', 1981, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), (select jsonb_agg(n) from generate_series(1,20) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,6) g), 20*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), 66, 13, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), (current_date - (i % 7)), '[DOGFOOD:p15] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,8) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15') and f.question_text like '[DOGFOOD:p15]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), 'standard', 'active', 'dogfood_p15', 'dogfood_sub_p15', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p15'), 'premium', 'dogfood-seed', '[DOGFOOD:p15] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p15] TTSの読み上げ速度を細かく調整したいです。コース連続再生中の安定性も改善されると効率的です。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p15]%');


-- =====================================================================
-- ===== p16 =====  木村ユイ / free / beginner / ja
--   completed=6 fermi=2 streak=5 deviation=47  feedback=UI改善
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), 'authenticated', 'authenticated', 'dogfood+p16@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p16","batch":"dogfood-20260530","nickname":"木村ユイ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16')::text, 'email', 'dogfood+p16@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), '木村ユイ', 'ja', '学生', 2004, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), '[1,2,3,4,5,6]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,4) g), 6*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), 47, 9, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16'), (current_date - (i % 5)), '[DOGFOOD:p16] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,1) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p16') and f.question_text like '[DOGFOOD:p16]%');

insert into public.feedback (category, message, locale, source)
select 'UI改善', '[DOGFOOD:p16] 配置診断のレベル判定の根拠がもう少し見えると、結果が腑に落ちます。完璧主義なので判定に動揺しました。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p16]%');


-- =====================================================================
-- ===== p17 =====  林タケシ / free / beginner / ja
--   completed=2 fermi=1 streak=1 deviation=45  feedback=その他
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), 'authenticated', 'authenticated', 'dogfood+p17@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p17","batch":"dogfood-20260530","nickname":"林タケシ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17')::text, 'email', 'dogfood+p17@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), '林タケシ', 'ja', 'その他', 1974, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), '[1,2]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,0) g), 2*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), 45, 9, 20, '[1,2]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17'), (current_date - (i % 1)), '[DOGFOOD:p17] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,0) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p17') and f.question_text like '[DOGFOOD:p17]%');

insert into public.feedback (category, message, locale, source)
select 'その他', '[DOGFOOD:p17] 文字が小さく感じます。文字サイズ調整やコントラスト設定の場所がもっと分かりやすいと助かります。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p17]%');


-- =====================================================================
-- ===== p18 =====  清水アオイ / paid_monthly(=standard active) / intermediate / ja
--   completed=9 fermi=6 streak=5 deviation=56  feedback=機能追加  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), 'authenticated', 'authenticated', 'dogfood+p18@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p18","batch":"dogfood-20260530","nickname":"清水アオイ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18')::text, 'email', 'dogfood+p18@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), '清水アオイ', 'ja', '専門職', 1996, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), '[1,2,3,4,5,6,7,8,9]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,4) g), 9*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), 56, 11, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), (current_date - (i % 5)), '[DOGFOOD:p18] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,5) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18') and f.question_text like '[DOGFOOD:p18]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), 'standard', 'active', 'dogfood_p18', 'dogfood_sub_p18', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p18'), 'premium', 'dogfood-seed', '[DOGFOOD:p18] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select '機能追加', '[DOGFOOD:p18] 通知が多いと割り込まれて集中が切れます。通知の粒度や時間帯を細かく制御できると助かります。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p18]%');


-- =====================================================================
-- ===== p19 =====  森ハナ / free / beginner / ja
--   completed=4 fermi=2 streak=3 deviation=46  feedback=その他
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), 'authenticated', 'authenticated', 'dogfood+p19@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p19","batch":"dogfood-20260530","nickname":"森ハナ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19')::text, 'email', 'dogfood+p19@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), '森ハナ', 'ja', 'その他', 1990, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), '[1,2,3,4]'::jsonb, (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,2) g), 4*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), 46, 9, 20, '[1,2,3,4]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19'), (current_date - (i % 3)), '[DOGFOOD:p19] サンプルフェルミ問題 #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'ja', 'dogfood'
from generate_series(0,1) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p19') and f.question_text like '[DOGFOOD:p19]%');

insert into public.feedback (category, message, locale, source)
select 'その他', '[DOGFOOD:p19] 解説をじっくり読む派です。不正解時のフィードバック文言が責めない中立的なトーンだと安心して続けられます。', 'ja', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p19]%');


-- =====================================================================
-- ===== p20 =====  岡田ケイ / paid_monthly(=standard active) / advanced / en
--   completed=17 fermi=9 streak=6 deviation=65  feedback=バグ報告(en)  ★有料
-- =====================================================================

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('00000000-0000-0000-0000-000000000000', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), 'authenticated', 'authenticated', 'dogfood+p20@logic-test.local', '$2a$10$DOGFOODdummyhashDOGFOODdummyhashDOGFOODdummyhashDOG12', now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"is_test":true,"persona":"p20","batch":"dogfood-20260530","nickname":"岡田ケイ"}'::jsonb, false, false)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20')::text, extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), jsonb_build_object('sub', extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20')::text, 'email', 'dogfood+p20@logic-test.local', 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

insert into public.profiles (id, nickname, language, occupation, birth_year, onboarded_at, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), '岡田ケイ', 'en', 'その他', 1986, now(), now())
on conflict (id) do update set nickname=excluded.nickname, language=excluded.language, occupation=excluded.occupation, birth_year=excluded.birth_year, onboarded_at=excluded.onboarded_at, updated_at=excluded.updated_at;

insert into public.user_progress (user_id, completed_lessons, study_dates, study_time_ms, category_progress, completion_counts, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), (select jsonb_agg(n) from generate_series(1,17) n), (select jsonb_agg(to_char((current_date - g)::date,'YYYY-MM-DD')) from generate_series(0,5) g), 17*4*60*1000, '{}'::jsonb, '{}'::jsonb, now())
on conflict (user_id) do update set completed_lessons=excluded.completed_lessons, study_dates=excluded.study_dates, study_time_ms=excluded.study_time_ms, updated_at=excluded.updated_at;

insert into public.user_placement (user_id, deviation, correct_count, total_count, recommended_lesson_ids, completed_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), 65, 13, 20, '[1,2,3,4,5]'::jsonb, now())
on conflict (user_id) do update set deviation=excluded.deviation, correct_count=excluded.correct_count, total_count=excluded.total_count, recommended_lesson_ids=excluded.recommended_lesson_ids, completed_at=excluded.completed_at;

insert into public.fermi_answers (user_id, question_date, question_text, user_input, hint_used, elapsed_sec, score, locale, app_version)
select extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), (current_date - (i % 6)), '[DOGFOOD:p20] sample fermi question #' || (i+1), ((i+1)*1000)::text, (i % 3 = 0), 60 + i*10, 40 + ((i*7) % 50), 'en', 'dogfood'
from generate_series(0,8) i
where not exists (select 1 from public.fermi_answers f where f.user_id = extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20') and f.question_text like '[DOGFOOD:p20]%');

insert into public.subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), 'standard', 'active', 'dogfood_p20', 'dogfood_sub_p20', now() + interval '30 days', now())
on conflict (user_id) do update set plan=excluded.plan, status=excluded.status, stripe_customer_id=excluded.stripe_customer_id, stripe_subscription_id=excluded.stripe_subscription_id, current_period_end=excluded.current_period_end, updated_at=excluded.updated_at;

insert into public.admin_overrides (user_id, plan, granted_by, note)
values (extensions.uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'logic-dogfood-20260530:p20'), 'premium', 'dogfood-seed', '[DOGFOOD:p20] dogfood-20260530')
on conflict (user_id) do update set plan=excluded.plan, granted_by=excluded.granted_by, note=excluded.note;

insert into public.feedback (category, message, locale, source)
select 'バグ報告', '[DOGFOOD:p20] [en locale] Some screens have untranslated strings and locale-dependent data (e.g. "Japan population" in Fermi) feels off in English.', 'en', 'dogfood'
where not exists (select 1 from public.feedback where message like '[DOGFOOD:p20]%');


-- =====================================================================
-- 投入後の検証クエリ（任意・read のみ）
-- =====================================================================
-- select count(*) from auth.users where raw_user_meta_data->>'is_test'='true';                  -- 期待 20
-- select count(*) from public.profiles where id in (select id from auth.users where raw_user_meta_data->>'is_test'='true'); -- 期待 20
-- select count(*) from public.fermi_answers where question_text like '[DOGFOOD:%';                -- 期待 117
-- select count(*) from public.feedback where source='dogfood';                                    -- 期待 20
-- select count(*) from public.subscriptions where stripe_customer_id like 'dogfood_%';            -- 期待 9
-- select count(*) from public.admin_overrides where note like '[DOGFOOD:%';                        -- 期待 9
-- select count(*) from public.user_placement where user_id in (select id from auth.users where raw_user_meta_data->>'is_test'='true'); -- 期待 20
