import { useEffect, useState } from 'react'
import { Header } from '../components/platform/Header'
import { BarChartIcon, BookmarkIcon, ClipboardListIcon, SparklesIcon, ChevronRightIcon } from '../icons'
import { getCardStats } from '../flashcardData'
import { getWrongAnswerStats } from '../wrongAnswerStore'
import { getSavedItemStats } from '../savedItemsStore'
import { API_BASE } from './apiBase'
import { getGuestId } from '../guestId'
import { t } from '../i18n'

interface Props {
  onBack: () => void
  onOpenFlashcards: (mode?: 'due' | 'weak') => void
  onOpenWrongAnswers: () => void
  onOpenFermiHistory: () => void
  onOpenSavedItems: () => void
}

interface FermiStats {
  total: number
  avgScore: number
}

export function ReviewHubScreen({ onBack, onOpenFlashcards, onOpenWrongAnswers, onOpenFermiHistory, onOpenSavedItems }: Props) {
  const cardStats = getCardStats()
  const wrongStats = getWrongAnswerStats()
  const savedStats = getSavedItemStats()
  const [fermiStats, setFermiStats] = useState<FermiStats | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const guestId = getGuestId()
        const res = await fetch(`${API_BASE}/api/fermi/history?guestId=${encodeURIComponent(guestId)}&limit=100`)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (cancelled) return
        const list = Array.isArray(data.history) ? data.history : []
        const scored = list.filter((x: { score: number | null }) => typeof x.score === 'number')
        const avg = scored.length > 0
          ? Math.round(scored.reduce((s: number, x: { score: number }) => s + x.score, 0) / scored.length)
          : 0
        setFermiStats({ total: list.length, avgScore: avg })
      } catch {
        if (cancelled) return
        setFermiStats({ total: 0, avgScore: 0 })
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('reviewHub.title')} onBack={onBack} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('reviewHub.lead')}
        </div>

        {/* Flashcards section */}
        <SectionCard
          icon={<SparklesIcon width={22} height={22} />}
          title={t('reviewHub.flashcardsTitle')}
          subtitle={
            cardStats.total === 0
              ? t('reviewHub.flashcardsNoCards')
              : t('reviewHub.flashcardsSummary', {
                  due: String(cardStats.due),
                  weak: String(cardStats.weak),
                  total: String(cardStats.total),
                })
          }
        >
          {cardStats.total === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('reviewHub.flashcardsHint')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: cardStats.weak > 0 ? '1fr 1fr' : '1fr', gap: 8 }}>
              <ActionButton
                primary
                disabled={cardStats.due === 0}
                label={cardStats.due > 0 ? t('reviewHub.openDue', { n: String(cardStats.due) }) : t('reviewHub.dueEmpty')}
                onClick={() => onOpenFlashcards('due')}
              />
              {cardStats.weak > 0 && (
                <ActionButton
                  label={t('reviewHub.openWeak', { n: String(cardStats.weak) })}
                  onClick={() => onOpenFlashcards('weak')}
                />
              )}
            </div>
          )}
        </SectionCard>

        {/* Saved items section */}
        <SectionCard
          icon={<BookmarkIcon width={22} height={22} />}
          title={t('reviewHub.savedTitle')}
          subtitle={
            savedStats.total === 0
              ? t('reviewHub.savedEmpty')
              : t('reviewHub.savedSummary', {
                  total: String(savedStats.total),
                  lesson: String(savedStats.byType.lesson),
                  course: String(savedStats.byType.course),
                })
          }
        >
          <button
            type="button"
            onClick={onOpenSavedItems}
            disabled={savedStats.total === 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: savedStats.total === 0 ? 'var(--bg-elevated)' : 'var(--brand)',
              color: savedStats.total === 0 ? 'var(--text-muted)' : 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: 14,
              fontWeight: 700,
              cursor: savedStats.total === 0 ? 'default' : 'pointer',
              fontFamily: "'Noto Sans JP', sans-serif",
              minHeight: 44,
            }}
          >
            <span>{savedStats.total === 0 ? t('reviewHub.savedDisabled') : t('reviewHub.openSaved')}</span>
            {savedStats.total > 0 && <ChevronRightIcon width={18} height={18} />}
          </button>
        </SectionCard>

        {/* Wrong-answer section */}
        <SectionCard
          icon={<ClipboardListIcon width={22} height={22} />}
          title={t('reviewHub.wrongAnswersTitle')}
          subtitle={
            wrongStats.total === 0
              ? t('reviewHub.wrongAnswersEmpty')
              : t('reviewHub.wrongAnswersSummary', {
                  unresolved: String(wrongStats.unresolved),
                  total: String(wrongStats.total),
                })
          }
        >
          <button
            type="button"
            onClick={onOpenWrongAnswers}
            disabled={wrongStats.total === 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: wrongStats.total === 0 ? 'var(--bg-elevated)' : 'var(--brand)',
              color: wrongStats.total === 0 ? 'var(--text-muted)' : 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: 14,
              fontWeight: 700,
              cursor: wrongStats.total === 0 ? 'default' : 'pointer',
              fontFamily: "'Noto Sans JP', sans-serif",
              minHeight: 44,
            }}
          >
            <span>{wrongStats.total === 0 ? t('reviewHub.wrongAnswersDisabled') : t('reviewHub.openWrongAnswers')}</span>
            {wrongStats.total > 0 && <ChevronRightIcon width={18} height={18} />}
          </button>
        </SectionCard>

        {/* Fermi history section */}
        <SectionCard
          icon={<BarChartIcon width={22} height={22} />}
          title={t('reviewHub.fermiTitle')}
          subtitle={
            !fermiStats || fermiStats.total === 0
              ? t('reviewHub.fermiEmpty')
              : t('reviewHub.fermiSummary', {
                  total: String(fermiStats.total),
                  avg: String(fermiStats.avgScore),
                })
          }
        >
          <button
            type="button"
            onClick={onOpenFermiHistory}
            disabled={!fermiStats || fermiStats.total === 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: !fermiStats || fermiStats.total === 0 ? 'var(--bg-elevated)' : 'var(--brand)',
              color: !fermiStats || fermiStats.total === 0 ? 'var(--text-muted)' : 'var(--accent-fg)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: 14,
              fontWeight: 700,
              cursor: !fermiStats || fermiStats.total === 0 ? 'default' : 'pointer',
              fontFamily: "'Noto Sans JP', sans-serif",
              minHeight: 44,
            }}
          >
            <span>
              {!fermiStats || fermiStats.total === 0
                ? t('reviewHub.fermiDisabled')
                : t('reviewHub.openFermiHistory')}
            </span>
            {fermiStats && fermiStats.total > 0 && <ChevronRightIcon width={18} height={18} />}
          </button>
        </SectionCard>
      </div>
    </div>
  )
}

function SectionCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-v3-card-inset)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </section>
  )
}

function ActionButton({ label, onClick, primary, disabled }: {
  label: string
  onClick: () => void
  primary?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-pill)',
        border: primary ? 'none' : `1px solid ${'var(--border)'}`,
        background: disabled ? 'var(--bg-elevated)' : primary ? 'var(--brand)' : 'transparent',
        color: disabled ? 'var(--text-muted)' : primary ? 'var(--accent-fg)' : 'var(--text-primary)',
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: "'Noto Sans JP', sans-serif",
        minHeight: 44,
      }}
    >
      {label}
    </button>
  )
}
