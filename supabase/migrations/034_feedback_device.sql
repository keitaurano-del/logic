-- DF-F21: フィードバックの投稿元を特定できるよう、匿名の端末識別子とアプリバージョンを追加する。
-- 追加列はすべて nullable・additive。既存行・既存挙動には影響しない。
-- device_id は localStorage に保存した UUID を再利用する匿名 ID (個人情報は含まない)。
alter table feedback add column if not exists device_id   text;
alter table feedback add column if not exists app_version text;
