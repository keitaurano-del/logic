-- 017_journal_images.sql
-- 2026-05-17: ジャーナルに画像添付（最大 10 枚 / 日）を追加
--
-- 追加内容:
--   1. daily_journals.images jsonb — 添付画像メタの配列
--      要素: { path: string, uploaded_at: string, width?: number, height?: number }
--      path は Storage オブジェクトのフルパス（{user_id}/{date}/{uuid}.{ext}）
--   2. Storage bucket `journal-images` を private で作成
--      ファイルサイズ上限 10MB、許可 MIME は jpeg/png/webp/heic/heif
--   3. Storage RLS: 認証ユーザーは自身の user_id フォルダ配下のみ get/insert/update/delete 可能
--
-- 画像の整合性（DB の path と Storage の実体）はアプリ層で担保する。

-- 1) DB カラム
alter table public.daily_journals
  add column if not exists images jsonb default '[]'::jsonb;

-- 配列以外が入らないようガード
alter table public.daily_journals
  drop constraint if exists daily_journals_images_is_array;
alter table public.daily_journals
  add constraint daily_journals_images_is_array
  check (jsonb_typeof(images) = 'array');

-- 2) Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-images',
  'journal-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3) Storage RLS — 自分のフォルダ配下のみ
drop policy if exists "journal-images: read own" on storage.objects;
drop policy if exists "journal-images: insert own" on storage.objects;
drop policy if exists "journal-images: update own" on storage.objects;
drop policy if exists "journal-images: delete own" on storage.objects;

create policy "journal-images: read own"
  on storage.objects for select
  using (
    bucket_id = 'journal-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "journal-images: insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'journal-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "journal-images: update own"
  on storage.objects for update
  using (
    bucket_id = 'journal-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "journal-images: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'journal-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
