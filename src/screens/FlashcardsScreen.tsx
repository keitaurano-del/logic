import { Fragment, type ReactNode, useMemo, useState } from 'react'
import { getDueCards, getWeakCards, previewIntervals, reviewCard, type Flashcard } from '../flashcardData'
import { CheckIcon, SparklesIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import { useStudyTimer } from '../hooks/useStudyTimer'
import { FeaturePreviewBanner } from '../components/FeaturePreviewBanner'
import './FlashcardsScreen.css'

interface FlashcardsScreenProps {
  onBack: () => void
  mode?: 'due' | 'weak'
  onUpgrade?: () => void
}

/**
 * カード本文をレンダリング前にクリーンにする。
 * 過去バージョンが残した <br/> や [icon:...]・::: callout フェンス等の markup が
 * localStorage の既存カードに混ざっているため、表示前に素のテキストへ落とす。
 */
function sanitizeCardText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n') // <br/> → 改行
    .replace(/\[icon:[a-z0-9-]+\]/gi, '') // [icon:xxx] 除去
    .replace(/^:::[a-z]*\s*$/gim, '') // ::: callout フェンス除去
    .replace(/\n{3,}/g, '\n\n') // 連続改行を圧縮
    .trim()
}

/** サニタイズ済みテキストを改行ごとに <br /> 区切りで JSX 化する。 */
function renderCardContent(text: string): ReactNode {
  const clean = sanitizeCardText(text)
  return clean.split('\n').map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}

export function FlashcardsScreen({ onBack, mode = 'due', onUpgrade }: FlashcardsScreenProps) {
  // 学習時間計測 — フラッシュカード画面の滞在時間を study_sessions に記録
  useStudyTimer({ type: 'flashcard', id: mode })
  const [queue] = useState<Flashcard[]>(() =>
    mode === 'weak' ? getWeakCards() : getDueCards(),
  )
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const total = useMemo(() => queue.length, [queue.length])

  const card = queue[idx]
  const done = idx >= queue.length

  // 各評価ボタンに「次はいつ復習になるか」を添えるためのラベル（good と easy の差を可視化）。
  const nextLabels = useMemo(() => {
    if (!card) return null
    const iv = previewIntervals(card)
    const fmt = (days: number) =>
      days <= 0 ? t('flashcards.nextSoon') : t('flashcards.nextDays', { days })
    return { again: fmt(iv.again), good: fmt(iv.good), easy: fmt(iv.easy) }
  }, [card])

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

  if (onUpgrade) {
    return (
      <div className="stack">
        <Header title={t('reviewHub.flashcardsTitle')} onBack={onBack} />
        <div style={{ padding: '24px 16px 120px' }}>
          <FeaturePreviewBanner feature="flashcards" onUpgrade={onUpgrade} />
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <Header title={done ? t('flashcards.headerDone') : `${Math.min(idx + 1, total)} / ${total}`} onBack={onBack} />

      <div className="fc3-page">
        {total > 0 && !done && (
          <div className="fc3-progress" role="progressbar" aria-valuenow={idx + 1} aria-valuemin={0} aria-valuemax={total}>
            <div
              className="fc3-progress-fill"
              style={{ width: `${((idx + 1) / total) * 100}%` }}
            />
          </div>
        )}

        {total === 0 ? (
          <div className="card empty" style={{ padding: 'var(--s-7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s-3)', color: 'var(--brand)' }}>
              <SparklesIcon width={36} height={36} />
            </div>
            <h3 style={{ fontSize: '1.3333rem', marginBottom: 'var(--s-2)' }}>
              {mode === 'weak'
                ? t('flashcards.emptyWeak')
                : t('flashcards.emptyDue')}
            </h3>
            <p className="muted" style={{ fontSize: '1.0667rem' }}>
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

            {/*
              key={idx} forces remount so the enter animation re-plays per card.
              The enter animation lives on .fc3-stage (the OUTER container),
              never on .fc3-card-inner, so it never fights the flip transform.
            */}
            <div className="fc3-stage is-entering" key={idx}>
              <button
                type="button"
                onClick={handleFlip}
                className={`fc3-card${flipped ? ' is-flipped' : ''}`}
                aria-pressed={flipped}
                aria-label={flipped ? t('label.answer') : t('label.question')}
              >
                <div className="fc3-card-inner">
                  <div className="fc3-face fc3-face-front">
                    <div className="fc3-face-eyebrow">{t('label.question')}</div>
                    <div className="fc3-face-text">{renderCardContent(card.front)}</div>
                    <div className="fc3-flip-hint">{t('flashcards.flipHint')}</div>
                  </div>
                  <div className="fc3-face fc3-face-back">
                    <div className="fc3-face-eyebrow">{t('label.answer')}</div>
                    <div className="fc3-face-text fc3-back-text">{renderCardContent(card.back)}</div>
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
                    <span className="fc3-rate">
                      <span className="fc3-rate-label">{t('flashcards.again')}</span>
                      <span className="fc3-rate-next">{nextLabels?.again}</span>
                    </span>
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    block
                    onClick={() => handleReview('good')}
                  >
                    <span className="fc3-rate">
                      <span className="fc3-rate-label">{t('flashcards.good')}</span>
                      <span className="fc3-rate-next">{nextLabels?.good}</span>
                    </span>
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    block
                    onClick={() => handleReview('easy')}
                  >
                    <span className="fc3-rate">
                      <span className="fc3-rate-label">{t('flashcards.easy')}</span>
                      <span className="fc3-rate-next">{nextLabels?.easy}</span>
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
