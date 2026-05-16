import { useState } from 'react'
import { Header } from '../components/platform/Header'
import {
  loadReminderPref, scheduleDailyReminder, cancelDailyReminder,
  loadStreakAlertPref, scheduleStreakRiskReminder, cancelStreakRiskReminder,
  requestNotificationPermission, isNative,
} from '../notifications'
import { Switch } from '../components/Switch'
import { t } from '../i18n'

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
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 4px 8px' }}>
      {children}
    </div>
  )
}

function NotifRow({ label, sub, value, onChange, last }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12, borderBottom: last ? 'none' : `1px solid ${'var(--border)'}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} label={label} />
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

export function NotificationSettingsScreen({ onBack }: Props) {
  const pref = loadReminderPref()
  const [enabled, setEnabled] = useState(pref.enabled)
  const [hour, setHour] = useState(pref.hour)
  const [minute, setMinute] = useState(pref.minute)
  const [streakAlert, setStreakAlert] = useState(() => loadStreakAlertPref().streakAlert)

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
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                    {t('notifSettings.browserOnly')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('notifSettings.daily')}</span>
                  <select
                    aria-label={t('notifSettings.hourAria')}
                    value={hour}
                    onChange={(e) => handleTimeChange(Number(e.target.value), minute)}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>:</span>
                  <select
                    aria-label={t('notifSettings.minuteAria')}
                    value={minute}
                    onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${'var(--border)'}`, background: 'var(--bg-primary)',
                      fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('notifSettings.notifyAt')}</span>
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

        {/* note */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, padding: '0 4px' }}>
          {t('notifSettings.note')}
        </div>
      </div>
    </div>
  )
}
