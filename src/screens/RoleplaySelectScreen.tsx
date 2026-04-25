import { getSituations, type Situation, type SituationCategory } from '../situations'
import { isPremium } from '../subscription'
import { getRoleplayRemaining, ROLEPLAY_FREE_LIMIT } from '../roleplayUsage'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'

interface RoleplaySelectScreenProps {
  onBack: () => void
  onStart: (situationId: string) => void
  onUpgrade: () => void
}

const DIFF_LABEL: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const DIFF_COLOR: Record<string, string> = {
  beginner: '#059669',
  intermediate: '#D97706',
  advanced: '#DC2626',
}

// カテゴリ別SVGアイコン（絵文字なし）
function SituationIcon({ id, size = 22 }: { id: string; size?: number }) {
  const s = `${size}`
  if (id === 'why-so-report') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
  if (id === 'mece-meeting') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (id === 'pyramid-client') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
  if (id === 'logic-tree-sub') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="8"/>
      <path d="M12 8C9 8 6 10 6 13v1M12 8c3 0 6 2 6 5v1"/>
      <circle cx="6" cy="17" r="2"/>
      <circle cx="18" cy="17" r="2"/>
      <circle cx="12" cy="2" r="2"/>
    </svg>
  )
  // default
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

const ICON_BG: Record<string, string> = {
  'why-so-report': '#EEF2FF',
  'mece-meeting': '#ECFDF5',
  'pyramid-client': '#F3F0FF',
  'logic-tree-sub': '#FFFBEB',
}

const CATEGORY_LABELS: Record<SituationCategory, string> = {
  business: 'ビジネス思考',
  philosophy: '哲学・思考実験',
}

function SituationCard({
  s,
  premium,
  remaining,
  onClick,
}: {
  s: Situation
  premium: boolean
  remaining: number
  onClick: () => void
}) {
  const locked = (s.premium && !premium) || (!premium && remaining <= 0 && !s.premium)
  const comingSoon = s.category === 'philosophy'

  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      style={{
        background: '#fff',
        border: `1.5px solid ${comingSoon ? '#E8EEFF' : '#E2E8FF'}`,
        borderRadius: 16,
        padding: 16,
        cursor: comingSoon ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        opacity: comingSoon ? 0.55 : 1,
        width: '100%',
        transition: 'border-color .15s',
      }}
    >
      {/* アイコン */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: ICON_BG[s.id] ?? '#EEF2FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SituationIcon id={s.id} />
      </div>

      {/* テキスト */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', marginBottom: 4 }}>
          {s.title}
        </div>
        <div style={{ fontSize: 13, color: '#7A849E', lineHeight: 1.5, marginBottom: 8 }}>
          {s.goal}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: '#F0F4FF', color: '#3B5BDB',
          }}>
            {s.frameworkLabel}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: '#F8FAFF',
            color: DIFF_COLOR[s.difficulty] ?? '#7A849E',
          }}>
            {DIFF_LABEL[s.difficulty] ?? s.difficulty}
          </span>
        </div>
      </div>

      {/* バッジ */}
      {comingSoon ? (
        <span style={{
          flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 99, background: '#F5F5F5', color: '#9CA3AF',
          alignSelf: 'flex-start', whiteSpace: 'nowrap',
        }}>
          近日公開
        </span>
      ) : locked ? (
        <span style={{
          flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 99, background: '#EEF2FF', color: '#3B5BDB',
          alignSelf: 'flex-start', whiteSpace: 'nowrap',
        }}>
          PRO
        </span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5CDE8" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, alignSelf: 'center' }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </button>
  )
}

export function RoleplaySelectScreen({ onBack, onStart, onUpgrade }: RoleplaySelectScreenProps) {
  const premium = isPremium()
  const remaining = getRoleplayRemaining()

  const situations = getSituations()
  const businessSituations = situations.filter((s) => s.category === 'business')
  const philosophySituations = situations.filter((s) => s.category === 'philosophy')

  const handleClick = (s: Situation) => {
    if (s.category === 'philosophy') return
    if (s.premium && !premium) { onUpgrade(); return }
    if (!premium && remaining <= 0) { onUpgrade(); return }
    onStart(s.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0 40px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px' }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1523', letterSpacing: '-.02em' }}>
            ロールプレイ
          </div>
          <div style={{ fontSize: 13, color: '#7A849E', marginTop: 1 }}>
            実践的な思考力を鍛える
          </div>
        </div>
      </div>

      {/* 残り回数バッジ */}
      {!premium && (
        <div style={{
          background: '#EEF2FF', borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 14, color: '#3B5BDB', fontWeight: 600 }}>今月の残り回数</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#3B5BDB' }}>
            {remaining} / {ROLEPLAY_FREE_LIMIT}
          </span>
        </div>
      )}

      {/* ビジネス思考 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#7A849E', marginBottom: 12,
        }}>
          {CATEGORY_LABELS.business}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {businessSituations.map((s) => (
            <SituationCard
              key={s.id}
              s={s}
              premium={premium}
              remaining={remaining}
              onClick={() => handleClick(s)}
            />
          ))}
        </div>
      </div>

      {/* 哲学・思考実験（coming soon） */}
      {philosophySituations.length > 0 && (
        <div>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
            color: '#7A849E', marginBottom: 12,
          }}>
            {CATEGORY_LABELS.philosophy}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {philosophySituations.map((s) => (
              <SituationCard
                key={s.id}
                s={s}
                premium={premium}
                remaining={remaining}
                onClick={() => handleClick(s)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
