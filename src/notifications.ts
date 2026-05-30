// Local notification wrapper — 今日の1問リマインダー + ストリーク途切れアラート
// Native: @capacitor/local-notifications で実際にスケジュール
// Web: localStorage 保存のみ（no-op）

import { t } from './i18n'
import { getStudyDates } from './stats'

const REMINDER_PREF_KEY = 'logic-reminder'
const STREAK_ALERT_PREF_KEY = 'logic-notif-extra'
const JOURNAL_PREF_KEY = 'logic-journal-reminder'
const DAILY_NOTIF_ID = 1001
const STREAK_RISK_NOTIF_ID = 1002
const JOURNAL_NOTIF_ID = 1003
const STREAK_RISK_HOUR = 21
const DAILY_MESSAGE_COUNT = 20

// DF-F8: 曜日別の daily reminder 通知 id。
// frequency が weekdays / weekly のときは曜日ごとに別 notification を登録する。
// 基準値 + JS 曜日 (0=日 〜 6=土) で 1010〜1016 を払い出し、DAILY_NOTIF_ID(1001) や
// streak(1002) / journal(1003) と衝突しない一意な範囲にする。
const DAILY_WEEKDAY_NOTIF_BASE = 1010
// 0=日 〜 6=土。曜日別 id の全範囲（cancel 時の取りこぼし防止に使う）。
const DAILY_WEEKDAY_NOTIF_IDS = [0, 1, 2, 3, 4, 5, 6].map((d) => DAILY_WEEKDAY_NOTIF_BASE + d)
// daily reminder が払い出しうる全 id（単一の 1001 ＋ 曜日別 1010〜1016）。
const DAILY_ALL_NOTIF_IDS = [DAILY_NOTIF_ID, ...DAILY_WEEKDAY_NOTIF_IDS]
// Logic がスケジュールしうる全 notification id。
const ALL_NOTIF_IDS = [...DAILY_ALL_NOTIF_IDS, STREAK_RISK_NOTIF_ID, JOURNAL_NOTIF_ID]

// DF-F8: Capacitor LocalNotifications の Weekday enum は 1 始まりで日曜=1。
// （node_modules/@capacitor/local-notifications: Sunday=1 ... Saturday=7 を型定義で確認）
// アプリ内部の weeklyDays は JS の getDay() 準拠で 0=日 〜 6=土 なので +1 で変換する。
function jsDayToCapacitorWeekday(jsDay: number): number {
  return jsDay + 1
}

// ── Pref types ─────────────────────────────────────────────────

// DF-F8: 通知頻度モード。
// - daily:    毎日
// - weekdays: 平日のみ（月〜金）
// - weekly:   選択した曜日のみ（weeklyDays で指定）
export type ReminderFrequency = 'daily' | 'weekdays' | 'weekly'

// DF-F8: 静かな時間帯（Do Not Disturb）。
// start〜end の時間帯はリマインダーを鳴らさない想定。
// 時刻は "HH:MM" 形式（24h）。
export type QuietHours = {
  enabled: boolean
  start: string  // "22:00"
  end: string    // "07:00"
}

export type ReminderPref = {
  enabled: boolean
  hour: number    // 0-23
  minute: number  // 0-59
  // DF-F8 で追加した粒度設定。旧データ（hour/minute のみ）からは
  // loadReminderPref() のマイグレーションでデフォルトが補完される。
  frequency: ReminderFrequency
  weeklyDays: number[]   // 0=日 〜 6=土。frequency === 'weekly' のときに使う
  quietHours: QuietHours
}

export type StreakAlertPref = {
  streakAlert: boolean
}

export type JournalReminderPref = {
  enabled: boolean
  hour: number   // 0-23
  minute: number // 0-59
}

