import { pushProgress, getSyncUser } from './syncService'

const STORAGE_KEY = 'logic-stats'

type Stats = {
  completedLessons: string[]  // lesson keys like "lesson-6", "mock-exam", "journal-input", "worksheet"
  studyDates: string[]        // YYYY-MM-DD
  studyTimeMs: number         // total milliseconds
}

function load(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { completedLessons: [], studyDates: [], studyTimeMs: 0 }
}

function save(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function recordCompletion(lessonKey: string) {
  const stats = load()
  if (!stats.completedLessons.includes(lessonKey)) {
    stats.completedLessons.push(lessonKey)
  }
  const d = today()
  if (!stats.studyDates.includes(d)) {
    stats.studyDates.push(d)
  }
  save(stats)
  recordLessonStreak()
  if (getSyncUser()) pushProgress(stats)
}

export function addStudyTime(ms: number) {
  const stats = load()
  stats.studyTimeMs += ms
  const d = today()
  if (!stats.studyDates.includes(d)) {
    stats.studyDates.push(d)
  }
  save(stats)
  if (getSyncUser()) pushProgress(stats)
}

export function getCompletedCount(): number {
  return load().completedLessons.length
}

export function getStreak(): number {
  const dates = load().studyDates.sort()
  if (dates.length === 0) return 0

  const todayStr = today()
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // streak must include today or yesterday
  const last = dates[dates.length - 1]
  if (last !== todayStr && last !== yesterdayStr) return 0

  let streak = 1
  for (let i = dates.length - 1; i > 0; i--) {
    const cur = new Date(dates[i]).getTime()
    const prev = new Date(dates[i - 1]).getTime()
    if (cur - prev === 86400000) {
      streak++
    } else if (cur - prev > 86400000) {
      break
    }
    // same day duplicates: skip
  }
  return streak
}

export function getStudyHours(): string {
  const ms = load().studyTimeMs
  const hours = ms / 3600000
  if (hours < 1) {
    const min = Math.round(ms / 60000)
    return `${min}分`
  }
  return `${hours.toFixed(1)}h`
}

export function getStudyTimeMs(): number {
  return load().studyTimeMs
}

export function getCompletedLessons(): string[] {
  return load().completedLessons
}

export function getStudyDates(): string[] {
  return load().studyDates
}

export function getTotalStudyDays(): number {
  return load().studyDates.length
}


const XP_KEY = 'logic-xp'

export type XpEvent = 'lesson' | 'quiz_perfect' | 'streak' | 'fermi'

export const XP_REWARDS: Record<XpEvent, number> = {
  lesson: 50,
  quiz_perfect: 20,
  streak: 10,
  fermi: 30,
}

export function getXp(): number {
  try {
    return parseInt(localStorage.getItem(XP_KEY) ?? '0', 10) || 0
  } catch { return 0 }
}

export function addXp(event: XpEvent): number {
  const gained = XP_REWARDS[event]
  const newXp = getXp() + gained
  localStorage.setItem(XP_KEY, String(newXp))
  appendXpLog(event, gained)
  return newXp
}

/** 任意のXP量を直接加算（AI問題生成・解答完了などのカスタムXP用） */
export function addXP(amount: number): number {
  const newXp = getXp() + amount
  localStorage.setItem(XP_KEY, String(newXp))
  try {
    const log: XpLogEntry[] = JSON.parse(localStorage.getItem(XP_LOG_KEY) || '[]')
    log.push({ ts: Date.now(), event: 'lesson' as XpEvent, xp: amount })
    if (log.length > 500) log.splice(0, log.length - 500)
    localStorage.setItem(XP_LOG_KEY, JSON.stringify(log))
  } catch { /* */ }
  return newXp
}

// ── XP履歴ログ（月別内訳用） ──
export type XpLogEntry = { ts: number; event: XpEvent; xp: number }
const XP_LOG_KEY = 'logic-xp-log'

export function appendXpLog(event: XpEvent, xp: number) {
  try {
    const log: XpLogEntry[] = JSON.parse(localStorage.getItem(XP_LOG_KEY) || '[]')
    log.push({ ts: Date.now(), event, xp })
    // 最大500件
    if (log.length > 500) log.splice(0, log.length - 500)
    localStorage.setItem(XP_LOG_KEY, JSON.stringify(log))
  } catch { /* */ }
}

export function getXpLogThisMonth(): XpLogEntry[] {
  try {
    const log: XpLogEntry[] = JSON.parse(localStorage.getItem(XP_LOG_KEY) || '[]')
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return log.filter(e => new Date(e.ts).toISOString().slice(0, 7) === ym)
  } catch { return [] }
}

export const XP_EVENT_LABEL: Record<XpEvent, string> = {
  lesson: 'レッスン完了',
  quiz_perfect: 'クイズ満点',
  streak: '連続学習ボーナス',
  fermi: 'フェルミ推定',
}

// ── 連続学習日数（レッスン完了ベース、1日スキップOK） ──
const LESSON_STREAK_KEY = 'logic-lesson-streak'
type LessonStreak = { count: number; lastDate: string }

export function getLessonStreak(): number {
  try {
    const s: LessonStreak = JSON.parse(localStorage.getItem(LESSON_STREAK_KEY) || '{}')
    if (!s.lastDate) return 0
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10)
    // 今日か昨日か一昨日（1日スキップOK = 最大2日空白まで）
    if (s.lastDate === today || s.lastDate === yesterday || s.lastDate === twoDaysAgo) {
      return s.count
    }
    return 0
  } catch { return 0 }
}

export function recordLessonStreak() {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const s: LessonStreak = JSON.parse(localStorage.getItem(LESSON_STREAK_KEY) || '{}')
    if (s.lastDate === today) return // 今日は既にカウント済み
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10)
    const newCount = (s.lastDate === yesterday || s.lastDate === twoDaysAgo) ? (s.count || 0) + 1 : 1
    localStorage.setItem(LESSON_STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }))
  } catch { /* */ }
}

// 表示名をlocalStorageに保存
const DISPLAY_NAME_KEY = 'logic-display-name'
export function getDisplayName(): string {
  return localStorage.getItem(DISPLAY_NAME_KEY) || ''
}
export function setDisplayName(name: string) {
  localStorage.setItem(DISPLAY_NAME_KEY, name)
}
