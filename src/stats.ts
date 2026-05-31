import { pushProgress, pushDisplayName, getSyncUser } from './syncService'
import { incrementCompletionCount } from './db/completionCountDb'

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch { /* localStorage 不可（プライベートモード / cross-origin frame など）は無視 */ }
}

function today(): string {
  // UTC基準ではなくローカル時刻（日本時間）で日付を取得
  return localDateStr()
}

/**
 * 任意のUnixミリ秒またはDateをローカル日付文字列（YYYY-MM-DD）に変換。
 * `toISOString().slice(0, 10)` を使うと UTC 基準で日付がズレる
 * （JST 朝 9:00 前は前日扱いになる）ため、学習日・週次サマリー等は必ずこちらを使うこと。
 */
export function localDateStr(d?: Date | number): string {
  const date = d === undefined ? new Date() : (d instanceof Date ? d : new Date(d))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function recordCompletion(lessonKey: string) {
  const stats = load()
  if (!stats.completedLessons.includes(lessonKey)) {
    stats.completedLessons.push(lessonKey)
  }
  // レッスン完了時はローカル日付で必ず studyDates を更新する。
  // addStudyTime() の MIN_DURATION_MS 未満（5秒未満）の短時間レッスンでも
  // 「学習した日」として今週カードや 30 日チャートに反映させるための念押し。
  const d = today()
  if (!stats.studyDates.includes(d)) {
    stats.studyDates.push(d)
  }
  save(stats)
  recordLessonStreak()
  maybeGrantStreakFreeze()
  // 日別ログにも記録（時間情報なし）。useStudyTimer 経由でも別途 ms 付きで記録されるが、
  // タイマー回らなかった短時間完了でも「何を学んだか」一覧には出るようにする。
  appendStudyDaily({ key: lessonKey, ts: Date.now() })
  // 完了回数を +1 (1 回目 / 2 回目 / 3 回以上 をバッジで可視化するため別管理)。
  // 既存の completedLessons (Set 相当) とは独立。
  try { incrementCompletionCount(lessonKey) } catch { /* localStorage 不可は無視 */ }
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

// ── 日別学習ログ（localStorage）─────────────────────────
//
// 既存の studyTimeMs（累計）/ studyDates（学習した日付集合）に加えて、
// 「いつ・何を・どれだけ学んだか」をローカルで保持する。
// StudyTimeScreen の日別グラフ + 学習内訳表示で参照する。
//
// 形式: { 'YYYY-MM-DD': { ms: number, items: { key: string; ts: number; ms?: number }[] } }
//   - key: useStudyTimer の activity_type + ':' + activity_id（例 'lesson:23', 'fermi:default'）
//          または recordCompletion 経由の completion key（例 'lesson-23'）
//   - ts:  そのアクティビティが終わった unix ms
//   - ms:  そのアクティビティで計測された学習時間（recordCompletion 由来は undefined）
//
// 保持上限: 過去 180 日分（古いものから自動削除）。
const STUDY_DAILY_KEY = 'logic-study-daily'

export type StudyDailyItem = { key: string; ts: number; ms?: number }
export type StudyDailyMap = Record<string, { ms: number; items: StudyDailyItem[] }>

const MAX_DAILY_KEEP_DAYS = 180
const MAX_ITEMS_PER_DAY = 200

function loadDaily(): StudyDailyMap {
  try {
    const raw = localStorage.getItem(STUDY_DAILY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as StudyDailyMap
  } catch { return {} }
}

function saveDaily(map: StudyDailyMap) {
  try {
    // 古い日を間引いて localStorage 容量を守る
    const keys = Object.keys(map).sort()
    if (keys.length > MAX_DAILY_KEEP_DAYS) {
      for (const k of keys.slice(0, keys.length - MAX_DAILY_KEEP_DAYS)) delete map[k]
    }
    localStorage.setItem(STUDY_DAILY_KEY, JSON.stringify(map))
  } catch { /* ignore */ }
}

/**
 * 日別学習ログに 1 件追加。useStudyTimer の flush と recordCompletion の両方から呼ぶ。
 *
 * - ms が指定された場合は日合計に加算する（useStudyTimer 経路）。
 * - ms が undefined の場合は時間加算なし（短時間レッスン完了など、recordCompletion 経路）。
 *
 * 日付は ts（ended_at 相当）のローカル日付で決める。
 * useStudyTimer は UTC ISO を投げてくるが、こちらは localStorage 側なのでローカル時刻で
 * 揃えれば JST 朝のズレを起こさず、サーバー集計（UTC）と独立に正しい値を保てる。
 */
export function appendStudyDaily(item: StudyDailyItem) {
  try {
    const map = loadDaily()
    const dateStr = localDateStr(item.ts)
    const day = map[dateStr] ?? { ms: 0, items: [] }
    if (typeof item.ms === 'number' && item.ms > 0) day.ms += item.ms
    day.items.push(item)
    // 1 日あたりのアイテム上限（暴走防止）
    if (day.items.length > MAX_ITEMS_PER_DAY) {
      day.items.splice(0, day.items.length - MAX_ITEMS_PER_DAY)
    }
    map[dateStr] = day
    saveDaily(map)
  } catch { /* localStorage 不可は無視 */ }
}

export function getStudyDaily(): StudyDailyMap {
  return loadDaily()
}

/**
 * 指定日（YYYY-MM-DD ローカル）の学習時間とアイテムを返す。データがない日は ms=0, items=[]。
 */
export function getStudyDailyEntry(dateStr: string): { ms: number; items: StudyDailyItem[] } {
  const map = loadDaily()
  const e = map[dateStr]
  return e ? { ms: e.ms, items: [...e.items] } : { ms: 0, items: [] }
}

export function getCompletedCount(): number {
  return load().completedLessons.length
}

// ── ストリークフリーズ（連続学習が1日抜けても自動で穴埋めするアイテム） ──
//
// Duolingo の Streak Freeze 相当。無料配布のみ（課金導線なし）。
//   - 最大 MAX_STREAK_FREEZE 個までストックできる。
//   - 1日抜けが発生したら getStreak() がフリーズを1個自動消費してストリークを維持する。
//   - フリーズが0個なら従来どおりストリークは途切れる。
//   - 付与はストリークが GRANT_STREAK_INTERVAL 日の節目に達したとき 1 個（recordCompletion 経由）。
//
// 永続化: localStorage キー `logic-streak-freeze`
//   { count: number;            // 現在の保有数（0..MAX_STREAK_FREEZE）
//     consumedDates: string[];  // フリーズで穴埋めした日付（YYYY-MM-DD）。getStreak 計算で連結に使う
//     lastGrantStreak: number } // 最後に付与判定したストリーク値（同じ節目で多重付与しないため）
//
// 後方互換: フィールド欠落の旧データ / 未保存ユーザーは count=0・consumedDates=[]・lastGrantStreak=0
//           として安全に読める（既存ストリークデータ logic-stats とは別キーなので破壊しない）。
export const MAX_STREAK_FREEZE = 2
const GRANT_STREAK_INTERVAL = 5
const STREAK_FREEZE_KEY = 'logic-streak-freeze'

export type StreakFreeze = { count: number; consumedDates: string[]; lastGrantStreak: number }

function loadFreeze(): StreakFreeze {
  try {
    const raw = localStorage.getItem(STREAK_FREEZE_KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<StreakFreeze>
      const count =
        typeof p.count === 'number' && p.count >= 0
          ? Math.min(Math.floor(p.count), MAX_STREAK_FREEZE)
          : 0
      return {
        count,
        consumedDates: Array.isArray(p.consumedDates) ? p.consumedDates.filter((d) => typeof d === 'string') : [],
        lastGrantStreak: typeof p.lastGrantStreak === 'number' && p.lastGrantStreak >= 0 ? p.lastGrantStreak : 0,
      }
    }
  } catch { /* ignore */ }
  return { count: 0, consumedDates: [], lastGrantStreak: 0 }
}

function saveFreeze(f: StreakFreeze) {
  try {
    localStorage.setItem(
      STREAK_FREEZE_KEY,
      JSON.stringify({
        count: Math.min(Math.max(0, Math.floor(f.count)), MAX_STREAK_FREEZE),
        consumedDates: f.consumedDates,
        lastGrantStreak: f.lastGrantStreak,
      }),
    )
  } catch { /* localStorage 不可は無視 */ }
}

/** 現在保有しているストリークフリーズの個数（0..MAX_STREAK_FREEZE）。 */
export function getStreakFreezeCount(): number {
  return loadFreeze().count
}

/**
 * ストリークフリーズを1個付与する（上限 MAX_STREAK_FREEZE で頭打ち）。
 * 無料配布専用。実際に増えたら true、上限到達などで増えなければ false を返す。
 */
export function grantStreakFreeze(): boolean {
  const f = loadFreeze()
  if (f.count >= MAX_STREAK_FREEZE) return false
  f.count += 1
  saveFreeze(f)
  return true
}

/**
 * 学習を記録したタイミングで、ストリークの節目に達していればフリーズを無料付与する。
 *
 * 付与トリガー（安全側＝控えめ）: ストリークが GRANT_STREAK_INTERVAL(=5) 日の倍数に達したとき 1 個。
 * 同じ節目で多重付与しないよう lastGrantStreak を進め、超えた分の節目はまとめて 1 個だけ付与する
 * （上限 MAX_STREAK_FREEZE で頭打ち）。getStreak の副作用と混ざらないよう、付与判定でのみ
 * lastGrantStreak を更新する。
 *
 * 注: getStreak() を呼ぶとフリーズ自動消費の副作用が走るが、recordCompletion から呼ばれる時点では
 *     今日の studyDates が記録済み（anchor=今日）なので消費は発生しない。
 */
function maybeGrantStreakFreeze() {
  try {
    const streak = getStreak()
    const f = loadFreeze()
    const milestone = Math.floor(streak / GRANT_STREAK_INTERVAL)
    const lastMilestone = Math.floor(f.lastGrantStreak / GRANT_STREAK_INTERVAL)
    if (milestone > lastMilestone) {
      // 節目を新たに通過した。上限内であれば 1 個付与（連続して複数節目を跨いでも 1 個まで）。
      f.lastGrantStreak = streak
      if (f.count < MAX_STREAK_FREEZE) f.count += 1
      saveFreeze(f)
    }
  } catch { /* localStorage 不可は無視 */ }
}

/**
 * ストリークを計算する。1日の抜けはフリーズを自動消費して連結を維持する。
 *
 * 純粋な読み取りだけでなく「フリーズ消費」という副作用を持つ。穴埋めに使ったフリーズは
 * その場で count を減らし、穴埋めした日付を consumedDates に記録する（同じ日を二重消費しない）。
 * フリーズが0個なら従来どおりそこでストリークが途切れる。
 */
export function getStreak(): number {
  const dates = load().studyDates.sort()
  if (dates.length === 0) return 0

  const todayStr = today()
  const yesterdayStr = localDateStr(Date.now() - 86400000)

  // 学習日の集合（重複除去）。連結判定はこの集合 + フリーズ穴埋め日で行う。
  const studied = new Set(dates)
  const last = dates[dates.length - 1]

  const freeze = loadFreeze()
  let freezeAvail = freeze.count
  const newConsumed: string[] = []

  // ストリークの「先頭日」を決める。今日学習済みなら今日、未学習でも昨日学習済みならまだ生きている。
  // どちらでもない場合、昨日の1日穴をフリーズで埋められればストリークは生存できる。
  let anchor: string
  if (last === todayStr || studied.has(todayStr)) {
    anchor = todayStr
  } else if (studied.has(yesterdayStr)) {
    anchor = yesterdayStr
  } else if (freeze.consumedDates.includes(yesterdayStr)) {
    // 昨日は過去に既にフリーズで埋め済み → ストリークは生存（追加消費なし）
    anchor = yesterdayStr
  } else if (freezeAvail > 0) {
    // 昨日が空いている1日抜け → フリーズ1個で昨日を埋めてストリーク維持
    freezeAvail -= 1
    newConsumed.push(yesterdayStr)
    anchor = yesterdayStr
  } else {
    // フリーズ0個 → 従来どおりストリークは途切れる
    return 0
  }

  // anchor から1日ずつ過去へ遡り、抜けはフリーズで埋めながら連続日数を数える。
  let streak = 0
  let cursorMs = new Date(anchor).getTime()
  const earliestMs = new Date(dates[0]).getTime()
  while (cursorMs >= earliestMs) {
    const cursorStr = localDateStr(cursorMs)
    if (studied.has(cursorStr) || freeze.consumedDates.includes(cursorStr) || newConsumed.includes(cursorStr)) {
      streak++
    } else if (freezeAvail > 0) {
      // この日の抜けをフリーズで埋める
      freezeAvail -= 1
      newConsumed.push(cursorStr)
      streak++
    } else {
      break
    }
    cursorMs -= 86400000
  }

  // フリーズを実際に消費した場合のみ永続化する（純粋ストリークでは書き込まない）。
  if (newConsumed.length > 0) {
    saveFreeze({
      count: freezeAvail,
      consumedDates: [...freeze.consumedDates, ...newConsumed],
      lastGrantStreak: freeze.lastGrantStreak,
    })
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
/**
 * MAX XP — homeHelpers.MAX_XP と一致させる。循環依存を避けるため stats 側にも定数を置く。
 *
 * 2026-05-24: MAX_LEVEL 100→500 拡張に伴い 9,999 → 50,399 に拡張。
 *   - homeHelpers.MAX_XP = (MAX_LEVEL - 1) * 101 = 499 * 101 = 50,399
 *   - 旧 v2 migration (242,550 → 9,999) を通過済みのユーザーは 9,999 で頭打ちのまま
 *     残っているが、新カーブでも 9,999 XP は Lv 100 相当なので「現状維持」になる。
 *     新たに XP を稼ぐと Lv 101 以降に伸びていく。
 *   - 9,999 でクランプされていないユーザー (旧 v2 を通っていない新規ユーザー)
 *     は何もしなくても新上限まで自然に伸びる。
 */
const STATS_MAX_XP = 50399

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
