import { useMemo, useState } from 'react'
import { getDueCards, getWeakCards, reviewCard, type Flashcard } from '../flashcardData'
import { CheckIcon, SparklesIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import './FlashcardsScreen.css'

interface FlashcardsScreenProps {
  onBack: () => void
  mode?: 'due' | 'weak'
}

export function FlashcardsScreen({ onBack, mode = 'due' }: FlashcardsScreenProps) {
  const [queue] = useState<Flashcard[]>(() =>
    mode === 'weak' ? getWeakCards() : getDueCards(),
  )
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const total = useMemo(() => queue.length, [queue.length])

  const card = queue[idx]
  const done = idx >= queue.length

  const handleFlip = () => {
    haptic.selection()
    setFlipped((f) => !f)
  }

  const handleReview = (quality: 'again' | 'good' | 'easy') => {
    if (!card) return
    if (quality === 'again') haptic.warning()
    else haptic.selection()
    reviewCard(card.id, quality)
    setIdx((i) => i + 1)
    setFlipped(false)
  }

  return (
    <div className="stack">
      <Header title={done ? t('flashcards.headerDone') : `${Math.min(idx + 1, total)} / ${total}`} onBack={onBack} />

      {total > 0 && !done && (
        <div className="progress" style={{ marginBottom: 'var(--s-5)' }}>
          <div
            className="progress-fill"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>
      )}

      {total === 0 ? (
        <div className="card empty" style={{ padding: 'var(--s-7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s-3)', color: 'var(--brand)' }}>
            <SparklesIcon width={36} height={36} />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 'var(--s-2)' }}>
            {mode === 'weak'
              ? t('flashcards.emptyWeak')
              : t('flashcards.emptyDue')}
          </h3>
          <p className="muted" style={{ fontSize: 16 }}>
            {mode === 'weak'
              ? t('flashcards.emptyWeakDesc')
              : t('flashcards.emptyDueDesc')}
          </p>
        </div>
      ) : done ? (
        <div className="feedback-card" style={{ textAlign: 'center' }}>
          <div className="feedback-head" style={{ justifyContent: 'center' }}>
            <div className="feedback-check">
              <CheckIcon />
            </div>
            <div className="feedback-title">{t('flashcards.allDone')}</div>
          </div>
          <div className="feedback-text" style={{ marginTop: 'var(--s-2)' }}>
            {t('flashcards.allDoneDesc', { total })}
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onBack}
            style={{ marginTop: 'var(--s-4)' }}
          >
            {t('flashcards.back')}
          </Button>
        </div>
      ) : (
        <>
          <div className="fc3-eyebrow">
            FLASHCARD · {card.category.toUpperCase()}
          </div>

          {/* key={idx} forces remount → re-plays the enter animation per card */}
          <div className="fc3-stage" key={idx}>
            <button
              type="button"
              onClick={handleFlip}
              className={`fc3-card is-entering${flipped ? ' is-flipped' : ''}`}
              aria-pressed={flipped}
              aria-label={flipped ? t('label.answer') : t('label.question')}
            >
              <div className="fc3-card-inner">
                <div className="fc3-face fc3-face-front">
                  <div className="fc3-face-eyebrow">{t('label.question')}</div>
                  <div className="fc3-face-text">{card.front}</div>
                  <div className="fc3-flip-hint">{t('flashcards.flipHint')}</div>
                </div>
                <div className="fc3-face fc3-face-back">
                  <div className="fc3-face-eyebrow">{t('label.answer')}</div>
                  <div className="fc3-face-text fc3-back-text">{card.back}</div>
                </div>
              </div>
            </button>
          </div>

          {flipped && (
            <div className="fc3-actions">
              <div className="fc3-actions-row">
                <Button
                  variant="danger"
                  size="lg"
                  block
                  onClick={() => handleReview('again')}
                >
                  {t('flashcards.again')}
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  block
                  onClick={() => handleReview('good')}
                >
                  {t('flashcards.good')}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  block
                  onClick={() => handleReview('easy')}
                >
                  {t('flashcards.easy')}
                </Button>
              </div>
              <div className="fc3-meta">
                {t('flashcards.intervalEase', { interval: card.interval, ease: card.ease.toFixed(1) })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
