import { pushProgress, pushDisplayName, getSyncUser } from './syncService'

const STORAGE_KEY = 'logic-stats'

type Stats = {
  completedLessons: string[]  // lesson keys like "lesson-6", "mock-exam", "journal-input", "worksheet"
  studyDates: string[]        // YYYY-MM-DD
  studyTimeMs: number         // total milliseconds
}

function load(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Stats>
      // 型チェック: スキーマ変更時に壊れたデータをデフォルトにフォールバック
      return {
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
        studyDates: Array.isArray(parsed.studyDates) ? parsed.studyDates : [],
        studyTimeMs: typeof parsed.studyTimeMs === 'number' ? parsed.studyTimeMs : 0,
      }
    }
  } catch { /* ignore */ }
  return { completedLessons: [], studyDates: [], studyTimeMs: 0 }
}

function save(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

function today(): string {
  // UTC基準ではなくローカル時刻（日本時間）で日付を取得
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 任意のUnixミリ秒をローカル日付文字列（YYYY-MM-DD）に変換 */
function localDateStr(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const yesterdayStr = (() => {
    const d = new Date(Date.now() - 86400000)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

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
const XP_MIGRATION_KEY = 'logic-xp-scale-v2'
/** MAX XP — homeHelpers.MAX_XP と一致させる。循環依存を避けるため stats 側にも定数を置く */
const STATS_MAX_XP = 9999

export type XpEvent = 'lesson' | 'quiz_perfect' | 'streak' | 'fermi' | 'journal_morning' | 'journal_evening'

export const XP_REWARDS: Record<XpEvent, number> = {
  lesson: 50,
  quiz_perfect: 20,
  streak: 10,
  fermi: 30,
  journal_morning: 25,
  journal_evening: 25,
}

/**
 * 旧 XP スケール（MAX 242,550）→ 新スケール（MAX 9,999）への変換。
 * 旧仕様で長く使ってきたユーザーは Lv99 で 242k XP まで貯まっている可能性があるため、
 * 9999 を超えていたら 9999 にクランプする（実質 Lv100 に張り付き）。
 * 既存の進捗・解放状況は維持しつつ、表示上のレベルだけ新仕様に揃える。
 * 一度走ったらフラグを立てて再実行しない（追加 XP を間違ってクランプしないため）。
 */
function migrateLegacyXp(): void {
  try {
    if (localStorage.getItem(XP_MIGRATION_KEY) === '1') return
    const raw = parseInt(localStorage.getItem(XP_KEY) ?? '0', 10) || 0
    if (raw > STATS_MAX_XP) {
      localStorage.setItem(XP_KEY, String(STATS_MAX_XP))
    }
    localStorage.setItem(XP_MIGRATION_KEY, '1')
  } catch { /* localStorage 不可なら諦める */ }
}

export function getXp(): number {
  try {
    migrateLegacyXp()
    const raw = parseInt(localStorage.getItem(XP_KEY) ?? '0', 10) || 0
    return Math.min(raw, STATS_MAX_XP)
  } catch { return 0 }
}

export function addXp(event: XpEvent): number {
  const gained = XP_REWARDS[event]
  const newXp = Math.min(getXp() + gained, STATS_MAX_XP)
  localStorage.setItem(XP_KEY, String(newXp))
  appendXpLog(event, gained)
  return newXp
}

/** 任意のXP量を直接加算（AI問題生成・解答完了などのカスタムXP用） */
export function addXP(amount: number): number {
  const newXp = Math.min(getXp() + amount, STATS_MAX_XP)
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
  journal_morning: '朝のジャーナル',
  journal_evening: '夜のジャーナル',
}

// ─── ジャーナル朝/夜 XP 付与（1日1回ずつ） ───────────────────────
//   localStorage キー: logic-journal-xp = { 'YYYY-MM-DD': { morning?: true, evening?: true } }
//   既に付与済みなら no-op で 0 を返す。新規付与なら XP_REWARDS の値を返す。
const JOURNAL_XP_KEY = 'logic-journal-xp'

type JournalXpMap = Record<string, { morning?: boolean; evening?: boolean }>

function loadJournalXpMap(): JournalXpMap {
  try {
    const raw = localStorage.getItem(JOURNAL_XP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed as JournalXpMap : {}
  } catch { return {} }
}

function saveJournalXpMap(map: JournalXpMap) {
  try { localStorage.setItem(JOURNAL_XP_KEY, JSON.stringify(map)) } catch { /* */ }
}

/**
 * 指定日のジャーナル朝/夜 XP を 1 回だけ付与する。
 * 既に同日同フェーズで付与済みなら 0 を返し、その他副作用なし。
 * 新規付与時は addXp を呼び、付与した XP 量を返す。
 */
export function awardJournalXp(date: string, phase: 'morning' | 'evening'): number {
  const map = loadJournalXpMap()
  const day = map[date] ?? {}
  if (day[phase]) return 0
  day[phase] = true
  map[date] = day
  saveJournalXpMap(map)
  const event: XpEvent = phase === 'morning' ? 'journal_morning' : 'journal_evening'
  addXp(event)
  return XP_REWARDS[event]
}

// ── 連続学習日数（レッスン完了ベース、1日スキップOK） ──
const LESSON_STREAK_KEY = 'logic-lesson-streak'
type LessonStreak = { count: number; lastDate: string }

export function getLessonStreak(): number {
  try {
    const s: LessonStreak = JSON.parse(localStorage.getItem(LESSON_STREAK_KEY) || '{}')
    if (!s.lastDate) return 0
    const todayStr = today()
    const yesterday = localDateStr(Date.now() - 86400000)
    const twoDaysAgo = localDateStr(Date.now() - 172800000)
    // 今日か昨日か一昨日（1日スキップOK = 最大2日空白まで）
    if (s.lastDate === todayStr || s.lastDate === yesterday || s.lastDate === twoDaysAgo) {
      return s.count
    }
    return 0
  } catch { return 0 }
}

export function recordLessonStreak() {
  try {
    const todayStr = today()
    const s: LessonStreak = JSON.parse(localStorage.getItem(LESSON_STREAK_KEY) || '{}')
    if (s.lastDate === todayStr) return // 今日は既にカウント済み
    const yesterday = localDateStr(Date.now() - 86400000)
    const twoDaysAgo = localDateStr(Date.now() - 172800000)
    const newCount = (s.lastDate === yesterday || s.lastDate === twoDaysAgo) ? (s.count || 0) + 1 : 1
    localStorage.setItem(LESSON_STREAK_KEY, JSON.stringify({ count: newCount, lastDate: todayStr }))
  } catch { /* */ }
}

// 表示名をlocalStorageに保存
const DISPLAY_NAME_KEY = 'logic-display-name'
export function getDisplayName(): string {
  return localStorage.getItem(DISPLAY_NAME_KEY) || ''
}
export function setDisplayName(name: string) {
  localStorage.setItem(DISPLAY_NAME_KEY, name)
  if (getSyncUser()) {
    pushDisplayName(name).catch(() => { /* fire and forget */ })
  }
}
