/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * src/db/roadmapDb.ts
 * roadmapStore の Supabase 版
 * NOTE: (db as any) は Supabase 動的スキーマ未知の typing 回避。
 * テーブル: roadmap_progress (user_id, goal_id, target_date, daily_minutes, completed_steps, created_at)
 */
import { getSupabaseClient } from './index'
import type { GoalEntry, RoadmapState } from '../roadmapStore'

type RoadmapRow = {
  id?: string
  user_id: string
  goal_id: string
  target_date: string | null
  daily_minutes: number
  completed_steps: number[]
  setup_done?: boolean
  created_at?: string
  updated_at?: string
}

function rowToGoalEntry(row: RoadmapRow): GoalEntry {
  return {
    goalId: row.goal_id,
    targetDate: row.target_date,
    dailyMinutes: row.daily_minutes ?? 15,
    completedSteps: row.completed_steps ?? [],
    createdAt: row.created_at || new Date().toISOString(),
  }
}

/**
 * roadmap_progress テーブルから全ゴールを取得
 */
export async function getRoadmapProgress(userId: string): Promise<RoadmapState | null> {
  const db = getSupabaseClient()
  if (!db) return null

  try {
    const { data, error } = await (db as any)
      .from('roadmap_progress')
      .select('goal_id, target_date, daily_minutes, completed_steps, setup_done, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[roadmapDb] getRoadmapProgress error:', error.message)
      return null
    }

    if (!data || data.length === 0) return null

    const goals = (data as RoadmapRow[]).map(rowToGoalEntry)
    // setup_done は最初の行から取る（全行同じ値を想定）
    const setupDone = (data[0] as RoadmapRow).setup_done ?? goals.length > 0

    return { goals, setupDone }
  } catch (e) {
    console.warn('[roadmapDb] getRoadmapProgress exception:', e)
    return null
  }
}

/**
 * ゴールノードを upsert
 */
export async function saveRoadmapNode(
  userId: string,
  goalEntry: GoalEntry,
  setupDone: boolean
): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const { error } = await (db as any).from('roadmap_progress').upsert(
      {
        user_id: userId,
        goal_id: goalEntry.goalId,
        target_date: goalEntry.targetDate,
        daily_minutes: goalEntry.dailyMinutes,
        completed_steps: goalEntry.completedSteps,
        setup_done: setupDone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,goal_id' }
    )

    if (error) {
      console.warn('[roadmapDb] saveRoadmapNode error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[roadmapDb] saveRoadmapNode exception:', e)
    return false
  }
}

/**
 * 全ゴールを一括 upsert
 */
export async function saveAllRoadmapGoals(
  userId: string,
  state: RoadmapState
): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  if (state.goals.length === 0) return true

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
      .from('roadmap_progress')
      .upsert(rows, { onConflict: 'user_id,goal_id' })

    if (error) {
      console.warn('[roadmapDb] saveAllRoadmapGoals error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[roadmapDb] saveAllRoadmapGoals exception:', e)
    return false
  }
}

/**
 * ゴールを削除
 */
export async function deleteRoadmapGoal(userId: string, goalId: string): Promise<boolean> {
  const db = getSupabaseClient()
  if (!db) return false

  try {
    const { error } = await (db as any)
      .from('roadmap_progress')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId)

    if (error) {
      console.warn('[roadmapDb] deleteRoadmapGoal error:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[roadmapDb] deleteRoadmapGoal exception:', e)
    return false
  }
}
