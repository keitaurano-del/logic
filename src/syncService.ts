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

export async function syncOnLogin(userId: string): Promise<void> {
  setSyncUser(userId)
  if (!supabase) return

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

    console.log('[sync] Login sync complete. Lessons:', merged.completedLessons.length)
  } catch (e) {
    console.warn('[sync] syncOnLogin failed:', e)
  }
}

export async function syncOnLogout(): Promise<void> {
  setSyncUser(null)
  // ローカルデータは消さない
}
