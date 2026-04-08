import { getSituations, type Situation } from '../situations'
import { isPremium } from '../subscription'
import { getRoleplayRemaining, ROLEPLAY_FREE_LIMIT } from '../roleplayUsage'
import { ArrowLeftIcon, ChevronRightIcon } from '../icons'
import { IconButton } from '../components/IconButton'

interface RoleplaySelectScreenProps {
  onBack: () => void
  onStart: (situationId: string) => void
  onUpgrade: () => void
}

export function RoleplaySelectScreen({ onBack, onStart, onUpgrade }: RoleplaySelectScreenProps) {
  const premium = isPremium()
  const remaining = getRoleplayRemaining()

  const handleClick = (s: Situation) => {
    if (s.premium && !premium) {
      onUpgrade()
      return
    }
    if (!premium && remaining <= 0) {
      onUpgrade()
      return
    }
    onStart(s.id)
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">ROLEPLAY</div>
      </div>

      <div className="eyebrow accent">REAL WORLD PRACTICE</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>
        ロールプレイ
      </h1>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.7, marginTop: 4 }}>
        実際のビジネスシーンで論理思考を試そう。AI があなたの対話相手になります。
      </p>

      {!premium && (
        <div
          className="card card-compact"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'var(--s-3)',
          }}
        >
          <span className="muted" style={{ fontSize: 13 }}>
            今月の残り回数
          </span>
          <span
            className="mono"
            style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand)' }}
          >
            {remaining} / {ROLEPLAY_FREE_LIMIT}
          </span>
        </div>
      )}

      <div className="stack-sm" style={{ marginTop: 'var(--s-4)' }}>
        {getSituations().map((s) => {
          const locked = s.premium && !premium
          return (
            <button
              key={s.id}
              className="card"
              onClick={() => handleClick(s)}
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s-4)',
                opacity: locked ? 0.6 : 1,
                transition: 'border-color 120ms ease, transform 120ms ease',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--brand-soft)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {s.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="eyebrow accent"
                  style={{ marginBottom: 4, fontSize: 10 }}
                >
                  {s.frameworkLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: '-0.015em',
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 12, marginBottom: 2 }}
                >
                  相手: {s.partnerName}（{s.partnerRole}）
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                  }}
                >
                  🎯 {s.goal}
                </div>
              </div>
              {locked ? (
                <span className="badge badge-accent">PREMIUM</span>
              ) : (
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
