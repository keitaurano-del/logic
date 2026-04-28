-- Migration: 006_generated_problems
-- Description: AI 問題自動生成システム用テーブル
-- Related: SCRUM-83, SCRUM-84, SCRUM-85, SCRUM-68

CREATE TABLE generated_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  question TEXT NOT NULL,
  choices JSONB NOT NULL,  -- [{label: string, correct: boolean}]
  explanation TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT false,
  approved_by TEXT,
  quality_score FLOAT,
  used_count INT DEFAULT 0,
  tags TEXT[]
);

-- インデックス: カテゴリ・難易度・承認済みで頻繁に検索する
CREATE INDEX idx_generated_problems_category ON generated_problems(category);
CREATE INDEX idx_generated_problems_difficulty ON generated_problems(difficulty);
CREATE INDEX idx_generated_problems_approved ON generated_problems(approved);
CREATE INDEX idx_generated_problems_quality_score ON generated_problems(quality_score);

-- RLS: 承認済み問題は全認証ユーザーが参照可能
ALTER TABLE generated_problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved_problems_select" ON generated_problems
  FOR SELECT
  USING (approved = true);

-- サービスロール（管理操作）は全行アクセス可能 (Service key bypass RLS by default)
