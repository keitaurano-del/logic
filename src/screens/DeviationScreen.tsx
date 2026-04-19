import { loadPlacementResult, rankLabel, recommendedLessons } from '../placementData'
import { ArrowLeftIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { deviationToTopPercent } from './homeHelpers'
import { t } from '../i18n'

interface DeviationScreenProps {
  onBack: () => void
  onRetakeTest: () => void
  onStartLesson: (lessonId: number) => void
}

export function DeviationScreen({ onBack, onRetakeTest, onStartLesson }: DeviationScreenProps) {
  const result = loadPlacementResult()

  if (!result) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
          <div className="progress-text">偏差値</div>
        </div>
        <div className="card empty">
          <h3 style={{ fontSize: 17, marginBottom: 'var(--s-2)' }}>
            プレースメントテスト未完了
          </h3>
          <p className="muted" style={{ fontSize: 13 }}>
            テストを受けると偏差値が算出されます
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onRetakeTest}
            style={{ marginTop: 'var(--s-4)' }}
          >
            テストを受ける
          </Button>
        </div>
      </div>
    )
  }

  const rank = rankLabel(result.deviation)
  const topPct = deviationToTopPercent(result.deviation)
  const fill = Math.min(100, Math.max(10, 100 - topPct))
  const recommended = recommendedLessons(result.deviation)

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">偏差値</div>
      </div>

      <div className="eyebrow accent">あなたの結果</div>

      <section
        className="profile-hero"
        style={{ marginTop: 'var(--s-3)' }}
      >
        <div
          className="eyebrow"
          style={{
            color: 'rgba(255,255,255,0.65)',
            marginBottom: 'var(--s-3)',
            position: 'relative',
          }}
        >
          偏差値スコア
        </div>
        <div
          className="display"
          style={{
            fontSize: 80,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {result.deviation}
        </div>
        <div
          style={{
            marginTop: 'var(--s-3)',
            position: 'relative',
            fontSize: 13,
            color: 'rgba(255,255,255,0.78)',
            fontWeight: 500,
          }}
        >
          {result.correctCount} / {result.totalCount} correct
        </div>
      </section>

      <section className="rank-card">
        <div className="rank-eyebrow">{t('home.nationalRanking')}</div>
        <div className="rank-row">
          <div className="rank-num">
            {topPct}
            <span className="rank-num-unit">%</span>
          </div>
          <div>
            <div className="rank-meta-top">{t('ranking.topPercent', { pct: topPct })}</div>
            <div className="rank-meta-sub">{rank.label}</div>
          </div>
        </div>
        <div className="rank-bar">
          <div className="rank-bar-fill" style={{ width: `${fill}%` }} />
        </div>
      </section>

      <div className="card" style={{ marginTop: 'var(--s-3)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>
          コメント
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>{rank.comment}</p>
      </div>

      {recommended.length > 0 && (
        <section style={{ marginTop: 'var(--s-4)' }}>
          <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>
            おすすめレッスン
          </h2>
          <div className="stack-sm">
            {recommended.map((id) => (
              <button
                key={id}
                className="card card-compact"
                onClick={() => onStartLesson(id)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--s-3)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  Lesson #{id}
                </span>
                <span className="badge badge-accent">おすすめ</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <Button
        variant="default"
        size="lg"
        block
        onClick={onRetakeTest}
        style={{ marginTop: 'var(--s-4)' }}
      >
        テストを受け直す
      </Button>
    </div>
  )
}
