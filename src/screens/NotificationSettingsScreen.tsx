import { useState } from 'react'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import {
  loadReminderPref, scheduleDailyReminder,
  cancelDailyReminder, requestNotificationPermission, isNative,
} from '../notifications'

interface Props {
  onBack: () => void
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

const pad = (n: number) => String(n).padStart(2, '0')

export function NotificationSettingsScreen({ onBack }: Props) {
  const pref = loadReminderPref()
  const [enabled, setEnabled] = useState(pref.enabled)
  const [hour, setHour] = useState(pref.hour)
  const [minute, setMinute] = useState(pref.minute)

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

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="戻る" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">通知設定</div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* リマインダーON/OFF */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>毎日リマインダー</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                設定した時刻に学習を促す通知が届きます
              </div>
            </div>
            <Toggle value={enabled} onChange={handleToggle} />
          </div>
        </div>

        {/* 時刻設定 */}
        {enabled && (
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: '.04em' }}>
              通知時刻
            </div>
            {!isNative() && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                ブラウザ版では通知はアプリを開いている間のみ機能します
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>毎日</span>
              <select
                value={hour}
                onChange={(e) => handleTimeChange(Number(e.target.value), minute)}
                style={{
                  padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                  fontSize: 20, fontWeight: 700, color: 'var(--text)',
                  cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-mono)',
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{pad(i)}</option>
                ))}
              </select>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>:</span>
              <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
                style={{
                  padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                  fontSize: 20, fontWeight: 700, color: 'var(--text)',
                  cursor: 'pointer', outline: 'none', fontFamily: 'var(--font-mono)',
                }}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
              <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>に通知</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
