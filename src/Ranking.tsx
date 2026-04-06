import { useEffect, useState } from 'react'
import { getGuestId } from './guestId'
import { hasCompletedPlacement, loadPlacementResult } from './placementTest'
import './Ranking.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

type RankEntry = { rank: number; nickname: string; deviation: number; isYou: boolean }
type RankingData = { total: number; top: RankEntry[]; yourRank: number; yourDeviation: number }

type Props = { onBack: () => void; onTakeTest: () => void }

export default function Ranking({ onBack, onTakeTest }: Props) {
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const completed = hasCompletedPlacement() && (loadPlacementResult()?.totalCount ?? 0) > 0

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/placement/ranking?guestId=${encodeURIComponent(getGuestId())}`)
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
    return () => { cancelled = true }
  }, [])

  return (
    <div className="rk-screen">
      <header className="rk-header">
        <button className="rk-back" onClick={onBack}>‹</button>
        <span>偏差値ランキング</span>
        <span className="rk-header-spacer" />
      </header>

      <div className="rk-content">
        {!completed && (
          <div className="rk-cta-card">
            <div className="rk-cta-emoji">📋</div>
            <h3>まだプレイスメントテストを受けていません</h3>
            <p>テストを受けると、偏差値ランキングに参加できます。</p>
            <button className="rk-cta-btn" onClick={onTakeTest}>テストを受ける</button>
          </div>
        )}

        {loading && <div className="rk-loading">読み込み中...</div>}

        {error && <div className="rk-error">ランキングの取得に失敗しました</div>}

        {data && data.total === 0 && !loading && (
          <div className="rk-empty">まだ参加者がいません。</div>
        )}

        {data && data.total > 0 && (
          <>
            <div className="rk-summary">
              <div className="rk-summary-row">
                <div>
                  <div className="rk-summary-label">参加者</div>
                  <div className="rk-summary-value">{data.total}<span>人</span></div>
                </div>
                {data.yourRank > 0 && (
                  <>
                    <div className="rk-summary-divider" />
                    <div>
                      <div className="rk-summary-label">あなたの順位</div>
                      <div className="rk-summary-value">{data.yourRank}<span>位</span></div>
                    </div>
                    <div className="rk-summary-divider" />
                    <div>
                      <div className="rk-summary-label">偏差値</div>
                      <div className="rk-summary-value">{data.yourDeviation}</div>
                    </div>
                  </>
                )}
              </div>
              {data.yourRank > 0 && (
                <div className="rk-summary-percent">
                  上位 {Math.round((data.yourRank / data.total) * 100)}%
                </div>
              )}
            </div>

            <h3 className="rk-section-title">トップランキング</h3>
            <div className="rk-list">
              {data.top.map((e) => (
                <div key={`${e.rank}-${e.nickname}`} className={`rk-row ${e.isYou ? 'you' : ''} ${e.rank <= 3 ? 'top' : ''}`}>
                  <div className={`rk-rank ${e.rank <= 3 ? `medal-${e.rank}` : ''}`}>
                    {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : e.rank}
                  </div>
                  <div className="rk-name">{e.nickname}{e.isYou && <span className="rk-you-badge">YOU</span>}</div>
                  <div className="rk-dev">偏差値 <strong>{e.deviation}</strong></div>
                </div>
              ))}
            </div>

            {completed && (
              <button className="rk-retake-btn" onClick={onTakeTest}>もう一度テストを受ける</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
