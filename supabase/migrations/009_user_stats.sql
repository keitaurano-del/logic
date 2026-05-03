-- Migration 009: user_stats — XP・ニックネームの正準ストア
-- ─────────────────────────────────────────────────────────────────
-- placement_results は本来「プレースメントテストの結果」のテーブル。
-- 008 で xp 列を相乗りさせていたが、プレースメント未受験ユーザーの
-- XP が乗らない／概念が混在する問題があったため、専用テーブルへ分離。
--
-- placement_results.xp は当面残す（ロールバック余地）。
-- 将来削除する場合は別 migration で `ALTER TABLE ... DROP COLUMN xp;`

CREATE TABLE IF NOT EXISTS user_stats (
  guest_id   TEXT PRIMARY KEY,
  nickname   TEXT NOT NULL DEFAULT 'ゲスト',
  xp         INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- XP 順ソート用
CREATE INDEX IF NOT EXISTS idx_user_stats_xp
  ON user_stats (xp DESC);

-- 008 適用済み環境からの backfill（xp 列が無ければスキップ）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'placement_results' AND column_name = 'xp'
  ) THEN
    INSERT INTO user_stats (guest_id, nickname, xp)
    SELECT guest_id, nickname, xp
    FROM placement_results
    WHERE xp > 0
    ON CONFLICT (guest_id) DO UPDATE
      SET xp = GREATEST(user_stats.xp, EXCLUDED.xp),
          updated_at = now();
  END IF;
END $$;