// DF-F8: weekdays = 月〜金（1〜5）。
const WEEKDAY_INDICES = [1, 2, 3, 4, 5]
const DEFAULT_QUIET_HOURS: QuietHours = { enabled: false, start: '22:00', end: '07:00' }
const DEFAULT_REMINDER_PREF: ReminderPref = {
  enabled: false,
  hour: 20,
  minute: 0,
  frequency: 'daily',
  weeklyDays: [...WEEKDAY_INDICES],
  quietHours: { ...DEFAULT_QUIET_HOURS },
}
const DEFAULT_STREAK_ALERT_PREF: StreakAlertPref = { streakAlert: true }
const DEFAULT_JOURNAL_REMINDER_PREF: JournalReminderPref = { enabled: false, hour: 22, minute: 0 }

// ── Helpers ────────────────────────────────────────────────────

export function isNative(): boolean {
  try {
    return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  } catch { return false }
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function studiedToday(): boolean {
  try {
    return getStudyDates().includes(todayStr())
  } catch { return false }
}

/** 日付ベースで20パターンから決定的に1つ選ぶ。日が変われば異なるメッセージになる */
function buildDailyBody(): string {
  const d = new Date()
  const seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()
  const idx = (seed % DAILY_MESSAGE_COUNT) + 1
  return t(`notif.daily.${idx}`)
}

// ── Pref load/save ─────────────────────────────────────────────

// DF-F8: "HH:MM" を hour/minute に分解（不正値は null）。
function parseTimeString(s: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

// DF-F8: 時刻を分単位 (0〜1439) に変換。
function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

/**
 * DF-F8: 通知予定時刻 (hour:minute) が静かな時間帯 (DND) の範囲内かを判定する。
 * 範囲は [start, end)（start を含み end を含まない）。
 * - 通常範囲 (start < end): 例 22:00〜23:30 → start <= t < end
 * - 日跨ぎ範囲 (start > end): 例 22:00〜07:00 → t >= start もしくは t < end
 * - start === end: 範囲ゼロとみなし常に false（鳴らす）。
 * enabled が false の場合は常に false（DND 無効）。
 */
export function isWithinQuietHours(quiet: QuietHours, hour: number, minute: number): boolean {
  if (!quiet.enabled) return false
  const start = parseTimeString(quiet.start)
  const end = parseTimeString(quiet.end)
  if (!start || !end) return false
  const startMin = toMinutes(start.hour, start.minute)
  const endMin = toMinutes(end.hour, end.minute)
  const t = toMinutes(hour, minute)
  if (startMin === endMin) return false
  if (startMin < endMin) {
    // 通常範囲
    return t >= startMin && t < endMin
  }
  // 日跨ぎ範囲（start > end）
  return t >= startMin || t < endMin
}

/**
 * DF-F8: ReminderPref から「実際にスケジュールすべき曜日（JS 0=日〜6=土）」の配列を返す。
 * - quietHours で通知予定時刻が DND 範囲内なら空配列（＝ daily reminder を一切鳴らさない）。
 * - daily: 全曜日 [0..6]。
 * - weekdays: 月〜金 [1,2,3,4,5]。
 * - weekly: weeklyDays をそのまま（空配列ならゼロ）。
 * 返り値の使い分け:
 *  - 全曜日 [0..6] のときは呼び出し側で単一の "every: day" スケジュールにできる。
 *  - それ以外は曜日別の on スケジュールを払い出す。
 */
export function resolveReminderWeekdays(pref: Pick<ReminderPref, 'hour' | 'minute' | 'frequency' | 'weeklyDays' | 'quietHours'>): number[] {
  if (isWithinQuietHours(pref.quietHours, pref.hour, pref.minute)) return []
  switch (pref.frequency) {
    case 'daily':
      return [0, 1, 2, 3, 4, 5, 6]
    case 'weekdays':
      return [...WEEKDAY_INDICES]
    case 'weekly':
      return [...pref.weeklyDays].filter((d) => d >= 0 && d <= 6).sort((a, b) => a - b)
    default:
      return [0, 1, 2, 3, 4, 5, 6]
  }
}

/**
 * DF-F8: ReminderPref を読み込む。
 * 後方互換:
 *  - 旧 JSON 構造（{ enabled, hour, minute }）は frequency/weeklyDays/quietHours が
 *    デフォルトで補完される（spread マージ）。
 *  - 万一 string（"21:00" のような旧 reminder time）が保存されていた場合は
 *    time として解釈し、enabled=true の daily リマインダーへ移行する。
 *  - quietHours / weeklyDays が部分的に欠けていてもデフォルトで埋める。
 */
export function loadReminderPref(): ReminderPref {
  try {
    const raw = localStorage.getItem(REMINDER_PREF_KEY)
    if (raw) {
      const trimmed = raw.trim()
      // 旧 string 値（"HH:MM"）のマイグレーション
      if (!trimmed.startsWith('{')) {
        const parsed = parseTimeString(trimmed)
        if (parsed) {
          return { ...DEFAULT_REMINDER_PREF, enabled: true, hour: parsed.hour, minute: parsed.minute }
        }
        return { ...DEFAULT_REMINDER_PREF }
      }
      const obj = JSON.parse(trimmed) as Partial<ReminderPref>
      return {
        ...DEFAULT_REMINDER_PREF,
        ...obj,
        // ネストした構造は spread で上書きされないため個別にマージする
        weeklyDays: Array.isArray(obj.weeklyDays) && obj.weeklyDays.length > 0
          ? obj.weeklyDays
          : [...DEFAULT_REMINDER_PREF.weeklyDays],
        quietHours: { ...DEFAULT_QUIET_HOURS, ...(obj.quietHours ?? {}) },
      }
    }
  } catch { /* */ }
  return { ...DEFAULT_REMINDER_PREF }
}

export function saveReminderPref(pref: ReminderPref) {
  localStorage.setItem(REMINDER_PREF_KEY, JSON.stringify(pref))
}

export function loadStreakAlertPref(): StreakAlertPref {
  try {
    const raw = localStorage.getItem(STREAK_ALERT_PREF_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StreakAlertPref>
      return { streakAlert: parsed.streakAlert !== false }
    }
  } catch { /* */ }
  return { ...DEFAULT_STREAK_ALERT_PREF }
}

export function saveStreakAlertPref(pref: StreakAlertPref) {
  localStorage.setItem(STREAK_ALERT_PREF_KEY, JSON.stringify(pref))
}

export function loadJournalReminderPref(): JournalReminderPref {
  try {
    const raw = localStorage.getItem(JOURNAL_PREF_KEY)
    if (raw) return { ...DEFAULT_JOURNAL_REMINDER_PREF, ...JSON.parse(raw) }
  } catch { /* */ }
  return { ...DEFAULT_JOURNAL_REMINDER_PREF }
}

export function saveJournalReminderPref(pref: JournalReminderPref) {
  localStorage.setItem(JOURNAL_PREF_KEY, JSON.stringify(pref))
}

// ── Permission ─────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'granted') return true
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (e) {
    console.warn('Notification permission error:', e)
    return false
  }
}

// ── Daily reminder ─────────────────────────────────────────────

// DF-F8: 保存済み pref（frequency / weeklyDays / quietHours）を実際の native スケジュール
// に反映する。後方互換のため hour/minute は従来どおり位置引数。
// 挙動:
//  - daily（かつ DND に当たらない）: 単一通知 `{ at, repeats: true, every: 'day' }`。
//  - weekdays: 月〜金それぞれを `{ on: { weekday, hour, minute }, repeats: true }` で曜日別登録。
//  - weekly: weeklyDays の各曜日のみ曜日別登録。空配列なら通知ゼロ。
//  - quietHours: enabled かつ通知予定時刻が DND 範囲内ならスケジュールしない（鳴らさない）。
// Web は従来どおり no-op（保存のみ）。native のみ実スケジュール。
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  extra?: Partial<Pick<ReminderPref, 'frequency' | 'weeklyDays' | 'quietHours'>>,
): Promise<boolean> {
  const pref: ReminderPref = { ...loadReminderPref(), ...extra, enabled: true, hour, minute }
  saveReminderPref(pref)
  if (!isNative()) return true

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    // 古いスケジュール（単一・曜日別とも）を一旦すべて掃除してから再登録する。
    await LocalNotifications.cancel({ notifications: DAILY_ALL_NOTIF_IDS.map((id) => ({ id })) })

    const weekdays = resolveReminderWeekdays(pref)
    // DND 範囲内 or weekly で曜日未選択 → スケジュールしない。
    if (weekdays.length === 0) return true

    const body = buildDailyBody()

    // 全曜日 → 単一の毎日通知（従来挙動を維持）。
    if (weekdays.length === 7) {
      const now = new Date()
      const at = new Date()
      at.setHours(hour, minute, 0, 0)
      if (at <= now) at.setDate(at.getDate() + 1)
      await LocalNotifications.schedule({
        notifications: [{
          id: DAILY_NOTIF_ID,
          title: 'Logic',
          body,
          schedule: { at, repeats: true, every: 'day' },
          extra: { type: 'daily' },
        }],
      })
      return true
    }

    // 一部曜日のみ → 曜日別に on スケジュールを登録（複数 notification）。
    await LocalNotifications.schedule({
      notifications: weekdays.map((d) => ({
        id: DAILY_WEEKDAY_NOTIF_BASE + d,
        title: 'Logic',
        body,
        schedule: {
          on: { weekday: jsDayToCapacitorWeekday(d), hour, minute },
          repeats: true,
        },
        extra: { type: 'daily', weekday: d },
      })),
    })
    return true
  } catch (e) {
    console.warn('Schedule daily reminder error:', e)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  saveReminderPref({ ...loadReminderPref(), enabled: false })
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    // 単一 id だけでなく曜日別 id 群も取りこぼさず全 cancel する。
    await LocalNotifications.cancel({ notifications: DAILY_ALL_NOTIF_IDS.map((id) => ({ id })) })
  } catch (e) {
    console.warn('Cancel daily reminder error:', e)
  }
}

