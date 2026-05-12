import { useState, useEffect, useMemo } from 'react'
import { TrophyIcon, MedalIcon } from '../icons'
import { getDisplayName } from '../stats'
import { getNickname } from '../guestId'
import { LoadingIndicator } from '../components/LoadingIndicator'
import { API_BASE } from './apiBase'
import { t } from '../i18n'

interface RankEntry {
  rank: number
  name: string
  score: number
  isMe?: boolean
  isMock?: boolean
}

type Period = 'week' | 'month' | 'alltime'

const PREV_RANK_KEY = (p: Period) => `logic-fermi-prev-rank-${p}`

export function FermiRankingScreen() {
  const [period, setPeriod] = useState<Period>('week')
  const [entries, setEntries] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [rankDelta, setRankDelta] = useState<number | null>(null)
  const [showRankUp, setShowRankUp] = useState(false)

  const myName = useMemo(() => getDisplayName() || getNickname() || t('home.guestName'), [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setRankDelta(null)
      setShowRankUp(false)
      try {
        const r = await fetch(`${API_BASE}/api/fermi/ranking?period=${period}`)
        const d = await r.json()
        if (cancelled) return
        const list = Array.isArray(d.ranking) ? d.ranking : []
        const ranked: RankEntry[] = list.map((row: { name: string; score: number; isMock?: boolean }, i: number) => ({
          rank: i + 1,
          name: row.name,
          score: row.score,
          isMock: row.isMock === true,
          // ダミー行に自分の名前が偶然一致しても自分扱いにしない
          isMe: row.isMock !== true && row.name === myName,
        }))
        setEntries(ranked)

        // 順位アップ判定
        const myEntry = ranked.find(e => e.isMe)
        if (myEntry) {
          try {
            const raw = localStorage.getItem(PREV_RANK_KEY(period))
            const prev = raw ? parseInt(raw, 10) : NaN
            if (Number.isFinite(prev) && prev > myEntry.rank) {
              setRankDelta(prev - myEntry.rank)
              setShowRankUp(true)
              setTimeout(() => setShowRankUp(false), 4500)
            }
            localStorage.setItem(PREV_RANK_KEY(period), String(myEntry.rank))
          } catch { /* */ }
        }
      } catch { /* network error: empty list */ }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [period, myName])

  const myEntry = entries.find(e => e.isMe)
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  const periodLabel = {
    week: t('fermiRank.period.week'),
    month: t('fermiRank.period.month'),
    alltime: t('fermiRank.period.alltime'),
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      <FermiRankingStyle />

      {/* 順位アップ・トースト */}
      {showRankUp && rankDelta != null && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 44px) + 64px)',
            left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--score-excellent-grad)',
            color: 'var(--score-excellent-on)',
            borderRadius: 99,
            padding: '12px 20px',
            boxShadow: '0 12px 32px rgba(112,216,189,0.45), 0 0 0 1px rgba(255,255,255,0.2) inset',
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.005em',
            animation: 'rankup-toast 0.55s cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 15 12 9 18 15" />
          </svg>
          {t('fermiRank.rankUp', { n: rankDelta })}
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 20px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 800 }}>
          <span>{t('fermiRank.heading')}</span>
          <TrophyIcon width={20} height={20} style={{ color: 'var(--medal-gold)' }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{t('fermiRank.subtitle')}</div>
      </div>

      {/* 期間タブ */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        {(['week', 'month', 'alltime'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '8px 16px', borderRadius: 99,
            border: `1.5px solid ${period === p ? 'var(--brand)' : 'var(--border)'}`,
            background: period === p ? 'var(--accent-soft)' : 'transparent',
            color: period === p ? 'var(--brand)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {/* ローディング */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <LoadingIndicator label={t('common.loading')} />
        </div>
      )}

      {/* 自分の順位 */}
      {!loading && myEntry && (
        <div
          style={{
            margin: '0 20px 20px',
            background: showRankUp
              ? 'linear-gradient(135deg, rgba(112,216,189,0.18), rgba(108,142,245,0.16))'
              : `color-mix(in srgb, var(--brand) 8%, transparent)`,
            border: `1.5px solid ${showRankUp ? 'var(--score-excellent)' : 'color-mix(in srgb, var(--brand) 25%, transparent)'}`,
            borderRadius: 16, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background 0.4s ease, border-color 0.4s ease',
            animation: showRankUp ? 'rankup-glow 1.4s ease-in-out 2' : undefined,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700, marginBottom: 4 }}>{t('fermiRank.yourRank')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: 32, fontWeight: 900, color: 'var(--brand)',
                  display: 'inline-block',
                  animation: showRankUp ? 'rankup-pop 0.5s cubic-bezier(.2,.8,.2,1) both' : undefined,
                }}
              >
                {myEntry.rank}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('fermiRank.rankUnit')}</span>
              {rankDelta != null && rankDelta > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                    fontSize: 12, fontWeight: 800,
                    color: 'var(--score-excellent-on)',
                    background: 'var(--score-excellent)',
                    borderRadius: 99,
                    padding: '2px 8px',
                    animation: 'rankup-badge 0.6s cubic-bezier(.2,.8,.2,1) both',
                  }}
                >
                  ▲{rankDelta}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('fermiRank.bestScore')}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{myEntry.score}</div>
          </div>
        </div>
      )}

      {/* TOP3 */}
      {!loading && top3.length > 0 && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.08em', marginBottom: 10 }}>{t('fermiRank.top3')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top3.map(e => <RankCard key={`${e.rank}-${e.name}`} entry={e} highlight={showRankUp && e.isMe} />)}
          </div>
        </div>
      )}

      {/* 4位以降 */}
      {!loading && rest.length > 0 && (
        <div style={{ padding: '0 20px 100px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.08em', margin: '8px 0 10px' }}>{t('fermiRank.fourPlus')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map(e => <RankCard key={`${e.rank}-${e.name}`} entry={e} compact highlight={showRankUp && e.isMe} />)}
          </div>
        </div>
      )}

      {/* 空状態 */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t('fermiRank.empty.title')}</div>
          <div style={{ fontSize: 13 }}>{t('fermiRank.empty.desc')}</div>
        </div>
      )}
    </div>
  )
}

