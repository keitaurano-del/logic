-- 039: LR-9 Phase 0 / レビュー #41 ─ set_updated_at() の search_path を固定する。
--
-- 背景:
--   001 は `set_updated_at()` を `security definer set search_path = public` で定義していたが、
--   012 が `create or replace function set_updated_at() ... language plpgsql as $$...$$`
--   と **search_path 指定なし** で上書きしたため、現行の実体は search_path 可変。
--   可変 search_path の関数は、悪意あるオブジェクトを優先解決される余地があり Supabase linter も赤。
--
-- 修正:
--   関数本体は不変（new.updated_at = now() のみ）のまま、`set search_path = public` を付与して固定する。
--   権限文脈は現行（security invoker＝定義なし）を維持し、不要な権限昇格(security definer)は行わない。
--   既存トリガは関数名 set_updated_at を参照し続けるため変更不要。冪等（create or replace）。
--
-- 適用は手動（scripts/run-migration.js）。本マイグレは他施策と独立・低リスク。

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end $$;
