import { useEffect, useState, useCallback } from 'react'
import { Header } from '../components/platform/Header'
import {
  loadReminderPref, scheduleDailyReminder, cancelDailyReminder,
  loadStreakAlertPref, scheduleStreakRiskReminder, cancelStreakRiskReminder,
  loadJournalReminderPref, scheduleJournalReminder, cancelJournalReminder,
  requestNotificationPermission, isNative,
  getPendingNotifications, rescheduleAllReminders,
  type PendingNotificationInfo,
} from '../notifications'
import { Switch } from '../components/Switch'
import { t } from '../i18n'
import { isAdmin } from '../admin'

interface Props {
  onBack: () => void
}

// ── UI parts ──────────────────────────────────────────────────────
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  // Platform-aware Switch (iOS / M3) — see src/components/Switch.tsx
  return <Switch checked={value} onChange={onChange} aria-label={label ?? t('notifSettings.toggleAria')} />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.7333rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 4px 8px' }}>
      {children}
    </div>
  )
}

function NotifRow({ label, sub, value, onChange, last }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12, borderBottom: last ? 'none' : `1px solid ${'var(--border)'}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} label={label} />
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

function showDebug(): boolean {
  if (isAdmin()) return true
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1'
  } catch {
    return false
  }
}

function formatScheduledAt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function NotifIdLabel({ id }: { id: number }) {
  if (id === 1001) return <>1001 / {t('notifSettings.debug.idDaily')}</>
  if (id === 1002) return <>1002 / {t('notifSettings.debug.idStreakRisk')}</>
  if (id === 1003) return <>1003 / {t('notifSettings.debug.idJournal')}</>
  return <>{id}</>
}

export function NotificationSettingsScreen({ onBack }: Props) {
  const pref = loadReminderPref()
  const journalPref = loadJournalReminderPref()
  const [enabled, setEnabled] = useState(pref.enabled)
  const [hour, setHour] = useState(pref.hour)
  const [minute, setMinute] = useState(pref.minute)
  const [streakAlert, setStreakAlert] = useState(() => loadStreakAlertPref().streakAlert)
  const [journalEnabled, setJournalEnabled] = useState(journalPref.enabled)
  const [journalHour, setJournalHour] = useState(journalPref.hour)
  const [journalMinute, setJournalMinute] = useState(journalPref.minute)

  // Debug: pending notifications
  const debug = showDebug()
  const [pending, setPending] = useState<PendingNotificationInfo[]>([])
  const [pendingFetchedAt, setPendingFetchedAt] = useState<Date | null>(null)
  const [pendingLoading, setPendingLoading] = useState(false)

  const refreshPending = useCallback(async () => {
    setPendingLoading(true)
    try {
      const list = await getPendingNotifications()
      setPending(list)
      setPendingFetchedAt(new Date())
    } finally {
      setPendingLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!debug) return
    // Defer to next microtask so setState inside refreshPending doesn't fire
    // synchronously within the effect body (react-hooks/set-state-in-effect).
    const id = setTimeout(() => { void refreshPending() }, 0)
    return () => clearTimeout(id)
  }, [debug, refreshPending])

  async function handleForceReschedule() {
    await rescheduleAllReminders()
    await refreshPending()
  }

  async function handleToggle(v: boolean) {
    if (v) {
      const granted = await requestNotificationPermission()
      if (!granted && isNative()) return
      await scheduleDailyReminder(hour, minute)
    } else {
      await cancelDailyReminder()
    }
    setEnabled(v)
  }

  async function handleTimeChange(h: number, m: number) {
    setHour(h)
    setMinute(m)
    if (enabled) await scheduleDailyReminder(h, m)
  }

  async function handleStreakAlertToggle(v: boolean) {
    if (v) {
      const granted = await requestNotificationPermission()
      if (!granted && isNative()) return
      await scheduleStreakRiskReminder()
    } else {
      await cancelStreakRiskReminder()
    }
    setStreakAlert(v)
  }

  async function handleJournalToggle(v: boolean) {
    if (v) {
      const granted = await requestNotificationPermission()
      if (!granted && isNative()) return
      await scheduleJournalReminder(journalHour, journalMinute)
    } else {
      await cancelJournalReminder()
    }
    setJournalEnabled(v)
  }

  async function handleJournalTimeChange(h: number, m: number) {
    setJournalHour(h)
    setJournalMinute(m)
    if (journalEnabled) await scheduleJournalReminder(h, m)
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      <Header title={t('notifSettings.title')} onBack={onBack} />

      <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── 毎日リマインダー ── */}
        <div>
          <SectionLabel>{t('notifSettings.dailyReminderHeading')}</SectionLabel>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
            <NotifRow
              label={t('notifSettings.dailyReminder')}
              sub={t('notifSettings.dailyReminderSub')}
              value={enabled}
              onChange={handleToggle}
              last={!enabled}
            />
            {enabled && (
              <div style={{ padding: '16px 20px' }}>
                {!isNative() && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                    {t('notifSettings.browserOnly')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('notifSettings.daily')}</span>
                  <select
                    aria-label={t('notifSettings.hourAria')}
                    value={hour}
                    onChange={(e) => handleTimeChange(Number(e.target.value), minute)}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: '1.3333rem', fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '1.4667rem', fontWeight: 700 }}>:</span>
                  <select
                    aria-label={t('notifSettings.minuteAria')}
                    value={minute}
                    onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: '1.3333rem', fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('notifSettings.notifyAt')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 学習モチベーション ── */}
        <div>
          <SectionLabel>{t('notifSettings.motivation')}</SectionLabel>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
            <NotifRow
              label={t('notifSettings.streakAlert')}
              sub={t('notifSettings.streakAlertSub')}
              value={streakAlert}
              onChange={handleStreakAlertToggle}
              last
            />
          </div>
        </div>

        {/* ── ジャーナル ── */}
        <div>
          <SectionLabel>{t('notifSettings.journalHeading')}</SectionLabel>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
            <NotifRow
              label={t('notifSettings.journalReminder')}
              sub={t('notifSettings.journalReminderSub')}
              value={journalEnabled}
              onChange={handleJournalToggle}
              last={!journalEnabled}
            />
            {journalEnabled && (
              <div style={{ padding: '16px 20px' }}>
                {!isNative() && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                    {t('notifSettings.browserOnly')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('notifSettings.daily')}</span>
                  <select
                    aria-label={t('notifSettings.hourAria')}
                    value={journalHour}
                    onChange={(e) => handleJournalTimeChange(Number(e.target.value), journalMinute)}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: '1.3333rem', fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '1.4667rem', fontWeight: 700 }}>:</span>
                  <select
                    aria-label={t('notifSettings.minuteAria')}
                    value={journalMinute}
                    onChange={(e) => handleJournalTimeChange(journalHour, Number(e.target.value))}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: '1.3333rem', fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('notifSettings.notifyAt')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {debug && (
          <div>
            <SectionLabel>{t('notifSettings.debug.heading')}</SectionLabel>
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${'var(--border)'}` }}>
                <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('notifSettings.debug.intro')}
                  {pendingFetchedAt && (
                    <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                      {t('notifSettings.debug.fetchedAt')}: {formatScheduledAt(pendingFetchedAt.toISOString())}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { void refreshPending() }}
                  disabled={pendingLoading}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: `1.5px solid ${'var(--border)'}`,
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t('notifSettings.debug.refresh')}
                </button>
              </div>

              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${'var(--border)'}` }}>
                <button
                  type="button"
                  onClick={() => { void handleForceReschedule() }}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: `1.5px solid ${'var(--border)'}`,
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '0.8667rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t('notifSettings.debug.forceReschedule')}
                </button>
                <div style={{ marginTop: 6, fontSize: '0.7333rem', color: 'var(--text-muted)' }}>
                  {t('notifSettings.debug.forceRescheduleHint')}
                </div>
              </div>

              <div style={{ padding: '14px 20px' }}>
                {!isNative() ? (
                  <div style={{ fontSize: '0.8667rem', color: 'var(--text-muted)' }}>
                    {t('notifSettings.debug.webNoop')}
                  </div>
                ) : pending.length === 0 ? (
                  <div style={{ fontSize: '0.8667rem', color: 'var(--text-muted)' }}>
                    {pendingLoading ? t('notifSettings.debug.loading') : t('notifSettings.debug.empty')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pending.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: 10, borderRadius: 10,
                          background: 'var(--bg-primary)',
                          border: `1px solid ${'var(--border)'}`,
                          fontSize: '0.8rem', lineHeight: 1.55,
                          color: 'var(--text-primary)',
                          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>
                          <NotifIdLabel id={n.id} />
                        </div>
                        <div>{t('notifSettings.debug.fieldTitle')}: {n.title ?? '—'}</div>
                        <div>{t('notifSettings.debug.fieldNextAt')}: {formatScheduledAt(n.scheduledAt)}</div>
                        <div>{t('notifSettings.debug.fieldEvery')}: {n.every ?? '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
