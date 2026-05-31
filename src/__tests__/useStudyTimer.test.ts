// FB-02 回帰テスト: useStudyTimer のバックグラウンド時間除外ロジックの unit test。
//
// カバーするシナリオ:
//   1. visible のまま N 秒経過 → flush で概ね N 秒加算（MIN_DURATION_MS=5s 以上）。
//   2. 背景化（hidden / native isActive=false）中の経過時間は加算されない（FB-02 本体の回帰ガード）。
//      背景遷移 → 長時間 → 復帰 → 閉じる、で背景分が除外されること。
//   3. 5 秒未満の滞在は捨てられる。
//
// addStudyTime / appendStudyDaily（stats.ts）と syncService、@capacitor/* は mock する。
// タイマーは vi.useFakeTimers() で決定的にする。jsdom の document.visibilityState は
// Object.defineProperty で差し替える（jsdom は標準で 'visible' を返し書き込み不可なため）。

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// ── stats.ts を mock（localStorage 計算ではなく加算 ms を直接観測する）──
const addStudyTime = vi.fn()
const appendStudyDaily = vi.fn()
vi.mock('../stats', () => ({
  addStudyTime: (ms: number) => addStudyTime(ms),
  appendStudyDaily: (item: unknown) => appendStudyDaily(item),
}))

// ── server POST 経路は未ログイン扱いで無効化 ──
vi.mock('../syncService', () => ({
  getSyncUser: () => null,
}))

// ── apiBase は @capacitor/core / import.meta.env.DEV に依存するので素通しできるよう簡素化 ──
vi.mock('../screens/apiBase', () => ({ API_BASE: '' }))

// ── @capacitor/core: ネイティブ判定を切り替えられるようにする ──
let isNative = false
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNative },
}))

// ── @capacitor/app: appStateChange リスナーを捕捉して手動発火できるようにする ──
type AppStateListener = (state: { isActive: boolean }) => void
let appStateListener: AppStateListener | null = null
const appHandleRemove = vi.fn(async () => undefined)
const appAddListener = vi.fn(
  async (_event: string, fn: AppStateListener) => {
    appStateListener = fn
    return { remove: appHandleRemove }
  },
)
vi.mock('@capacitor/app', () => ({
  App: { addListener: (event: string, fn: AppStateListener) => appAddListener(event, fn) },
}))

import { useStudyTimer } from '../hooks/useStudyTimer'

// document.visibilityState を任意の値に差し替えるヘルパー。
function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
  document.dispatchEvent(new Event('visibilitychange'))
}

// native の appStateChange を発火する。
function emitAppState(active: boolean) {
  appStateListener?.({ isActive: active })
}

// microtask（App.addListener の .then で handle を捕捉する）を流す。
async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useStudyTimer — FB-02 背景時間除外', () => {
  beforeEach(() => {
    isNative = false
    appStateListener = null
    addStudyTime.mockClear()
    appendStudyDaily.mockClear()
    appAddListener.mockClear()
    appHandleRemove.mockClear()
    setVisibility('visible')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('1) visible のまま N 秒経過 → flush で概ね N 秒加算される', () => {
    const { unmount } = renderHook(() => useStudyTimer({ type: 'lesson', id: '1' }))

    // 30 秒 visible のまま経過
    vi.advanceTimersByTime(30_000)

    // アンマウントで flush
    unmount()

    expect(addStudyTime).toHaveBeenCalledTimes(1)
    expect(addStudyTime).toHaveBeenCalledWith(30_000)
  })

  it('2-web) hidden 中に経過した時間は加算されない（visibilitychange 経路）', () => {
    const { unmount } = renderHook(() => useStudyTimer({ type: 'lesson', id: '1' }))

    // 10 秒アクティブ
    vi.advanceTimersByTime(10_000)
    // 背景化 → ここでセグメントが閉じる
    setVisibility('hidden')
    // 長時間（30 分）背景滞在
    vi.advanceTimersByTime(30 * 60_000)
    // 復帰
    setVisibility('visible')
    // さらに 5 秒アクティブ
    vi.advanceTimersByTime(5_000)

    unmount()

    // 加算は 10s + 5s = 15s のみ。背景の 30 分は除外。
    expect(addStudyTime).toHaveBeenCalledTimes(1)
    expect(addStudyTime).toHaveBeenCalledWith(15_000)
  })

  it('2-native) native では appStateChange(isActive=false) で背景時間が除外される（FB-02 本体）', async () => {
    isNative = true
    const { unmount } = renderHook(() => useStudyTimer({ type: 'lesson', id: '1' }))
    // addListener の Promise を解決して handle を捕捉
    await flushMicrotasks()
    expect(appAddListener).toHaveBeenCalledWith('appStateChange', expect.any(Function))

    // 10 秒アクティブ
    vi.advanceTimersByTime(10_000)
    // ネイティブ背景化（visibilitychange は native では発火しない想定なので使わない）
    emitAppState(false)
    // 長時間（45 分）背景滞在
    vi.advanceTimersByTime(45 * 60_000)
    // 復帰
    emitAppState(true)
    // さらに 8 秒アクティブ
    vi.advanceTimersByTime(8_000)

    unmount()
    await flushMicrotasks()

    // 加算は 10s + 8s = 18s のみ。背景の 45 分は除外（FB-02 の過大計上が起きない）。
    expect(addStudyTime).toHaveBeenCalledTimes(1)
    expect(addStudyTime).toHaveBeenCalledWith(18_000)
    // listener は cleanup で remove される（リーク防止）
    expect(appHandleRemove).toHaveBeenCalled()
  })

  it('3) 5 秒未満の滞在は捨てられる（加算なし）', () => {
    const { unmount } = renderHook(() => useStudyTimer({ type: 'lesson', id: '1' }))

    // 4 秒だけ
    vi.advanceTimersByTime(4_000)
    unmount()

    expect(addStudyTime).not.toHaveBeenCalled()
  })

  it('冪等性: web と native のシグナルが二重発火しても二重計上しない', async () => {
    isNative = true
    const { unmount } = renderHook(() => useStudyTimer({ type: 'lesson', id: '1' }))
    await flushMicrotasks()

    vi.advanceTimersByTime(10_000)
    // native 背景化 → その直後に web の hidden も発火（両方来るケース）
    emitAppState(false)
    setVisibility('hidden')
    vi.advanceTimersByTime(20 * 60_000)
    // 復帰も両方
    emitAppState(true)
    setVisibility('visible')
    vi.advanceTimersByTime(6_000)

    unmount()
    await flushMicrotasks()

    // closeSegment は冪等（segmentStart を 0 に）／再開もガード済みなので
    // 二重に閉じても再開しても 10s + 6s = 16s のまま。
    expect(addStudyTime).toHaveBeenCalledTimes(1)
    expect(addStudyTime).toHaveBeenCalledWith(16_000)
  })
})
