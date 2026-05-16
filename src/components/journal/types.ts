export type Mood = 1 | 2 | 3 | 4 | 5
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy'
export type PeriodType = 'weekly' | 'monthly' | 'yearly'
export type GoalCategory = 'work' | 'private'
export const GOAL_CATEGORIES: GoalCategory[] = ['work', 'private']

export interface DailyJournal {
  id?: string
  user_id?: string
  date: string // YYYY-MM-DD
  mood: Mood | null
  weather: Weather | null
  morning_memo: string | null
  schedule_notes: string | null  // 朝の意図・予定
  evening_reflection: string | null  // 夜の振り返り
  ai_summary: string | null
  tags: string[]
  created_at?: string
  updated_at?: string
}

export interface Goal {
  id: string
  user_id?: string
  period_type: PeriodType
  period_key: string
  title: string
  description: string | null
  category: GoalCategory | null
  status: 'active' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface GoalReview {
  id: string
  goal_id: string
  user_id?: string
  review_text: string | null
  ai_feedback: string | null
  reviewed_at: string
}

// ─── period_key 命名ヘルパー ─────────────────────────────────────
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function weekKey(d: Date = new Date()): string {
  // ISO 週番号
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNr = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = (target.getTime() - firstThursday.getTime()) / 86400000
  const week = 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function yearKey(d: Date = new Date()): string {
  return String(d.getFullYear())
}

export function periodKeyFor(type: PeriodType, d: Date = new Date()): string {
  switch (type) {
    case 'weekly':  return weekKey(d)
    case 'monthly': return monthKey(d)
    case 'yearly':  return yearKey(d)
  }
}

// 指定期間内の日付一覧を作る（カレンダー集計などに使用）
export function dateRangeFor(type: PeriodType, periodKey: string): { start: string; end: string } {
  // 入力 periodKey を信頼してパース。失敗時は今日を返す
  const today = todayKey()
  try {
    if (type === 'weekly') {
      // 'YYYY-Www' → その週の月曜〜日曜
      const m = periodKey.match(/^(\d{4})-W(\d{2})$/)
      if (!m) return { start: today, end: today }
      const year = Number(m[1])
      const week = Number(m[2])
      // ISO 週: 1月4日を含む週が第1週
      const jan4 = new Date(Date.UTC(year, 0, 4))
      const jan4Dow = (jan4.getUTCDay() + 6) % 7
      const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Dow))
      const monday = new Date(week1Monday)
      monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)
      const sunday = new Date(monday)
      sunday.setUTCDate(monday.getUTCDate() + 6)
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      }
    }
    if (type === 'monthly') {
      const m = periodKey.match(/^(\d{4})-(\d{2})$/)
      if (!m) return { start: today, end: today }
      const y = Number(m[1])
      const mm = Number(m[2])
      const last = new Date(y, mm, 0).getDate()
      return {
        start: `${m[1]}-${m[2]}-01`,
        end: `${m[1]}-${m[2]}-${String(last).padStart(2, '0')}`,
      }
    }
    if (type === 'yearly') {
      const m = periodKey.match(/^(\d{4})$/)
      if (!m) return { start: today, end: today }
      return { start: `${m[1]}-01-01`, end: `${m[1]}-12-31` }
    }
  } catch { /* fallthrough */ }
  return { start: today, end: today }
}
