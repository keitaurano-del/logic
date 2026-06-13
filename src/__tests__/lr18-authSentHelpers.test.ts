import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResendCooldown, openMailApp, RESEND_COOLDOWN_SECONDS } from '../screens/authSentHelpers'

describe('LR-18 useResendCooldown', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('starts inactive', () => {
    const { result } = renderHook(() => useResendCooldown(5))
    expect(result.current.active).toBe(false)
    expect(result.current.remaining).toBe(0)
  })

  it('arms the cooldown and counts down to 0', () => {
    const { result } = renderHook(() => useResendCooldown(3))
    act(() => { result.current.start() })
    expect(result.current.remaining).toBe(3)
    expect(result.current.active).toBe(true)

    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.remaining).toBe(2)

    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.remaining).toBe(0)
    expect(result.current.active).toBe(false)
  })

  it('defaults to the shared cooldown constant', () => {
    const { result } = renderHook(() => useResendCooldown())
    act(() => { result.current.start() })
    expect(result.current.remaining).toBe(RESEND_COOLDOWN_SECONDS)
  })
})

describe('LR-18 openMailApp', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('returns true when window.open succeeds', () => {
    vi.stubGlobal('open', vi.fn(() => ({} as Window)))
    expect(openMailApp()).toBe(true)
  })

  it('returns false when window.open is blocked (null)', () => {
    vi.stubGlobal('open', vi.fn(() => null))
    expect(openMailApp()).toBe(false)
  })

  it('returns false (never throws) when window.open throws', () => {
    vi.stubGlobal('open', vi.fn(() => { throw new Error('blocked') }))
    expect(openMailApp()).toBe(false)
  })
})
