/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRoadmap } from './roadmapData'
import {
  getRoadmapProgress,
  saveRoadmapNode,
  saveAllRoadmapGoals,
  deleteRoadmapGoal,
} from './db/roadmapDb'
import { getSupabaseClient } from './db/index'

const STORAGE_KEY = 'logic-roadmap'

export type GoalEntry = {
  goalId: string
  targetDate: string | null
  dailyMinutes: number
  completedSteps: number[]
  createdAt: string
}

export type RoadmapState = {
  goals: GoalEntry[]
  setupDone: boolean
}

const DEFAULT_STATE: RoadmapState = { goals: [], setupDone: false }

// =============================================
// localStorage ロジック（未ログイン・フォールバック用）
// =============================================

function load(): RoadmapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate old single-goal format
      if (parsed.goalId && !parsed.goals) {
        const migrated: RoadmapState = {
          goals: [{
            goalId: parsed.goalId,
            targetDate: parsed.targetDate || null,
            dailyMinutes: parsed.dailyMinutes || 15,
            completedSteps: parsed.completedSteps || [],
            createdAt: new Date().toISOString()
          }],
          setupDone: parsed.setupDone ?? true
        }
        save(migrated)
        return migrated
      }
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

function save(state: RoadmapState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function findGoal(state: RoadmapState, goalId: string): GoalEntry | undefined {
  return state.goals.find(g => g.goalId === goalId)
}

export function loadRoadmapState(): RoadmapState { return load() }

export function selectGoal(goalId: string): RoadmapState {
  const state = load()
  if (state.goals.some(g => g.goalId === goalId)) return state
  state.goals.push({ goalId, targetDate: null, dailyMinutes: 15, completedSteps: [], createdAt: new Date().toISOString() })
  state.setupDone = true
  save(state)
  return state
}

export function removeGoal(goalId: string): RoadmapState {
  const state = load()
  state.goals = state.goals.filter(g => g.goalId !== goalId)
  save(state)
  return state
}

export function setTargetDate(goalId: string, date: string): RoadmapState {
  const state = load()
  const goal = findGoal(state, goalId)
  if (goal) { goal.targetDate = date; save(state) }
  return state
}

export function setDailyMinutes(goalId: string, minutes: number): RoadmapState {
  const state = load()
  const goal = findGoal(state, goalId)
  if (goal) { goal.dailyMinutes = minutes; save(state) }
  return state
}

export function completeStep(lessonId: number): RoadmapState {
  const state = load()
  for (const goal of state.goals) {
    const rm = getRoadmap(goal.goalId)
    if (rm && rm.steps.some(s => s.lessonId === lessonId)) {
      if (!goal.completedSteps.includes(lessonId)) {
        goal.completedSteps.push(lessonId)
      }
    }
  }
  save(state)
  return state
}

export function completeSetup(): RoadmapState {
  const state = load()
  state.setupDone = true
  save(state)
  return state
}

export function getCurrentStep(goalId: string): number | null {
  const state = load()
  const goal = findGoal(state, goalId)
  if (!goal) return null
  const rm = getRoadmap(goalId)
  if (!rm) return null
  for (const step of rm.steps) {
    if (!goal.completedSteps.includes(step.lessonId)) return step.lessonId
  }
  return null
}

export function getProgress(goalId: string): { completed: number; total: number; percent: number } {
  const state = load()
  const goal = findGoal(state, goalId)
  if (!goal) return { completed: 0, total: 0, percent: 0 }
  const rm = getRoadmap(goalId)
  if (!rm) return { completed: 0, total: 0, percent: 0 }
  const total = rm.steps.length
  const completed = rm.steps.filter(s => goal.completedSteps.includes(s.lessonId)).length
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function isStepComplete(goalId: string, lessonId: number): boolean {
  const state = load()
  const goal = findGoal(state, goalId)
  return goal ? goal.completedSteps.includes(lessonId) : false
}

export function needsOnboarding(): boolean {
  return load().goals.length === 0
}

export function getActiveGoalIds(): string[] {
  return load().goals.map(g => g.goalId)
}

// =============================================
// Supabase ハイブリッド関数
// =============================================

/**
 * 認証済みユーザーのロードマップを DB から読み込み、localStorage に同期する
 */
export async function loadRoadmapFromDB(userId: string): Promise<RoadmapState> {
  try {
    const dbState = await getRoadmapProgress(userId)
    if (dbState) {
      // DB データを localStorage にキャッシュ
      save(dbState)
      return dbState
    }
  } catch (e) {
    console.warn('[roadmapStore] loadRoadmapFromDB failed, using localStorage:', e)
  }
  return load()
}

/**
 * ゴールを選択し、DB と localStorage の両方に保存
 */
export async function selectGoalForUser(
  userId: string,
  goalId: string
): Promise<RoadmapState> {
  const state = selectGoal(goalId)
  const goal = findGoal(state, goalId)
  if (goal) {
    try {
      await saveRoadmapNode(userId, goal, state.setupDone)
    } catch (e) {
      console.warn('[roadmapStore] DB sync failed:', e)
    }
  }
  return state
}

/**
 * ゴールを削除し、DB と localStorage の両方から削除
 */
export async function removeGoalForUser(
  userId: string,
  goalId: string
): Promise<RoadmapState> {
  const state = removeGoal(goalId)
  try {
    await deleteRoadmapGoal(userId, goalId)
  } catch (e) {
    console.warn('[roadmapStore] DB delete failed:', e)
  }
  return state
}

/**
 * ステップ完了を DB と localStorage の両方に保存
 */
export async function completeStepForUser(
  userId: string,
  lessonId: number
): Promise<RoadmapState> {
  const state = completeStep(lessonId)
  // 更新された全ゴールを DB に保存
  try {
    await saveAllRoadmapGoals(userId, state)
  } catch (e) {
    console.warn('[roadmapStore] DB sync failed:', e)
  }
  return state
}

/**
 * 目標日・毎日の学習時間を DB と localStorage の両方に保存
 */
export async function setTargetDateForUser(
  userId: string,
  goalId: string,
  date: string
): Promise<RoadmapState> {
  const state = setTargetDate(goalId, date)
  const goal = findGoal(state, goalId)
  if (goal) {
    try {
      await saveRoadmapNode(userId, goal, state.setupDone)
    } catch (e) {
      console.warn('[roadmapStore] DB sync failed:', e)
    }
  }
  return state
}

export async function setDailyMinutesForUser(
  userId: string,
  goalId: string,
  minutes: number
): Promise<RoadmapState> {
  const state = setDailyMinutes(goalId, minutes)
  const goal = findGoal(state, goalId)
  if (goal) {
    try {
      await saveRoadmapNode(userId, goal, state.setupDone)
    } catch (e) {
      console.warn('[roadmapStore] DB sync failed:', e)
    }
  }
  return state
}

// =============================================
// Supabase 同期 (Phase 1: Device Sync — user_roadmap_goals テーブル)
// =============================================
//
// 旧 roadmap_progress テーブル (node_id + status) は実装と不整合のため、
// 新テーブル user_roadmap_goals (026_user_roadmap_goals.sql) に向き直す。

type RoadmapGoalRow = {
  goal_id: string
  target_date: string | null
  daily_minutes: number
  completed_steps: number[]
  setup_done: boolean
  created_at: string
}

function rowToGoalEntryV2(row: RoadmapGoalRow): GoalEntry {
  return {
    goalId: row.goal_id,
    targetDate: row.target_date,
    dailyMinutes: row.daily_minutes ?? 15,
    completedSteps: row.completed_steps ?? [],
    createdAt: row.created_at || new Date().toISOString(),
  }
}

async function fetchRoadmapGoalsV2(userId: string): Promise<RoadmapState | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('user_roadmap_goals')
      .select('goal_id, target_date, daily_minutes, completed_steps, setup_done, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[roadmapStore] fetchRoadmapGoalsV2 error:', error.message)
      return null
    }
    if (!data || data.length === 0) return null
    const goals = (data as RoadmapGoalRow[]).map(rowToGoalEntryV2)
    const setupDone = (data[0] as RoadmapGoalRow).setup_done ?? true
    return { goals, setupDone }
  } catch (e) {
    console.warn('[roadmapStore] fetchRoadmapGoalsV2 exception:', e)
    return null
  }
}