function RankCard({ entry, compact, highlight }: { entry: RankEntry; compact?: boolean; highlight?: boolean }) {
  const isPodium = entry.rank >= 1 && entry.rank <= 3

  return (
    <div style={{
      background: entry.isMe ? `color-mix(in srgb, var(--brand) 8%, transparent)` : 'var(--bg-card)',
      border: `1.5px solid ${entry.isMe ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: compact ? 12 : 16,
      padding: compact ? '12px 14px' : '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      animation: highlight ? 'rankup-row 1.2s cubic-bezier(.2,.8,.2,1) both' : undefined,
      boxShadow: highlight ? '0 0 0 2px var(--score-excellent) inset, 0 8px 24px rgba(112,216,189,0.32)' : undefined,
    }}>
      {/* 順位バッジ */}
      <div style={{
        width: compact ? 32 : 40, height: compact ? 32 : 40, borderRadius: '50%', flexShrink: 0,
        background: entry.rank === 1 ? 'var(--medal-gold-grad)'
          : entry.rank === 2 ? 'var(--medal-silver-grad)'
          : entry.rank === 3 ? 'var(--medal-bronze-grad)'
          : 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // a11y: 順位 1-3 のメダルは色 (gold/silver/bronze) のみで差別化されているため、
        // スクリーンリーダー / 色覚多様性ユーザー向けに aria-label で順位を明示する。
      }}>
        {isPodium
          ? <MedalIcon width={compact ? 16 : 20} height={compact ? 16 : 20} aria-label={t('onboarding.slidesRankUnit', { n: entry.rank })} style={{ color: 'var(--text-on-hero)' }} />
          : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{entry.rank}</span>
        }
      </div>

      {/* 名前 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 14 : 15, fontWeight: entry.isMe ? 800 : 600,
          color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {entry.name}
          {entry.isMe && <span style={{ fontSize: 11, background: 'var(--brand)', color: 'var(--accent-fg)', borderRadius: 4, padding: '1px 6px' }}>YOU</span>}
        </div>
      </div>

      {/* スコア */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800 }}>{entry.score}</span>
      </div>
    </div>
  )
}

function FermiRankingStyle() {
  return (
    <style>{`
      @keyframes rankup-toast {
        0%   { opacity: 0; transform: translate(-50%, -16px) scale(0.92); }
        60%  { opacity: 1; transform: translate(-50%, 4px)   scale(1.04); }
        100% { opacity: 1; transform: translate(-50%, 0)     scale(1);    }
      }
      @keyframes rankup-pop {
        0%   { transform: scale(1);    color: ${'var(--brand)'}; }
        30%  { transform: scale(1.4);  color: var(--score-excellent); }
        60%  { transform: scale(0.96); color: var(--score-excellent); }
        100% { transform: scale(1);    color: ${'var(--brand)'}; }
      }
      @keyframes rankup-badge {
        0%   { opacity: 0; transform: translateY(-8px) scale(0.6); }
        60%  { opacity: 1; transform: translateY(2px)  scale(1.12); }
        100% { opacity: 1; transform: translateY(0)    scale(1);    }
      }
      @keyframes rankup-row {
        0%   { transform: translateY(8px) scale(0.98); }
        50%  { transform: translateY(-2px) scale(1.015); }
        100% { transform: translateY(0)   scale(1);    }
      }
      @keyframes rankup-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(112,216,189,0); }
        50%      { box-shadow: 0 0 0 6px rgba(112,216,189,0.18); }
      }
    `}</style>
  )
}
