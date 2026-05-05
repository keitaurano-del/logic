import { useState } from 'react'
import { Header } from '../components/platform/Header'
import {
  loadReminderPref, scheduleDailyReminder,
  cancelDailyReminder, requestNotificationPermission, isNative,
} from '../notifications'
import { v3 } from '../styles/tokensV3'
import { Switch } from '../components/Switch'

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
  return <Switch checked={value} onChange={onChange} aria-label={label ?? 'トグル'} />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: v3.color.text3, padding: '4px 4px 8px' }}>
      {children}
    </div>
  )
}

function NotifRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12, borderBottom: `1px solid ${v3.color.line}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: v3.color.text }}>{label}</div>
        <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
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
    <div style={{ background: v3.color.bg, minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <Header title="通知設定" onBack={onBack} />

      <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── 毎日リマインダー ── */}
        <div>
          <SectionLabel>毎日のリマインダー</SectionLabel>
          <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden', boxShadow: v3.shadow.card }}>
            <NotifRow
              label="毎日リマインダー"
              sub="設定した時刻に学習を促す通知が届きます"
              value={enabled}
              onChange={handleToggle}
            />
            {enabled && (
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${v3.color.line}` }}>
                {!isNative() && (
                  <div style={{ fontSize: 12, color: v3.color.text3, marginBottom: 12, padding: '8px 12px', background: v3.color.bg, borderRadius: 8 }}>
                    ブラウザ版では通知はアプリを開いている間のみ機能します
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: v3.color.text2 }}>毎日</span>
                  <select
                    aria-label="通知時刻 - 時"
                    value={hour}
                    onChange={(e) => handleTimeChange(Number(e.target.value), minute)}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${v3.color.line}`, background: v3.color.bg,
                      fontSize: 20, fontWeight: 700, color: v3.color.text,
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad(i)}</option>
                    ))}
                  </select>
                  <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 700 }}>:</span>
                  <select
                    aria-label="通知時刻 - 分"
                    value={minute}
                    onChange={(e) => handleTimeChange(hour, Number(e.target.value))}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: `1.5px solid ${v3.color.line}`, background: v3.color.bg,
                      fontSize: 20, fontWeight: 700, color: v3.color.text,
                      cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {[0, 15, 30, 45].map((m) => (
                      <option key={m} value={m}>{pad(m)}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: 14, color: v3.color.text2 }}>に通知</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 学習モチベーション ── */}
        <div>
          <SectionLabel>学習モチベーション</SectionLabel>
          <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden', boxShadow: v3.shadow.card }}>
            <NotifRow
              label="連続学習アラート"
              sub="ストリークが途切れそうなときに通知"
              value={extra.streakAlert}
              onChange={(v) => updateExtra('streakAlert', v)}
            />
            <NotifRow
              label="ランキング更新"
              sub="週次ランキングが確定したときに通知"
              value={extra.rankingUpdate}
              onChange={(v) => updateExtra('rankingUpdate', v)}
            />
            <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: v3.color.text }}>偏差値変動</div>
                <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2, lineHeight: 1.5 }}>偏差値が大きく変動したときに通知</div>
              </div>
              <Toggle value={extra.deviationChange} onChange={(v) => updateExtra('deviationChange', v)} />
            </div>
          </div>
        </div>

        {/* ── コンテンツ ── */}
        <div>
          <SectionLabel>コンテンツ</SectionLabel>
          <div style={{ background: v3.color.card, borderRadius: 16, overflow: 'hidden', boxShadow: v3.shadow.card }}>
            <NotifRow
              label="新レッスン公開"
              sub="新しいレッスンが追加されたときに通知"
              value={extra.newLesson}
              onChange={(v) => updateExtra('newLesson', v)}
            />
            
          </div>
        </div>

        {/* note */}
        <div style={{ fontSize: 12, color: v3.color.text3, lineHeight: 1.7, padding: '0 4px' }}>
          ※ プッシュ通知はネイティブアプリ（iOS/Android）でのみ完全に動作します。ブラウザ版は一部機能が制限されます。
        </div>
      </div>
    </div>
  )
}
