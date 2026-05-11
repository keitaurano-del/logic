-- Migration 010: fermi_scores — フェルミ推定スコアのランキング用ストア
-- ─────────────────────────────────────────────────────────────────
-- server/routes/fermi.ts の /api/fermi/ranking と /api/fermi/record-score が
-- このテーブルを参照する。マイグレ未適用環境では ranking エンドポイントが
-- レコード数 3 件未満となりダミーデータにフォールバックしていた。

CREATE TABLE IF NOT EXISTS public.fermi_scores (
  id              BIGSERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL DEFAULT 'guest',
  user_name       TEXT NOT NULL DEFAULT 'ゲスト',
  score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  question_index  INTEGER NOT NULL DEFAULT -1,
  elapsed_sec     INTEGER NOT NULL DEFAULT 0,
  hint_used       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ランキング集計用（スコア降順、期間フィルタ）
CREATE INDEX IF NOT EXISTS idx_fermi_scores_score
  ON public.fermi_scores (score DESC);

CREATE INDEX IF NOT EXISTS idx_fermi_scores_created_at
  ON public.fermi_scores (created_at DESC);

-- RLS: 読みは公開、書きは service_role のみ（バックエンド経由のみ受け付ける）
ALTER TABLE public.fermi_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read fermi scores"
  ON public.fermi_scores
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert fermi scores"
  ON public.fermi_scores
  FOR INSERT
  WITH CHECK (true);
