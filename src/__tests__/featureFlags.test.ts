import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('featureFlags', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  describe('isDeviceSyncEnabled', () => {
    it('returns false by default when no caches and no env override', async () => {
      const { isDeviceSyncEnabled } = await import('../featureFlags')
      expect(isDeviceSyncEnabled()).toBe(false)
    })

    it('returns true from session cache when enabled flag was fetched', async () => {
      sessionStorage.setItem(
        'logic-flag-device-sync-session',
        JSON.stringify({
          enabled: true,
          rolloutPct: 100,
          hashBucket: 50,
          fetchedAt: Date.now(),
        }),
      )
      const { isDeviceSyncEnabled } = await import('../featureFlags')
      expect(isDeviceSyncEnabled()).toBe(true)
    })

    it('falls back to localStorage persistent cache when session cache is missing', async () => {
      localStorage.setItem(
        'logic-flag-device-sync-last',
        JSON.stringify({
          enabled: true,
          rolloutPct: 25,
          hashBucket: 10,
          fetchedAt: Date.now() - 86400000,
        }),
      )
      const { isDeviceSyncEnabled } = await import('../featureFlags')
      expect(isDeviceSyncEnabled()).toBe(true)
    })

    it('prefers session cache over persistent cache', async () => {
      sessionStorage.setItem(
        'logic-flag-device-sync-session',
        JSON.stringify({ enabled: false, rolloutPct: 0, hashBucket: 0, fetchedAt: Date.now() }),
      )
      localStorage.setItem(
        'logic-flag-device-sync-last',
        JSON.stringify({ enabled: true, rolloutPct: 100, hashBucket: 0, fetchedAt: 0 }),
      )
      const { isDeviceSyncEnabled } = await import('../featureFlags')
      expect(isDeviceSyncEnabled()).toBe(false)
    })

    it('returns false when persistent cache is corrupted', async () => {
      localStorage.setItem('logic-flag-device-sync-last', 'not-json{')
      const { isDeviceSyncEnabled } = await import('../featureFlags')
      expect(isDeviceSyncEnabled()).toBe(false)
    })
  })

  describe('refreshDeviceSyncFlag', () => {
    it('returns null and does not fetch when userId is empty', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      const { refreshDeviceSyncFlag } = await import('../featureFlags')
      const result = await refreshDeviceSyncFlag('')
      expect(result).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('returns cached value without fetching when session cache is warm', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      sessionStorage.setItem(
        'logic-flag-device-sync-session',
        JSON.stringify({
          enabled: true,
          rolloutPct: 100,
          hashBucket: 50,
          fetchedAt: Date.now(),
        }),
      )
      const { refreshDeviceSyncFlag } = await import('../featureFlags')
      const result = await refreshDeviceSyncFlag('user-1')
      expect(result?.enabled).toBe(true)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('fetches, parses, and caches the server response on cold start', async () => {
      const body = { enabled: true, rolloutPct: 50, hashBucket: 23 }
      const fetchMock = vi.fn(async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      vi.stubGlobal('fetch', fetchMock)
      const { refreshDeviceSyncFlag } = await import('../featureFlags')
      const result = await refreshDeviceSyncFlag('user-42')
      expect(result?.enabled).toBe(true)
      expect(result?.rolloutPct).toBe(50)
      expect(result?.hashBucket).toBe(23)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      // 結果がキャッシュに乗っている
      const cached = JSON.parse(sessionStorage.getItem('logic-flag-device-sync-session') || '{}')
      expect(cached.enabled).toBe(true)
      const persisted = JSON.parse(localStorage.getItem('logic-flag-device-sync-last') || '{}')
      expect(persisted.enabled).toBe(true)
    })

    it('returns null on fetch failure without polluting cache', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('boom', { status: 500 })),
      )
      const { refreshDeviceSyncFlag } = await import('../featureFlags')
      const result = await refreshDeviceSyncFlag('user-x')
      expect(result).toBeNull()
      expect(sessionStorage.getItem('logic-flag-device-sync-session')).toBeNull()
    })

    it('survives a thrown fetch error gracefully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('network down')
        }),
      )
      const { refreshDeviceSyncFlag } = await import('../featureFlags')
      const result = await refreshDeviceSyncFlag('user-y')
      expect(result).toBeNull()
    })
  })

  describe('HEAVY_USER_THRESHOLDS constants', () => {
    it('exposes the known thresholds for migration tracing', async () => {
      const { HEAVY_USER_THRESHOLDS } = await import('../featureFlags')
      expect(HEAVY_USER_THRESHOLDS.flashcards).toBe(200)
      expect(HEAVY_USER_THRESHOLDS.notebook).toBe(30)
    })
  })
})
