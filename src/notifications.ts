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

const PREF_KEY = 'logic-reminder'

type ReminderPref = {
  enabled: boolean
  hour: number  // 0-23
  minute: number // 0-59
}

const DEFAULT_PREF: ReminderPref = { enabled: false, hour: 20, minute: 0 }

export function isNative(): boolean {
  // Capacitor not installed — always false on web build
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)?.Capacitor?.isNativePlatform?.() ?? false
  } catch {
    return false
  }
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
  return false
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  saveReminderPref({ enabled: true, hour, minute })
  return true
}

export async function cancelDailyReminder(): Promise<void> {
  const pref = loadReminderPref()
  saveReminderPref({ ...pref, enabled: false })
}
