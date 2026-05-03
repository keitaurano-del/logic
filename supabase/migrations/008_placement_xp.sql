-- Migration 008: Add XP column to placement_results for ranking display
-- ─────────────────────────────────────────────────────────────────
-- Adds an `xp` column so the ranking endpoint can show each user's
-- cumulative XP alongside their deviation score.
-- Existing rows default to 0; clients sync their localStorage XP up
-- via /api/placement/sync-xp on ranking screen mount.

ALTER TABLE placement_results
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;

-- Index for potential XP-based sorting in the future.
CREATE INDEX IF NOT EXISTS idx_placement_results_xp
  ON placement_results (xp DESC);
