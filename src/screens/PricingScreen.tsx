import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { ArrowLeftIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface PricingScreenProps {
  onBack: () => void
}

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    setError('')
    try {
      const guest = loadGuestUser()
      await startCheckout(plan, guest.id)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">PRICING</div>
      </div>

      <div className="eyebrow accent">PREMIUM</div>
      <h1 style={{ fontSize: 26, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        論理的思考力を、<br />もっと深く鍛える。
      </h1>

      {state.plan === 'trial' && (
        <div className="card" style={{ background: 'var(--brand-soft)', borderColor: 'var(--brand)', marginTop: 'var(--s-3)' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>
            トライアル中: あと {trialDays} 日
          </span>
        </div>
      )}

      <div className="stack-sm" style={{ marginTop: 'var(--s-4)' }}>
        {/* Free plan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>FREE</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>¥0<span style={{ fontSize: 14, fontWeight: 500 }}>/月</span></div>
            </div>
          </div>
          <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 'var(--s-4)', color: 'var(--text-muted)' }}>
            <li>全レッスン閲覧</li>
            <li>AI問題生成 1日10問まで</li>
            <li>ロードマップ</li>
          </ul>
          <button style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginTop: 'var(--s-3)', cursor: 'not-allowed' }} disabled>
            現在のプラン
          </button>
        </div>

        {/* Yearly plan */}
        <div className="card" style={{ borderColor: 'var(--brand)', position: 'relative' }}>
          <div className="badge" style={{ position: 'absolute', top: -10, left: 'var(--s-4)', background: 'var(--brand)', color: '#fff', border: 'none' }}>
            人気 No.1
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
            <div>
              <div className="eyebrow accent" style={{ marginBottom: 4 }}>YEARLY</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>¥980<span style={{ fontSize: 14, fontWeight: 500 }}>/月</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>年額払いで 2 ヶ月分お得</div>
            </div>
          </div>
          <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 'var(--s-4)' }}>
            <li>全機能アンロック</li>
            <li>AI問題生成 月300問</li>
            <li>全ロールプレイシナリオ</li>
            <li>ダークモード</li>
          </ul>
          <Button
            variant="primary" size="lg" block
            onClick={() => handleUpgrade('yearly')}
            disabled={loading === 'yearly'}
            style={{ marginTop: 'var(--s-3)' }}
          >
            {loading === 'yearly' ? '処理中…' : '年額プランで始める'}
          </Button>
        </div>

        {/* Monthly plan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>MONTHLY</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>¥1,480<span style={{ fontSize: 14, fontWeight: 500 }}>/月</span></div>
            </div>
          </div>
          <Button
            variant="default" size="md" block
            onClick={() => handleUpgrade('monthly')}
            disabled={loading === 'monthly'}
          >
            {loading === 'monthly' ? '処理中…' : '月額プランで始める'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {state.plan !== 'free' && (
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">プレミアム有効</div>
          </div>
          <div className="feedback-text">すべての機能をご利用いただけます。</div>
        </div>
      )}
    </div>
  )
}
