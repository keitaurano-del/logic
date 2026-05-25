import { beforeEach, describe, expect, it, vi } from 'vitest'

// completionCountDb は db/index.ts (Supabase クライアント生成) を import するが、
// env が未設定なら null を返すだけなので unit test では mock 不要。

vi.mock('../db/index', () => ({
  getSupabaseClient: () => null,
  supabase: null,
}))

describe('completionCountDb', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('incrementCompletionCount', () => {
    it('starts at 1 for an unseen key', async () => {
      const { incrementCompletionCount } = await import('../db/completionCountDb')
      expect(incrementCompletionCount('lesson-1')).toBe(1)
    })

    it('increments monotonically', async () => {
      const { incrementCompletionCount } = await import('../db/completionCountDb')
      incrementCompletionCount('lesson-7')
      incrementCompletionCount('lesson-7')
      expect(incrementCompletionCount('lesson-7')).toBe(3)
    })

    it('tracks different keys independently', async () => {
      const { incrementCompletionCount, getCompletionCount } = await import(
        '../db/completionCountDb'
      )
      incrementCompletionCount('a')
      incrementCompletionCount('b')
      incrementCompletionCount('a')
      expect(getCompletionCount('a')).toBe(2)
      expect(getCompletionCount('b')).toBe(1)
    })
  })

  describe('getCompletionCount', () => {
    it('returns 0 for unknown key', async () => {
      const { getCompletionCount } = await import('../db/completionCountDb')
      expect(getCompletionCount('missing')).toBe(0)
    })

    it('reads back persisted value', async () => {
      const { incrementCompletionCount, getCompletionCount } = await import(
        '../db/completionCountDb'
      )
      incrementCompletionCount('lesson-100')
      incrementCompletionCount('lesson-100')
      expect(getCompletionCount('lesson-100')).toBe(2)
    })

    it('ignores corrupted JSON in localStorage', async () => {
      localStorage.setItem('logic-completion-counts', 'not-json{')
      const { getCompletionCount } = await import('../db/completionCountDb')
      expect(getCompletionCount('lesson-1')).toBe(0)
    })

    it('ignores non-numeric or negative values', async () => {
      localStorage.setItem(
        'logic-completion-counts',
        JSON.stringify({ ok: 3, bad: 'oops', zero: 0, neg: -1, frac: 2.7 }),
      )
      const { getCompletionCount } = await import('../db/completionCountDb')
      expect(getCompletionCount('ok')).toBe(3)
      expect(getCompletionCount('bad')).toBe(0)
      expect(getCompletionCount('zero')).toBe(0)
      expect(getCompletionCount('neg')).toBe(0)
      // 小数は floor される
      expect(getCompletionCount('frac')).toBe(2)
    })
  })

  describe('getAllCompletionCounts', () => {
    it('returns a copy (mutation does not affect store)', async () => {
      const { incrementCompletionCount, getAllCompletionCounts } = await import(
        '../db/completionCountDb'
      )
      incrementCompletionCount('lesson-1')
      const snapshot = getAllCompletionCounts()
      snapshot['lesson-1'] = 999
      const reread = getAllCompletionCounts()
      expect(reread['lesson-1']).toBe(1)
    })

    it('returns an empty object initially', async () => {
      const { getAllCompletionCounts } = await import('../db/completionCountDb')
      expect(getAllCompletionCounts()).toEqual({})
    })
  })

  describe('setCompletionCount', () => {
    it('deletes the entry when count <= 0', async () => {
      const { setCompletionCount, getCompletionCount } = await import(
        '../db/completionCountDb'
      )
      setCompletionCount('x', 5)
      setCompletionCount('x', 0)
      expect(getCompletionCount('x')).toBe(0)
    })
  })
})
