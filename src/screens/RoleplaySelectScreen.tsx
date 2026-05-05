import { getSituations, type Situation, type SituationCategory } from '../situations'
import { isPremium } from '../subscription'
import { getRoleplayRemaining, ROLEPLAY_FREE_LIMIT } from '../roleplayUsage'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { v3 } from '../styles/tokensV3'

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
  beginner: '#34D399',
  intermediate: '#D97706',
  advanced: 'var(--md-sys-color-error)',
}

// カテゴリ別SVGアイコン（絵文字なし）
function SituationIcon({ id, size = 22 }: { id: string; size?: number }) {
  const s = `${size}`
  if (id === 'why-so-report') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
  if (id === 'mece-meeting') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (id === 'pyramid-client') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
  if (id === 'logic-tree-sub') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="8"/>
      <path d="M12 8C9 8 6 10 6 13v1M12 8c3 0 6 2 6 5v1"/>
      <circle cx="6" cy="17" r="2"/>
      <circle cx="18" cy="17" r="2"/>
      <circle cx="12" cy="2" r="2"/>
    </svg>
  )
  if (id === 'socrates-dialog') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
  if (id === 'descartes-doubt') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  )
  if (id === 'nietzsche-values') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )
  // default
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

const ICON_BG: Record<string, string> = {
  'why-so-report': 'rgba(112,216,189,.14)',
  'mece-meeting': 'rgba(112,216,189,.14)',
  'pyramid-client': 'rgba(165,180,252,.14)',
  'logic-tree-sub': 'rgba(244,162,97,.14)',
  'socrates-dialog': 'rgba(196,181,253,.14)',
  'descartes-doubt': 'rgba(196,181,253,.14)',
  'nietzsche-values': 'rgba(196,181,253,.14)',
}

// シナリオごとの表現画像（既存 v3 画像を活用）
const SCENARIO_IMAGE: Record<string, string> = {
  'why-so-report': '/images/v3/course-business.webp',
  'mece-meeting': '/images/v3/course-business.webp',
  'pyramid-client': '/images/v3/course-business.webp',
  'logic-tree-sub': '/images/v3/course-business.webp',
  'socrates-dialog': '/images/v3/course-philosophy.webp',
  'descartes-doubt': '/images/v3/course-philosophy.webp',
  'nietzsche-values': '/images/v3/course-philosophy.webp',
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
  const comingSoon = false // 哲学者シリーズも開放

  const image = SCENARIO_IMAGE[s.id]
  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      style={{
        background: v3.color.card,
        border: `1.5px solid ${comingSoon ? `${v3.color.accent}12` : `${v3.color.accent}18`}`,
        borderRadius: 16,
        padding: 0,
        cursor: comingSoon ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        opacity: comingSoon ? 0.55 : 1,
        width: '100%',
        overflow: 'hidden',
        transition: 'border-color .15s, transform .12s',
      }}
    >
      {/* 表現画像 */}
      {image && (
        <div style={{ width: '100%', height: 96, overflow: 'hidden', position: 'relative' }}>
          <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,33,33,0) 50%, rgba(8,33,33,.55) 100%)' }} />
          {/* アイコンを画像上に重ねる */}
          <div style={{
            position: 'absolute', bottom: 8, left: 12,
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: ICON_BG[s.id] ?? 'rgba(112,216,189,.18)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SituationIcon id={s.id} size={18} />
          </div>
        </div>
      )}

      {/* テキスト部 SCRUM-179: 文字サイズ改善・重複整理 */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: v3.color.accent, letterSpacing: '.04em' }}>
              {s.partnerRole}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: `${v3.color.accent}18`, color: DIFF_COLOR[s.difficulty] ?? v3.color.text2,
            }}>
              {DIFF_LABEL[s.difficulty] ?? s.difficulty}
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: v3.color.text, marginBottom: 6, lineHeight: 1.35 }}>
            {s.title}
          </div>
          <div style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.6, marginBottom: 8 }}>
            {s.goal}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${v3.color.accent}14`, borderRadius: 8, padding: '4px 10px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: v3.color.accent }}>{s.frameworkLabel}</span>
          </div>
        </div>

        {/* 右端のバッジ / 矢印 */}
        {comingSoon ? (
          <span style={{
            flexShrink: 0, fontSize: 14, fontWeight: 700, padding: '3px 8px',
            borderRadius: 99, background: `${v3.color.accent}12`, color: v3.color.text3,
            alignSelf: 'flex-start', whiteSpace: 'nowrap',
          }}>
            近日公開
          </span>
        ) : locked ? (
          <span style={{
            flexShrink: 0, fontSize: 14, fontWeight: 700, padding: '3px 8px',
            borderRadius: 99, background: `${v3.color.accent}28`, color: v3.color.accent,
            alignSelf: 'flex-start', whiteSpace: 'nowrap',
          }}>
            PRO
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, alignSelf: 'center' }} aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </div>
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
    // 2026-04-27: 哲学シリーズも開放済み。タップをフィルタしてた早期 return を削除した。
    if (s.premium && !premium) { onUpgrade(); return }
    if (!premium && remaining <= 0) { onUpgrade(); return }
    onStart(s.id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 40px', background: v3.color.bg, minHeight: '100vh', color: v3.color.text, fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px' }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: v3.color.text, letterSpacing: '-.02em' }}>
            ロールプレイ
          </div>
          <div style={{ fontSize: 14, color: v3.color.text2, marginTop: 1 }}>
            実践的な思考力を鍛える
          </div>
        </div>
      </div>

      {/* 残り回数バッジ */}
      {!premium && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 14, color: 'var(--md-sys-color-primary)', fontWeight: 600 }}>今月の残り回数</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>
            {remaining} / {ROLEPLAY_FREE_LIMIT}
          </span>
        </div>
      )}

      {/* ビジネス思考 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 14, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 12,
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
            fontSize: 14, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginBottom: 12,
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
