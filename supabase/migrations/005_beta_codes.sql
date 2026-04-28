-- ベータ招待コードテーブル
CREATE TABLE IF NOT EXISTS beta_codes (
  code TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  max_uses INT DEFAULT 1,
  use_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  note TEXT
);

-- profilesテーブルにbeta_code_usedカラム追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beta_code_used TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;

-- 初期ベータコード（テスト用）
INSERT INTO beta_codes (code, note) VALUES
  ('LOGIC2026', '一般公開ベータ（無制限）'),
  ('EARLYBIRD', 'アーリーアクセス'),
  ('KEITA0429', '社内テスト用')
ON CONFLICT DO NOTHING;
