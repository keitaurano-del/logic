import { useState } from 'react'
import { startCheckout, startBetaCampaignCheckout, isAndroidNative } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { v3 } from '../styles/tokensV3'

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
      padding: '40px 24px', background: v3.color.bg, textAlign: 'center',
    }}>
      {/* ロゴアイコン（v3テーマ：ミントグリーン） */}
      <div style={{
        width: 88, height: 88, borderRadius: 24, marginBottom: 28,
        background: `linear-gradient(135deg, ${v3.color.accent} 0%, #2dd4bf 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 32px ${v3.color.accent}50`,
        flexShrink: 0,
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0F2E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/>
        </svg>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: v3.color.accent, textTransform: 'uppercase', marginBottom: 8 }}>
        LOGIC
      </div>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: v3.color.text,
        letterSpacing: '-.025em', lineHeight: 1.25, marginBottom: 12,
      }}>
        論理的思考力を、<br />毎日5分で鍛えよう。
      </h1>
      <p style={{ fontSize: 15, color: v3.color.text2, lineHeight: 1.75, maxWidth: 340, marginBottom: 40 }}>
        フェルミ推定・ケース面接・ロジカルシンキングを<br />AIと一緒に実践トレーニング。
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
    { color: v3.color.accent, bg: '#EEF2FF', label: '全レッスン解放', sub: '40以上のレッスンが使い放題' },
    { color: '#12B76A', bg: '#ECFDF3', label: 'デイリーフェルミ推定', sub: 'AIフィードバック付き毎日問題' },
    { color: v3.color.accent, bg: '#FFFBF0', label: 'AI問題生成', sub: '弱点に合わせた問題を自動生成' },
  ]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: v3.color.bg,
    }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${v3.color.accent} 0%, #2dd4bf 100%)`,
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
            background: v3.color.card, borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: f.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckIcon width={16} height={16} style={{ color: f.color }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>{f.label}</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 1 }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 20px 8px' }}>
        <button
          onClick={onNext}
          style={{
            width: '100%', background: v3.color.accent, color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${v3.color.accent}40`,
          }}
        >
          無料トライアルを開始
        </button>
      </div>
      <p style={{ fontSize: 12, color: v3.color.text3, textAlign: 'center', padding: '0 20px 24px', lineHeight: 1.6 }}>
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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: v3.color.bg }}>
      {/* Hero */}
      <div style={{
        background: v3.color.bg,
        padding: '36px 20px 28px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.accent, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
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
              border: `1.5px solid ${selected === p.id ? (p.featured ? v3.color.accent : v3.color.accent) : v3.color.line}`,
              borderRadius: 14, padding: '14px 16px',
              background: selected === p.id ? v3.color.accentSoft : v3.color.card,
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', textAlign: 'left', width: '100%',
              position: 'relative',
              color: v3.color.text,
              boxShadow: selected === p.id ? `0 0 0 2px ${v3.color.accent}30` : 'none',
            }}
          >
            {p.featured && selected === p.id && (
              <div style={{
                position: 'absolute', top: -10, left: 16,
                background: v3.color.accent, color: '#fff',
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
              border: `2px solid ${selected === p.id ? (p.featured ? v3.color.accent : v3.color.accent) : v3.color.line}`,
              background: selected === p.id ? v3.color.accent : v3.color.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected === p.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: v3.color.bg }} />}
            </div>
            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>{p.name}</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2 }}>{p.desc}</div>
            </div>
            {/* Price */}
            <div style={{ textAlign: 'right' }}>
              {p.original && (
                <div style={{ fontSize: 11, color: v3.color.text3, textDecoration: 'line-through' }}>{p.original}</div>
              )}
              <span style={{ fontSize: 18, fontWeight: 800, color: p.featured && selected === p.id ? '#D97706' : '#0F1523' }}>
                {p.price}
              </span>
              <span style={{ fontSize: 11, color: v3.color.text2 }}>{p.per}</span>
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
            background: v3.color.accent,
            color: '#fff', border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${v3.color.accent}40`,
          }}
        >
          {selected === 'beta' ? 'ベータキャンペーンで始める' : selected === 'standard' ? 'スタンダードで始める' : '無料プランで始める'}
        </button>
      </div>
      <div style={{ padding: '0 16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: v3.color.text3, textDecoration: 'underline', cursor: 'pointer' }}
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
        padding: '40px 24px', background: v3.color.bg, textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${v3.color.accent}, #2dd4bf)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px ${v3.color.accent}35`, marginBottom: 24,
        }}>
          <CheckIcon width={36} height={36} style={{ color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: v3.color.text, lineHeight: 1.3, letterSpacing: '-.01em', marginBottom: 12 }}>
          {plan === 'free' ? 'ようこそ！' : '7日間の無料体験\nスタート！'}
        </h2>
        <p style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.6, marginBottom: 24 }}>
          {plan === 'free'
            ? '基本レッスンをさっそく試してみよう。'
            : 'トライアル期間中はすべての機能を制限なく使えます。'}
        </p>
        {plan !== 'free' && (
          <div style={{
            background: v3.color.bg, borderRadius: 14, padding: '14px 18px',
            width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24,
          }}>
            {[
              ['プラン', plan === 'beta' ? 'ベータキャンペーン' : 'スタンダード'],
              ['無料期間', '7日間'],
              ['トライアル終了後', plan === 'beta' ? '¥1,980/年' : '¥500/月'],
              ['自動更新', 'あり（いつでも解約可）'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: v3.color.text }}>
                <span>{label}</span>
                <strong style={{ color: v3.color.text }}>{val}</strong>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onComplete}
          style={{
            width: '100%', maxWidth: 320, background: v3.color.accent, color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${v3.color.accent}40`,
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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: v3.color.bg }}>
      {/* Header */}
      <div style={{
        background: v3.color.bg, padding: '16px 20px 12px',
        borderBottom: `1px solid ${v3.color.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <img src="/logo-512.png" alt="Logic"
          style={{ width: 40, height: 40, borderRadius: 10 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text }}>Logic</div>
          <div style={{ fontSize: 12, color: v3.color.text2 }}>{android ? 'Google Play' : 'App Store / Web'}</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {/* Plan */}
        <div style={{ background: v3.color.bg, borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${v3.color.line}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>{planLabel}</div>
          <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 3 }}>{planDetail}</div>
        </div>

        {/* Today's charge */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: v3.color.accentSoft, borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 13, color: v3.color.text, fontWeight: 500 }}>今日のお支払い</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: v3.color.accent }}>¥0（7日間無料）</div>
        </div>

        {/* Notice */}
        <div style={{ fontSize: 12, color: v3.color.text2, lineHeight: 1.6 }}>
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
            width: '100%', background: loading ? v3.color.card : v3.color.accent, color: '#fff',
            border: 'none', borderRadius: 14, padding: '16px',
            fontSize: 17, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
            boxShadow: loading ? 'none' : `0 4px 16px ${v3.color.accent}40`,
          }}
        >
          {loading ? '処理中…' : '無料体験を開始'}
        </button>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: 13, color: v3.color.text3, cursor: 'pointer' }}
        >
          戻る
        </button>
      </div>
    </div>
  )
}

