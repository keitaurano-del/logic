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
  /** @deprecated 互換のため残置。新規書き込みは evening_mood を使う */
  mood: Mood | null
  /** @deprecated 互換のため残置。新規書き込みは evening_weather を使う */
  weather: Weather | null
  morning_mood?: Mood | null
  morning_weather?: Weather | null
  evening_mood?: Mood | null
  evening_weather?: Weather | null
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

// ─── AI アシスタント会話履歴 ─────────────────────────────────────
// ジャーナルの AI アシスタント（holistic feedback）の応答を保存し、
// 後から見返せるようにするための履歴レコード。
// 保存先は daily_journals / goals と同じく Supabase（getSupabaseClient）。

export interface AssistantRecommendedLesson {
  id: number
  title: string
  category: string
}

export interface AssistantRecommendedCourse {
  id: string
  title: string
  category: string
  image?: string
  lessonCount: number
}

export interface AssistantConversation {
  id?: string
  user_id?: string
  /** AI からのアドバイス本文（markdown）。JournalRichText で整形して表示する。 */
  feedback: string
  /** 推薦レッスン（解決済みの表示用情報を保存。後から ID 解決に失敗しても表示できる） */
  recommended_lessons: AssistantRecommendedLesson[]
  /** 推薦コース（同上） */
  recommended_courses: AssistantRecommendedCourse[]
  created_at?: string
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

/**
 * 表示用 mood を返す。優先順: evening_mood → morning_mood → legacy mood。
 * カレンダー / 一覧 / グラフはすべてこの関数経由で取り出す。
 */
export function displayMood(j: Pick<DailyJournal, 'mood' | 'morning_mood' | 'evening_mood'> | null | undefined): Mood | null {
  if (!j) return null
  if (j.evening_mood != null) return j.evening_mood as Mood
  if (j.morning_mood != null) return j.morning_mood as Mood
  if (j.mood != null) return j.mood as Mood
  return null
}

/**
 * 表示用 weather を返す。優先順: evening_weather → morning_weather → legacy weather。
 */
export function displayWeather(j: Pick<DailyJournal, 'weather' | 'morning_weather' | 'evening_weather'> | null | undefined): Weather | null {
  if (!j) return null
  if (j.evening_weather) return j.evening_weather as Weather
  if (j.morning_weather) return j.morning_weather as Weather
  if (j.weather) return j.weather as Weather
  return null
}

