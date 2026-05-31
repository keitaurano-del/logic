-- Migration: 保存アイテムのフォルダ分け (FB-11)
--
-- 【重要】このマイグレーションは本番 DB へ未適用です。
--   適用は Keita 承認後（FB-11 の端末間同期サブタスク）に行います。
--   現状のアプリ実装はフォルダ分けを localStorage (logic-saved-folders /
--   SavedItem.folderId) で完結させており、folder_id を Supabase の
--   user_saved_items に同期していません。`npm run db:migrate` 等で
--   本番へ流さないこと。
--
-- 設計メモ:
--   - additive のみ（破壊的変更なし）。すべて IF NOT EXISTS / 冪等。
--   - saved_item_folders: ユーザーのフォルダ定義。RLS は本人のみ all
--     （024_user_saved_items / 033_user_custom_courses の記法に倣う）。
--   - user_saved_items.folder_id: 所属フォルダ（nullable、未分類は NULL）。
--     フォルダ削除時はアイテムを未分類化したいので ON DELETE SET NULL。

-- =============================================
-- saved_item_folders
-- =============================================
CREATE TABLE IF NOT EXISTS public.saved_item_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_item_folders_user_id
  ON public.saved_item_folders (user_id, sort_order);

ALTER TABLE public.saved_item_folders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='saved_item_folders' AND policyname='users_rw_own_saved_item_folders'
  ) THEN
    CREATE POLICY users_rw_own_saved_item_folders ON public.saved_item_folders
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- user_saved_items.folder_id（所属フォルダ、nullable）
-- =============================================
ALTER TABLE public.user_saved_items
  ADD COLUMN IF NOT EXISTS folder_id UUID
  REFERENCES public.saved_item_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_saved_items_folder_id
  ON public.user_saved_items (folder_id);

-- ロールバック手順 (手動):
--   drop index if exists idx_user_saved_items_folder_id;
--   alter table public.user_saved_items drop column if exists folder_id;
--   drop policy if exists users_rw_own_saved_item_folders on public.saved_item_folders;
--   drop index if exists idx_saved_item_folders_user_id;
--   drop table if exists public.saved_item_folders;
