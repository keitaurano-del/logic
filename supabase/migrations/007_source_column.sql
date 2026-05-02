-- SCRUM-202: reports・feedbackテーブルにsource列を追加
-- source: 'production' | 'sit' でデータ出所を識別する

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'production';

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'production';

-- インデックス（cronクエリの絞り込みを高速化）
CREATE INDEX IF NOT EXISTS reports_source_idx ON reports(source);
CREATE INDEX IF NOT EXISTS feedback_source_idx ON feedback(source);
