/**
 * src/featureFlags.ts
 *
 * Device Sync の有効/無効判定。
 *
 * Phase 1 (commit 9aa9b89): VITE_ENABLE_DEVICE_SYNC 環境変数のみで判定
 * Phase 3 (2026-05-24): サーバー配信 API /api/feature-flags/device-sync を導入
 *   - 起動時 1 回 fetch して結果を sessionStorage にキャッシュ
 *   - fetch 失敗時は localStorage に残った前回値を fallback
 *   - それも無ければ false (デフォルト OFF)
 *
 * 同期判定は呼び出し側 (syncOnLogin 等) から isDeviceSyncEnabled() で参照される。
 * 初回 fetch 前は env flag だけで判定し (= 内部テスター env=true は即時 ON)、
 * fetch 完了後はサーバー判定で上書きする。
 */

function readEnvFlag(key: string, defaultValue: boolean): boolean {
  try {
    const raw = (import.meta.env as Record<string, string | undefined>)[key]
    if (raw == null) return defaultValue
    const v = String(raw).trim().toLowerCase()
    if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true
    if (v === 'false' || v === '0' || v === 'off' || v === 'no') return false
    return defaultValue
  } catch {
    return defaultValue
  }
}

// ── キャッシュキー ──
const SESSION_CACHE_KEY = 'logic-flag-device-sync-session'
const PERSISTENT_CACHE_KEY = 'logic-flag-device-sync-last'

interface DeviceSyncFlag {
  enabled: boolean
  rolloutPct: number
  hashBucket: number
  fetchedAt: number
}

function readSessionCache(): DeviceSyncFlag | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DeviceSyncFlag
  } catch {
    return null
  }
}

function writeSessionCache(flag: DeviceSyncFlag): void {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(flag))
  } catch { /* */ }
}

function readPersistentCache(): DeviceSyncFlag | null {
  try {
    const raw = localStorage.getItem(PERSISTENT_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DeviceSyncFlag
  } catch {
    return null
  }
}

function writePersistentCache(flag: DeviceSyncFlag): void {
  try {
    localStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(flag))
  } catch { /* */ }
}

/**
 * サーバー /api/feature-flags/device-sync から最新のロールアウト判定を取得して
 * キャッシュに保存する。同セッション中の重複呼び出しは抑止する (一度成功すれば二度目以降は no-op)。
 *
 * 呼び出しは AppV3.tsx のログイン完了時 or syncOnLogin から 1 回だけが想定。
 */
export async function refreshDeviceSyncFlag(userId: string): Promise<DeviceSyncFlag | null> {
  if (!userId) return null
  // 同セッション内に既に fetch 済みならスキップ
  const cached = readSessionCache()
  if (cached) return cached

  try {
    // 動的 import で循環依存を回避 (apiBase は Capacitor を import している)
    const { API_BASE } = await import('./apiBase')
    const url = `${API_BASE}/api/feature-flags/device-sync?userId=${encodeURIComponent(userId)}`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const body = (await res.json()) as { enabled: boolean; rolloutPct: number; hashBucket: number }
    const flag: DeviceSyncFlag = {
      enabled: !!body.enabled,
      rolloutPct: Number(body.rolloutPct) || 0,
      hashBucket: Number(body.hashBucket) || 0,
      fetchedAt: Date.now(),
    }
    writeSessionCache(flag)
    writePersistentCache(flag)
    return flag
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[featureFlags] refreshDeviceSyncFlag failed:', e)
    }
    return null
  }
}

/**
 * Phase 1 デバイス間同期 (flashcards / wrong_answers / saved_items / notebook /
 * roadmap / category_progress) を有効にするか。
 *
 * 判定優先順位:
 *   1. VITE_ENABLE_DEVICE_SYNC=true → 即 true (内部テスター env override)
 *   2. sessionStorage キャッシュ (同セッションの fetch 結果)
 *   3. localStorage キャッシュ (前回セッションの fetch 結果)
 *   4. それも無ければ false (デフォルト OFF)
 */
export function isDeviceSyncEnabled(): boolean {
  // 1. env override (内部テスターのみ true にしておく想定)
  if (readEnvFlag('VITE_ENABLE_DEVICE_SYNC', false)) return true

  // 2. session cache
  const sessionCache = readSessionCache()
  if (sessionCache) return sessionCache.enabled

  // 3. persistent cache (前回 fetch の結果)
  const persistentCache = readPersistentCache()
  if (persistentCache) return persistentCache.enabled

  // 4. デフォルト OFF
  return false
}

/**
 * ヘビーユーザー閾値 (移行時のトレースログ用)。
 * 設計書 Section 5.2 と確認事項 4 で flashcards 200 / notebook 30 維持と確定済。
 */
export const HEAVY_USER_THRESHOLDS = {
  flashcards: 200,
  notebook: 30,
} as const
