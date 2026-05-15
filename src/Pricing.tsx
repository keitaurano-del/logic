import { useState } from 'react'
import { startCheckout, getSubscriptionState, PLAN_PRICES, isPaid } from './subscription'
import './Pricing.css'

// Legacy v1 のプラン画面。AppV3 では src/screens/PricingScreen.tsx を使う。
// CLAUDE.md「v1 は触らない」に従い、価格表示と plan 名のみ整合性を保つ。

type Props = { onBack: () => void }

export default function Pricing({ onBack }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const state = getSubscriptionState()
  const paid = isPaid()

  const handleUpgrade = async (plan: 'paid_monthly' | 'paid_yearly') => {
    setLoading(plan)
    setError('')
    try {
      await startCheckout(plan)
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : null) || 'エラーが発生しました')
      setLoading(null)
    }
  }

  const yearlyMonthly = Math.round(PLAN_PRICES.yearly / 12)
  const yearlySavingsPct = Math.round((1 - PLAN_PRICES.yearly / (PLAN_PRICES.monthly * 12)) * 100)

  return (
    <div className="pr-screen">
      <header className="pr-header">
        <button className="pr-back" onClick={onBack}>← 戻る</button>
        <h2>プラン</h2>
      </header>

      <div className="pr-body">
        <div className="pr-intro">
          <h3>AI 問題生成を、<br/>あなたの学習に。</h3>
          <p>有料プランで AI 問題生成が無制限</p>
        </div>

        <div className="pr-plans">
          {/* 年額プラン（推奨・先に表示） */}
          <div className="pr-card pr-card-recommended">
            <div className="pr-recommended-badge">おすすめ</div>
            <div className="pr-plan-name">年額プラン</div>
            <div className="pr-price">¥{PLAN_PRICES.yearly.toLocaleString()}<span>/年</span></div>
            <div className="pr-price-monthly">月々 <strong>¥{yearlyMonthly}</strong></div>
            <div className="pr-price-savings">年額でぐんとお得！ <span className="pr-off-badge">{yearlySavingsPct}% OFF</span></div>
            <ul className="pr-features">
              <li>AI 問題生成 <strong>無制限</strong></li>
              <li>レッスン受け放題</li>
              <li>AI ロールプレイ</li>
              <li>復習・誤答リスト</li>
              <li>プレミアムテーマ</li>
            </ul>
            <button
              className="pr-btn pr-btn-primary pr-btn-recommended"
              onClick={() => handleUpgrade('paid_yearly')}
              disabled={loading !== null || (paid && state.plan === 'paid_yearly')}
            >
              {paid && state.plan === 'paid_yearly' ? '加入中' : loading === 'paid_yearly' ? '読み込み中...' : '年額プランを始める'}
            </button>
          </div>

          {/* 月額プラン */}
          <div className="pr-card">
            <div className="pr-plan-name">月額プラン</div>
            <div className="pr-price">¥{PLAN_PRICES.monthly.toLocaleString()}<span>/月</span></div>
            <ul className="pr-features">
              <li>AI 問題生成 <strong>無制限</strong></li>
              <li>レッスン受け放題</li>
              <li>AI ロールプレイ</li>
              <li>復習・誤答リスト</li>
              <li>プレミアムテーマ</li>
            </ul>
            <button
              className="pr-btn pr-btn-secondary"
              onClick={() => handleUpgrade('paid_monthly')}
              disabled={loading !== null || (paid && state.plan === 'paid_monthly')}
            >
              {paid && state.plan === 'paid_monthly' ? '加入中' : loading === 'paid_monthly' ? '読み込み中...' : '月額プランにする'}
            </button>
          </div>
        </div>

        {error && <div className="pr-error">{error}</div>}

        <div className="pr-note">
          Google Play 決済<br/>
          いつでも解約可能
        </div>
      </div>
    </div>
  )
}
