import { useMemo, useState } from 'react'
import { getDueCards, getWeakCards, reviewCard, type Flashcard } from '../flashcardData'
import { CheckIcon, SparklesIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'

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
      <Header title={done ? '完了' : `${Math.min(idx + 1, total)} / ${total}`} onBack={onBack} />

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s-3)', color: 'var(--accent)' }}>
            <SparklesIcon width={36} height={36} />
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 'var(--s-2)' }}>
            {mode === 'weak'
              ? '復習する弱点カードはありません'
              : '復習するカードはありません'}
          </h3>
          <p className="muted" style={{ fontSize: 16 }}>
            {mode === 'weak'
              ? 'まだ間違えた問題がありません。レッスンを進めましょう。'
              : 'レッスンを完了するとここにカードが追加されます'}
          </p>
        </div>
      ) : done ? (
        <div className="feedback-card" style={{ textAlign: 'center' }}>
          <div className="feedback-head" style={{ justifyContent: 'center' }}>
            <div className="feedback-check">
              <CheckIcon />
            </div>
            <div className="feedback-title">All done!</div>
          </div>
          <div className="feedback-text" style={{ marginTop: 'var(--s-2)' }}>
            {total} 枚の復習を完了しました
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onBack}
            style={{ marginTop: 'var(--s-4)' }}
          >
            戻る
          </Button>
        </div>
      ) : (
        <>
          <div className="eyebrow accent" style={{ marginBottom: 'var(--s-3)' }}>
            FLASHCARD · {card.category.toUpperCase()}
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="card"
            style={{
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--s-6) var(--s-5)',
              cursor: 'pointer',
              textAlign: 'center',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-card)',
              transition: 'border-color 120ms ease',
            }}
          >
            <div>
              <div
                className="eyebrow"
                style={{ marginBottom: 'var(--s-3)', color: 'var(--text-muted)' }}
              >
                {flipped ? t('label.answer') : t('label.question')}
              </div>
              <div
                className="display"
                style={{
                  fontSize: 26,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {flipped ? card.back : card.front}
              </div>
              {!flipped && (
                <div
                  className="muted"
                  style={{ marginTop: 'var(--s-4)', fontSize: 14 }}
                >
                  タップで答えを見る
                </div>
              )}
            </div>
          </button>

          {flipped && (
            <div
              className="stack"
              style={{ marginTop: 'var(--s-5)', gap: 'var(--s-2)' }}
            >
              <div className="row" style={{ gap: 'var(--s-2)' }}>
                <Button
                  variant="danger"
                  size="lg"
                  block
                  onClick={() => handleReview('again')}
                >
                  もう一度
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  block
                  onClick={() => handleReview('good')}
                >
                  わかった
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  block
                  onClick={() => handleReview('easy')}
                >
                  簡単
                </Button>
              </div>
              <div
                className="muted"
                style={{ fontSize: 14, textAlign: 'center', marginTop: 'var(--s-2)' }}
              >
                間隔: {card.interval}日 · ease: {card.ease.toFixed(1)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