async function pushRoadmapGoalsV2(userId: string, state: RoadmapState): Promise<void> {
  if (state.goals.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  try {
    const rows = state.goals.map((g) => ({
      user_id: userId,
      goal_id: g.goalId,
      target_date: g.targetDate,
      daily_minutes: g.dailyMinutes,
      completed_steps: g.completedSteps,
      setup_done: state.setupDone,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await (db as any)
      .from('user_roadmap_goals')
      .upsert(rows, { onConflict: 'user_id,goal_id' })
    if (error) console.warn('[roadmapStore] pushRoadmapGoalsV2 error:', error.message)
  } catch (e) {
    console.warn('[roadmapStore] pushRoadmapGoalsV2 exception:', e)
  }
}

/** 1 ゴールを v2 テーブルに upsert (書き込みフック用) */
export async function pushRoadmapGoalForUserV2(
  userId: string,
  goal: GoalEntry,
  setupDone: boolean,
): Promise<void> {
  await pushRoadmapGoalsV2(userId, { goals: [goal], setupDone })
}

/** v2 テーブルから 1 ゴール削除 */
export async function deleteRoadmapGoalForUserV2(userId: string, goalId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_roadmap_goals')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId)
    if (error) console.warn('[roadmapStore] deleteRoadmapGoalForUserV2 error:', error.message)
  } catch (e) {
    console.warn('[roadmapStore] deleteRoadmapGoalForUserV2 exception:', e)
  }
}

/**
 * ログイン時の同期 (Phase 1)。
 * 戦略: Union of completedSteps + last-write for metadata
 * - goal_id 単位でマージ
 * - completedSteps は union (両端の進捗を合算)
 * - targetDate / dailyMinutes は createdAt が新しい方を採用
 */
export async function syncRoadmap(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const remote = await fetchRoadmapGoalsV2(userId)
    const local = load()

    if (!remote && local.goals.length === 0) return

    const remoteGoals = remote?.goals ?? []
    const localGoals = local.goals
    const remoteByGoal = new Map(remoteGoals.map((g) => [g.goalId, g]))
    const merged: GoalEntry[] = []
    const toPushIds = new Set<string>()

    for (const r of remoteGoals) {
      const l = localGoals.find((lg) => lg.goalId === r.goalId)
      if (!l) {
        merged.push(r)
        continue
      }
      const completedSteps = Array.from(new Set([...r.completedSteps, ...l.completedSteps]))
      const newer = l.createdAt > r.createdAt ? l : r
      const mergedEntry: GoalEntry = {
        goalId: r.goalId,
        targetDate: newer.targetDate ?? r.targetDate ?? l.targetDate,
        dailyMinutes: newer.dailyMinutes ?? r.dailyMinutes,
        completedSteps,
        createdAt: r.createdAt < l.createdAt ? r.createdAt : l.createdAt,
      }
      merged.push(mergedEntry)
      if (
        completedSteps.length !== r.completedSteps.length ||
        mergedEntry.targetDate !== r.targetDate ||
        mergedEntry.dailyMinutes !== r.dailyMinutes
      ) {
        toPushIds.add(r.goalId)
      }
    }

    for (const l of localGoals) {
      if (!remoteByGoal.has(l.goalId)) {
        merged.push(l)
        toPushIds.add(l.goalId)
      }
    }

    const mergedState: RoadmapState = {
      goals: merged,
      setupDone: (remote?.setupDone ?? false) || local.setupDone || merged.length > 0,
    }
    save(mergedState)

    const goalsToPush = merged.filter((g) => toPushIds.has(g.goalId))
    if (goalsToPush.length > 0) {
      await pushRoadmapGoalsV2(userId, { goals: goalsToPush, setupDone: mergedState.setupDone })
    }

    if (import.meta.env.DEV) {
      console.log(
        '[roadmapStore] syncRoadmap complete:',
        `remote=${remoteGoals.length}`,
        `local=${localGoals.length}`,
        `merged=${merged.length}`,
        `pushed=${goalsToPush.length}`,
      )
    }
  } catch (e) {
    console.warn('[roadmapStore] syncRoadmap failed:', e)
  }
}

/**
 * localStorage のデータを Supabase DB に移行する
 * ログイン時に一度だけ呼び出す
 */
export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  try {
    const local = load()
    if (local.goals.length === 0) return

    // DB に既存データがあるか確認
    const dbState = await getRoadmapProgress(userId)
    if (dbState && dbState.goals.length > 0) {
      // DB のゴールと localStorage のゴールをマージ
      const dbGoalIds = new Set(dbState.goals.map(g => g.goalId))
      const toMigrate = local.goals.filter(g => !dbGoalIds.has(g.goalId))

      if (toMigrate.length > 0) {
        const mergedState: RoadmapState = {
          goals: [...dbState.goals, ...toMigrate],
          setupDone: dbState.setupDone || local.setupDone,
        }
        await saveAllRoadmapGoals(userId, mergedState)
        save(mergedState)
      }
    } else {
      // DB に何もなければ localStorage をそのまま移行
      await saveAllRoadmapGoals(userId, local)
    }

    if (import.meta.env.DEV) {
      console.log('[roadmapStore] migrated localStorage to Supabase')
    }
  } catch (e) {
    console.warn('[roadmapStore] migration failed:', e)
  }
}
