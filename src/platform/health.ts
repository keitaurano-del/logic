import { Health, type HealthDataType, type HealthSample } from '@capgo/capacitor-health'
import { isAndroid, isNative } from './platform'

const READ_TYPES: HealthDataType[] = ['steps', 'sleep']

export type HealthAvailability =
  | 'available'
  | 'not-installed'      // Health Connect APK not installed (Android)
  | 'not-supported'      // Device / OS not supported
  | 'web'                // Running on web — feature disabled
  | 'error'

export interface HealthSnapshot {
  /** Total steps for the day, or null when unavailable. */
  steps: number | null
  /** Total sleep duration in minutes, or null when unavailable. */
  sleepMinutes: number | null
  /** ISO timestamp of the earliest "asleep" sample for the night, or null. */
  sleepStart: string | null
  /** ISO timestamp of the latest "asleep" sample for the night, or null. */
  sleepEnd: string | null
}

const EMPTY_SNAPSHOT: HealthSnapshot = {
  steps: null,
  sleepMinutes: null,
  sleepStart: null,
  sleepEnd: null,
}

export async function getHealthAvailability(): Promise<HealthAvailability> {
  if (!isNative()) return 'web'
  try {
    const res = await Health.isAvailable()
    if (res.available) return 'available'
    // On Android the plugin surfaces NotInstalled / NotSupported via the `reason` field.
    if (typeof res.reason === 'string') {
      const reason = res.reason.toLowerCase()
      if (reason.includes('install')) return 'not-installed'
      if (reason.includes('support')) return 'not-supported'
    }
    return 'not-supported'
  } catch {
    return 'error'
  }
}

export async function requestHealthAuthorization(): Promise<boolean> {
  if (!isNative()) return false
  try {
    const status = await Health.requestAuthorization({ read: READ_TYPES })
    return hasAllReadGrants(status.readAuthorized)
  } catch {
    return false
  }
}

export async function checkHealthAuthorization(): Promise<boolean> {
  if (!isNative()) return false
  try {
    const status = await Health.checkAuthorization({ read: READ_TYPES })
    return hasAllReadGrants(status.readAuthorized)
  } catch {
    return false
  }
}

export async function openHealthSettings(): Promise<void> {
  if (!isAndroid()) return
  try {
    // The plugin exposes openHealthConnectSettings() on Android.
    const plugin = Health as unknown as { openHealthConnectSettings?: () => Promise<void> }
    if (typeof plugin.openHealthConnectSettings === 'function') {
      await plugin.openHealthConnectSettings()
    }
  } catch {
    // best-effort
  }
}

/**
 * Snapshot for a given local date (YYYY-MM-DD).
 * Steps: total for the day (local-time 00:00 → next 00:00).
 * Sleep: any sample whose start falls between the previous day 18:00 and target day 12:00.
 */
export async function getHealthSnapshot(date: string): Promise<HealthSnapshot> {
  if (!isNative()) return EMPTY_SNAPSHOT

  const dayStart = startOfDay(date)
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const [steps, sleep] = await Promise.all([
    fetchDailySteps(dayStart, dayEnd),
    fetchNightSleep(dayStart),
  ])

  return {
    steps,
    sleepMinutes: sleep.minutes,
    sleepStart: sleep.start,
    sleepEnd: sleep.end,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function hasAllReadGrants(granted: HealthDataType[]): boolean {
  return READ_TYPES.every((t) => granted.includes(t))
}

function startOfDay(date: string): Date {
  const [y, m, d] = date.split('-').map((n) => Number.parseInt(n, 10))
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)
}

async function fetchDailySteps(start: Date, end: Date): Promise<number | null> {
  try {
    const res = await Health.queryAggregated({
      dataType: 'steps',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: 'day',
      aggregation: 'sum',
    })
    if (!res.samples || res.samples.length === 0) return 0
    return Math.round(res.samples.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0))
  } catch {
    return null
  }
}

interface SleepSummary {
  minutes: number | null
  start: string | null
  end: string | null
}

async function fetchNightSleep(dayStart: Date): Promise<SleepSummary> {
  // Capture the night that ended on `dayStart`: previous 18:00 → +12:00.
  const windowStart = new Date(dayStart.getTime() - 6 * 60 * 60 * 1000)
  const windowEnd = new Date(dayStart.getTime() + 12 * 60 * 60 * 1000)
  try {
    const res = await Health.readSamples({
      dataType: 'sleep',
      startDate: windowStart.toISOString(),
      endDate: windowEnd.toISOString(),
      limit: 500,
      ascending: true,
    })
    return summariseSleep(res.samples ?? [])
  } catch {
    return { minutes: null, start: null, end: null }
  }
}

function summariseSleep(samples: HealthSample[]): SleepSummary {
  // Health Connect emits both whole-session samples and per-stage samples (rem/light/deep).
  // To avoid double-counting we only sum stage samples when present; otherwise we fall back
  // to the session samples (anything that is not explicitly `inBed`/`awake`).
  const stageSamples = samples.filter((s) => {
    const state = s.sleepState
    return state === 'rem' || state === 'deep' || state === 'light' || state === 'asleep'
  })
  const sessionSamples = samples.filter((s) => !s.sleepState)
  const chosen = stageSamples.length > 0 ? stageSamples : sessionSamples

  if (chosen.length === 0) return { minutes: null, start: null, end: null }

  let minutes = 0
  let earliest = Number.POSITIVE_INFINITY
  let latest = 0
  for (const s of chosen) {
    const startMs = Date.parse(s.startDate)
    const endMs = Date.parse(s.endDate)
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue
    minutes += Math.round((endMs - startMs) / 60000)
    if (startMs < earliest) earliest = startMs
    if (endMs > latest) latest = endMs
  }
  if (minutes <= 0) return { minutes: null, start: null, end: null }
  return {
    minutes,
    start: Number.isFinite(earliest) ? new Date(earliest).toISOString() : null,
    end: latest > 0 ? new Date(latest).toISOString() : null,
  }
}
