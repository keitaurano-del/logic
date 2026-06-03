import { useState, useEffect, useMemo, useRef } from 'react'
import { ArrowRightIcon } from '../icons'
import { getDisplayName } from '../stats'
import { getNickname } from '../guestId'
import { LoadingIndicator } from '../components/LoadingIndicator'
import { API_BASE } from './apiBase'
import { t, getLocale } from '../i18n'

interface RankEntry {
  rank: number
  name: string
  score: number
  isMe?: boolean
  isMock?: boolean
  occupation?: string | null
}

type Period = 'week' | 'month' | 'alltime'

const PREV_RANK_KEY = (p: Period) => `logic-fermi-prev-rank-${p}`

// FB-36: ランキングは毎回サーバ→Supabase（2 往復 + cold start）で数秒かかるため、
// period 別に localStorage キャッシュして stale-while-revalidate する。
// マウント/period 切替時はキャッシュ値を即描画し、裏で最新を取得して差し替える。
// 初回（キャッシュ無し）のみローディングを出す。
const RANK_CACHE_KEY = (p: Period) => `logic-fermi-rank-cache-${p}`
interface RawRow { name: string; score: number; isMock?: boolean; occupation?: string | null }

function readRankCache(p: Period): RawRow[] | null {
  try {
    const raw = localStorage.getItem(RANK_CACHE_KEY(p))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; rows: RawRow[] }
    if (!parsed || !Array.isArray(parsed.rows)) return null
    return parsed.rows
  } catch { return null }
}

function writeRankCache(p: Period, rows: RawRow[]) {
  try {
    localStorage.setItem(RANK_CACHE_KEY(p), JSON.stringify({ ts: Date.now(), rows }))
  } catch { /* quota: ignore */ }
}

// userProfile.ts の Occupation enum と同じキー集合。
// 文字列だけで完結させたいのでここでローカル定義し、循環依存を避ける。
const OCCUPATION_BADGE_JA: Record<string, string> = {
  executive: '経営',
  consultant: 'コンサル',
  strategy: '企画',
  sales_marketing: '営業',
  engineering: 'エンジニア',
  admin: '管理部門',
  professional: '専門職',
  student: '学生',
  other: 'その他',
}

const OCCUPATION_BADGE_EN: Record<string, string> = {
  executive: 'Exec',
  consultant: 'Consultant',
  strategy: 'Strategy',
  sales_marketing: 'Sales',
  engineering: 'Engineer',
  admin: 'Admin',
  professional: 'Pro',
  student: 'Student',
  other: 'Other',
}

function occupationLabel(occ: string | null | undefined, locale: 'ja' | 'en'): string | null {
  if (!occ) return null
  const table = locale === 'en' ? OCCUPATION_BADGE_EN : OCCUPATION_BADGE_JA
  return table[occ] ?? null
}

interface FermiRankingScreenProps {
  onSolveFermi: () => void
}

