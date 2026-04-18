import { getCompletedCount, getStreak } from '../stats'
import { loadPlacementResult } from '../placementData'
import { getPoints, deviationToTopPercent } from './homeHelpers'
import { logout } from '../supabase'
import { getSubscriptionState, isPremiumPlan, isStandardPlan, daysLeftInTrial } from '../subscription'

// 実際のサブスクリプション状態から表示ラベルを生成
function getPlanLabel(): string {
  const state = getSubscriptionState()
  if (isPremiumPlan()) {
    if (state.plan === 'trial') {
      const days = daysLeftInTrial()
      return days > 0 ? `トライアル（残り${days}日）` : 'トライアル（期限切れ）'
    }
    return 'Premium — プレミアムプラン'
  }
  if (isStandardPlan()) {
    return state.plan.includes('yearly') ? 'Standard — 年額プラン' : 'Standard — ¥500/月'
  }
  return '無料プラン'
}

interface ProfileScreenProps {
  userName: string
  onOpenStreak: () => void
  onOpenSettings: () => void
  onOpenCompleted: () => void
  onOpenStudyTime: () => void
  onOpenRank: () => void
  onOpenRanking: () => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
}

export function ProfileScreen({ userName, onOpenSettings, onOpenFeedback, onOpenPricing }: ProfileScreenProps) {
  const streak = getStreak()
  const completed = getCompletedCount()
  const points = getPoints()
  const placement = loadPlacementResult()
  const deviation = placement?.deviation ?? null
  const topPct = deviation != null ? deviationToTopPercent(deviation) : null

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const settings = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>,
      name: 'アカウント',
      sub: userName || 'ゲスト',
      onClick: onOpenSettings,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      name: '通知設定',
      sub: '毎日 08:00',
      onClick: onOpenSettings,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10" stroke="white" strokeWidth="2"/></svg>,
      name: 'プラン',
      sub: getPlanLabel(),
      onClick: onOpenPricing,
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      name: 'フィードバック',
      sub: 'ご意見をお聞かせください',
      onClick: onOpenFeedback,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4FF' }}>

      {/* ナビバー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', background: 'rgba(240,244,255,.95)', borderBottom: '1px solid #E2E8FF' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#3B5BDB', letterSpacing: '-.04em' }}>プロフィール</div>
      </div>

      <div style={{ padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

        {/* プロフィールヒーロー */}
        <div style={{ background: '#3B5BDB', borderRadius: 28, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, bottom: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.3)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,.8)"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.02em' }}>{userName || 'ゲスト'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>Member since Apr 2026</div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            {[
              { value: String(completed), label: 'Lessons' },
              { value: String(streak), label: 'Streak' },
              { value: topPct != null ? `Top ${Math.round(topPct)}%` : `${points}pts`, label: 'Rank' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>{value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 設定リスト */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {settings.map((s) => (
            <div
              key={s.name}
              onClick={() => s.onClick?.()}
              style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1523' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#7A849E', marginTop: 1 }}>{s.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8BFD0" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}

          {/* ログアウト */}
          <div
            onClick={handleLogout}
            style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 11, background: '#FEF3F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#F04438"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F04438' }}>ログアウト</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
