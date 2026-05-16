import { getSupabaseClient } from '../../supabase'
import type { DailyJournal, Goal, GoalCategory, GoalReview, PeriodType } from './types'

export async function fetchJournalByDate(userId: string, date: string): Promise<DailyJournal | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  if (error) {
    console.warn('fetchJournalByDate:', error.message)
    return null
  }
  return data as DailyJournal | null
}

export async function fetchJournalsBetween(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
  if (error) {
    console.warn('fetchJournalsBetween:', error.message)
    return []
  }
  return (data as DailyJournal[]) ?? []
}

export async function upsertJournal(j: DailyJournal): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { error } = await supabase
    .from('daily_journals')
    .upsert({
      user_id: j.user_id,
      date: j.date,
      mood: j.mood,
      weather: j.weather,
      morning_memo: j.morning_memo,
      schedule_notes: j.schedule_notes,
      evening_reflection: j.evening_reflection,
      ai_summary: j.ai_summary,
      tags: Array.isArray(j.tags) ? j.tags : [],
    }, { onConflict: 'user_id,date' })
  if (error) return { error: error.message }
  return {}
}

/**
 * 過去 N 日分のジャーナルを取得（カレンダー / スパークライン用）
 */
export async function fetchRecentJournals(userId: string, days = 30): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const end = new Date()
  const start = new Date(end.getTime() - (days - 1) * 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return fetchJournalsBetween(userId, fmt(start), fmt(end))
}

/**
 * 連続記録日数（streak）を計算。今日（または昨日まで）から遡って「ジャーナルが書かれた連続日数」を返す。
 * ジャーナルが書かれた = mood / weather / schedule_notes / evening_reflection / tags のどれかが入ってる
 */
export async function fetchJournalStreak(userId: string): Promise<number> {
  const supabase = getSupabaseClient()
  if (!supabase) return 0
  const end = new Date()
  const start = new Date(end.getTime() - 365 * 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('daily_journals')
    .select('date, mood, weather, schedule_notes, evening_reflection, tags')
    .eq('user_id', userId)
    .gte('date', fmt(start))
    .lte('date', fmt(end))
    .order('date', { ascending: false })
  if (error) { console.warn('fetchJournalStreak:', error.message); return 0 }
  const rows = (data as Array<{ date: string; mood?: number | null; weather?: string | null; schedule_notes?: string | null; evening_reflection?: string | null; tags?: string[] | null }>) ?? []
  const dateSet = new Set(
    rows
      .filter((r) => r.mood != null || !!r.weather || !!(r.schedule_notes && r.schedule_notes.trim()) || !!(r.evening_reflection && r.evening_reflection.trim()) || (r.tags && r.tags.length > 0))
      .map((r) => r.date)
  )
  let streak = 0
  let started = false
  for (let i = 0; i < 365; i++) {
    const d = new Date(end.getTime() - i * 86400000)
    if (dateSet.has(fmt(d))) { streak++; started = true }
    else if (!started && i === 0) { /* 今日未入力でも昨日から数える */ continue }
    else break
  }
  return streak
}

export async function searchJournals(userId: string, keyword: string): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const k = keyword.trim()
  if (!k) return []
  // LIKE インジェクション + PostgREST or フィルタ構文対策:
  //   - % _ \ : LIKE のメタ文字
  //   - , ( ) : PostgREST の or フィルタ区切り（含むと別フィルタとしてパースされる）
  //   - * : PostgREST のワイルドカード扱い
  // すべて取り除いて単純な文字列マッチに倒す（最大 100 文字に切り詰め）
  const esc = k
    .slice(0, 100)
    .replace(/[\\%_,()*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!esc) return []
  const pat = `%${esc}%`
  const { data, error } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', userId)
    .or([
      `morning_memo.ilike.${pat}`,
      `schedule_notes.ilike.${pat}`,
      `ai_summary.ilike.${pat}`,
      `evening_reflection.ilike.${pat}`,
    ].join(','))
    .order('date', { ascending: false })
    .limit(50)
  if (error) {
    console.warn('searchJournals:', error.message)
    return []
  }
  return (data as DailyJournal[]) ?? []
}

/**
 * 指定期間の目標を全件取得（複数 OK）。created_at 昇順で安定表示。
 */
export async function fetchGoals(userId: string, periodType: PeriodType, periodKey: string): Promise<Goal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .eq('period_key', periodKey)
    .order('created_at', { ascending: true })
  if (error) {
    console.warn('fetchGoals:', error.message)
    return []
  }
  return (data as Goal[]) ?? []
}

/**
 * 「今日」のサマリー表示用に、週次/月次/年次の現在期間の目標を一括取得。
 */
export async function fetchCurrentGoalsAllPeriods(
  userId: string,
  keys: { weekly: string; monthly: string; yearly: string },
): Promise<{ weekly: Goal[]; monthly: Goal[]; yearly: Goal[] }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { weekly: [], monthly: [], yearly: [] }
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .in('period_type', ['weekly', 'monthly', 'yearly'])
    .or(
      [
        `and(period_type.eq.weekly,period_key.eq.${keys.weekly})`,
        `and(period_type.eq.monthly,period_key.eq.${keys.monthly})`,
        `and(period_type.eq.yearly,period_key.eq.${keys.yearly})`,
      ].join(','),
    )
    .order('created_at', { ascending: true })
  if (error) {
    console.warn('fetchCurrentGoalsAllPeriods:', error.message)
    return { weekly: [], monthly: [], yearly: [] }
  }
  const all = (data as Goal[]) ?? []
  return {
    weekly:  all.filter((g) => g.period_type === 'weekly'  && g.period_key === keys.weekly),
    monthly: all.filter((g) => g.period_type === 'monthly' && g.period_key === keys.monthly),
    yearly:  all.filter((g) => g.period_type === 'yearly'  && g.period_key === keys.yearly),
  }
}

export async function createGoal(g: {
  user_id: string
  period_type: PeriodType
  period_key: string
  title: string
  description: string | null
  category: GoalCategory | null
}): Promise<{ goal?: Goal; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goals')
    .insert(g)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { goal: data as Goal }
}

export async function updateGoal(
  id: string,
  patch: { title?: string; description?: string | null; category?: GoalCategory | null; status?: 'active' | 'completed' },
): Promise<{ goal?: Goal; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goals')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { goal: data as Goal }
}

export async function deleteGoal(id: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function fetchGoalReviews(goalId: string): Promise<GoalReview[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('goal_reviews')
    .select('*')
    .eq('goal_id', goalId)
    .order('reviewed_at', { ascending: false })
  if (error) {
    console.warn('fetchGoalReviews:', error.message)
    return []
  }
  return (data as GoalReview[]) ?? []
}

export async function insertGoalReview(r: {
  goal_id: string
  user_id: string
  review_text: string | null
  ai_feedback: string | null
}): Promise<{ review?: GoalReview; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goal_reviews')
    .insert(r)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { review: data as GoalReview }
}
