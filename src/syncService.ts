/**
 * Supabase データ同期レイヤー
 *
 * 設計:
 * - localStorageをキャッシュとして使う（オフライン対応）
 * - ログイン時: ローカル→Supabaseにマージ
 * - 以後の書き込み: ローカル + Supabase 両方
 * - ログアウト時: ローカルデータそのまま
 * - 未ログイン: localStorageのみ
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isDeviceSyncEnabled, HEAVY_USER_THRESHOLDS, refreshDeviceSyncFlag } from './featureFlags'
import { syncFlashcards, loadCards } from './flashcardData'
import { syncWrongAnswers } from './wrongAnswerStore'
import { syncSavedItems } from './savedItemsStore'
import { syncNotebook, loadEntries } from './notebookStore'
import { syncRoadmap } from './roadmapStore'
import { syncCategoryProgress } from './progressStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch { /* */ }

// ---- Types ----

interface LocalStats {
  completedLessons: string[]
  studyDates: string[]
  studyTimeMs: number
}

interface LocalPlacement {
  deviation: number
  correctCount: number
  totalCount: number
  completedAt: string
  recommendedLessonIds: number[]
}

// ---- Helpers ----

let _currentUserId: string | null = null

export function setSyncUser(userId: string | null) {
  _currentUserId = userId
}

export function getSyncUser(): string | null {
  return _currentUserId
}

function isReady(): boolean {
  return !!supabase && !!_currentUserId
}

// ---- Telemetry 送信 ----

interface TelemetryPayload {
  syncType: string
  itemCount: number
  durationMs: number
  success: boolean
  errorMsg?: string
}

/**
 * /api/sync-telemetry に sync 完了ログを送る。失敗しても UX を止めない。
 *
 * - Supabase の access token を Authorization header に乗せる
 * - 未ログイン or token 取得失敗時は no-op
 * - 送信完了は fire-and-forget (await しても呼び出し側のチェーンを長引かせない)
 */
