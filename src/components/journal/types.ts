export type Mood = 1 | 2 | 3 | 4 | 5
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy'
export type PeriodType = 'weekly' | 'monthly' | 'yearly'
export type GoalCategory = 'work' | 'private'
export const GOAL_CATEGORIES: GoalCategory[] = ['work', 'private']

export const JOURNAL_IMAGE_MAX_COUNT = 10

export interface JournalImage {
  path: string         // Storage オブジェクトのフルパス: {user_id}/{date}/{uuid}.{ext}
  uploaded_at: string  // ISO 8601
  width?: number
  height?: number
}

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
  // Health Connect / HealthKit snapshot — null when not synced or unavailable.
  steps_count?: number | null
  sleep_minutes?: number | null
  sleep_start?: string | null // ISO 8601
  sleep_end?: string | null   // ISO 8601
  // 添付画像（最大 JOURNAL_IMAGE_MAX_COUNT 枚）。Storage 上のパスを保持する。
  images?: JournalImage[]
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

