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
  return newXp
}