export async function sendSyncTelemetry(payload: TelemetryPayload): Promise<void> {
  if (!supabase || !_currentUserId) return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    const { API_BASE } = await import('./apiBase')
    await fetch(`${API_BASE}/api/sync-telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: _currentUserId,
        syncType: payload.syncType,
        itemCount: payload.itemCount,
        durationMs: payload.durationMs,
        success: payload.success,
        errorMsg: payload.errorMsg,
      }),
    })
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[sync] sendSyncTelemetry failed:', e)
    }
  }
}

// ---- Progress 同期 ----

export async function pushProgress(stats: LocalStats): Promise<void> {
  if (!isReady()) return
  try {
    await supabase!.from('user_progress').upsert({
      user_id: _currentUserId,
      completed_lessons: stats.completedLessons,
      study_dates: stats.studyDates,
      study_time_ms: stats.studyTimeMs,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  } catch (e) {
    console.warn('[sync] pushProgress failed:', e)
  }
}

export async function pullProgress(): Promise<LocalStats | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('user_progress')
      .select('completed_lessons, study_dates, study_time_ms')
      .eq('user_id', _currentUserId)
      .single()
    if (error || !data) return null
    return {
      completedLessons: data.completed_lessons ?? [],
      studyDates: data.study_dates ?? [],
      studyTimeMs: data.study_time_ms ?? 0,
    }
  } catch {
    return null
  }
}

// ---- 表示名 (profiles.nickname) 同期 ----

export async function pushDisplayName(name: string): Promise<void> {
  if (!isReady()) return
  try {
    await supabase!.from('profiles').upsert({
      id: _currentUserId,
      nickname: name,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  } catch (e) {
    console.warn('[sync] pushDisplayName failed:', e)
  }
}

export async function pullDisplayName(): Promise<string | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('nickname')
      .eq('id', _currentUserId)
      .maybeSingle()
    if (error || !data) return null
    return (data.nickname as string | null) ?? null
  } catch {
    return null
  }
}

// ---- 職業 (profiles.occupation) 同期 ----

/**
 * 職業を Supabase profiles へ upsert する。
 * - 未ログインや Supabase 未設定時は no-op
 * - migration 030 未適用の環境では列が無いため失敗するが UX を止めない
 * - 値は localStorage の Occupation enum と同じ string をそのまま保存
 */
export async function pushOccupation(occupation: string | null): Promise<void> {
  if (!isReady()) return
  try {
    const { error } = await supabase!.from('profiles').upsert({
      id: _currentUserId,
      occupation: occupation ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (error) {
      // migration 030 未適用環境の "column occupation does not exist" は無視
      if (!/occupation/i.test(error.message)) {
        console.warn('[sync] pushOccupation failed:', error.message)
      }
    }
  } catch (e) {
    console.warn('[sync] pushOccupation failed:', e)
  }
}

export async function pullOccupation(): Promise<string | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('occupation')
      .eq('id', _currentUserId)
      .maybeSingle()
    if (error || !data) return null
    return (data.occupation as string | null) ?? null
  } catch {
    return null
  }
}

// ---- 汎用 profile フィールド (birth_year / goal / nickname) 同期 ----

export interface ProfileFieldPatch {
  birth_year?: number | null
  goal?: string | null
  nickname?: string | null
}

/**
 * プロフィール属性 (birth_year / goal / nickname) を Supabase profiles へ upsert する。
 * - 未ログインや Supabase 未設定時は no-op
 * - undefined のフィールドは送信しない (明示的に null を渡すとクリアされる)
 * - migration 030 未適用環境では birth_year 列が無く失敗するが UX を止めない
 */
export async function pushProfileFields(patch: ProfileFieldPatch): Promise<void> {
  if (!isReady()) return
  const payload: Record<string, unknown> = {
    id: _currentUserId,
    updated_at: new Date().toISOString(),
  }
  let hasAny = false
  if (patch.birth_year !== undefined) { payload.birth_year = patch.birth_year; hasAny = true }
  if (patch.goal !== undefined) { payload.goal = patch.goal; hasAny = true }
  if (patch.nickname !== undefined) { payload.nickname = patch.nickname; hasAny = true }
  if (!hasAny) return
  try {
    const { error } = await supabase!.from('profiles').upsert(payload, { onConflict: 'id' })
    if (error) {
      if (!/birth_year|goal|nickname/i.test(error.message)) {
        console.warn('[sync] pushProfileFields failed:', error.message)
      }
    }
  } catch (e) {
    console.warn('[sync] pushProfileFields failed:', e)
  }
}

export async function pullProfileFields(): Promise<{
  birthYear: number | null
  goal: string | null
  nickname: string | null
  occupation: string | null
} | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('birth_year, goal, nickname, occupation')
      .eq('id', _currentUserId)
      .maybeSingle()
    if (error || !data) return null
    return {
      birthYear: (data.birth_year as number | null) ?? null,
      goal: (data.goal as string | null) ?? null,
      nickname: (data.nickname as string | null) ?? null,
      occupation: (data.occupation as string | null) ?? null,
    }
  } catch {
    return null
  }
}

// ---- Placement 同期 ----

export async function pushPlacement(p: LocalPlacement): Promise<void> {
  if (!isReady()) return
  try {
    await supabase!.from('user_placement').upsert({
      user_id: _currentUserId,
      deviation: p.deviation,
      correct_count: p.correctCount,
      total_count: p.totalCount,
      completed_at: p.completedAt,
      recommended_lesson_ids: p.recommendedLessonIds,
    }, { onConflict: 'user_id' })
  } catch (e) {
    console.warn('[sync] pushPlacement failed:', e)
  }
}

export async function pullPlacement(): Promise<LocalPlacement | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('user_placement')
      .select('deviation, correct_count, total_count, completed_at, recommended_lesson_ids')
      .eq('user_id', _currentUserId)
      .single()
    if (error || !data) return null
    return {
      deviation: data.deviation,
      correctCount: data.correct_count,
      totalCount: data.total_count,
      completedAt: data.completed_at,
      recommendedLessonIds: data.recommended_lesson_ids ?? [],
    }
  } catch {
    return null
  }
}

// ---- ログイン時のマージ ----

function mergeArrays(local: string[], remote: string[]): string[] {
  return [...new Set([...remote, ...local])]
}

async function syncSubscriptionFromRemote(): Promise<void> {
  if (!supabase || !_currentUserId) return
  try {
    // admin_overrides を最優先（自動付与プラン）
    const { data: override } = await supabase
      .from('admin_overrides')
      .select('plan')
      .eq('user_id', _currentUserId)
      .maybeSingle()

    if (override?.plan) {
      // クライアント型に正規化（admin_overrides.plan が legacy 値の場合も対応）
      const { normalizeLegacyPlan, setPaidPlan } = await import('./subscription')
      const normalized = normalizeLegacyPlan(override.plan as string)
      if (normalized !== 'free') {
        // 期限は実質無期限（10年後）として保存
        const expiresAt = new Date(Date.now() + 10 * 365 * 86400000).toISOString()
        setPaidPlan(normalized, expiresAt)
        return
      }
    }

    // 通常サブスクリプション
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, plan, current_period_end')
      .eq('user_id', _currentUserId)
      .maybeSingle()

    if (sub && sub.status === 'active' && sub.plan) {
      const { normalizeLegacyPlan, setPaidPlan } = await import('./subscription')
      const normalized = normalizeLegacyPlan(sub.plan as string)
      if (normalized !== 'free' && sub.current_period_end) {
        setPaidPlan(normalized, sub.current_period_end as string)
      }
    }
  } catch (e) {
    console.warn('[sync] syncSubscriptionFromRemote failed:', e)
  }
}

export async function syncOnLogin(userId: string): Promise<void> {
  setSyncUser(userId)
  if (!supabase) return

  // サブスクリプション状態を同期（admin_overrides 含む）
  await syncSubscriptionFromRemote()

  try {
    // ローカルデータ読み出し
    const localStatsRaw = localStorage.getItem('logic-stats')
    const localStats: LocalStats = localStatsRaw
      ? JSON.parse(localStatsRaw)
      : { completedLessons: [], studyDates: [], studyTimeMs: 0 }

    // リモートデータ取得
    const remoteStats = await pullProgress()

    // マージ（union式）
    const merged: LocalStats = remoteStats
      ? {
          completedLessons: mergeArrays(localStats.completedLessons, remoteStats.completedLessons),
          studyDates: mergeArrays(localStats.studyDates, remoteStats.studyDates),
          studyTimeMs: Math.max(localStats.studyTimeMs, remoteStats.studyTimeMs),
        }
      : localStats

    // ローカルを更新
    localStorage.setItem('logic-stats', JSON.stringify(merged))

    // リモートにpush
    await pushProgress(merged)

    // 表示名: リモート優先で同期（リモートあればローカルに反映、なければローカル送信）
    const remoteDisplayName = await pullDisplayName()
    const localDisplayName = localStorage.getItem('logic-display-name') || ''
    if (remoteDisplayName && remoteDisplayName !== localDisplayName) {
      localStorage.setItem('logic-display-name', remoteDisplayName)
    } else if (!remoteDisplayName && localDisplayName) {
      await pushDisplayName(localDisplayName)
    }

    // Placement も同様
    const localPlacementRaw = localStorage.getItem('logic-placement')
    const localPlacement: LocalPlacement | null = localPlacementRaw
      ? JSON.parse(localPlacementRaw)
      : null

    const remotePlacement = await pullPlacement()

    if (localPlacement && remotePlacement) {
      // 新しい方を採用
      const useRemote = new Date(remotePlacement.completedAt) > new Date(localPlacement.completedAt)
      const winner = useRemote ? remotePlacement : localPlacement
      localStorage.setItem('logic-placement', JSON.stringify({
        deviation: winner.deviation,
        correctCount: winner.correctCount,
        totalCount: winner.totalCount,
        completedAt: winner.completedAt,
        recommendedLessonIds: winner.recommendedLessonIds,
      }))
      await pushPlacement(winner)
    } else if (localPlacement) {
      await pushPlacement(localPlacement)
    } else if (remotePlacement) {
      localStorage.setItem('logic-placement', JSON.stringify({
        deviation: remotePlacement.deviation,
        correctCount: remotePlacement.correctCount,
        totalCount: remotePlacement.totalCount,
        completedAt: remotePlacement.completedAt,
        recommendedLessonIds: remotePlacement.recommendedLessonIds,
      }))
    }

    if (import.meta.env.DEV) {
      console.log('[sync] Login sync complete. Lessons:', merged.completedLessons.length)
    }

    // Phase 3: ログイン直後にサーバー配信 flag を fetch してキャッシュ更新。
    // 失敗しても無視 (前回 localStorage キャッシュ or env flag で判定する)。
    await refreshDeviceSyncFlag(userId)

    // Phase 1 Device Sync: feature flag が ON のときだけ追加同期を走らせる。
    // Phase 3 では上の refresh によってサーバー判定が反映済みなので、
    // この時点での isDeviceSyncEnabled() は server rollout の最新結果。
    if (isDeviceSyncEnabled()) {
      // ヘビーユーザー判定 (移行時のトレースログ用、UI は silent)
      const cardCount = loadCards().length
      const notebookCount = loadEntries().length
      try {
        if (
          cardCount >= HEAVY_USER_THRESHOLDS.flashcards ||
          notebookCount >= HEAVY_USER_THRESHOLDS.notebook
        ) {
          console.warn('[sync] heavy user detected', {
            userId,
            flashcards: cardCount,
            notebook: notebookCount,
          })
        }
      } catch { /* */ }

      const t0 = Date.now()
      const results = await Promise.allSettled([
        syncFlashcards(userId),
        syncWrongAnswers(userId),
        syncSavedItems(userId),
        syncNotebook(userId),
        syncRoadmap(userId),
        syncCategoryProgress(userId),
      ])
      const failures = results.filter((r) => r.status === 'rejected')
      if (failures.length > 0) {
        console.warn('[sync] Phase 1 device sync had failures:', failures.length)
      }
      const durationMs = Date.now() - t0
      if (import.meta.env.DEV) {
        console.log(`[sync] device sync complete in ${durationMs}ms`)
      }

      // Phase 3: テレメトリ送信 (fire-and-forget、失敗しても UX に影響しない)
      const firstErrorMsg = failures
        .map((r) => (r.status === 'rejected' ? String((r as PromiseRejectedResult).reason).slice(0, 500) : ''))
        .find((m) => m)
      void sendSyncTelemetry({
        syncType: 'all',
        itemCount: cardCount + notebookCount,
        durationMs,
        success: failures.length === 0,
        errorMsg: firstErrorMsg,
      })
    }
  } catch (e) {
    console.warn('[sync] syncOnLogin failed:', e)
  }
}

export async function syncOnLogout(): Promise<void> {
  // 2026-05-16: ログアウト時はローカルのユーザーデータをクリア。
  // 残すのは UI / インストール永続キー（locale, theme, v3-preview, install-id,
  // dev-mode, admin, onboarded, tutorial）のみ。
  // 個人の進捗・通知設定・ジャーナルXP・サブスク状態などはすべて削除する。
  //
  // 注意: Supabase の onAuthChange は最初に INITIAL_SESSION イベントで
  // null を返してくる（未ログインの場合）。これは「ログアウト」ではなく
  // 「最初から未ログイン」なので、_currentUserId が null のまま null を
  // 受け取ったときは何もしない。
  const wasLoggedIn = _currentUserId !== null
  setSyncUser(null)
  if (!wasLoggedIn) return

  const KEEP_KEYS = new Set([
    'logic-locale',
    'logic-theme',
    'logic-v3-preview',
    'logic-install-id',
    'logic-dev-mode',
    'logic-admin',
    'logic-onboarded',
    'logic-onboarding-done',
    'logic-tutorial-home-done',
    'logic-tutorial-daily-done',
    'logic-tutorial-lesson-done',
    'logic-tutorial-placement-dismissed',
    'logic-tutorial-fab-dismissed',
    // 次回ログイン時の再構築コストが高いユーザーコンテンツも保持。
    // Supabase 同期未整備のうちは消すと完全に失われる。
    'logic-saved-items',
    'logic-display-name',
    'logic-guest-id',
    'logic-flashcards',
    'logic-wrong-answers',
    // 通知設定キーは保持する。OS スケジュールはログアウト後も残るため、
    // pref を消すと UI 上 OFF 表示なのに通知だけ来る不整合になる
    // (REVIEW_REPORT_20260524 高#1)。
    'logic-reminder',
    'logic-notif-extra',
    'logic-journal-reminder',
  ])
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('logic-') && !KEEP_KEYS.has(k)) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  } catch (e) {
    console.warn('[sync] syncOnLogout clear failed:', e)
  }
}
