import { useState } from 'react'
import { startCheckout, startBetaCampaignCheckout, isAndroidNative } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'

interface OnboardingScreenProps {
  onComplete: () => void
}

// Platform detection: isAndroidNative() from subscription.ts (SCRUM-121)

// ── Step 0: Welcome ──────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', background: '#fff', textAlign: 'center',
    }}>
      <img
        src="/logo-512.png"
        alt="Logic"
        style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 24 }}
        onError={(e) => {
          // fallback: blue gradient icon
          const t = e.currentTarget as HTMLImageElement
          t.style.display = 'none'
          const fb = document.createElement('div')
          fb.style.cssText = 'width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#3B5BDB,#6366f1);display:flex;align-items:center;justify-content:center;margin-bottom:24px'
          fb.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>'
          t.parentNode?.insertBefore(fb, t)
        }}
      />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#3B5BDB', textTransform: 'uppercase', marginBottom: 8 }}>
        LOGIC
      </div>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: '#0F1523',
        letterSpacing: '-.025em', lineHeight: 1.25, marginBottom: 12,
      }}>
        論理的思考力を、<br />毎日5分で鍛えよう。
      </h1>
      <p style={{ fontSize: 16, color: '#7A849E', lineHeight: 1.7, maxWidth: 300, marginBottom: 40 }}>
        フェルミ推定・ケース面接・ロジカルシンキングをAIと一緒に実践トレーニング。
      </p>
      <Button variant="primary" size="lg" block style={{ maxWidth: 320 }} onClick={onNext}>
        はじめる
        <ArrowRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}

