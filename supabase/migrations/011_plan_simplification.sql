-- 011_plan_simplification.sql
-- 2026-05-15: 単一有料プランへ集約
--
-- クライアント側の SubscriptionPlan は 'free' | 'paid_monthly' | 'paid_yearly'
-- の 3 値だけになった。DB 側に残っている legacy plan を新型へ正規化する。
--
-- 対象テーブル:
--   - subscriptions.plan
--   - profiles.plan（存在する場合）
--   - admin_overrides.plan（存在する場合）

-- ─── subscriptions ────────────────────────────────────────────────
UPDATE subscriptions
SET plan = 'paid_monthly'
WHERE plan IN (
  'monthly',
  'basic_monthly',
  'standard_monthly',
  'premium_monthly'
);

UPDATE subscriptions
SET plan = 'paid_yearly'
WHERE plan IN (
  'yearly',
  'basic_yearly',
  'standard_yearly',
  'premium_yearly',
  'campaign_yearly',
  'beta_campaign'
);

UPDATE subscriptions
SET plan = 'free'
WHERE plan = 'trial';

-- ─── profiles ─────────────────────────────────────────────────────
-- plan カラムが存在する場合のみ更新する（存在しない環境でも安全に走るよう DO ブロックで包む）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    UPDATE profiles
    SET plan = 'paid_monthly'
    WHERE plan IN (
      'monthly',
      'basic_monthly',
      'standard_monthly',
      'premium_monthly'
    );

    UPDATE profiles
    SET plan = 'paid_yearly'
    WHERE plan IN (
      'yearly',
      'basic_yearly',
      'standard_yearly',
      'premium_yearly',
      'campaign_yearly',
      'beta_campaign'
    );

    UPDATE profiles
    SET plan = 'free'
    WHERE plan = 'trial';
  END IF;
END $$;

-- ─── admin_overrides ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'admin_overrides'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_overrides' AND column_name = 'plan'
  ) THEN
    UPDATE admin_overrides
    SET plan = 'paid_monthly'
    WHERE plan IN (
      'monthly',
      'basic_monthly',
      'standard_monthly',
      'premium_monthly'
    );

    UPDATE admin_overrides
    SET plan = 'paid_yearly'
    WHERE plan IN (
      'yearly',
      'basic_yearly',
      'standard_yearly',
      'premium_yearly',
      'campaign_yearly',
      'beta_campaign'
    );

    UPDATE admin_overrides
    SET plan = 'free'
    WHERE plan = 'trial';
  END IF;
END $$;
