import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isSuccessMoment,
  hasPromptedReview,
  markReviewPrompted,
  shouldRequestReview,
  REVIEW_MIN_COMPLETED_LESSONS,
  REVIEW_MIN_STREAK_DAYS,
} from '../platform/appReview'
import * as platform from '../platform/platform'

describe('appReview — 成功判定（LR-40）', () => {
  it('3レッスン完了かつストリーク3日で成功の瞬間', () => {
    expect(isSuccessMoment({ completedLessons: 3, streakDays: 3 })).toBe(true)
    expect(isSuccessMoment({ completedLessons: 10, streakDays: 5 })).toBe(true)
  })

  it('しきい値未満は成功と判定しない', () => {
    expect(isSuccessMoment({ completedLessons: 2, streakDays: 3 })).toBe(false)
    expect(isSuccessMoment({ completedLessons: 3, streakDays: 2 })).toBe(false)
    expect(isSuccessMoment({ completedLessons: 0, streakDays: 0 })).toBe(false)
  })

  it('しきい値定数はそれぞれ3', () => {
    expect(REVIEW_MIN_COMPLETED_LESSONS).toBe(3)
    expect(REVIEW_MIN_STREAK_DAYS).toBe(3)
  })
})

describe('appReview — 頻度制御（1回制限）', () => {
  beforeEach(() => {
    try { localStorage.clear() } catch { /* */ }
  })

  it('初期状態では未プロンプト', () => {
    expect(hasPromptedReview()).toBe(false)
  })

  it('markReviewPrompted で以降は表示済みになる', () => {
    markReviewPrompted()
    expect(hasPromptedReview()).toBe(true)
  })
})

describe('appReview — shouldRequestReview の二段ガード', () => {
  beforeEach(() => {
    try { localStorage.clear() } catch { /* */ }
    vi.restoreAllMocks()
  })

  it('native 以外では成功の瞬間でも false（native 限定）', () => {
    vi.spyOn(platform, 'isNative').mockReturnValue(false)
    expect(shouldRequestReview({ completedLessons: 5, streakDays: 5 })).toBe(false)
  })

  it('native かつ成功の瞬間かつ未プロンプトなら true', () => {
    vi.spyOn(platform, 'isNative').mockReturnValue(true)
    expect(shouldRequestReview({ completedLessons: 3, streakDays: 3 })).toBe(true)
  })

  it('native でも一度プロンプト済みなら false（再表示しない）', () => {
    vi.spyOn(platform, 'isNative').mockReturnValue(true)
    markReviewPrompted()
    expect(shouldRequestReview({ completedLessons: 5, streakDays: 5 })).toBe(false)
  })

  it('native でも成功の瞬間でなければ false', () => {
    vi.spyOn(platform, 'isNative').mockReturnValue(true)
    expect(shouldRequestReview({ completedLessons: 1, streakDays: 1 })).toBe(false)
  })
})