// ── プロフィール属性質問 (SCRUM-153) ────────────────────────────

interface UserProfileData {
  ageRange: string
  occupation: string
  purposes: string[]
  selfAssessment: number
}

function saveUserProfile(data: Partial<UserProfileData>) {
  try {
    const existing = JSON.parse(localStorage.getItem('logic-user-profile') || '{}')
    localStorage.setItem('logic-user-profile', JSON.stringify({
      ...existing,
      ...data,
      onboardedAt: new Date().toISOString(),
    }))
  } catch { /* ignore */ }
}

const AGE_OPTIONS = [
  { value: 'under-18', label: '18歳未満' },
  { value: '19-24', label: '19〜24歳' },
  { value: '25-34', label: '25〜34歳' },
  { value: '35-44', label: '35〜44歳' },
  { value: '45-54', label: '45〜54歳' },
  { value: '55-plus', label: '55歳以上' },
]

const OCCUPATION_OPTIONS = [
  { value: 'business', label: 'ビジネスパーソン（会社員）' },
  { value: 'student', label: '学生' },
  { value: 'executive', label: '経営者・起業家' },
  { value: 'consultant', label: 'コンサルタント' },
  { value: 'engineer', label: 'エンジニア・IT職' },
  { value: 'education', label: '教育・研究職' },
  { value: 'other', label: 'その他' },
]

