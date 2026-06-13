/**
 * LR-32: 起動短縮（bootTiming）とタブ独立履歴スタック（tabStack）の純粋ロジック検証。
 *
 * - bootTiming: 初回/2回目の分岐、localStorage 不可時のフォールバック（安全側=初回）。
 * - tabStack: ルート画面除外・揮発画面除外・remember/restore のラウンドトリップ。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BOOTED_ONCE_KEY,
  FIRST_LAUNCH_MIN_BOOT_MS,
  REPEAT_LAUNCH_MIN_BOOT_MS,
  getMinBootMs,
  isFirstLaunch,
  markBooted,
} from '../bootTiming'
import {
  createTabStack,
  rememberScreen,
  restoreScreen,
  type ScreenLike,
} from '../tabStack'

describe('LR-32 bootTiming', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('getMinBootMs: 初回は長く（2000）、2回目以降は短い（400）', () => {
    expect(getMinBootMs(true)).toBe(FIRST_LAUNCH_MIN_BOOT_MS)
    expect(getMinBootMs(true)).toBe(2000)
    expect(getMinBootMs(false)).toBe(REPEAT_LAUNCH_MIN_BOOT_MS)
    expect(getMinBootMs(false)).toBe(400)
    expect(REPEAT_LAUNCH_MIN_BOOT_MS).toBeLessThan(FIRST_LAUNCH_MIN_BOOT_MS)
  })

  it('isFirstLaunch: 未記録なら初回（true）、markBooted 後は false', () => {
    expect(isFirstLaunch()).toBe(true)
    markBooted()
    expect(localStorage.getItem(BOOTED_ONCE_KEY)).toBe('1')
    expect(isFirstLaunch()).toBe(false)
  })

  it('初回→markBooted→2回目で getMinBootMs が 2000→400 に切り替わる', () => {
    expect(getMinBootMs(isFirstLaunch())).toBe(2000)
    markBooted()
    expect(getMinBootMs(isFirstLaunch())).toBe(400)
  })

  it('localStorage.getItem が throw する環境では安全側で初回扱い（true）', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: localStorage unavailable')
    })
    expect(isFirstLaunch()).toBe(true)
  })

  it('localStorage.setItem が throw しても markBooted は例外を投げない', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => markBooted()).not.toThrow()
  })
})

describe('LR-32 tabStack', () => {
  // AppV3 の ROOT_SCREENS / PERSISTABLE_SCREENS を模した集合
  const rootScreens = new Set<string>(['home', 'lessons', 'fermi-ranking', 'journal', 'profile'])
  const restorableScreens = new Set<string>([
    'home', 'lessons', 'roadmap', 'profile', 'flashcards', 'review-mode',
    'streak', 'completed-lessons', 'study-time', 'rank', 'journal', 'fermi-ranking',
  ])
  const opts = { rootScreens, restorableScreens }

  type S = ScreenLike & { category?: string }

  it('非ルート・復元可能な画面を覚えて復元できる（ラウンドトリップ）', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'roadmap', category: 'logic' }, opts)
    const restored = restoreScreen(stack, 'lessons', opts)
    expect(restored).toEqual({ type: 'roadmap', category: 'logic' })
  })

  it('ルート画面は覚えない（復元は null = 従来どおりルートへ）', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'lessons' }, opts)
    expect(restoreScreen(stack, 'lessons', opts)).toBeNull()
  })

  it('揮発画面（PERSISTABLE 外: lesson 等）は覚えない', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'lesson' }, opts)
    expect(restoreScreen(stack, 'lessons', opts)).toBeNull()
  })

  it('記憶がないタブは null を返す', () => {
    const stack = createTabStack<S>()
    expect(restoreScreen(stack, 'profile', opts)).toBeNull()
  })

  it('ルート/揮発画面で remember すると過去の記憶を破棄する', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'roadmap' }, opts)
    expect(restoreScreen(stack, 'lessons', opts)).toEqual({ type: 'roadmap' })
    // 同タブでルート画面に居た状態で離脱 → 記憶破棄
    rememberScreen(stack, 'lessons', { type: 'lessons' }, opts)
    expect(restoreScreen(stack, 'lessons', opts)).toBeNull()
  })

  it('タブごとに独立して記憶する', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'roadmap', category: 'a' }, opts)
    rememberScreen(stack, 'profile', { type: 'streak' }, opts)
    expect(restoreScreen(stack, 'lessons', opts)).toEqual({ type: 'roadmap', category: 'a' })
    expect(restoreScreen(stack, 'profile', opts)).toEqual({ type: 'streak' })
  })

  it('restore 時に復元可能性を再検証する（restorable 集合が変わったら null）', () => {
    const stack = createTabStack<S>()
    rememberScreen(stack, 'lessons', { type: 'roadmap' }, opts)
    // 復元可能集合から roadmap を外したオプションで復元しようとすると null
    const narrowed = {
      rootScreens,
      restorableScreens: new Set<string>(['home']),
    }
    expect(restoreScreen(stack, 'lessons', narrowed)).toBeNull()
  })
})
