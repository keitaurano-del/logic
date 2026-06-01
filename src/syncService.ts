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
import { getGuestId } from './guestId'
import { isDeviceSyncEnabled, HEAVY_USER_THRESHOLDS, refreshDeviceSyncFlag } from './featureFlags'
import { syncFlashcards, loadCards } from './flashcardData'
import { syncWrongAnswers } from './wrongAnswerStore'
import { syncSavedItems } from './savedItemsStore'
import { syncNotebook, loadEntries } from './notebookStore'
import { syncRoadmap } from './roadmapStore'
import { syncCustomCourses } from './customCourseStore'
import { syncCategoryProgress } from './progressStore'
import { syncCompletionCounts } from './db/completionCountDb'

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

/**
 * ランキング (fermi_scores.user_id) に記録する安定 user_id を返す。
 *
 * - 認証済み: Supabase auth user の UUID (= profiles.id) を返す。
 *   これにより server/routes/fermi.ts の /ranking が profiles.occupation を
 *   join できる (join キーが UUID で一致する)。
 * - 未ログイン: guest ID (g_xxxx) を fallback として返す。
 *
 * 旧実装は常に getGuestId() を渡していたため、認証ユーザーでも fermi_scores.user_id が
 * guest 形式になり、profiles との occupation join が一切成立しなかった。
 */