const PURPOSE_OPTIONS = [
  { value: 'work', label: '仕事の意思決定力を上げたい' },
  { value: 'interview', label: '面接・就職活動の対策' },
  { value: 'career', label: 'コンサル・外資転職の準備' },
  { value: 'exam', label: 'MBA・資格試験対策' },
  { value: 'teaching', label: '子供や部下への教育' },
  { value: 'hobby', label: '趣味・自己研鑽' },
]

const SELF_ASSESSMENT_OPTIONS = [
  { value: 1, label: 'まったく自信がない' },
  { value: 2, label: '少し苦手' },
  { value: 3, label: '普通' },
  { value: 4, label: '得意だと思う' },
  { value: 5, label: '自信がある' },
]

function ProfileStepWrapper({
  title, subtitle, step, totalSteps, onSkip, children,
}: {
  title: string
  subtitle: string
  step: number
  totalSteps: number
  onSkip: () => void
  children: React.ReactNode
}) {
  const pct = (step / totalSteps) * 100
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: v3.color.bg, fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 20px 0' }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: v3.color.card, borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: v3.color.accent, borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: v3.color.text3, fontWeight: 600 }}>{step} / {totalSteps}</div>
          <button onClick={onSkip} style={{ fontSize: 13, color: v3.color.text3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>あとで</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px 20px 40px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.3, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.6 }}>{subtitle}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

function SelectCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        border: `2px solid ${selected ? v3.color.accent : v3.color.line}`,
        borderRadius: 14,
        cursor: 'pointer',
        background: selected ? v3.color.accentSoft : v3.color.card,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 150ms',
      }}
    >
      <span style={{ fontSize: 15, fontWeight: selected ? 700 : 500, color: selected ? v3.color.accent : v3.color.text }}>{label}</span>
      {selected && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
      )}
    </div>
  )
}

