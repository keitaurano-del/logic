import { useState, useEffect } from 'react'
import { v3 } from '../styles/tokensV3'
import { getXp } from '../stats'
import { getGuestId, getNickname } from '../guestId'
import { API_BASE } from './apiBase'

interface RankEntry {
  rank: number
  name: string
  score: number
  isMe?: boolean
}

export function FermiRankingScreen() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')
  const [entries, setEntries] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const myScore = getXp()

  useEffect(() => {
    let cancelled = false
    const guestId = getGuestId()
    const nickname = getNickname()
    const run = async () => {
      try {
        await fetch(`${API_BASE}/api/profile/sync-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId, nickname, xp: myScore }),
        })
      } catch { /* オフライン時は無視 */ }
      try {
        const r = await fetch(`${API_BASE}/api/placement/ranking?guestId=${encodeURIComponent(guestId)}`)
        const d = await r.json()
        if (!cancelled && d.top) {
          const mapped: RankEntry[] = d.top.map((e: { rank: number; nickname: string; xp: number; isYou: boolean }) => ({
            rank: e.rank,
            name: e.nickname,
            score: e.xp,
            isMe: e.isYou,
          }))
          setEntries(mapped)
        }
      } catch { /* ネットワークエラー時は空リスト */ }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [myScore])

  // 期間フィルタ: APIがupdated_atを返さないため現状はalltime相当で表示
  const filtered = entries

  const myEntry = filtered.find(e => e.isMe)
  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  const periodLabel = { weekly: '今週', monthly: '今月', alltime: '累計' }

  return (
    <div style={{ minHeight: '100vh', background: v3.color.bg, fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>

      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>ランキング </div>
        <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 4 }}>フェルミ推定スコアの合計で競おう</div>
      </div>

      {/* 期間タブ */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        {(['weekly', 'monthly', 'alltime'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '8px 16px', borderRadius: 99,
            border: `1.5px solid ${period === p ? v3.color.accent : v3.color.line}`,
            background: period === p ? v3.color.accentSoft : 'transparent',
            color: period === p ? v3.color.accent : v3.color.text2,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {/* ローディング */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: v3.color.text3, fontSize: 14 }}>
          読み込み中...
        </div>
      )}

      {/* 自分のスコア */}
      {myEntry && (
        <div style={{
          margin: '0 20px 20px',
          background: `${v3.color.accent}15`,
          border: `1.5px solid ${v3.color.accent}40`,
          borderRadius: 16, padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: v3.color.accent, fontWeight: 700, marginBottom: 4 }}>あなたの順位</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: v3.color.accent }}>{myEntry.rank}</span>
              <span style={{ fontSize: 14, color: v3.color.text2 }}>位</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: v3.color.text2, marginBottom: 4 }}>スコア</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{myScore.toLocaleString()}<span style={{ fontSize: 11, color: v3.color.text3, marginLeft: 2 }}>pt</span></div>
          </div>
        </div>
      )}

      {/* TOP3 */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ fontSize: 12, color: v3.color.text3, fontWeight: 700, letterSpacing: '.08em', marginBottom: 10 }}>TOP 3</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top3.map(e => <RankCard key={e.rank} entry={e} />)}
        </div>
      </div>

      {/* 4位以降 */}
      {rest.length > 0 && (
        <div style={{ padding: '0 20px 100px' }}>
          <div style={{ fontSize: 12, color: v3.color.text3, fontWeight: 700, letterSpacing: '.08em', margin: '8px 0 10px' }}>4位以降</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map(e => <RankCard key={e.rank} entry={e} compact />)}
          </div>
        </div>
      )}
    </div>
  )
}

function RankCard({ entry, compact }: { entry: RankEntry; compact?: boolean }) {
  const medal = entry.rank === 1 ? '' : entry.rank === 2 ? '' : entry.rank === 3 ? '' : null

  return (
    <div style={{
      background: entry.isMe ? `${v3.color.accent}15` : v3.color.card,
      border: `1.5px solid ${entry.isMe ? v3.color.accent : v3.color.line}`,
      borderRadius: compact ? 12 : 16,
      padding: compact ? '12px 14px' : '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      {/* 順位バッジ */}
      <div style={{
        width: compact ? 32 : 40, height: compact ? 32 : 40, borderRadius: '50%', flexShrink: 0,
        background: entry.rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)'
          : entry.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #909090)'
          : entry.rank === 3 ? 'linear-gradient(135deg, #CD7F32, #A0522D)'
          : v3.color.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {medal
          ? <span style={{ fontSize: compact ? 16 : 20 }}>{medal}</span>
          : <span style={{ fontSize: 13, fontWeight: 700, color: v3.color.text2 }}>{entry.rank}</span>
        }
      </div>

      {/* 名前 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 14 : 15, fontWeight: entry.isMe ? 800 : 600,
          color: entry.isMe ? v3.color.accent : v3.color.text,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {entry.name}
          {entry.isMe && <span style={{ fontSize: 11, background: v3.color.accent, color: '#fff', borderRadius: 4, padding: '1px 6px' }}>YOU</span>}
        </div>
      </div>

      {/* スコア */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontSize: compact ? 15 : 18, fontWeight: 800 }}>{entry.score.toLocaleString()}</span>
        <span style={{ fontSize: 11, color: v3.color.text3, marginLeft: 2 }}>pt</span>
      </div>
    </div>
  )
}