export function getRankingUserId(): string {
  return _currentUserId ?? getGuestId()
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

// ---- ゲストスコアの auth UUID 継承（ランキング職業バッジ恒久対策）----

// claim 済みを記録する localStorage キー。値は claim 対象だった guestId。
// 同じ guestId は二度 claim しない（サーバー側も冪等だが無駄打ちを避ける）。
const FERMI_CLAIMED_KEY = 'logic-fermi-claimed-guest-id'

/**
 * この端末の guestId で記録された過去の fermi_scores を、ログイン中の auth UUID へ
 * 付け替えるよう /api/fermi/claim-guest-scores を呼ぶ。
 *
 * - 認証済み (_currentUserId あり) かつ Supabase access token が取れる場合のみ実行
 * - guestId が auth UUID と一致する場合は no-op（付け替え不要）
 * - 同じ guestId を既に claim 済みなら no-op（localStorage フラグで判定）
 * - 失敗しても UX は止めない（fire-and-forget 前提だが await 可能）
 *
 * これにより、記録時の修正 (getRankingUserId) では救えない「過去にゲストとして
 * 解いたスコア」が、ログイン後に職業バッジ付きでランキングに反映される。
 */
export async function claimGuestFermiScores(): Promise<void> {
  if (!supabase || !_currentUserId) return
  try {
    const guestId = getGuestId()
    // guestId が無い / auth UUID と同一なら付け替え対象なし
    if (!guestId || guestId === _currentUserId) return
    // 既に同じ guestId を claim 済みなら再実行しない
    if (localStorage.getItem(FERMI_CLAIMED_KEY) === guestId) return

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    const { API_BASE } = await import('./apiBase')
    const res = await fetch(`${API_BASE}/api/fermi/claim-guest-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guestId }),
    })
    if (res.ok) {
      // 成功時のみフラグを立てる。失敗時は次回起動でリトライさせる。
      localStorage.setItem(FERMI_CLAIMED_KEY, guestId)
      if (import.meta.env.DEV) {
        try {
          const json = await res.json()
          console.log('[sync] claimGuestFermiScores claimed:', json?.claimed)
        } catch { /* */ }
      }
    } else if (import.meta.env.DEV) {
      console.warn('[sync] claimGuestFermiScores failed:', res.status)
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[sync] claimGuestFermiScores error:', e)
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

// ---- XP (profiles.xp) 同期 ----

/**
 * 累積 XP を Supabase profiles.xp へ upsert する。
 * - 未ログインや Supabase 未設定時は no-op
 * - migration 036 未適用環境では列が無いため失敗するが UX を止めない
 *   ("column xp does not exist" は握り潰す)
 * - 負値は送らない (0 でクランプ)
 */
export async function pushXp(xp: number): Promise<void> {
  if (!isReady()) return
  const safeXp = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0
  try {
    const { error } = await supabase!.from('profiles').upsert({
      id: _currentUserId,
      xp: safeXp,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (error) {
      // migration 036 未適用環境の "column xp does not exist" は無視
      if (!/\bxp\b/i.test(error.message)) {
        console.warn('[sync] pushXp failed:', error.message)
      }
    }
  } catch (e) {
    console.warn('[sync] pushXp failed:', e)
  }
}

export async function pullXp(): Promise<number | null> {
  if (!isReady()) return null
  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('xp')
      .eq('id', _currentUserId)
      .maybeSingle()
    if (error || !data) return null
    const raw = (data.xp as number | null) ?? null
    if (raw == null || !Number.isFinite(raw)) return null
    return Math.max(0, Math.floor(raw))
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

  // ゲスト時代の fermi_scores を auth UUID へ付け替え（ランキング職業バッジ恒久対策）。
  // fire-and-forget。失敗してもログイン同期本体は続行する。
  void claimGuestFermiScores()

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

    // XP (profiles.xp): local と remote の Math.max マージ (オフライン加算を消さない安全側)。
    // AF-05: 以前は XP の pull/push が無く、ログアウトで logic-xp を消していたため
    // 再ログインで XP/レベルが完全消失していた。
    try {
      const localXp = parseInt(localStorage.getItem('logic-xp') ?? '0', 10) || 0
      const remoteXp = await pullXp()
      const mergedXp = remoteXp != null ? Math.max(localXp, remoteXp) : localXp
      localStorage.setItem('logic-xp', String(mergedXp))
      // マージ結果をリモートにも反映 (remote が無かった/古かった場合に揃える)
      if (remoteXp == null || mergedXp !== remoteXp) {
        await pushXp(mergedXp)
      }
    } catch (e) {
      console.warn('[sync] XP merge failed:', e)
    }

    // プロフィール属性 (birth_year / goal / occupation / nickname) を pull して
    // logic-user-profile / logic-display-name へ書き戻す。
    // AF-05: 以前は pull が結線されておらず、リモートに保存済みでも再ログインで
    // 職業・生まれ年・目的が復元されなかった。
    // リモート優先 (プロフィール編集は明示更新なので、別端末の最新を尊重する)。
    try {
      const remoteProfile = await pullProfileFields()
      if (remoteProfile) {
        const profileRaw = localStorage.getItem('logic-user-profile')
        let profile: Record<string, unknown> = {}
        try {
          const parsed = profileRaw ? JSON.parse(profileRaw) : {}
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            profile = parsed as Record<string, unknown>
          }
        } catch { /* 破損時は空から再構築 */ }

        if (remoteProfile.birthYear != null) profile.birthYear = remoteProfile.birthYear
        if (remoteProfile.goal != null) profile.goal = remoteProfile.goal
        if (remoteProfile.occupation != null) profile.occupation = remoteProfile.occupation
        if (remoteProfile.nickname != null) profile.displayName = remoteProfile.nickname

        localStorage.setItem('logic-user-profile', JSON.stringify(profile))

        // nickname は logic-display-name とも整合させる (上の表示名同期と同じ正本)
        if (remoteProfile.nickname) {
          localStorage.setItem('logic-display-name', remoteProfile.nickname)
        }
      }
    } catch (e) {
      console.warn('[sync] profile fields pull failed:', e)
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
        syncCompletionCounts(userId),
        syncCustomCourses(userId),
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
    // フォルダ分けはローカル専用機能 (FB-11)。Supabase 同期未整備のため
    // ログアウト時に消すとユーザーの整理が完全に失われる。保持する。
    'logic-saved-folders',
    'logic-display-name',
    'logic-guest-id',
    'logic-flashcards',
    'logic-wrong-answers',
    // XP / レベルはログアウト時に消すと再ログインで完全消失する (AF-05 P0)。
    // syncOnLogin で profiles.xp と Math.max マージするまでローカルを保持する。
    // 関連: logic-xp-log (履歴) / logic-journal-xp (朝夜付与フラグ) も
    // ローカル専用のため保持し、累積 XP との不整合を防ぐ。
    'logic-xp',
    'logic-xp-log',
    'logic-journal-xp',
    // プロフィール属性 (生まれ年 / 性別 / 職業 / 目的)。profiles へ push 済みだが
    // pull 復元が確実に効くまでの安全側保持 (AF-05)。
    'logic-user-profile',
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
