// Local notification wrapper for "今日の1問" reminder.
// Uses @capacitor/local-notifications when running on a native device,
// no-op on web (so dev/preview just works).
//
// On native:
//   1. Request permission on first opt-in
//   2. Schedule a repeating daily notification at the user-chosen time
//   3. Persist user preference in localStorage
//
// On web:
//   - All methods resolve immediately, isNative() returns false

import { Capacitor } from '@capacitor/core'

const PREF_KEY = 'logic-reminder'
const NOTIF_ID = 1001 // single recurring notification

type ReminderPref = {
  enabled: boolean
  hour: number  // 0-23
  minute: number // 0-59
}

const DEFAULT_PREF: ReminderPref = { enabled: false, hour: 20, minute: 0 }

export function isNative(): boolean {
  return Capacitor.isNativePlatform()
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
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (e) {
    console.error('[notifications] permission error', e)
    return false
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNative()) {
    saveReminderPref({ enabled: true, hour, minute })
    return true
  }
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    // Cancel any prior schedule
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_ID,
          title: 'Logic',
          body: '今日の 1 問が届いてます。3 分から始めよう。',
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true,
            repeats: true,
          },
        },
      ],
    })
    saveReminderPref({ enabled: true, hour, minute })
    return true
  } catch (e) {
    console.error('[notifications] schedule error', e)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  const pref = loadReminderPref()
  saveReminderPref({ ...pref, enabled: false })
  if (!isNative()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })
  } catch (e) {
    console.error('[notifications] cancel error', e)
  }
}
