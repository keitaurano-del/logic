import { useState } from 'react'
import { Header } from '../components/platform/Header'
import {
  loadReminderPref, scheduleDailyReminder,
  cancelDailyReminder, requestNotificationPermission, isNative,
} from '../notifications'
import { Switch } from '../components/Switch'
import { t } from '../i18n'

interface Props {
  onBack: () => void
}

// ── 追加通知設定の保存 ────────────────────────────────────────────
const EXTRA_NOTIF_KEY = 'logic-notif-extra'

interface ExtraNotifPref {
  newLesson: boolean       // 新レッスン公開
  rankingUpdate: boolean   // ランキング更新（週次）
  deviationChange: boolean // 偏差値変動
  streakAlert: boolean     // 連続学習アラート（途切れそう）
}

function loadExtraPref(): ExtraNotifPref {
  try {
    const raw = localStorage.getItem(EXTRA_NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    newLesson: true,
    rankingUpdate: true,
    deviationChange: false,
    streakAlert: true,
  }
}

function saveExtraPref(pref: ExtraNotifPref) {
  try { localStorage.setItem(EXTRA_NOTIF_KEY, JSON.stringify(pref)) } catch { /* ignore */ }
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

function NotifRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12, borderBottom: `1px solid ${'var(--border)'}` }}>
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
  const [extra, setExtra] = useState<ExtraNotifPref>(loadExtraPref)

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

  function updateExtra(key: keyof ExtraNotifPref, val: boolean) {
    const next = { ...extra, [key]: val }
    setExtra(next)
    saveExtraPref(next)
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
            />
            {enabled && (
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${'var(--border)'}` }}>
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
              value={extra.streakAlert}
              onChange={(v) => updateExtra('streakAlert', v)}
            />
            <NotifRow
              label={t('notifSettings.rankingUpdate')}
              sub={t('notifSettings.rankingUpdateSub')}
              value={extra.rankingUpdate}
              onChange={(v) => updateExtra('rankingUpdate', v)}
            />
            <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{t('notifSettings.deviationChange')}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{t('notifSettings.deviationChangeSub')}</div>
              </div>
              <Toggle value={extra.deviationChange} onChange={(v) => updateExtra('deviationChange', v)} />
            </div>
          </div>
        </div>

        {/* ── コンテンツ ── */}
        <div>
          <SectionLabel>{t('notifSettings.contentSection')}</SectionLabel>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
            <NotifRow
              label={t('notifSettings.newLesson')}
              sub={t('notifSettings.newLessonSub')}
              value={extra.newLesson}
              onChange={(v) => updateExtra('newLesson', v)}
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
