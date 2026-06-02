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
  | { type: 'fermi-ranking' }
  | { type: 'profile' }
  | { type: 'flashcards'; mode?: 'due' | 'weak' }
  | { type: 'review-hub' }
  | { type: 'daily-fermi' }
  | { type: 'fermi-history' }
  | { type: 'daily-problem' }
  | { type: 'streak' }
  | { type: 'completed-lessons' }
  | { type: 'study-time' }
  | { type: 'rank' }

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

// ─── Stage② テスト用のロジック抽出 ─────────────────────────────────────────
const NAV_SNAPSHOT_KEY_TEST = 'logic-nav-snapshot'
const PERSISTABLE_SCREENS_TEST = new Set<string>([
  'home', 'lessons', 'roadmap', 'profile',
  'flashcards', 'review-hub', 'wrong-answers', 'saved-items',
  'daily-fermi', 'fermi-ranking', 'fermi-history', 'daily-problem',
  'streak', 'completed-lessons', 'study-time', 'rank', 'journal',
])

function shouldPersist(screen: Screen): boolean {
  return PERSISTABLE_SCREENS_TEST.has(screen.type)
}

function saveSnapshot(screen: Screen): void {
  if (shouldPersist(screen)) {
    localStorage.setItem(NAV_SNAPSHOT_KEY_TEST, JSON.stringify(screen))
  }
}

function loadSnapshot(): Screen | null {
  try {
    const raw = localStorage.getItem(NAV_SNAPSHOT_KEY_TEST)
    if (!raw) return null
    const snapshot = JSON.parse(raw) as Screen
    if (snapshot && PERSISTABLE_SCREENS_TEST.has(snapshot.type)) return snapshot
  } catch { /* ignore */ }
  return null
}

function getInitialScreenForUser_Stage2(): Screen {
  const restored = loadSnapshot()
  if (restored) return restored
  const lastTab = localStorage.getItem('logic-last-tab')
  const RESTORABLE_TABS = ['home', 'lessons', 'fermi-ranking', 'journal', 'profile']
  if (lastTab && RESTORABLE_TABS.includes(lastTab)) {
    if (lastTab === 'fermi-ranking') return { type: 'fermi-ranking' }
    return { type: lastTab } as Screen
  }
  return { type: 'home' }
}

describe('FB-05 Stage② 離脱復帰: localStorage スナップショット', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('PERSISTABLE な screen (roadmap) は saveSnapshot で保存される', () => {
    saveSnapshot({ type: 'roadmap', category: 'logic' })
    expect(localStorage.getItem(NAV_SNAPSHOT_KEY_TEST)).not.toBeNull()
  })

  it('非 PERSISTABLE な screen (lesson) は saveSnapshot で保存されない', () => {
    saveSnapshot({ type: 'lesson', lessonId: 1 } as Screen)
    expect(localStorage.getItem(NAV_SNAPSHOT_KEY_TEST)).toBeNull()
  })

  it('非 PERSISTABLE な screen (lesson-complete) は保存されない', () => {
    saveSnapshot({ type: 'lesson-complete', lessonId: 1, durationSec: 60, prevLevel: 1 } as Screen)
    expect(localStorage.getItem(NAV_SNAPSHOT_KEY_TEST)).toBeNull()
  })

  it('loadSnapshot はスナップショットがあれば復元する', () => {
    saveSnapshot({ type: 'roadmap', category: 'numeracy' })
    const result = loadSnapshot()
    expect(result).toEqual({ type: 'roadmap', category: 'numeracy' })
  })

  it('loadSnapshot はスナップショットがなければ null を返す', () => {
    expect(loadSnapshot()).toBeNull()
  })

  it('getInitialScreenForUser はスナップショットがあればそれを返す', () => {
    saveSnapshot({ type: 'saved-items' })
    expect(getInitialScreenForUser_Stage2()).toEqual({ type: 'saved-items' })
  })

  it('getInitialScreenForUser はスナップショットがない場合 logic-last-tab を参照する', () => {
    localStorage.setItem('logic-last-tab', 'lessons')
    expect(getInitialScreenForUser_Stage2()).toEqual({ type: 'lessons' })
  })

  it('getInitialScreenForUser は logic-last-tab もなければ home を返す', () => {
    expect(getInitialScreenForUser_Stage2()).toEqual({ type: 'home' })
  })
})
