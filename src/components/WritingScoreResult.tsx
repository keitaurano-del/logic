/**
 * WritingScoreResult — LW-5
 * Polished score card for the PREP writing assessment.
 * Shown after AI scoring in ThinkSlide (LessonStoriesScreen).
 */
import type { ScoringResult } from '../../server/routes/writing-score'
import { t } from '../i18n'
import { SparklesIcon, ThumbsUpIcon, LightbulbIcon } from '../icons'

// ── Score color helpers ────────────────────────────────────────────────────

/** Map a PREP axis score (0-5) to the appropriate CSS variable name. */
function prepScoreColor(score: number): string {
  if (score === 5) return 'var(--score-excellent)'
  if (score === 4) return 'var(--score-good)'
  if (score === 3) return 'var(--score-keep)'
  return 'var(--score-retry)'
}

/** Map an overall score (0-100) to the appropriate CSS variable name. */
function overallScoreColor(score: number): string {
  if (score >= 80) return 'var(--score-excellent)'
  if (score >= 60) return 'var(--score-good)'
  if (score >= 40) return 'var(--score-keep)'
  return 'var(--score-retry)'
}

/** Map a PREP axis score (0-5) to a readable label string (used for a11y). */
function prepScoreLabel(score: number): string {
  if (score === 5) return 'excellent'
  if (score === 4) return 'good'
  if (score === 3) return 'keep'
  return 'retry'
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface PrepAxisProps {
  label: string
  score: number
}

function PrepAxis({ label, score }: PrepAxisProps) {
  const color = prepScoreColor(score)
  const barPct = Math.round((score / 5) * 100)

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--s-1)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--s-3) var(--s-2)',
      }}
    >
      {/* Numeric score */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-full)',
          background: `color-mix(in srgb, ${color} 18%, transparent)`,
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.15rem',
          color: color,
          flexShrink: 0,
        }}
        aria-label={`${label}: ${score} out of 5, ${prepScoreLabel(score)}`}
      >
        {score}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 5,
          borderRadius: 99,
          background: 'var(--bg-tertiary)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: `${barPct}%`,
            background: color,
            borderRadius: 99,
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Label + denominator */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            lineHeight: 1.3,
            letterSpacing: '.01em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            marginTop: 1,
          }}
          aria-hidden="true"
        >
          / 5
        </div>
      </div>
    </div>
  )
}

// ── FeedbackSection ────────────────────────────────────────────────────────

interface FeedbackSectionProps {
  icon: React.ReactNode
  label: string
  text: string
  accentColor: string
}

function FeedbackSection({ icon, label, text, accentColor }: FeedbackSectionProps) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        padding: 'var(--s-3) var(--s-4)',
        background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
          marginBottom: 'var(--s-2)',
        }}
      >
        <span
          style={{ color: accentColor, display: 'flex', flexShrink: 0 }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
        }}
      >
        {text}
      </p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export interface WritingScoreResultProps {
  result: ScoringResult
  locale: 'ja' | 'en'
}

export function WritingScoreResult({ result, locale }: WritingScoreResultProps) {
  const { scores } = result
  const overallColor = overallScoreColor(scores.overall)
  const commentText = locale === 'en' ? result.comments.en : result.comments.ja
  const strengthText = locale === 'en' ? result.strengths.en : result.strengths.ja
  const improvementText = locale === 'en' ? result.improvements.en : result.improvements.ja

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--s-4) var(--s-5)',
        marginBottom: 'var(--s-5)',
        border: `1.5px solid color-mix(in srgb, var(--brand) 24%, transparent)`,
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-4)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
        }}
      >
        <span style={{ color: 'var(--brand)', display: 'flex' }} aria-hidden="true">
          <SparklesIcon width={16} height={16} />
        </span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--brand)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          {t('stories.scoreResult')}
        </span>
      </div>

      {/* ── Overall score badge ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--s-2)',
        }}
        aria-label={`${t('stories.scoreOverall')}: ${scores.overall} / 100`}
      >
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            letterSpacing: '.02em',
          }}
          aria-hidden="true"
        >
          {t('stories.scoreOverall')}
        </div>

        {/* Circular badge */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 'var(--radius-full)',
            background: `color-mix(in srgb, ${overallColor} 16%, transparent)`,
            border: `3px solid ${overallColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px color-mix(in srgb, ${overallColor} 30%, transparent)`,
          }}
          aria-hidden="true"
        >
          <span
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: overallColor,
              lineHeight: 1,
            }}
          >
            {scores.overall}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* ── PREP axes ── */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--s-2)',
        }}
        role="group"
        aria-label="PREP scores"
      >
        <PrepAxis label={t('stories.scorePrepPoint')} score={scores.point} />
        <PrepAxis label={t('stories.scorePrepReason')} score={scores.reason} />
        <PrepAxis label={t('stories.scorePrepExample')} score={scores.example} />
      </div>

      {/* ── Comment ── */}
      <div>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            marginBottom: 'var(--s-2)',
          }}
        >
          {t('stories.scoreComment')}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
          }}
        >
          {commentText}
        </p>
      </div>

      {/* ── Strengths ── */}
      <FeedbackSection
        icon={<ThumbsUpIcon width={14} height={14} />}
        label={t('stories.scoreStrengths')}
        text={strengthText}
        accentColor="var(--score-excellent)"
      />

      {/* ── Improvements ── */}
      <FeedbackSection
        icon={<LightbulbIcon width={14} height={14} />}
        label={t('stories.scoreImprovements')}
        text={improvementText}
        accentColor="var(--score-good)"
      />
    </div>
  )
}