// ── Step 1: 7-day trial explanation ─────────────────────────────
function TrialStep({ onNext }: { onNext: () => void }) {
  const features = [
    { color: '#3B5BDB', bg: '#EEF2FF', label: '全レッスン解放', sub: '40以上のレッスンが使い放題' },
    { color: '#12B76A', bg: '#ECFDF3', label: 'デイリーフェルミ推定', sub: 'AIフィードバック付き毎日問題' },
    { color: '#F59E0B', bg: '#FFFBF0', label: 'AI問題生成', sub: '弱点に合わせた問題を自動生成' },
  ]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: '#fff',
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #3B5BDB 0%, #6366f1 100%)',
        padding: '52px 24px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        textAlign: 'center',
      }}>
        <div style={{
          background: 'rgba(255,255,255,.2)', borderRadius: 20,
          padding: '4px 14px', fontSize: 11, fontWeight: 700, color: '#fff',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          FREE TRIAL
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-.03em' }}>7</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,.88)' }}>日間 無料で全機能を体験</div>
      </div>

      {/* Features */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {features.map((f) => (
          <div key={f.label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#F8F9FF', borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: f.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckIcon width={16} height={16} style={{ color: f.color }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1523' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: '#7A849E', marginTop: 1 }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 20px 8px' }}>
        <button
          onClick={onNext}
          style={{
            width: '100%', background: '#3B5BDB', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59,91,219,.35)',
          }}
        >
          無料トライアルを開始
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#B0B8CC', textAlign: 'center', padding: '0 20px 24px', lineHeight: 1.6 }}>
        クレジットカード登録が必要です。<br />7日以内に解約すれば費用は発生しません。
      </p>
    </div>
  )
}

// ── Step 2: Campaign selection ───────────────────────────────────
type PlanChoice = 'beta' | 'standard' | 'free'

function CampaignStep({ onSelect }: { onSelect: (plan: PlanChoice) => void }) {
  const [selected, setSelected] = useState<PlanChoice>('beta')

  const plans: { id: PlanChoice; name: string; desc: string; price: string; per: string; original?: string; featured?: boolean }[] = [
    {
      id: 'beta',
      name: 'ベータキャンペーン',
      desc: 'AI生成含む全機能 / 7日間無料',
      price: '¥1,980',
      per: '/年',
      original: '¥6,980/年',
      featured: true,
    },
    {
      id: 'standard',
      name: 'スタンダード',
      desc: '全レッスン / 7日間無料',
      price: '¥500',
      per: '/月',
    },
    {
      id: 'free',
      name: '無料プラン',
      desc: '基本レッスンのみ',
      price: '¥0',
      per: '',
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #0F1523 0%, #1e2547 100%)',
        padding: '36px 20px 28px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          BETA CAMPAIGN
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.3, letterSpacing: '-.01em', marginBottom: 8 }}>
          今なら年額<br />¥1,980 で<br />全機能使い放題
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
          ベータ期間限定の特別価格。通常価格になる前にロックインできます。
        </div>
      </div>

      {/* Plan list */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            style={{
              border: `1.5px solid ${selected === p.id ? (p.featured ? '#F59E0B' : '#3B5BDB') : '#E2E8FF'}`,
              borderRadius: 14, padding: '14px 16px',
              background: selected === p.id && p.featured ? '#FFFBF0' : '#fff',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              position: 'relative',
              boxShadow: selected === p.id && p.featured ? '0 0 0 2px #FEF3C7' : 'none',
            }}
          >
            {p.featured && selected === p.id && (
              <div style={{
                position: 'absolute', top: -10, left: 16,
                background: '#F59E0B', color: '#fff',
                fontSize: 10, fontWeight: 700,
                padding: '2px 10px', borderRadius: 20,
                letterSpacing: '.06em', textTransform: 'uppercase',
              }}>
                おすすめ
              </div>
            )}
            {/* Radio */}
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${selected === p.id ? (p.featured ? '#F59E0B' : '#3B5BDB') : '#E2E8FF'}`,
              background: selected === p.id ? (p.featured ? '#F59E0B' : '#3B5BDB') : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
            </div>
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1523' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#7A849E', marginTop: 2 }}>{p.desc}</div>
            </div>
            {/* Price */}
            <div style={{ textAlign: 'right' }}>
              {p.original && (
                <div style={{ fontSize: 11, color: '#B0B8CC', textDecoration: 'line-through' }}>{p.original}</div>
              )}
              <span style={{ fontSize: 18, fontWeight: 800, color: p.featured && selected === p.id ? '#D97706' : '#0F1523' }}>
                {p.price}
              </span>
              <span style={{ fontSize: 11, color: '#7A849E' }}>{p.per}</span>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 16px 8px' }}>
        <button
          onClick={() => onSelect(selected)}
          style={{
            width: '100%',
            background: selected === 'beta' ? '#F59E0B' : '#3B5BDB',
            color: '#fff', border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 12px ${selected === 'beta' ? 'rgba(245,158,11,.4)' : 'rgba(59,91,219,.35)'}`,
          }}
        >
          {selected === 'beta' ? 'ベータキャンペーンで始める' : selected === 'standard' ? 'スタンダードで始める' : '無料プランで始める'}
        </button>
      </div>
      <div style={{ padding: '0 16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: '#B0B8CC', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => onSelect('free')}>
          スキップ（後で変更できます）
        </span>
      </div>
    </div>
  )
}

// ── Step 3: Payment / completion ─────────────────────────────────
function PaymentStep({
  plan,
  onComplete,
  onBack,
}: {
  plan: PlanChoice
  onComplete: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const android = isAndroidNative()

  const handlePay = async () => {
    if (plan === 'free') {
      onComplete()
      return
    }
    setLoading(true)
    setError('')
    try {
      const guest = loadGuestUser()
      if (plan === 'beta') {
        await startBetaCampaignCheckout(guest.id)
      } else {
        await startCheckout('standard_monthly', guest.id)
      }
      // Stripe redirects; Google Play Billing resolves here
      setDone(true)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(false)
    }
  }

  if (done || plan === 'free') {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: '#fff', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #12B76A, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(18,183,106,.35)', marginBottom: 24,
        }}>
          <CheckIcon width={36} height={36} style={{ color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F1523', lineHeight: 1.3, letterSpacing: '-.01em', marginBottom: 12 }}>
          {plan === 'free' ? 'ようこそ！' : '7日間の無料体験\nスタート！'}
        </h2>
        <p style={{ fontSize: 14, color: '#7A849E', lineHeight: 1.6, marginBottom: 24 }}>
          {plan === 'free'
            ? '基本レッスンをさっそく試してみよう。'
            : 'トライアル期間中はすべての機能を制限なく使えます。'}
        </p>
        {plan !== 'free' && (
          <div style={{
            background: '#F0F4FF', borderRadius: 14, padding: '14px 18px',
            width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24,
          }}>
            {[
              ['プラン', plan === 'beta' ? 'ベータキャンペーン' : 'スタンダード'],
              ['無料期間', '7日間'],
              ['トライアル終了後', plan === 'beta' ? '¥1,980/年' : '¥500/月'],
              ['自動更新', 'あり（いつでも解約可）'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#3A4259' }}>
                <span>{label}</span>
                <strong style={{ color: '#0F1523' }}>{val}</strong>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onComplete}
          style={{
            width: '100%', maxWidth: 320, background: '#3B5BDB', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59,91,219,.35)',
          }}
        >
          学習を始める
        </button>
      </div>
    )
  }

  const planLabel = plan === 'beta' ? 'ベータキャンペーン年額プラン' : 'スタンダード月額プラン'
  const planDetail = plan === 'beta'
    ? '7日間無料 → その後 ¥1,980/年（自動更新）'
    : '7日間無料 → その後 ¥500/月（自動更新）'

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F0F4FF' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px 12px',
        borderBottom: '1px solid #E2E8FF',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <img src="/logo-512.png" alt="Logic"
          style={{ width: 40, height: 40, borderRadius: 10 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F1523' }}>Logic</div>
          <div style={{ fontSize: 12, color: '#7A849E' }}>{android ? 'Google Play' : 'App Store / Web'}</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {/* Plan */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1.5px solid #E2E8FF' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1523' }}>{planLabel}</div>
          <div style={{ fontSize: 12, color: '#7A849E', marginTop: 3 }}>{planDetail}</div>
        </div>

        {/* Today's charge */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#EEF2FF', borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 13, color: '#3A4259', fontWeight: 500 }}>今日のお支払い</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#3B5BDB' }}>¥0（7日間無料）</div>
        </div>

        {/* Notice */}
        <div style={{ fontSize: 12, color: '#7A849E', lineHeight: 1.6 }}>
          {android
            ? 'トライアル終了後、Google Play に登録した支払い方法に自動請求されます。Google Play からいつでもキャンセルできます。'
            : 'トライアル終了後、登録した支払い方法に自動請求されます。いつでもキャンセルできます。'}
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,.06)', border: '1px solid #F04438',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 14, color: '#F04438',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#D1D9F0' : '#3B5BDB', color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(59,91,219,.35)',
          }}
        >
          {loading ? '処理中…' : '無料体験を開始'}
        </button>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#B0B8CC', cursor: 'pointer' }}
        >
          戻る
        </button>
      </div>
    </div>
  )
}

// ── Main OnboardingScreen ────────────────────────────────────────
export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<'welcome' | 'trial' | 'campaign' | 'payment'>('welcome')
  const [selectedPlan, setSelectedPlan] = useState<PlanChoice>('beta')

  const handleCampaignSelect = (plan: PlanChoice) => {
    if (plan === 'free') {
      onComplete()
      return
    }
    setSelectedPlan(plan)
    setStep('payment')
  }

  if (step === 'welcome') return <WelcomeStep onNext={() => setStep('trial')} />
  if (step === 'trial')   return <TrialStep onNext={() => setStep('campaign')} />
  if (step === 'campaign') return <CampaignStep onSelect={handleCampaignSelect} />
  return (
    <PaymentStep
      plan={selectedPlan}
      onComplete={onComplete}
      onBack={() => setStep('campaign')}
    />
  )
}
