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
}

export function addStudyTime(ms: number) {
  const stats = load()
  stats.studyTimeMs += ms
  const d = today()
  if (!stats.studyDates.includes(d)) {
    stats.studyDates.push(d)
  }
  save(stats)
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

// XP system
const XP_MAP: Record<string, number> = {
  'lesson': 100,
  'mock-exam': 200,
  'journal-input': 150,
  'worksheet': 150,
}

export function getXpForKey(key: string): number {
  if (key.startsWith('lesson-')) return XP_MAP['lesson']
  return XP_MAP[key] || 100
}

export function getTotalXp(): number {
  const stats = load()
  return stats.completedLessons.reduce((sum, key) => sum + getXpForKey(key), 0) +
    Math.floor(stats.studyTimeMs / 60000) * 2
}

export type LevelInfo = { level: number; title: string; xp: number; nextXp: number; progress: number }

const LEVELS = [
  { xp: 0, title: '初心者' },
  { xp: 200, title: '学習者' },
  { xp: 500, title: '実践者' },
  { xp: 1000, title: '挑戦者' },
  { xp: 2000, title: '達人' },
  { xp: 5000, title: 'マスター' },
]

export function getLevelInfo(rpSessions?: number): LevelInfo {
  const xp = getTotalXp() + (rpSessions || 0) * 50
  let level = 1
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { level = i + 1; break }
  }
  const current = LEVELS[level - 1]
  const next = LEVELS[level] || { xp: current.xp + 1000 }
  const progress = Math.min(((xp - current.xp) / (next.xp - current.xp)) * 100, 100)
  return { level, title: current.title, xp, nextXp: next.xp, progress }
}
