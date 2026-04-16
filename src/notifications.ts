// Local notification wrapper — 今日の1問リマインダー
// Native: @capacitor/local-notifications で実際にスケジュール
// Web: localStorage 保存のみ（no-op）

const PREF_KEY = 'logic-reminder'
const NOTIF_ID = 1001

export type ReminderPref = {
  enabled: boolean
  hour: number    // 0-23
  minute: number  // 0-59
}

const DEFAULT_PREF: ReminderPref = { enabled: false, hour: 20, minute: 0 }

export function isNative(): boolean {
  try {
    return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  } catch { return false }
}

export function loadReminderPref(): ReminderPref {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) return { ...DEFAULT_PREF, ...JSON.parse(raw) }
  } catch { /* */ }
  return { ...DEFAULT_PREF }
}

export function saveReminderPref(pref: ReminderPref) {
  localStorage.setItem(PREF_KEY, JSON.stringify(pref))
}

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

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  saveReminderPref({ enabled: true, hour, minute })
  if (!isNative()) return true // web: 保存のみ

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    // 既存通知をキャンセル
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })

    // 次の通知時刻を計算
    const now = new Date()
    const at = new Date()
    at.setHours(hour, minute, 0, 0)
    if (at <= now) at.setDate(at.getDate() + 1)

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIF_ID,
        title: 'Logic',
        body: '今日の1問が待っています！毎日の練習でランクアップ 🧠',
        schedule: { at, repeats: true, every: 'day' },
      }],
    })
    return true
  } catch (e) {
    console.warn('Schedule notification error:', e)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  saveReminderPref({ ...loadReminderPref(), enabled: false })
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })
  } catch (e) {
    console.warn('Cancel notification error:', e)
  }
}