// ── Streak risk reminder ───────────────────────────────────────

/**
 * 21:00 にストリーク途切れアラートを毎日スケジュール。
 * - 今日学習済みなら次回は翌日 21:00 から開始
 * - 今日まだで 21:00 前なら今日から開始、過ぎてれば翌日から開始
 * - 一度 schedule すれば repeats=daily で毎日同時刻に届く
 */
export async function scheduleStreakRiskReminder(): Promise<boolean> {
  saveStreakAlertPref({ streakAlert: true })
  if (!isNative()) return true

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: STREAK_RISK_NOTIF_ID }] })

    const now = new Date()
    const at = new Date()
    at.setHours(STREAK_RISK_HOUR, 0, 0, 0)
    // 今日学習済み、または 21:00 を過ぎている → 翌日から開始
    if (studiedToday() || at <= now) {
      at.setDate(at.getDate() + 1)
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: STREAK_RISK_NOTIF_ID,
        title: t('notif.streakRisk.title'),
        body: t('notif.streakRisk.body'),
        schedule: { at, repeats: true, every: 'day' },
        extra: { type: 'streakRisk' },
      }],
    })
    return true
  } catch (e) {
    console.warn('Schedule streak risk reminder error:', e)
    return false
  }
}

export async function cancelStreakRiskReminder(): Promise<void> {
  saveStreakAlertPref({ streakAlert: false })
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: STREAK_RISK_NOTIF_ID }] })
  } catch (e) {
    console.warn('Cancel streak risk reminder error:', e)
  }
}

