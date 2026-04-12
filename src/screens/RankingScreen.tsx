import { useEffect, useState } from 'react'
import { getGuestId } from '../guestId'
import { hasCompletedPlacement, loadPlacementResult } from '../placementData'
import { ArrowLeftIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { API_BASE } from './apiBase'
import { t } from '../i18n'

interface RankingScreenProps {
  onBack: () => void
  onTakeTest: () => void
}

type RankEntry = { rank: number; nickname: string; deviation: number; isYou: boolean }
type RankingData = { total: number; top: RankEntry[]; yourRank: number; yourDeviation: number }

export function RankingScreen({ onBack, onTakeTest }: RankingScreenProps) {
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const completed =
    hasCompletedPlacement() && (loadPlacementResult()?.totalCount ?? 0) > 0

  useEffect(() => {
    let cancelled = false
    fetch(
      `${API_BASE}/api/placement/ranking?guestId=${encodeURIComponent(getGuestId())}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">RANKING</div>
      </div>

      <div className="eyebrow accent">NATIONAL LEADERBOARD</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>
        {t('ranking.title')}
      </h1>

      {!completed && (
        <div className="card" style={{ marginTop: 'var(--s-3)' }}>
          <div style={{ fontSize: 36, marginBottom: 'var(--s-2)' }}>📋</div>
          <h3 style={{ fontSize: 17, marginBottom: 'var(--s-2)' }}>
            プレースメントテストを受ける
          </h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 'var(--s-4)' }}>
            8 問のテストで偏差値を算出して、全国のユーザーとランキング比較できます
          </p>
          <Button variant="primary" size="lg" onClick={onTakeTest}>
            テストを受ける
          </Button>
        </div>
      )}

      {loading && <div className="card empty">読み込み中…</div>}

      {error && (
        <div className="card empty">
          ランキングの取得に失敗しました
        </div>
      )}

      {data && data.total === 0 && !loading && (
        <div className="card empty">まだ参加者がいません</div>
      )}

      {data && data.total > 0 && (
        <>
          {data.yourRank > 0 && (
            <section className="rank-card" style={{ marginTop: 'var(--s-3)' }}>
              <div className="rank-eyebrow">YOUR RANK</div>
              <div className="rank-row">
                <div className="rank-num">{data.yourRank}</div>
                <div>
                  <div className="rank-meta-top">
                    / {data.total} 人中
                  </div>
                  <div className="rank-meta-sub">
                    偏差値 {data.yourDeviation}
                    {' · '}
                    上位 {Math.round((data.yourRank / data.total) * 100)}%
                  </div>
                </div>
              </div>
              <div className="rank-bar">
                <div
                  className="rank-bar-fill"
                  style={{
                    width: `${Math.max(5, 100 - Math.round((data.yourRank / data.total) * 100))}%`,
                  }}
                />
              </div>
            </section>
          )}

          <section style={{ marginTop: 'var(--s-4)' }}>
            <h2 style={{ fontSize: 17, marginBottom: 'var(--s-3)' }}>Top players</h2>
            <div className="stack-sm">
              {data.top.map((e) => {
                const isMedal = e.rank <= 3
                const medal = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : null
                return (
                  <div
                    key={`${e.rank}-${e.nickname}`}
                    className="card card-compact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--s-3)',
                      border: e.isYou
                        ? '2px solid var(--brand)'
                        : '1px solid var(--border)',
                      background: e.isYou ? 'var(--brand-soft)' : 'var(--bg-card)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        fontFamily: 'var(--font-display)',
                        fontSize: isMedal ? 24 : 18,
                        fontWeight: 900,
                        color: isMedal ? 'var(--brand)' : 'var(--text-muted)',
                        textAlign: 'center',
                      }}
                    >
                      {medal ?? e.rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {e.nickname}
                        {e.isYou && (
                          <span
                            className="badge badge-accent"
                            style={{ marginLeft: 'var(--s-2)' }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--brand)',
                      }}
                    >
                      {e.deviation}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {completed && (
            <Button
              variant="default"
              size="lg"
              block
              onClick={onTakeTest}
              style={{ marginTop: 'var(--s-4)' }}
            >
              テストを受け直す
            </Button>
          )}
        </>
      )}
    </div>
  )
}
