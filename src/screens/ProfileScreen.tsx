import { getCompletedCount, getStreak } from '../stats'
import { getCurrentTier, RANK_TIERS } from './homeHelpers'
import { RankIllustration } from '../components/RankIllustration'
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
  onOpenSettings: (section?: 'account' | 'notifications' | 'plan') => void
  onOpenCompleted: () => void
  onOpenStudyTime: () => void
  onOpenRank: () => void
  onOpenRanking: () => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
}

export function ProfileScreen({ userName, onOpenSettings, onOpenFeedback, onOpenPricing, onOpenRank, onOpenStreak, onOpenCompleted }: ProfileScreenProps) {
  const streak = getStreak()
  const completed = getCompletedCount()
  const xp = completed * 100
  const tier = getCurrentTier(xp)
  const nextTier = RANK_TIERS.find(t => t.level === tier.level + 1)
  const xpInLevel = xp - tier.minXp
  const xpToNext = nextTier ? nextTier.minXp - tier.minXp : 1000
  const xpPct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100))


  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const settings = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>,
      name: 'アカウント',
      sub: userName || 'ゲスト',
      onClick: () => onOpenSettings('account'),
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      name: '通知設定',
      sub: '毎日 08:00',
      onClick: () => onOpenSettings('notifications'),
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 12px', background: 'rgba(240,244,255,.95)', borderBottom: '1px solid #E2E8FF' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: '#3B5BDB', letterSpacing: '-.04em' }}>プロフィール</div>
      </div>

      <div style={{ padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

        {/* プロフィールヒーロー — 哲学者ランク */}
        <div
          onClick={() => onOpenRank?.()}
          style={{ background: 'linear-gradient(145deg, #1E3A8A 0%, #3B5BDB 60%, #4C6EF5 100%)', borderRadius: 24, padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        >
          {/* 背景装飾 */}
          <div style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: -30, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

          {/* ユーザー名 */}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.55)', letterSpacing: '.04em', marginBottom: 10 }}>{userName || 'ゲスト'}</div>

          {/* 哲学者イラスト */}
          <div style={{ marginBottom: 10 }}>
            <RankIllustration level={tier.level} size={80} />
          </div>

          {/* ランク名 */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>LV.{tier.level}</div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', marginBottom: 4 }}>{tier.title}</div>

          {/* XPバー */}
          <div style={{ width: '100%', maxWidth: 200, marginBottom: 4 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: 'rgba(255,255,255,.7)', borderRadius: 99, transition: 'width .4s ease' }} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
            {xpInLevel} / {xpToNext}{nextTier ? ` — 次: ${nextTier.title}` : ' — MAX'}
          </div>

          {/* ステータス行 */}
          <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.12)', width: '100%', justifyContent: 'center' }}>
            {([
              { value: String(completed), label: 'レッスン', onClick: onOpenCompleted },
              { value: `${streak}日`, label: '連続学習', onClick: onOpenStreak },
            ] as { value: string; label: string; onClick?: () => void }[]).map(({ value, label, onClick }) => (
              <div key={label} onClick={onClick} style={{ textAlign: 'center', cursor: onClick ? 'pointer' : 'default', padding: '4px 8px', borderRadius: 10, transition: 'background .15s' }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.02em' }}>{value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* タップ誘導 */}
          <div style={{ position: 'absolute', top: 14, right: 16, fontSize: 13, color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: 3 }}>
            全ランク
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
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
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0F1523' }}>{s.name}</div>
                <div style={{ fontSize: 14, color: '#7A849E', marginTop: 1 }}>{s.sub}</div>
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
              <div style={{ fontSize: 16, fontWeight: 600, color: '#F04438' }}>ログアウト</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
