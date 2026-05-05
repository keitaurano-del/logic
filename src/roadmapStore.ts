import { getRoadmap } from './roadmapData'
import {
  getRoadmapProgress,
  saveRoadmapNode,
  saveAllRoadmapGoals,
  deleteRoadmapGoal,
} from './db/roadmapDb'

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
