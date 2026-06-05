import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getSubscriptionState, isAndroidNative, PLAN_PRICES, normalizeLegacyPlan } from './subscription'
import type { SubscriptionPlan } from './subscription'
import './SubscriptionManagement.css'

type SubData = {
  plan: string
  status: string
  current_period_end: string | null
}

type Props = {
  userId: string | null
  onChangePlan: () => void
}

export default function SubscriptionManagement({ userId, onChangePlan }: Props) {
  const [subData, setSubData] = useState<SubData | null>(null)
  // env 未設定時 / userId 無し時は最初から非ローディングで初期化（render 中の setState を回避）
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const canFetch = !!userId && !!supabaseUrl && !!supabaseAnonKey
  const [loading, setLoading] = useState(canFetch)

  const [localState, setLocalState] = useState(getSubscriptionState)
  const isAndroid = isAndroidNative()

  useEffect(() => {
    const handler = () => setLocalState(getSubscriptionState())
    window.addEventListener('subscription:updated', handler)
    return () => window.removeEventListener('subscription:updated', handler)
  }, [])

  useEffect(() => {
    if (!canFetch) return
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const fetchSub = async () => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('plan, status, current_period_end')
          .eq('user_id', userId)
          .single()
        if (data) setSubData(data as SubData)
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    fetchSub()
  }, [userId, canFetch, supabaseUrl, supabaseAnonKey])

  const plan: SubscriptionPlan = normalizeLegacyPlan(subData?.plan ?? localState.plan)
  const status = subData?.status || null
  const periodEnd = subData?.current_period_end || localState.expiresAt

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const planLabel = () => {
    if (plan === 'paid_yearly') return `年額プラン (¥${PLAN_PRICES.yearly.toLocaleString()}/年)`
    if (plan === 'paid_monthly') return `月額プラン (¥${PLAN_PRICES.monthly.toLocaleString()}/月)`
    return '無料プラン'
  }

  const isActive = plan === 'paid_monthly' || plan === 'paid_yearly'

  // Google Play 定期購入管理へのリンク
  const handleOpenPlayStoreManagement = () => {
    const intent = 'intent://account/subscriptions'
    if (isAndroid) {
      window.location.href = intent
    } else {
      // Web: play.google.com に誘導
      window.open('https://play.google.com/account/subscriptions', '_blank')
    }
  }

  if (loading) {
    return (
      <div className="sm-container">
        <div className="sm-loading">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="sm-container">
      <h3 className="sm-title">サブスクリプション</h3>

      {/* 現在のプラン */}
      <div className="sm-card">
        <div className="sm-row">
          <span className="sm-label">現在のプラン</span>
          <span className={`sm-plan-badge sm-plan-${plan}`}>{planLabel()}</span>
        </div>

        {periodEnd && isActive && (
          <div className="sm-row sm-row-sub">
            <span className="sm-label">次回更新日</span>
            <span className="sm-value">{formatDate(periodEnd)}</span>
          </div>
        )}

        {!isActive && (
          <div className="sm-row sm-row-sub">
            <span className="sm-label">ステータス</span>
            <span className="sm-value sm-inactive">{status === 'canceled' ? '解約済み' : '未加入'}</span>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="sm-actions">
        <button className="sm-btn sm-btn-primary" onClick={onChangePlan}>
          プランを変更
        </button>

        {isActive && (
          <button
            className="sm-btn sm-btn-secondary"
            onClick={handleOpenPlayStoreManagement}
          >
            Google Playで管理
          </button>
        )}
      </div>

      {!userId && (
        <div className="sm-note">
          ログインすると詳細なサブスクリプション情報が確認できます。
        </div>
      )}
    </div>
  )
}
