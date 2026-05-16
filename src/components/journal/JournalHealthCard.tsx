import { useCallback, useEffect, useRef, useState } from 'react'
import { FootprintsIcon, MoonIcon, RefreshIcon } from '../../icons'
import {
  checkHealthAuthorization,
  getHealthAvailability,
  getHealthSnapshot,
  openHealthSettings,
  requestHealthAuthorization,
  type HealthAvailability,
  type HealthSnapshot,
} from '../../platform/health'
import { isAndroid } from '../../platform'
import { t } from '../../i18n'

interface JournalHealthCardProps {
  /** YYYY-MM-DD — the journal date being viewed/edited. */
  date: string
  /**
   * Initial snapshot pulled from the persisted journal row. Shown immediately;
   * a fresh Health Connect read replaces it when permissions are granted.
   */
  initial?: HealthSnapshot
  /** Called whenever a new snapshot is fetched from the device. */
  onSnapshot?: (snapshot: HealthSnapshot) => void
}

type Phase = 'loading' | 'web' | 'not-installed' | 'not-supported' | 'needs-permission' | 'ready' | 'error'

export function JournalHealthCard({ date, initial, onSnapshot }: JournalHealthCardProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [snapshot, setSnapshot] = useState<HealthSnapshot>(initial ?? emptySnapshot())
  const [refreshing, setRefreshing] = useState(false)
  const onSnapshotRef = useRef(onSnapshot)
  useEffect(() => { onSnapshotRef.current = onSnapshot }, [onSnapshot])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const next = await getHealthSnapshot(date)
      setSnapshot(next)
      onSnapshotRef.current?.(next)
    } finally {
      setRefreshing(false)
    }
  }, [date])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const availability = await getHealthAvailability()
      if (cancelled) return
      const nextPhase = phaseFromAvailability(availability)
      if (nextPhase !== 'ready') {
        setPhase(nextPhase)
        return
      }
      const granted = await checkHealthAuthorization()
      if (cancelled) return
      if (!granted) {
        setPhase('needs-permission')
        return
      }
      setPhase('ready')
      await refresh()
    })()
    return () => { cancelled = true }
  }, [refresh])

  const handleConnect = async () => {
    setPhase('loading')
    const granted = await requestHealthAuthorization()
    if (!granted) {
      setPhase('needs-permission')
      return
    }
    setPhase('ready')
    await refresh()
  }

  if (phase === 'loading') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('common.loading')}</div>
      </div>
    )
  }

  if (phase === 'web') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('journal.healthWebUnsupported')}</div>
      </div>
    )
  }

  if (phase === 'not-installed') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('journal.healthNotInstalled')}</div>
        {isAndroid() && (
          <a
            className="journal-health-card__action"
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('journal.healthOpenStore')}
          </a>
        )}
      </div>
    )
  }

  if (phase === 'not-supported') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('journal.healthNotSupported')}</div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('journal.healthError')}</div>
        <button type="button" className="journal-health-card__action" onClick={handleConnect}>
          {t('common.retry')}
        </button>
      </div>
    )
  }

  if (phase === 'needs-permission') {
    return (
      <div className="journal-health-card journal-health-card--muted">
        <div className="journal-health-card__msg">{t('journal.healthPermissionPrompt')}</div>
        <button type="button" className="journal-health-card__action" onClick={handleConnect}>
          {t('journal.healthConnectCta')}
        </button>
        <button
          type="button"
          className="journal-health-card__link"
          onClick={() => { void openHealthSettings() }}
        >
          {t('journal.healthOpenSettings')}
        </button>
      </div>
    )
  }

  return (
    <div className="journal-health-card">
      <div className="journal-health-card__metrics">
        <HealthMetric
          icon={<FootprintsIcon width={18} height={18} />}
          label={t('journal.healthSteps')}
          value={snapshot.steps != null ? formatSteps(snapshot.steps) : '—'}
          unit={snapshot.steps != null ? t('journal.healthStepsUnit') : ''}
          tone="steps"
        />
        <HealthMetric
          icon={<MoonIcon width={18} height={18} />}
          label={t('journal.healthSleep')}
          value={snapshot.sleepMinutes != null ? formatSleep(snapshot.sleepMinutes) : '—'}
          unit=""
          sub={snapshot.sleepStart && snapshot.sleepEnd ? formatSleepWindow(snapshot.sleepStart, snapshot.sleepEnd) : null}
          tone="sleep"
        />
      </div>
      <button
        type="button"
        className="journal-health-card__refresh"
        onClick={() => { void refresh() }}
        disabled={refreshing}
        aria-label={t('journal.healthRefresh')}
      >
        <RefreshIcon width={14} height={14} />
        <span>{refreshing ? t('common.loading') : t('journal.healthRefresh')}</span>
      </button>
    </div>
  )
}

function HealthMetric({
  icon, label, value, unit, sub, tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  sub?: string | null
  tone: 'steps' | 'sleep'
}) {
  return (
    <div className={`journal-health-metric journal-health-metric--${tone}`}>
      <div className="journal-health-metric__head">
        <span className="journal-health-metric__icon" aria-hidden="true">{icon}</span>
        <span className="journal-health-metric__label">{label}</span>
      </div>
      <div className="journal-health-metric__value">
        <span className="journal-health-metric__num">{value}</span>
        {unit && <span className="journal-health-metric__unit">{unit}</span>}
      </div>
      {sub && <div className="journal-health-metric__sub">{sub}</div>}
    </div>
  )
}

function phaseFromAvailability(a: HealthAvailability): Phase {
  switch (a) {
    case 'available':     return 'ready'
    case 'not-installed': return 'not-installed'
    case 'not-supported': return 'not-supported'
    case 'web':           return 'web'
    case 'error':         return 'error'
  }
}

function emptySnapshot(): HealthSnapshot {
  return { steps: null, sleepMinutes: null, sleepStart: null, sleepEnd: null }
}

function formatSteps(n: number): string {
  return n.toLocaleString('ja-JP')
}

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return t('journal.healthSleepHm', { h: String(h), m: String(m).padStart(2, '0') })
}

function formatSleepWindow(startIso: string, endIso: string): string | null {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${fmt(start)} → ${fmt(end)}`
}
