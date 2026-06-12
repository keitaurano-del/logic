/**
 * LR-27: キャンペーンの日付ベース自動制御テスト。
 * isCampaignActiveAt(end, start, now) の境界:
 * - 終了日が未来 → true、過去 → false
 * - 終了日は当日末まで有効（日付のみ指定時）
 * - 開始日が未来なら未開始 → false
 * - 終了日未設定/不正 → 安全側で false
 */
import { describe, it, expect } from 'vitest'
import { isCampaignActiveAt, CAMPAIGN_ACTIVE } from '../subscription'

const t = (iso: string) => new Date(iso).getTime()

describe('LR-27 isCampaignActiveAt', () => {
  it('終了日が未来なら active', () => {
    expect(isCampaignActiveAt('2026-12-31', undefined, t('2026-06-12T00:00:00'))).toBe(true)
  })

  it('終了日が過去なら inactive', () => {
    expect(isCampaignActiveAt('2026-01-01', undefined, t('2026-06-12T00:00:00'))).toBe(false)
  })

  it('終了日当日（末まで）は active', () => {
    // 日付のみ指定は 23:59:59.999 まで有効
    expect(isCampaignActiveAt('2026-06-12', undefined, t('2026-06-12T23:00:00'))).toBe(true)
  })

  it('終了日翌日 00:00 は inactive', () => {
    expect(isCampaignActiveAt('2026-06-12', undefined, t('2026-06-13T00:00:00'))).toBe(false)
  })

  it('開始日が未来なら未開始で inactive', () => {
    expect(isCampaignActiveAt('2026-12-31', '2026-07-01', t('2026-06-12T00:00:00'))).toBe(false)
  })

  it('開始日を過ぎていれば active', () => {
    expect(isCampaignActiveAt('2026-12-31', '2026-06-01', t('2026-06-12T00:00:00'))).toBe(true)
  })

  it('終了日未設定（undefined）は安全側で inactive（fallback=過去日）', () => {
    expect(isCampaignActiveAt(undefined, undefined, t('2026-06-12T00:00:00'))).toBe(false)
  })

  it('終了日が不正文字列は安全側で inactive', () => {
    expect(isCampaignActiveAt('not-a-date', undefined, t('2026-06-12T00:00:00'))).toBe(false)
  })

  it('ISO8601 (時刻付き) の終了日も扱える', () => {
    expect(isCampaignActiveAt('2026-06-12T12:00:00', undefined, t('2026-06-12T11:00:00'))).toBe(true)
    expect(isCampaignActiveAt('2026-06-12T12:00:00', undefined, t('2026-06-12T13:00:00'))).toBe(false)
  })

  it('CAMPAIGN_ACTIVE export は boolean（既存 import を壊さない）', () => {
    expect(typeof CAMPAIGN_ACTIVE).toBe('boolean')
  })
})
