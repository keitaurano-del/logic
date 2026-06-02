/**
 * FB-05 Stage① 「戻るルール統一」 回帰テスト
 *
 * AppV3.tsx は副作用が大きく全体 render は困難なため、
 * 以下の3点をロジック単体で確認する。
 *
 * テスト1: home から roadmap に openCategory したとき tab が lessons に切り替わる
 * テスト2: lesson-complete の onNext でカテゴリ内に次レッスンが無いとき roadmap に遷移する
 * テスト3: saved-items から lesson を開いて完了し onNext で次が無いとき saved-items に戻る
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { getAllLessonsFlat } from '../lessonData'

// ─── テスト用の最小 Screen 型 ─────────────────────────────────────────────
type Screen =
  | { type: 'home' }
  | { type: 'roadmap'; category?: string }
  | { type: 'lesson'; lessonId: number; startStep?: number; returnScreen?: Screen }
  | { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number; returnScreen?: Screen }
  | { type: 'saved-items' }
  | { type: 'journal' }
  | { type: 'wrong-answers' }
  | { type: 'lessons' }

// ─── lessonData のモック ──────────────────────────────────────────────────
// カテゴリ 'logic' に id=1, id=2 の 2 レッスン、
// カテゴリ 'case'  に id=10 の 1 レッスン（「次なし」テスト用）
// vi.mock はホイストされるため、factory 内でインラインで定義する。
vi.mock('../lessonData', () => {
  const lessons = {
    1: { id: 1, title: 'Lesson 1', category: 'logic', steps: [] },
    2: { id: 2, title: 'Lesson 2', category: 'logic', steps: [] },
    10: { id: 10, title: 'Lesson 10', category: 'case', steps: [] },
  } as const
  return {
    getAllLessonsFlat: () => lessons,
    allLessons: lessons,
  }
})

// ─── ナビゲーションロジックの抽出 ────────────────────────────────────────
/**
 * home の onOpenCategory callback と同じロジック。
 * setTab と navigate を外から注入して検証する。
 */
function openCategory(
  cat: string,
  setTab: (t: string) => void,
  navigate: (s: Screen) => void,
) {
  if (cat === 'fermi') {
    navigate({ type: 'roadmap', category: cat })
  } else {
    setTab('lessons')
    navigate({ type: 'roadmap', category: cat })
  }
}

/**
 * lesson-complete の onNext ロジック。
 * AppV3.tsx のインライン実装と 1:1 対応。
 */
function lessonCompleteOnNext(
  screen: { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number; returnScreen?: Screen },
  handleOpenLesson: (id: number, returnScreen?: Screen) => void,
  navigate: (s: Screen, replace?: boolean) => void,
) {
  const allFlat = getAllLessonsFlat()
  const currentLesson = allFlat[screen.lessonId]
  if (currentLesson) {
    const sameCategory = Object.values(allFlat)
      .filter(l => l.category === currentLesson.category)
      .sort((a, b) => a.id - b.id)
    const idx = sameCategory.findIndex(l => l.id === screen.lessonId)
    const nextLesson = sameCategory[idx + 1]
    if (nextLesson) {
      handleOpenLesson(nextLesson.id, screen.returnScreen)
      return
    }
  }
  const destination: Screen = screen.returnScreen
    ?? (currentLesson ? { type: 'roadmap', category: currentLesson.category } : { type: 'home' })
  navigate(destination, true)
}

// ─── テスト ───────────────────────────────────────────────────────────────

describe('FB-05 backNav — テスト1: home から roadmap に遷移したとき tab が lessons に切り替わる', () => {
  let setTabSpy: ReturnType<typeof vi.fn>
  let navigateSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setTabSpy = vi.fn()
    navigateSpy = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fermi 以外のカテゴリを開くと setTab("lessons") が呼ばれる', () => {
    openCategory('logic', setTabSpy, navigateSpy)
    expect(setTabSpy).toHaveBeenCalledWith('lessons')
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'roadmap', category: 'logic' })
  })

  it('fermi カテゴリを開くと setTab は呼ばれない', () => {
    openCategory('fermi', setTabSpy, navigateSpy)
    expect(setTabSpy).not.toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'roadmap', category: 'fermi' })
  })

  it('複数カテゴリでも setTab は必ず lessons', () => {
    for (const cat of ['case', 'critical', 'numeracy']) {
      setTabSpy.mockClear()
      navigateSpy.mockClear()
      openCategory(cat, setTabSpy, navigateSpy)
      expect(setTabSpy).toHaveBeenCalledWith('lessons')
    }
  })
})

describe('FB-05 backNav — テスト2: 次レッスンなし → roadmap に遷移する', () => {
  let handleOpenLessonSpy: ReturnType<typeof vi.fn>
  let navigateSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleOpenLessonSpy = vi.fn()
    navigateSpy = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('カテゴリ case に次レッスンが無いとき roadmap/case に遷移する', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 10,  // カテゴリ case に 1 本だけ（次なし）
      durationSec: 60,
      prevLevel: 1,
      returnScreen: undefined,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(handleOpenLessonSpy).not.toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'roadmap', category: 'case' }, true)
  })

  it('カテゴリ logic の最後のレッスンも roadmap/logic に遷移する', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 2,  // logic カテゴリの末尾
      durationSec: 60,
      prevLevel: 1,
      returnScreen: undefined,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(handleOpenLessonSpy).not.toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'roadmap', category: 'logic' }, true)
  })

  it('カテゴリ logic で次レッスンがある場合は handleOpenLesson を呼ぶ', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 1,  // logic カテゴリの先頭（次は 2）
      durationSec: 60,
      prevLevel: 1,
      returnScreen: undefined,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(handleOpenLessonSpy).toHaveBeenCalledWith(2, undefined)
    expect(navigateSpy).not.toHaveBeenCalled()
  })
})

describe('FB-05 backNav — テスト3: saved-items から開いたレッスンを完了し次なしで saved-items に戻る', () => {
  let handleOpenLessonSpy: ReturnType<typeof vi.fn>
  let navigateSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleOpenLessonSpy = vi.fn()
    navigateSpy = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returnScreen=saved-items で次なしのとき saved-items に遷移する', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 10,  // カテゴリ case に 1 本（次なし）
      durationSec: 60,
      prevLevel: 1,
      returnScreen: { type: 'saved-items' } as Screen,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(handleOpenLessonSpy).not.toHaveBeenCalled()
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'saved-items' }, true)
  })

  it('returnScreen=journal で次なしのとき journal に遷移する', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 10,
      durationSec: 60,
      prevLevel: 1,
      returnScreen: { type: 'journal' } as Screen,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'journal' }, true)
  })

  it('returnScreen=saved-items かつ次レッスンありのとき returnScreen を引き継いで handleOpenLesson を呼ぶ', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 1,  // logic カテゴリ、次は id=2
      durationSec: 60,
      prevLevel: 1,
      returnScreen: { type: 'saved-items' } as Screen,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(handleOpenLessonSpy).toHaveBeenCalledWith(2, { type: 'saved-items' })
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('returnScreen=wrong-answers で次なしのとき wrong-answers に遷移する', () => {
    const screen = {
      type: 'lesson-complete' as const,
      lessonId: 10,
      durationSec: 60,
      prevLevel: 1,
      returnScreen: { type: 'wrong-answers' } as Screen,
    }
    lessonCompleteOnNext(screen, handleOpenLessonSpy, navigateSpy)
    expect(navigateSpy).toHaveBeenCalledWith({ type: 'wrong-answers' }, true)
  })
})
