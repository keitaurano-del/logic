-- Migration: フェルミ推定 回答データ蓄積テーブル
-- 実行日: 2026-04-27
-- 適用先: Supabase > SQL Editor
-- ※ 本ファイルは参照用。実際のDB適用はKeita-sanの承認後に手動で実行してください。

-- =============================================
-- fermi_answers テーブル
-- =============================================
CREATE TABLE IF NOT EXISTS fermi_answers (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 問題情報
  question_date DATE NOT NULL,                    -- 出題日 (例: 2026-04-27)
  question_text TEXT NOT NULL,                    -- 問題文

  -- ユーザー識別（認証前はguest_idで管理）
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_id      TEXT,                             -- 未認証ユーザーのlocalStorage ID

  -- 回答内容
  user_input    TEXT NOT NULL,                    -- ユーザーの回答テキスト
  hint_used     BOOLEAN NOT NULL DEFAULT FALSE,   -- ヒント使用フラグ
  elapsed_sec   INTEGER,                          -- 解答時間（秒）

  -- AIスコア
  score         SMALLINT,                         -- 0〜100点
  score_breakdown TEXT,                           -- "論理性 40/50 · 独自性 25/30 · 明確さ 15/20"
  ai_feedback   TEXT,                             -- AIフィードバック本文

  -- メタ情報
  locale        TEXT NOT NULL DEFAULT 'ja',       -- 'ja' or 'en'
  app_version   TEXT                              -- クライアントアプリバージョン
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_fermi_answers_question_date ON fermi_answers(question_date);
CREATE INDEX IF NOT EXISTS idx_fermi_answers_user_id ON fermi_answers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fermi_answers_guest_id ON fermi_answers(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fermi_answers_score ON fermi_answers(score) WHERE score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fermi_answers_created_at ON fermi_answers(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE fermi_answers ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の回答のみ閲覧可
CREATE POLICY "users_read_own_answers" ON fermi_answers
  FOR SELECT USING (
    auth.uid() = user_id
    OR guest_id = current_setting('app.guest_id', true)
  );

-- サービスロールは全件アクセス可（サーバーサイドAPIから使用）
-- (service_role keyはRLSをバイパスするのでポリシー不要)

COMMENT ON TABLE fermi_answers IS 'フェルミ推定の回答ログ。分析・ユーザー振り返り用。';
COMMENT ON COLUMN fermi_answers.question_date IS '出題日（毎日同じ問題なので日付でグループ可能）';
COMMENT ON COLUMN fermi_answers.score IS 'AIによる採点結果 0〜100点';
COMMENT ON COLUMN fermi_answers.guest_id IS '非認証ユーザー識別子（localStorage: logic-guest-id）';