function ProfileStep_Age({ onNext, onSkip }: { onNext: (val: string) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState('')
  return (
    <ProfileStepWrapper title="あなたの年齢は？" subtitle="学習内容のカスタマイズに使います" step={1} totalSteps={4} onSkip={onSkip}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {AGE_OPTIONS.map(o => (
          <SelectCard key={o.value} label={o.label} selected={selected === o.value} onClick={() => setSelected(o.value)} />
        ))}
      </div>
      <button
        onClick={() => onNext(selected)}
        disabled={!selected}
        style={{
          marginTop: 24, width: '100%', padding: '16px 0',
          background: selected ? v3.color.accent : v3.color.card,
          color: selected ? '#fff' : v3.color.text3,
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 150ms',
        }}
      >
        次へ
      </button>
    </ProfileStepWrapper>
  )
}

function ProfileStep_Occupation({ onNext, onSkip }: { onNext: (val: string) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState('')
  return (
    <ProfileStepWrapper title="ご職業は？" subtitle="ビジネスシーンに合わせた問題を提案します" step={2} totalSteps={4} onSkip={onSkip}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {OCCUPATION_OPTIONS.map(o => (
          <SelectCard key={o.value} label={o.label} selected={selected === o.value} onClick={() => setSelected(o.value)} />
        ))}
      </div>
      <button
        onClick={() => onNext(selected)}
        disabled={!selected}
        style={{
          marginTop: 24, width: '100%', padding: '16px 0',
          background: selected ? v3.color.accent : v3.color.card,
          color: selected ? '#fff' : v3.color.text3,
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 150ms',
        }}
      >
        次へ
      </button>
    </ProfileStepWrapper>
  )
}

function ProfileStep_Purpose({ onNext, onSkip }: { onNext: (vals: string[]) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (v: string) => setSelected(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  return (
    <ProfileStepWrapper title="Logicを使う目的は？" subtitle="複数選んでOKです" step={3} totalSteps={4} onSkip={onSkip}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {PURPOSE_OPTIONS.map(o => (
          <SelectCard key={o.value} label={o.label} selected={selected.includes(o.value)} onClick={() => toggle(o.value)} />
        ))}
      </div>
      <button
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
        style={{
          marginTop: 24, width: '100%', padding: '16px 0',
          background: selected.length > 0 ? v3.color.accent : v3.color.card,
          color: selected.length > 0 ? '#fff' : v3.color.text3,
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: selected.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 150ms',
        }}
      >
        次へ
      </button>
    </ProfileStepWrapper>
  )
}

function ProfileStep_SelfAssessment({ onNext, onSkip }: { onNext: (val: number) => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <ProfileStepWrapper title="論理的思考の自信は？" subtitle="現在の自分を正直に教えてください！" step={4} totalSteps={4} onSkip={onSkip}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {SELF_ASSESSMENT_OPTIONS.map(o => (
          <SelectCard key={o.value} label={`${o.value}. ${o.label}`} selected={selected === o.value} onClick={() => setSelected(o.value)} />
        ))}
      </div>
      <button
        onClick={() => { if (selected !== null) onNext(selected) }}
        disabled={selected === null}
        style={{
          marginTop: 24, width: '100%', padding: '16px 0',
          background: selected !== null ? v3.color.accent : v3.color.card,
          color: selected !== null ? '#fff' : v3.color.text3,
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed', transition: 'all 150ms',
        }}
      >
        完了する
      </button>
    </ProfileStepWrapper>
  )
}

// ── Main OnboardingScreen ────────────────────────────────────────
export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<'welcome' | 'trial' | 'campaign' | 'payment' | 'profile-age' | 'profile-occupation' | 'profile-purpose' | 'profile-assessment'>('welcome')
  const [selectedPlan, setSelectedPlan] = useState<PlanChoice>('beta')
  const [profileData, setProfileData] = useState<Partial<UserProfileData>>({})

  const finishProfile = (finalData: Partial<UserProfileData>) => {
    const merged = { ...profileData, ...finalData }
    saveUserProfile(merged)
    onComplete()
  }

  const skipAllProfile = () => {
    saveUserProfile(profileData)
    onComplete()
  }

  const handleCampaignSelect = (plan: PlanChoice) => {
    if (plan === 'free') {
      setStep('profile-age')
      return
    }
    setSelectedPlan(plan)
    setStep('payment')
  }

  if (step === 'welcome') return <WelcomeStep onNext={() => setStep('trial')} />
  if (step === 'trial')   return <TrialStep onNext={() => setStep('campaign')} />
  if (step === 'campaign') return <CampaignStep onSelect={handleCampaignSelect} />
  if (step === 'profile-age') return (
    <ProfileStep_Age
      onNext={(ageRange) => { setProfileData(p => ({ ...p, ageRange })); setStep('profile-occupation') }}
      onSkip={skipAllProfile}
    />
  )
  if (step === 'profile-occupation') return (
    <ProfileStep_Occupation
      onNext={(occupation) => { setProfileData(p => ({ ...p, occupation })); setStep('profile-purpose') }}
      onSkip={() => { saveUserProfile(profileData); onComplete() }}
    />
  )
  if (step === 'profile-purpose') return (
    <ProfileStep_Purpose
      onNext={(purposes) => { setProfileData(p => ({ ...p, purposes })); setStep('profile-assessment') }}
      onSkip={() => { saveUserProfile(profileData); onComplete() }}
    />
  )
  if (step === 'profile-assessment') return (
    <ProfileStep_SelfAssessment
      onNext={(selfAssessment) => finishProfile({ selfAssessment })}
      onSkip={skipAllProfile}
    />
  )
  return (
    <PaymentStep
      plan={selectedPlan}
      onComplete={() => setStep('profile-age')}
      onBack={() => setStep('campaign')}
    />
  )
}
