import { getSupabaseClient } from '../../supabase'
import type { DailyJournal, Goal, GoalReview, PeriodType } from './types'

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
    }, { onConflict: 'user_id,date' })
  if (error) return { error: error.message }
  return {}
}

export async function searchJournals(userId: string, keyword: string): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const k = keyword.trim()
  if (!k) return []
  // LIKE インジェクション対策: % と _ を ＿ にエスケープ
  const esc = k.replace(/[%_]/g, (m) => `\\${m}`)
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

export async function fetchGoal(userId: string, periodType: PeriodType, periodKey: string): Promise<Goal | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .eq('period_key', periodKey)
    .maybeSingle()
  if (error) {
    console.warn('fetchGoal:', error.message)
    return null
  }
  return data as Goal | null
}

export async function upsertGoal(g: {
  user_id: string
  period_type: PeriodType
  period_key: string
  title: string
  description: string | null
}): Promise<{ goal?: Goal; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goals')
    .upsert(g, { onConflict: 'user_id,period_type,period_key' })
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { goal: data as Goal }
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
