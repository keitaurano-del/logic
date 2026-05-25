import { beforeEach, describe, expect, it, vi } from 'vitest'

// lessonData は実際のレッスン定義 (大量) を持ち込んで起動が重くなるので、
// テスト用に最小限の固定マップでモックする。
vi.mock('../lessonData', () => ({
  allLessons: {
    20: { id: 20, title: 'MECE', category: 'ロジカルシンキング' },
    23: { id: 23, title: 'ピラミッド原則', category: 'ロジカルシンキング' },
    28: { id: 28, title: 'ケース面接入門', category: 'ケース面接' },
  },
}))

// i18n も翻訳が重いので key をそのまま返すスタブで十分。
vi.mock('../i18n', () => ({
  t: (key: string) => key,
  getLocale: () => 'ja',
  setLocale: () => {},
}))

describe('lessonNames', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('resolveLessonName', () => {
    it('resolves "lesson-20" to its allLessons title', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('lesson-20')).toBe('MECE')
    })

    it('falls back to "Lesson <id>" for unknown lesson ids', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('lesson-9999')).toBe('Lesson 9999')
    })

    it('resolves "lesson:23" (useStudyTimer format) using allLessons', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('lesson:23')).toBe('ピラミッド原則')
    })

    it('returns the i18n key for special activity keys (mocked t = identity)', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('fermi')).toBe('completed.specialName.fermi')
      expect(resolveLessonName('placement-test')).toBe('completed.specialName.placementTest')
    })

    it('collapses ai-problem-<id> into the AI practice label', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('ai-problem-123')).toBe('completed.specialName.aiProblem')
    })

    it('returns the raw key when nothing matches', async () => {
      const { resolveLessonName } = await import('../screens/lessonNames')
      expect(resolveLessonName('totally-unknown-key')).toBe('totally-unknown-key')
    })
  })

  describe('resolveCategory', () => {
    it('returns the allLessons category for lesson-<id>', async () => {
      const { resolveCategory } = await import('../screens/lessonNames')
      expect(resolveCategory('lesson-28')).toBe('ケース面接')
    })

    it('returns the special category for known keys', async () => {
      const { resolveCategory } = await import('../screens/lessonNames')
      expect(resolveCategory('fermi')).toBe('AI練習')
      expect(resolveCategory('journal')).toBe('ジャーナル')
    })

    it('returns AI category for ai-problem-* keys', async () => {
      const { resolveCategory } = await import('../screens/lessonNames')
      expect(resolveCategory('ai-problem-abc')).toBe('AI練習')
    })

    it('falls back to i18n key when nothing matches', async () => {
      const { resolveCategory } = await import('../screens/lessonNames')
      expect(resolveCategory('mystery')).toBe('completed.fallbackCategory')
    })
  })

  describe('categoryLabel', () => {
    it('translates known category keys via the i18n table', async () => {
      const { categoryLabel } = await import('../screens/lessonNames')
      expect(categoryLabel('ロジカルシンキング')).toBe('category.logical')
      expect(categoryLabel('AI練習')).toBe('completed.cat.aiPractice')
    })

    it('returns raw category when not in the table', async () => {
      const { categoryLabel } = await import('../screens/lessonNames')
      expect(categoryLabel('unknown-category')).toBe('unknown-category')
    })
  })
})
