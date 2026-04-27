-- Migration: SCRUM-153 ユーザー属性カラム追加
-- 実行日: 2026-04-27
-- 適用先: Supabase > SQL Editor
-- ※ 本ファイルは参照用。実際のDB適用はKeita-sanの承認後に手動で実行してください。

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purposes TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS self_assessment SMALLINT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- インデックス（将来の分析クエリ用）
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON profiles(age_range);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON profiles(occupation);

-- 確認クエリ
-- SELECT age_range, occupation, COUNT(*) FROM profiles GROUP BY age_range, occupation ORDER BY COUNT(*) DESC;
