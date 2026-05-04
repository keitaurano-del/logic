import { useState, useLayoutEffect } from 'react'
import { ArrowLeftIcon, ChevronRightIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { getLocale, t } from '../i18n'
import {
  loadReminderPref, saveReminderPref, scheduleDailyReminder,
  cancelDailyReminder, requestNotificationPermission, isNative,
} from '../notifications'
import { getSubscriptionState, isPremium, daysLeftInTrial } from '../subscription'

interface SettingsScreenProps {
  onBack: () => void
  onOpenLanguage: () => void
  onOpenLogin: () => void
  currentUser: { email: string } | null
  onLogout: () => void
  onOpenPricing?: () => void
  initialSection?: 'account' | 'notifications' | 'plan'
}

function SettingsRow({
  label, value, onPress, showChevron = true, destructive = false,
}: {
  label: string; value?: string; onPress?: () => void; showChevron?: boolean; destructive?: boolean
}) {
  return (
    <button onClick={onPress} style={{
      display: 'flex', alignItems: 'center', width: '100%',
      padding: '14px 16px', background: 'none', border: 'none',
      cursor: onPress ? 'pointer' : 'default', textAlign: 'left', gap: 12,
    }}>
      <span style={{ flex: 1, fontSize: 18, color: destructive ? 'var(--danger)' : 'var(--text)' }}>
        {label}
      </span>
      {value && <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>{value}</span>}
      {showChevron && onPress && (
        <ChevronRightIcon width={16} height={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
      )}
    </button>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      padding: '16px 16px 6px',
    }}>
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', marginLeft: 16 }} />
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 48, height: 28, borderRadius: 99,
      background: value ? 'var(--brand)' : 'var(--border)',
      position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 200ms',
    }}>
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 23 : 3, width: 22, height: 22,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 200ms',
      }} />
    </div>
  )
}

