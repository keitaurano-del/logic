import { useState } from 'react'
import { startCheckout } from '../subscription'
import { loadGuestUser } from '../guestUser'
import { ArrowRightIcon, BrainIcon, BarChartIcon, BriefcaseIcon, CheckIcon, ZapIcon } from '../icons'
import { Button } from '../components/Button'

interface OnboardingScreenProps {
  onComplete: () => void
}

type Goal = 'consulting' | 'business' | 'other'

const GOALS: { id: Goal; icon: typeof BrainIcon; title: string; sub: string }[] = [
  { id: 'consulting', icon: BriefcaseIcon, title: 'コンサル・MBB志望', sub: 'ケース面接・フェルミ推定を徹底強化' },
  { id: 'business',  icon: BrainIcon,     title: 'ビジネスパーソン',   sub: '日常業務のロジカル思考を鍛える' },
  { id: 'other',     icon: BarChartIcon,  title: 'その他・自己研鑽',   sub: '幅広い論理的思考トレーニング' },
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStartTrial = async () => {
    setLoading(true)
    setError('')
    try {
      const guest = loadGuestUser()
      // Store goal
      if (goal) localStorage.setItem('logic-goal', goal)
      await startCheckout('standard_monthly', guest.id)
      // Stripe will redirect; set onboarded on return (in AppV3)
    } catch (e: unknown) {
      setError((e as Error).message || 'エラーが発生しました')
      setLoading(false)
    }
  }

  if (step === 0) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'var(--s-6) var(--s-4)', background: 'var(--bg)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'var(--s-5)',
        }}>
          <BrainIcon width={36} height={36} style={{ color: '#fff' }} />
        </div>
        <div className="eyebrow accent" style={{ marginBottom: 'var(--s-2)' }}>LOGIC</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 'var(--s-3)' }}>
          論理的思考力を、<br />毎日5分で鍛えよう。
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 300, marginBottom: 'var(--s-7)' }}>
          フェルミ推定・ケース面接・ロジカルシンキングを、AIと一緒に実践トレーニング。
        </p>
        <Button variant="primary" size="lg" block style={{ maxWidth: 320 }} onClick={() => setStep(1)}>
          はじめる
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        padding: 'var(--s-7) var(--s-4) var(--s-6)',
        background: 'var(--bg)', maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>ステップ 1 / 2</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: 'var(--s-2)' }}>
          目標を教えてください
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 'var(--s-5)' }}>
          あなたに合ったコンテンツをおすすめします。
        </p>
        <div className="stack-sm" style={{ flex: 1 }}>
          {GOALS.map(({ id, icon: Icon, title, sub }) => (
            <button
              key={id}
              onClick={() => setGoal(id)}
              style={{
                width: '100%', textAlign: 'left', padding: 'var(--s-4)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `2px solid ${goal === id ? 'var(--brand)' : 'var(--border)'}`,
                background: goal === id ? 'var(--brand-soft)' : 'var(--bg-card)',
                display: 'flex', alignItems: 'center', gap: 'var(--s-3)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: goal === id ? 'var(--brand)' : 'var(--bg-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon width={20} height={20} style={{ color: goal === id ? '#fff' : 'var(--text-muted)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
              </div>
              {goal === id && (
                <div style={{ marginLeft: 'auto', color: 'var(--brand)' }}>
                  <CheckIcon width={18} height={18} />
                </div>
              )}
            </button>
          ))}
        </div>
        <Button
          variant="primary" size="lg" block
          onClick={() => setStep(2)}
          disabled={!goal}
          style={{ marginTop: 'var(--s-5)' }}
        >
          次へ
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </div>
    )
  }

  // step === 2: Trial explanation + card registration
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: 'var(--s-7) var(--s-4) var(--s-6)',
      background: 'var(--bg)', maxWidth: 480, margin: '0 auto', width: '100%',
    }}>
      <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>ステップ 2 / 2</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: 'var(--s-2)' }}>
        7日間、無料で試せます
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 'var(--s-4)' }}>
        トライアル期間中はすべての機能が使い放題。いつでもキャンセルできます。
      </p>

      {/* Plan comparison */}
      <div className="stack-sm" style={{ marginBottom: 'var(--s-4)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-2)' }}>
            <BrainIcon width={16} height={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>スタンダード</span>
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700 }}>¥500/月</span>
          </div>
          <ul style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 'var(--s-4)', lineHeight: 2 }}>
            <li>全レッスン・クイズ</li>
            <li>AI問題生成 月30問</li>
            <li>フェルミ推定・ロードマップ</li>
          </ul>
        </div>
        <div className="card" style={{ borderColor: 'var(--brand)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-2)' }}>
            <ZapIcon width={16} height={16} style={{ color: 'var(--brand)' }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>プレミアム</span>
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>¥980/月</span>
          </div>
          <ul style={{ fontSize: 13, paddingLeft: 'var(--s-4)', lineHeight: 2 }}>
            <li>スタンダードの全機能</li>
            <li>AI問題生成 無制限</li>
            <li>全ロールプレイシナリオ</li>
          </ul>
        </div>
      </div>

      <Button
        variant="primary" size="lg" block
        onClick={handleStartTrial}
        disabled={loading}
      >
        {loading ? '処理中…' : '7日間無料で始める（カード登録へ）'}
        {!loading && <ArrowRightIcon width={16} height={16} />}
      </Button>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 'var(--s-3)' }}>
        トライアル終了後はスタンダードプラン（¥500/月）に自動移行します。<br />
        7日以内にキャンセルすれば費用はかかりません。
      </p>

      {error && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13, marginTop: 'var(--s-3)' }}>
          {error}
        </div>
      )}

      <button
        onClick={onComplete}
        style={{ marginTop: 'var(--s-4)', background: 'none', border: 'none', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
      >
        スキップ（後で設定する）
      </button>
    </div>
  )
}
