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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 0' }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 1 }}>
            REAL WORLD PRACTICE
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 20, fontWeight: 900, color: '#0F1523', letterSpacing: '-.025em' }}>
            ロールプレイ
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#7A849E', lineHeight: 1.7, margin: 0 }}>
        実際のビジネスシーンで論理思考を試そう。AI があなたの対話相手になります。
      </p>

      {!premium && (
        <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
          <span style={{ fontSize: 13, color: '#7A849E' }}>今月の残り回数</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 15, fontWeight: 700, color: '#3B5BDB' }}>
            {remaining} / {ROLEPLAY_FREE_LIMIT}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {getSituations().map((s) => {
          const locked = s.premium && !premium
          return (
            <button
              key={s.id}
              onClick={() => handleClick(s)}
              style={{
                background: '#fff',
                border: '1px solid #E2E8FF',
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: locked ? 0.6 : 1,
                boxShadow: '0 1px 2px rgba(15,21,35,.06)',
                transition: 'border-color 120ms ease, transform 120ms ease',
                width: '100%',
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                background: '#EEF2FF',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
              }}>
                {s.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 3 }}>
                  {s.frameworkLabel}
                </div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 15, fontWeight: 800, color: '#0F1523', letterSpacing: '-.015em', marginBottom: 3 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: '#7A849E', marginBottom: 2 }}>
                  相手: {s.partnerName}（{s.partnerRole}）
                </div>
                <div style={{ fontSize: 12, color: '#4A5568' }}>
                  🎯 {s.goal}
                </div>
              </div>
              {locked ? (
                <div style={{ background: '#EEF2FF', color: '#3B5BDB', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', padding: '3px 8px', borderRadius: 6 }}>
                  PREMIUM
                </div>
              ) : (
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ color: '#C5CDE8', flexShrink: 0 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