// ── Journal reminder ───────────────────────────────────────────
// 指定時刻にジャーナル記入リマインダーを毎日通知。
export async function scheduleJournalReminder(hour: number, minute: number): Promise<boolean> {
  saveJournalReminderPref({ enabled: true, hour, minute })
  if (!isNative()) return true

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: JOURNAL_NOTIF_ID }] })

    const now = new Date()
    const at = new Date()
    at.setHours(hour, minute, 0, 0)
    if (at <= now) at.setDate(at.getDate() + 1)

    await LocalNotifications.schedule({
      notifications: [{
        id: JOURNAL_NOTIF_ID,
        title: t('notif.journal.title'),
        body: t('notif.journal.body'),
        schedule: { at, repeats: true, every: 'day' },
        extra: { type: 'journal' },
      }],
    })
    return true
  } catch (e) {
    console.warn('Schedule journal reminder error:', e)
    return false
  }
}

export async function cancelJournalReminder(): Promise<void> {
  saveJournalReminderPref({ ...loadJournalReminderPref(), enabled: false })
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: JOURNAL_NOTIF_ID }] })
  } catch (e) {
    console.warn('Cancel journal reminder error:', e)
  }
}

// ── Cancel / Reschedule all ────────────────────────────────────

/**
 * Logic がスケジュールした全リマインダー (daily / streakRisk / journal) を一括 cancel。
 * 設定 (pref) は変更しない — 重複・古いスケジュール残存対策のための物理的な掃除のみ。
 */
