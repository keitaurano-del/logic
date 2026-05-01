import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial } from './subscription'
import './Pricing.css'

type Props = { onBack: () => void }

export default function Pricing({ onBack }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    setError('')
    try {
      await startCheckout(plan as any)
    } catch (e: any) {
      setError(e.message || 'エラーが発生しました')
      setLoading(null)
    }
  }

  return (
    <div className="pr-screen">
      <header className="pr-header">
        <button className="pr-back" onClick={onBack}>← 戻る</button>
        <h2>💎 プラン</h2>
      </header>

      <div className="pr-body">
        {state.plan === 'trial' && (
          <div className="pr-trial-banner">
            🎁 トライアル中: あと {trialDays} 日
          </div>
        )}

        <div className="pr-intro">
          <h3>論理的思考力を、<br/>もっと深く鍛える。</h3>
          <p>プレミアムプランで全機能解放</p>
        </div>

        <div className="pr-plans">
          {/* 年額プラン（推奨・先に表示） */}
          <div className="pr-card pr-card-recommended">
            <div className="pr-recommended-badge">🏆 おすすめ</div>
            <div className="pr-plan-name">年額プラン</div>
            <div className="pr-price">¥3,500<span>/年</span></div>
            <div className="pr-price-monthly">月々 <strong>¥292</strong></div>
            <div className="pr-price-savings">年額で約5ヶ月分お得！ <span className="pr-off-badge">42% OFF</span></div>
            <div className="pr-trial-note">🎁 7日間無料トライアル付き</div>
            <ul className="pr-features">
              <li>✓ AI問題生成 <strong>月300問</strong>まで</li>
              <li>✓ デイリー問題</li>
              <li>✓ AI手帳サマリー</li>
              <li>✓ 偏差値分析</li>
              <li>✓ 全機能アクセス</li>
            </ul>
            <button
              className="pr-btn pr-btn-primary pr-btn-recommended"
              onClick={() => handleUpgrade('yearly')}
              disabled={loading !== null || state.plan === 'yearly'}
            >
              {state.plan === 'yearly' ? '加入中' : loading === 'yearly' ? '読み込み中...' : '年額プランを始める'}
            </button>
          </div>

          {/* 月額プラン */}
          <div className="pr-card">
            <div className="pr-plan-name">月額プラン</div>
            <div className="pr-price">¥650<span>/月</span></div>
            <div className="pr-trial-note">🎁 7日間無料トライアル付き</div>
            <ul className="pr-features">
              <li>✓ AI問題生成 <strong>月300問</strong>まで</li>
              <li>✓ デイリー問題</li>
              <li>✓ AI手帳サマリー</li>
              <li>✓ 偏差値分析</li>
              <li>✓ 全機能アクセス</li>
            </ul>
            <button
              className="pr-btn pr-btn-secondary"
              onClick={() => handleUpgrade('monthly')}
              disabled={loading !== null || state.plan === 'monthly'}
            >
              {state.plan === 'monthly' ? '加入中' : loading === 'monthly' ? '読み込み中...' : '月額プランにする'}
            </button>
          </div>
        </div>

        {error && <div className="pr-error">{error}</div>}

        <div className="pr-note">
          💳 クレジットカード決済 / Stripe<br/>
          🎁 7日間の無料トライアル付き（カード登録必要）<br/>
          ✕ いつでも解約可能
        </div>
      </div>
    </div>
  )
}