export function FermiRankingScreen({ onSolveFermi }: FermiRankingScreenProps) {
  const myName = useMemo(() => getDisplayName() || getNickname() || t('home.guestName'), [])

  // 生レスポンス行 → 表示用エントリ（rank 採番 + 自分判定）。キャッシュ描画と本フェッチで共用。
  const toEntries = useMemo(() => (rows: RawRow[]): RankEntry[] =>
    rows.map((row, i) => ({
      rank: i + 1,
      name: row.name,
      score: row.score,
      isMock: row.isMock === true,
      // ダミー行に自分の名前が偶然一致しても自分扱いにしない
      isMe: row.isMock !== true && row.name === myName,
      occupation: row.occupation ?? null,
    })), [myName])

  // FB-36: 初回マウント時、キャッシュがあれば即それを初期 state にしてローディングを出さない。
  const initialPeriod: Period = 'week'
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [entries, setEntries] = useState<RankEntry[]>(() => {
    const cached = readRankCache(initialPeriod)
    return cached && cached.length > 0 ? toEntries(cached) : []
  })
  const [loading, setLoading] = useState(() => {
    const cached = readRankCache(initialPeriod)
    return !(cached && cached.length > 0)
  })
  const [rankDelta, setRankDelta] = useState<number | null>(null)
  const [showRankUp, setShowRankUp] = useState(false)

  // period 切替時のキャッシュ即描画は「レンダー中の state 調整」パターンで行う
  // （effect 内の同期 setState を避ける。React 公式の escape hatch）。
  const [hydratedPeriod, setHydratedPeriod] = useState<Period>(initialPeriod)
  if (period !== hydratedPeriod) {
    const cached = readRankCache(period)
    setHydratedPeriod(period)
    setEntries(cached && cached.length > 0 ? toEntries(cached) : [])
    setLoading(!(cached && cached.length > 0))
    setRankDelta(null)
    setShowRankUp(false)
  }

  // 順位アップ・トーストは「実フェッチ結果」に対してのみ判定する（キャッシュ即描画では出さない）。
  const rankUpTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const evalRankUp = useMemo(() => (ranked: RankEntry[], p: Period) => {
    const me = ranked.find(e => e.isMe)
    if (!me) return
    try {
      const raw = localStorage.getItem(PREV_RANK_KEY(p))
      const prev = raw ? parseInt(raw, 10) : NaN
      if (Number.isFinite(prev) && prev > me.rank) {
        setRankDelta(prev - me.rank)
        setShowRankUp(true)
        if (rankUpTimer.current) clearTimeout(rankUpTimer.current)
        rankUpTimer.current = setTimeout(() => setShowRankUp(false), 4500)
      }
      localStorage.setItem(PREV_RANK_KEY(p), String(me.rank))
    } catch { /* */ }
  }, [])

  useEffect(() => {
    let cancelled = false

    // stale-while-revalidate: キャッシュ即描画（上の render-phase 調整）の裏で最新を取得して差し替える
    const run = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/fermi/ranking?period=${period}`)
        const d = await r.json()
        if (cancelled) return
        const list: RawRow[] = Array.isArray(d.ranking) ? d.ranking : []
        writeRankCache(period, list)
        const ranked = toEntries(list)
        setEntries(ranked)
        evalRankUp(ranked, period)
      } catch {
        // network error: キャッシュ描画済みならそれを維持、無ければ空リストのまま
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [period, myName, toEntries, evalRankUp])

  // unmount 時にトーストタイマーを掃除
  useEffect(() => () => { if (rankUpTimer.current) clearTimeout(rankUpTimer.current) }, [])

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
            fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.005em',
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '1.4667rem', fontWeight: 800 }}>
          <span>{t('fermiRank.heading')}</span>
          {/* FB-33: ランキングの象徴アイコンは絵文字（Keita 明示の例外）。絵文字は読み上げ対象外なので aria-label を併記。 */}
          <span role="img" aria-label={t('fermiRank.headingAria')} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏆</span>
        </div>
        <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginTop: 4 }}>{t('fermiRank.subtitle')}</div>
        {/* スコア算出基準の常設説明: 実装の実態（AI採点スコアの期間累計・毎日更新）に合わせる */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
          {t('fermiRank.basis')}
        </div>
      </div>

      {/* フェルミに挑戦する CTA（FB-34: 小さく右寄せ・控えめなテキストリンク調） */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 12px' }}>
        <button
          onClick={onSolveFermi}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 4px',
            border: 'none', background: 'transparent',
            color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span>{t('fermiRank.solveCta')}</span>
          <ArrowRightIcon width={14} height={14} aria-hidden="true" />
        </button>
      </div>

      {/* 期間タブ */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        {(['week', 'month', 'alltime'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '8px 16px', borderRadius: 99,
            border: `1.5px solid ${period === p ? 'var(--brand)' : 'var(--border)'}`,
            background: period === p ? 'var(--accent-soft)' : 'transparent',
            color: period === p ? 'var(--brand)' : 'var(--text-secondary)',
            fontSize: '0.8667rem', fontWeight: 700, cursor: 'pointer',
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
            <div style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 700, marginBottom: 4 }}>{t('fermiRank.yourRank')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontSize: '2.1333rem', fontWeight: 900, color: 'var(--brand)',
                  display: 'inline-block',
                  animation: showRankUp ? 'rankup-pop 0.5s cubic-bezier(.2,.8,.2,1) both' : undefined,
                }}
              >
                {myEntry.rank}
              </span>
              <span style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('fermiRank.rankUnit')}</span>
              {rankDelta != null && rankDelta > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                    fontSize: '0.8rem', fontWeight: 800,
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{t('fermiRank.bestScore')}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{myEntry.score}</div>
          </div>
        </div>
      )}

      {/* 自分がボード（上位 N 位）に未掲載の場合の補足。
          現状の API は上位のみ返し、N 位より下の正確な順位は返さないため、
          順位の数値は捏造せず「上位入りで表示される」旨だけ案内する。 */}
      {!loading && !myEntry && entries.length > 0 && (
        <div style={{ margin: '0 20px 20px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('fermiRank.notRankedYet')}
        </div>
      )}

      {/* TOP3 */}
      {!loading && top3.length > 0 && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.08em', marginBottom: 10 }}>{t('fermiRank.top3')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top3.map(e => <RankCard key={`${e.rank}-${e.name}`} entry={e} highlight={showRankUp && e.isMe} />)}
          </div>
        </div>
      )}

      {/* 4位以降 */}
      {!loading && rest.length > 0 && (
        <div style={{ padding: '0 20px 100px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '.08em', margin: '8px 0 10px' }}>{t('fermiRank.fourPlus')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map(e => <RankCard key={`${e.rank}-${e.name}`} entry={e} compact highlight={showRankUp && e.isMe} />)}
          </div>
        </div>
      )}

      {/* 空状態 */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{t('fermiRank.empty.title')}</div>
          <div style={{ fontSize: '0.8667rem' }}>{t('fermiRank.empty.desc')}</div>
        </div>
      )}
    </div>
  )
}

// FB-33: 順位 1-3 のメダルアイコンは絵文字（Keita 明示の例外）。絵文字は読み上げ対象外なので
// aria-label に順位の語ラベルを併記する。
const PODIUM_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function RankCard({ entry, compact, highlight }: { entry: RankEntry; compact?: boolean; highlight?: boolean }) {
  const isPodium = entry.rank >= 1 && entry.rank <= 3
  const locale = getLocale() === 'en' ? 'en' : 'ja'
  const occLabel = occupationLabel(entry.occupation, locale)

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
      {/* 順位バッジ（FB-33: 1-3 位は順位絵文字 🥇🥈🥉、4 位以降は数字） */}
      <div style={{
        width: compact ? 32 : 40, height: compact ? 32 : 40, borderRadius: '50%', flexShrink: 0,
        background: isPodium ? 'transparent' : 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // a11y: 絵文字は読み上げ対象外なので、順位を aria-label で明示する。
      }}>
        {isPodium
          ? <span role="img" aria-label={t('onboarding.slidesRankUnit', { n: entry.rank })} style={{ fontSize: compact ? '1.25rem' : '1.6rem', lineHeight: 1 }}>{PODIUM_EMOJI[entry.rank]}</span>
          : <span style={{ fontSize: '0.8667rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{entry.rank}</span>
        }
      </div>

      {/* 名前 + 職業バッジ */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? '0.9333rem' : '1rem', fontWeight: entry.isMe ? 800 : 600,
          color: entry.isMe ? 'var(--brand)' : 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{entry.name}</span>
          {entry.isMe && <span style={{ fontSize: '0.7333rem', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>YOU</span>}
          {occLabel && (
            <span
              aria-label={t('fermiRank.occupationAria', { label: occLabel })}
              style={{
                fontSize: '0.6667rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 99,
                padding: '1px 8px',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}
            >
              {occLabel}
            </span>
          )}
        </div>
      </div>

      {/* スコア */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontSize: compact ? '1rem' : '1.2rem', fontWeight: 800 }}>{entry.score}</span>
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
