import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { daysLeftInTrial, getSubscriptionState } from './subscription'
import { isAndroidNative } from './subscription'
import './SubscriptionManagement.css'

import { API_BASE } from './apiBase'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const localState = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isAndroid = isAndroidNative()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || !supabaseAnonKey) {
      setLoading(false)
      return
    }
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
  }, [userId])

  const plan = subData?.plan || localState.plan
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
    if (plan === 'yearly') return '年額プラン (¥3,500/年)'
    if (plan === 'monthly') return '月額プャン (¥650/月)'
    if (plan === 'trial') return `7日間トライアル`
    return '無料プラン'
  }

  const isActive = plan === 'monthly' || plan === 'yearly' || plan === 'trial'
  const isTrial = plan === 'trial' || status === 'trialing'

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

        {isTrial && (
          <div className="sm-trial-info">
            <span className="sm-trial-icon">●</span>
            <span>無料トライアル中</span>
            {trialDays > 0 && (
              <strong>あと {trialDays} 日</strong>
            )}
          </div>
        )}

        {periodEnd && !isTrial && isActive && (
          <div className="sm-row sm-row-sub">
            <span className="sm-label">次回更新日</span>
            <span className="sm-value">{formatDate(periodEnd)}</span>
          </div>
        )}

        {periodEnd && isTrial && (
          <div className="sm-row sm-row-sub">
            <span className="sm-label">トライアル終了日</span>
            <span className="sm-value">{formatDate(periodEnd)}</span>
          </div>
        )}

        {!isActive && (
          <div className="sm-row sm-row-sub">
            <span className="sm-label">ステータス</span>
            <span className="sm-value sm-inactive">未加入</span>
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

      {error && <div className="sm-error">{error}</div>}

      {!userId && (
        <div className="sm-note">
          ログインすると詳細なサブスクリプション情報が確認できます。
        </div>
      )}
    </div>
  )
}
