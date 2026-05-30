/**
 * DF-F11: 無料トライアル残日数の表示判定テスト。
 * 残日数算出（getJournalTrialDaysLeft）と表示判定（shouldShowTrial 系）の
 * 境界（残り0日 / 期限切れ直後 / 有料 / 未ログイン）を検証する。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getJournalTrialDaysLeft, isTrialActive } from '../subscription'
import { shouldShowTrial, shouldShowTrialEndingBanner } from '../trialStatus'

const DAY = 86400000

function setInstallDaysAgo(days: number) {
  const ts = Date.now() - days * DAY
  localStorage.setItem('logic-install-id', `install-${ts}-abc123`)
}

function setPaid() {
  localStorage.setItem('logic-subscription', JSON.stringify({
    plan: 'paid_monthly',
    expiresAt: new Date(Date.now() + 30 * DAY).toISOString(),
    playStoreToken: 't',
  }))
}

describe('DF-F11 trial status', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  describe('getJournalTrialDaysLeft', () => {
    it('returns full days when freshly installed (no timestamp)', () => {
      expect(getJournalTrialDaysLeft()).toBe(7)
    })
    it('returns remaining days mid-trial', () => {
      setInstallDaysAgo(5)
      expect(getJournalTrialDaysLeft()).toBe(2)
    })
    it('returns 0 once 7 days have passed', () => {
      setInstallDaysAgo(7)
      expect(getJournalTrialDaysLeft()).toBe(0)
    })
    it('returns 0 well past expiry (no negative)', () => {
      setInstallDaysAgo(30)
      expect(getJournalTrialDaysLeft()).toBe(0)
    })
  })

  describe('isTrialActive', () => {
    it('is true mid-trial on the free plan', () => {
      setInstallDaysAgo(3)
      expect(isTrialActive()).toBe(true)
    })
    it('is false once trial is over', () => {
      setInstallDaysAgo(8)
      expect(isTrialActive()).toBe(false)
    })
    it('is false for paid users even within the trial window', () => {
      setInstallDaysAgo(2)
      setPaid()
      expect(isTrialActive()).toBe(false)
    })
  })

  describe('shouldShowTrial (badge)', () => {
    it('shows only when logged in and trial active', () => {
      setInstallDaysAgo(3)
      expect(shouldShowTrial(true)).toBe(true)
    })
    it('hidden when not logged in', () => {
      setInstallDaysAgo(3)
      expect(shouldShowTrial(false)).toBe(false)
    })
    it('hidden after trial ends', () => {
      setInstallDaysAgo(8)
      expect(shouldShowTrial(true)).toBe(false)
    })
    it('hidden for paid users', () => {
      setInstallDaysAgo(2)
      setPaid()
      expect(shouldShowTrial(true)).toBe(false)
    })
  })

  describe('shouldShowTrialEndingBanner (<=2 days)', () => {
    it('hidden with 3+ days left', () => {
      setInstallDaysAgo(4) // 3 days left
      expect(shouldShowTrialEndingBanner(true)).toBe(false)
    })
    it('shown with exactly 2 days left', () => {
      setInstallDaysAgo(5) // 2 days left
      expect(shouldShowTrialEndingBanner(true)).toBe(true)
    })
    it('shown on the last day (1 day left)', () => {
      setInstallDaysAgo(6.5) // <1 day -> ceil to 1
      expect(getJournalTrialDaysLeft()).toBe(1)
      expect(shouldShowTrialEndingBanner(true)).toBe(true)
    })
    it('hidden right after expiry (0 days)', () => {
      setInstallDaysAgo(7)
      expect(shouldShowTrialEndingBanner(true)).toBe(false)
    })
    it('hidden when not logged in even if ending soon', () => {
      setInstallDaysAgo(5)
      expect(shouldShowTrialEndingBanner(false)).toBe(false)
    })
  })
})
