/**
 * ProfileScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.6
 */
import { getCompletedCount, getStreak, getXp } from '../stats'
import { getCurrentLevel, getXpProgress } from './homeHelpers'
import { logout } from '../supabase'
import { getSubscriptionState, isPremiumPlan, isStandardPlan, daysLeftInTrial } from '../subscription'
import { v3 } from '../styles/tokensV3'
import { getStudyDates as _getStudyDatesArr } from '../stats'

function getPlanLabel(): string {
  const state = getSubscriptionState()
  if (isPremiumPlan()) {
    if (state.plan === 'trial') {
      const days = daysLeftInTrial()
      return days > 0 ? `トライアル（残り${days}日）` : 'トライアル切れ'
    }
    return 'プレミアム'
  }
  if (isStandardPlan()) {
    return state.plan.includes('yearly') ? 'スタンダード（年）' : 'スタンダード'
  }
  return '無料プラン'
}

interface ProfileScreenV3Props {
  userName: string
  onOpenSettings: (section?: 'account' | 'notifications' | 'plan') => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
  onOpenPlacementTest?: () => void
}

export function ProfileScreenV3(props: ProfileScreenV3Props) {
  const { userName, onOpenSettings, onOpenFeedback, onOpenPricing, onOpenPlacementTest } = props
  const streak = getStreak()
  const completed = getCompletedCount()
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const { pct: levelPct, current: levelXp, needed } = getXpProgress(xp)

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #082121 0%, #1A3A39 70%, #234D4B 100%)', padding: 'calc(env(safe-area-inset-top, 44px) + 14px) 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: v3.color.accentGlow, filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${v3.color.accent}, #A5E8D5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: v3.color.bg, boxShadow: `0 0 24px ${v3.color.accentGlow}` }}>
            {(userName || 'G').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 2 }}>{userName || 'ゲスト'}</div>
            <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500 }}>{userName ? `ロジカルシンカー トレーニー` : `ログインすると進捗が保存されるよ`}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.12em', textTransform: 'uppercase' }}>レベル</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: '-.02em' }}>Lv.{lv.level}</span>
        </div>
        <div style={{ height: 12, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <div style={{ height: '100%', width: `${levelPct}%`, background: v3.color.accent, borderRadius: 99, boxShadow: `0 0 12px ${v3.color.accentGlow}` }}></div>
        </div>
        <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500, textAlign: 'right', position: 'relative', zIndex: 1 }}>次のLvまで {Math.max(0, needed - levelXp)} XP</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: -32, position: 'relative', zIndex: 2, padding: '0 20px' }}>
        <StatCard val={String(streak)} label="連続学習" />
        <StatCard val={String(completed)} label="完了レッスン" />
        <StatCard val={xp.toLocaleString()} label="総XP" />
      </div>

      <div style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>
        {/* 学習サマリー */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, boxShadow: v3.shadow.card }}>
          <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 600, marginBottom: 12 }}>今週の学習サマリー</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70, marginBottom: 8 }}>
            {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => {
              const studied = getStudiedThisWeek()[i]
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: studied ? '100%' : '20%', minHeight: 8, background: studied ? v3.color.accent : v3.color.cardSoft, borderRadius: 5 }}></div>
                  </div>
                  <span style={{ fontSize: 10, color: v3.color.text3, fontWeight: 500 }}>{d}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* SCRUM-165: プレイスメントテスト導線 */}
        {onOpenPlacementTest && (
          <div onClick={onOpenPlacementTest} style={{
            background: `linear-gradient(135deg, ${v3.color.accentSoft} 0%, rgba(112,216,189,.1) 100%)`,
            border: `1px solid ${v3.color.accent}40`,
            borderRadius: v3.radius.card, padding: '16px 18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="2.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>プレイスメントテスト</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2 }}>自分のレベルを確認して最適なレッスンを履わせる</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        )}

        {/* 設定 */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', boxShadow: v3.shadow.card }}>
          <SettingRow icon="user" name="アカウント" sub={userName || 'ゲスト'} onClick={() => onOpenSettings('account')} />
          <SettingRow icon="bell" name="通知設定" sub="毎日 8:00" onClick={() => onOpenSettings('notifications')} />
          <SettingRow icon="card" name="プラン" sub={getPlanLabel()} onClick={onOpenPricing} />
          <SettingRow icon="message" name="フィードバック" sub="ご意見をお聞かせください" onClick={onOpenFeedback} />
        </div>
        <div onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(252,165,165,.4)', borderRadius: 14, padding: 13, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#FCA5A5', cursor: 'pointer' }}>
          ログアウト
        </div>
      </div>
    </div>
  )
}



function getStudiedThisWeek(): boolean[] {
  const studyDates = new Set(_getStudyDatesArr())
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - todayDow)
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return studyDates.has(iso)
  })
}

function StatCard({ val, label }: { val: string; label: string }) {
  return (
    <div style={{ background: v3.color.card, borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: '0 4px 16px rgba(112,216,189,.06)' }}>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: v3.color.accent, letterSpacing: '-.03em', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: v3.color.text2, marginTop: 5 }}>{label}</div>
    </div>
  )
}

function SettingRow({ icon, name, sub, onClick }: { icon: string; name: string; sub: string; onClick?: () => void }) {
  const iconSvg = {
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    card: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  }[icon]

  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: `1px solid ${v3.color.line}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{iconSvg}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500 }}>{sub}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
    </div>
  )
}
