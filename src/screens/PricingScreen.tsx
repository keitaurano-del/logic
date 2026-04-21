import { useState } from 'react'
import { startCheckout, getSubscriptionState, daysLeftInTrial, isPremiumPlan, isStandardPlan } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { ArrowLeftIcon, CheckIcon, ZapIcon, BrainIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface PricingScreenProps {
  onBack: () => void
}

type PlanId = 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'

export function PricingScreen({ onBack }: PricingScreenProps) {
  const [loading, setLoading] = useState<PlanId | null>(null)
  const [error, setError] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const state = getSubscriptionState()
  const trialDays = daysLeftInTrial()
  const isActivePremium = isPremiumPlan()
  const isActiveStandard = isStandardPlan()

  const handleUpgrade = async (plan: PlanId) => {
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

  const stdPlan: PlanId = billingCycle === 'yearly' ? 'standard_yearly' : 'standard_monthly'
  const prmPlan: PlanId = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">料金プラン</div>
      </div>

      <div className="eyebrow accent">プラン</div>
      <h1 style={{ fontSize: 30, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        論理的思考力を、<br />もっと深く鍛える。
      </h1>

      {state.plan === 'trial' && (
        <div className="card" style={{ background: 'var(--brand-soft)', borderColor: 'var(--brand)', marginTop: 'var(--s-2)' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand)' }}>
            7日間トライアル中: あと {trialDays} 日
          </span>
        </div>
      )}

      {/* 月額/年額トグル */}
      <div style={{ display: 'flex', background: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', padding: 3, marginTop: 'var(--s-3)', gap: 3 }}>
        {(['monthly', 'yearly'] as const).map((cycle) => (
          <button
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-full)',
              border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600,
              background: billingCycle === cycle ? 'var(--bg-card)' : 'none',
              color: billingCycle === cycle ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: billingCycle === cycle ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {cycle === 'monthly' ? '月払い' : '年払い'}
            {cycle === 'yearly' && (
              <span style={{ marginLeft: 5, fontSize: 13, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-soft)', borderRadius: 99, padding: '1px 5px' }}>
                2ヶ月分お得
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
        {/* Standard plan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <BrainIcon width={14} height={14} style={{ color: 'var(--text-muted)' }} />
                <span className="eyebrow">スタンダード</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {billingCycle === 'yearly'
                  ? <><span>¥3,500</span><span style={{ fontSize: 16, fontWeight: 500 }}>/年</span></>
                  : <><span>¥500</span><span style={{ fontSize: 16, fontWeight: 500 }}>/月</span></>
                }
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>月々約 ¥292</div>
              )}
            </div>
          </div>
          <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 'var(--s-4)', color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
            <li>全レッスン・クイズ</li>
            <li>AI問題生成 月30問</li>
            <li>フェルミ推定練習</li>
            <li>学習進捗・ノート</li>
          </ul>
          {isActiveStandard && !isActivePremium ? (
            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, color: 'var(--brand)', padding: 'var(--s-2)' }}>
              現在のプラン
            </div>
          ) : (
            <Button
              variant="default" size="md" block
              onClick={() => handleUpgrade(stdPlan)}
              disabled={!!loading}
            >
              {loading === stdPlan ? '処理中…' : 'スタンダードで始める'}
            </Button>
          )}
        </div>

        {/* Premium plan */}
        <div className="card" style={{ borderColor: 'var(--brand)', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -11, left: 'var(--s-4)',
            background: 'var(--brand)', color: '#fff', fontSize: 14, fontWeight: 700,
            borderRadius: 99, padding: '3px 10px', letterSpacing: '0.05em',
          }}>
            おすすめ
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <ZapIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                <span className="eyebrow accent">プレミアム</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {billingCycle === 'yearly'
                  ? <><span>¥6,980</span><span style={{ fontSize: 16, fontWeight: 500 }}>/年</span></>
                  : <><span>¥980</span><span style={{ fontSize: 16, fontWeight: 500 }}>/月</span></>
                }
              </div>
              {billingCycle === 'yearly' && (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>月々約 ¥582</div>
              )}
            </div>
          </div>
          <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 'var(--s-4)', marginBottom: 'var(--s-3)' }}>
            <li>スタンダードの全機能</li>
            <li>AI問題生成 無制限</li>
            <li>全ロールプレイシナリオ</li>
            <li>ケース面接 深掘りモード</li>
            <li>優先サポート</li>
          </ul>
          {isActivePremium ? (
            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, color: 'var(--brand)', padding: 'var(--s-2)' }}>
              現在のプラン
            </div>
          ) : (
            <Button
              variant="primary" size="lg" block
              onClick={() => handleUpgrade(prmPlan)}
              disabled={!!loading}
            >
              {loading === prmPlan ? '処理中…' : 'プレミアムで始める'}
            </Button>
          )}
        </div>
      </div>

      {/* トライアル注記 */}
      <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 'var(--s-2)' }}>
        7日間無料トライアル後、自動的に課金が始まります（カード登録必須）。<br />
        いつでもキャンセル可能です。
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16 }}>
          {error}
        </div>
      )}

      {(isActivePremium || isActiveStandard) && (
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">プラン有効</div>
          </div>
          <div className="feedback-text">すべての機能をご利用いただけます。</div>
        </div>
      )}
    </div>
  )
}