export function SettingsScreen({ onBack, onOpenLanguage, onOpenLogin, currentUser, onLogout, onOpenPricing, initialSection }: SettingsScreenProps) {
  const [highlightSection, setHighlightSection] = useState<string | undefined>(initialSection)

  // initialSection が変わったらハイライトを即時同期し、1.2秒後に解除
  // useLayoutEffect でペイント前に同期更新する（外部 prop との同期）
  useLayoutEffect(() => {
    if (!initialSection) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightSection(initialSection)
    const t = setTimeout(() => setHighlightSection(undefined), 1200)
    return () => clearTimeout(t)
  }, [initialSection])
  const locale = getLocale()
  const pref = loadReminderPref()
  const [reminderEnabled, setReminderEnabled] = useState(pref.enabled)
  const [reminderHour, setReminderHour] = useState(pref.hour)
  const [reminderMinute, setReminderMinute] = useState(pref.minute)

  async function handleToggleReminder(enabled: boolean) {
    if (enabled) {
      const granted = await requestNotificationPermission()
      if (!granted && isNative()) return // 権限拒否
      await scheduleDailyReminder(reminderHour, reminderMinute)
    } else {
      await cancelDailyReminder()
    }
    setReminderEnabled(enabled)
  }

  async function handleTimeChange(h: number, m: number) {
    setReminderHour(h)
    setReminderMinute(m)
    if (reminderEnabled) {
      await scheduleDailyReminder(h, m)
    } else {
      saveReminderPref({ enabled: false, hour: h, minute: m })
    }
  }

  function handleClearCache() {
    if (window.confirm(t('settings.clearCacheConfirm'))) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const timeLabel = t('settings.reminderTime')
    .replace('{h}', pad(reminderHour))
    .replace('{m}', pad(reminderMinute))

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('settings.title')}</div>
      </div>

      {/* ── アカウント ── */}
      <div style={{ transition: 'background 0.3s', borderRadius: 12, background: highlightSection === 'account' ? 'rgba(59,91,219,0.08)' : 'transparent' }}>
        <SectionHeader label={t('settings.section.account')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {currentUser ? (
            <>
              <SettingsRow
                label={currentUser.email}
                showChevron={false}
              />
              <Divider />
              <SettingsRow
                label={t('settings.logout')}
                onPress={onLogout}
                destructive
                showChevron={false}
              />
            </>
          ) : (
            <>
              <SettingsRow
                label={t('settings.loginGoogle')}
                onPress={onOpenLogin}
              />
              <Divider />
              <SettingsRow
                label={t('settings.loginEmail')}
                onPress={onOpenLogin}
              />
            </>
          )}
        </div>
      </div>

      {/* ── 通知 ── */}
      <div style={{ transition: 'background 0.3s', borderRadius: 12, background: highlightSection === 'notifications' ? 'rgba(59,91,219,0.08)' : 'transparent' }}>
        <SectionHeader label={t('settings.section.notifications')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Toggle row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 16px', gap: 12,
          }}>
            <span style={{ flex: 1, fontSize: 18, color: 'var(--text)' }}>
              {t('settings.reminder')}
            </span>
            <Toggle value={reminderEnabled} onChange={handleToggleReminder} />
          </div>
          {/* Time picker (shown when enabled) */}
          {reminderEnabled && (
            <>
              <Divider />
              <div style={{ padding: '12px 16px' }}>
                {!isNative() && (
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {t('settings.notificationsWebOnly')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>
                    毎日
                  </span>
                  <select
                    value={reminderHour}
                    onChange={(e) => handleTimeChange(Number(e.target.value), reminderMinute)}
                    style={{
                      padding: '8px 10px', borderRadius: 10,
                      border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                      fontSize: 18, fontWeight: 700, color: 'var(--text)',
                      cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>:</span>
                  <select
                    value={reminderMinute}
                    onChange={(e) => handleTimeChange(reminderHour, Number(e.target.value))}
                    style={{
                      padding: '8px 10px', borderRadius: 10,
                      border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                      fontSize: 18, fontWeight: 700, color: 'var(--text)',
                      cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {timeLabel}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── プラン ── */}
      <div style={{ transition: 'background 0.3s', borderRadius: 12, background: highlightSection === 'plan' ? 'rgba(59,91,219,0.08)' : 'transparent' }}>
        <SectionHeader label="プラン" />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {(() => {
            const state = getSubscriptionState()
            const premium = isPremium()
            const planLabel =
              state.plan === 'trial' ? `7日間トライアル（残り${daysLeftInTrial()}日）` :
              state.plan === 'monthly' ? '月額プレミアム' :
              state.plan === 'yearly' ? '年額プレミアム' :
              '無料プラン'
            return (
              <>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ flex: 1, fontSize: 18, color: 'var(--text)' }}>現在のプラン</span>
                  <span style={{
                    fontSize: 16, fontWeight: 700, padding: '4px 10px',
                    borderRadius: 20,
                    background: premium ? 'var(--brand-soft)' : 'var(--bg-secondary)',
                    color: premium ? 'var(--brand)' : 'var(--text-muted)',
                  }}>
                    {planLabel}
                  </span>
                </div>
                {!premium && onOpenPricing && (
                  <>
                    <Divider />
                    <SettingsRow
                      label="プレミアムにアップグレード"
                      onPress={onOpenPricing}
                    />
                  </>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* ── アプリ ── */}
      <div>
        <SectionHeader label={t('settings.section.app')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.support.appLanguage')}
            value={locale === 'ja' ? '日本語' : 'English'}
            onPress={onOpenLanguage}
          />
        </div>
      </div>

      {/* ── データ ── */}
      <div>
        <SectionHeader label={t('settings.section.data')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.general.clearCache')}
            onPress={handleClearCache}
            destructive
            showChevron={false}
          />
        </div>
      </div>

      {/* ── サポート ── */}
      <div>
        <SectionHeader label={t('settings.section.support')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.support.terms')}
            onPress={() => window.open('/terms.html', '_blank')}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: 'var(--s-2)', paddingBottom: 'var(--s-5)' }}>
        <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>Logic v3 · Beta</span>
      </div>
    </div>
  )
}