export async function cancelAllReminders(): Promise<void> {
  if (!isNative()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: ALL_NOTIF_IDS.map((id) => ({ id })) })
  } catch (e) {
    console.warn('Cancel all reminders error:', e)
  }
}

/**
 * 起動時 bootstrap 用: 既存スケジュールを全 cancel してから、各 pref が enabled のものだけ再 schedule。
 * 古いスケジュール残存 / 重複発火対策のために毎回呼ぶ前提。
 */
export async function rescheduleAllReminders(): Promise<void> {
  if (!isNative()) return
  await cancelAllReminders()

  const reminder = loadReminderPref()
  if (reminder.enabled) {
    await scheduleDailyReminder(reminder.hour, reminder.minute)
  }

  const streakAlert = loadStreakAlertPref()
  if (streakAlert.streakAlert) {
    await scheduleStreakRiskReminder()
  }

  const journal = loadJournalReminderPref()
  if (journal.enabled) {
    await scheduleJournalReminder(journal.hour, journal.minute)
  }
}

// ── Debug: getPending ──────────────────────────────────────────

export type PendingNotificationInfo = {
  id: number
  title: string | null
  body: string | null
  scheduledAt: string | null // ISO string、unknown なら null
  every: string | null       // 'day' など、unknown なら null
}

/**
 * 端末で実際に pending 状態の通知一覧を取得 (デバッグ用)。
 * Web 環境では空配列を返す。
 * 戻り値は schedule.at 昇順でソート済み。
 */
export async function getPendingNotifications(): Promise<PendingNotificationInfo[]> {
  if (!isNative()) return []
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const result = await LocalNotifications.getPending()
    const list: PendingNotificationInfo[] = (result.notifications ?? []).map((n) => {
      const schedule = (n as { schedule?: { at?: Date | string; every?: string } }).schedule
      let scheduledAt: string | null = null
      if (schedule?.at) {
        const d = schedule.at instanceof Date ? schedule.at : new Date(schedule.at)
        scheduledAt = isNaN(d.getTime()) ? null : d.toISOString()
      }
      return {
        id: n.id,
        title: n.title ?? null,
        body: n.body ?? null,
        scheduledAt,
        every: schedule?.every ?? null,
      }
    })
    // 次回発火時刻が早い順に並べる (null は末尾)
    list.sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return a.scheduledAt.localeCompare(b.scheduledAt)
      if (a.scheduledAt) return -1
      if (b.scheduledAt) return 1
      return a.id - b.id
    })
    return list
  } catch (e) {
    console.warn('getPendingNotifications error:', e)
    return []
  }
}

// ── Deep link listener ─────────────────────────────────────────

/**
 * 通知タップ時のハンドラを登録。ネイティブのみ実機能。
 * 返り値の関数で解除可能。
 */
export async function addNotificationTapListener(handler: () => void): Promise<() => void> {
  if (!isNative()) return () => { /* no-op */ }
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const listener = await LocalNotifications.addListener('localNotificationActionPerformed', () => {
      handler()
    })
    return () => { void listener.remove() }
  } catch (e) {
    console.warn('Add notification tap listener error:', e)
    return () => { /* no-op */ }
  }
}
