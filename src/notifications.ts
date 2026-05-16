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

// ── Pref types ─────────────────────────────────────────────────

export type ReminderPref = {
  enabled: boolean
  hour: number    // 0-23
  minute: number  // 0-59
}

export type StreakAlertPref = {
  streakAlert: boolean
}

export type JournalReminderPref = {
  enabled: boolean
  hour: number   // 0-23
  minute: number // 0-59
}

const DEFAULT_REMINDER_PREF: ReminderPref = { enabled: false, hour: 20, minute: 0 }
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

export function loadReminderPref(): ReminderPref {
  try {
    const raw = localStorage.getItem(REMINDER_PREF_KEY)
    if (raw) return { ...DEFAULT_REMINDER_PREF, ...JSON.parse(raw) }
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

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  saveReminderPref({ enabled: true, hour, minute })
  if (!isNative()) return true

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] })

    const now = new Date()
    const at = new Date()
    at.setHours(hour, minute, 0, 0)
    if (at <= now) at.setDate(at.getDate() + 1)

    await LocalNotifications.schedule({
      notifications: [{
        id: DAILY_NOTIF_ID,
        title: 'Logic',
        body: buildDailyBody(),
        schedule: { at, repeats: true, every: 'day' },
        extra: { type: 'daily' },
      }],
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
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_NOTIF_ID }] })
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
