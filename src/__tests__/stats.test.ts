import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// stats.ts は syncService を import するが、syncService は Supabase + flashcards 等
// 大量の依存を芋づる的に持ち込む。unit test では同期処理を無効化して純粋な
// localStorage 計算ロジックだけを検証する。
vi.mock('../syncService', () => ({
  pushProgress: vi.fn(),
  pushDisplayName: vi.fn(async () => undefined),
  getSyncUser: () => null,
}))

// completionCountDb は Supabase 同期側も持つので、localStorage 部分のみ実コードを
// 走らせるためにそのままにする (mock しない)。

describe('stats.ts', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('localDateStr', () => {
    it('returns YYYY-MM-DD in local timezone for a given Date', async () => {
      const { localDateStr } = await import('../stats')
      // 2026-03-15 10:00 ローカル時刻を渡す
      const d = new Date(2026, 2, 15, 10, 0, 0)
      expect(localDateStr(d)).toBe('2026-03-15')
    })

    it('returns todays date when called with no argument', async () => {
      const { localDateStr } = await import('../stats')
      vi.setSystemTime(new Date(2026, 0, 5, 12, 0, 0))
      expect(localDateStr()).toBe('2026-01-05')
    })

    it('accepts a numeric timestamp', async () => {
      const { localDateStr } = await import('../stats')
      const ts = new Date(2026, 5, 20, 0, 30).getTime()
      expect(localDateStr(ts)).toBe('2026-06-20')
    })

    it('pads single-digit months and days', async () => {
      const { localDateStr } = await import('../stats')
      const d = new Date(2026, 0, 7)
      expect(localDateStr(d)).toBe('2026-01-07')
    })
  })

  describe('recordCompletion', () => {
    it('persists lesson key and todays study date', async () => {
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      const { recordCompletion, getCompletedLessons, getStudyDates } = await import('../stats')
      recordCompletion('lesson-20')
      expect(getCompletedLessons()).toContain('lesson-20')
      expect(getStudyDates()).toContain('2026-05-25')
    })

    it('de-duplicates the same lesson key', async () => {
      const { recordCompletion, getCompletedLessons } = await import('../stats')
      recordCompletion('lesson-21')
      recordCompletion('lesson-21')
      const lessons = getCompletedLessons().filter((k) => k === 'lesson-21')
      expect(lessons).toHaveLength(1)
    })

    it('also bumps the completion count for the lesson', async () => {
      const { recordCompletion } = await import('../stats')
      const { getCompletionCount } = await import('../db/completionCountDb')
      recordCompletion('lesson-30')
      recordCompletion('lesson-30')
      expect(getCompletionCount('lesson-30')).toBe(2)
    })
  })

  describe('addStudyTime', () => {
    it('accumulates milliseconds across calls', async () => {
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      const { addStudyTime, getStudyTimeMs } = await import('../stats')
      addStudyTime(1000)
      addStudyTime(2500)
      expect(getStudyTimeMs()).toBe(3500)
    })

    it('records study date for today only once even with repeated calls', async () => {
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      const { addStudyTime, getStudyDates } = await import('../stats')
      addStudyTime(500)
      addStudyTime(500)
      expect(getStudyDates().filter((d) => d === '2026-05-25')).toHaveLength(1)
    })
  })

  describe('appendStudyDaily / getStudyDailyEntry', () => {
    it('aggregates ms and items per local date', async () => {
      const { appendStudyDaily, getStudyDailyEntry } = await import('../stats')
      const ts = new Date(2026, 1, 10, 14, 0).getTime()
      appendStudyDaily({ key: 'lesson:20', ts, ms: 60000 })
      appendStudyDaily({ key: 'fermi:default', ts: ts + 1000, ms: 30000 })
      const entry = getStudyDailyEntry('2026-02-10')
      expect(entry.ms).toBe(90000)
      expect(entry.items).toHaveLength(2)
      expect(entry.items[0].key).toBe('lesson:20')
    })

    it('does not increase ms when ms is undefined (recordCompletion path)', async () => {
      const { appendStudyDaily, getStudyDailyEntry } = await import('../stats')
      const ts = new Date(2026, 1, 11, 14, 0).getTime()
      appendStudyDaily({ key: 'lesson-23', ts })
      const entry = getStudyDailyEntry('2026-02-11')
      expect(entry.ms).toBe(0)
      expect(entry.items).toHaveLength(1)
    })

    it('returns empty entry for an unrecorded date', async () => {
      const { getStudyDailyEntry } = await import('../stats')
      const entry = getStudyDailyEntry('1999-12-31')
      expect(entry).toEqual({ ms: 0, items: [] })
    })

    it('keeps items array immutable from outside (returns a copy)', async () => {
      const { appendStudyDaily, getStudyDailyEntry } = await import('../stats')
      appendStudyDaily({ key: 'a', ts: new Date(2026, 0, 1, 10).getTime(), ms: 100 })
      const e1 = getStudyDailyEntry('2026-01-01')
      e1.items.push({ key: 'tampered', ts: 0 })
      const e2 = getStudyDailyEntry('2026-01-01')
      expect(e2.items).toHaveLength(1)
    })
  })

  describe('getStreak', () => {
    it('returns 0 when there is no study history', async () => {
      const { getStreak } = await import('../stats')
      expect(getStreak()).toBe(0)
    })

    it('returns 0 when last study is older than yesterday', async () => {
      vi.setSystemTime(new Date(2026, 4, 25, 12, 0))
      const { addStudyTime, getStreak } = await import('../stats')
      // 3 日前に学習しただけ
      vi.setSystemTime(new Date(2026, 4, 22, 12, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 25, 12, 0))
      expect(getStreak()).toBe(0)
    })

    it('counts a contiguous streak that ends today', async () => {
      const { addStudyTime, getStreak } = await import('../stats')
      vi.setSystemTime(new Date(2026, 4, 23, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 24, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      addStudyTime(1000)
      expect(getStreak()).toBe(3)
    })

    it('counts a streak that ends yesterday (still alive today)', async () => {
      const { addStudyTime, getStreak } = await import('../stats')
      vi.setSystemTime(new Date(2026, 4, 23, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 24, 9, 0))
      addStudyTime(1000)
      // 今日は学習していないが昨日まで連続
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      expect(getStreak()).toBe(2)
    })

    it('breaks the streak when there is a gap', async () => {
      const { addStudyTime, getStreak } = await import('../stats')
      vi.setSystemTime(new Date(2026, 4, 20, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 22, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 24, 9, 0))
      addStudyTime(1000)
      vi.setSystemTime(new Date(2026, 4, 25, 9, 0))
      addStudyTime(1000)
      // 24 → 25 は連続、22 → 24 で 2 日空き → streak は 2
      expect(getStreak()).toBe(2)
    })
  })
})
