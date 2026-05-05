/**
 * StatsScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.5
 */
import { useState, useMemo, useEffect } from 'react'
import { getStudyDates, getStreak, getCompletedCount, getCompletedLessons, getXp } from '../stats'
import { v3 } from '../styles/tokensV3'
import { allLessons, type LessonData } from '../lessonData'
import { hasCompletedPlacement, loadPlacementResult, rankLabel } from '../placementData'
import { getGuestId } from '../guestId'
import { API_BASE } from './apiBase'

type Period = 'day' | 'week' | 'month'
type RankEntry = { rank: number; nickname: string; deviation: number; isYou: boolean }
type RankingData = { total: number; top: RankEntry[]; yourRank: number; yourDeviation: number }

interface StatsScreenV3Props {
  onBack: () => void
}

const WEEK_DAYS_FULL = ['月', '火', '水', '木', '金', '土', '日'] as const

export function StatsScreenV3({ onBack: _onBack }: StatsScreenV3Props) {
  const [period, setPeriod] = useState<Period>('month')
  const studyDates = useMemo(() => new Set(getStudyDates()), [])
  const streak = getStreak()
  const completed = getCompletedCount()
  const completedLessons = useMemo(() => getCompletedLessons(), [])
  const xp = getXp()

  // 偏差値・ランキング
  const placement = loadPlacementResult()
  const deviation = placement?.deviation ?? null
  const hasPlacement = hasCompletedPlacement() && (placement?.totalCount ?? 0) > 0
  const [rankData, setRankData] = useState<RankingData | null>(null)
  const [rankLoading, setRankLoading] = useState(true)

  // ダミーランキング（ユーザー数が少ない間のフォールバック）— deviation 依存で再生成
  const dummyRanking: RankingData = useMemo(() => ({
    yourRank: 3,
    total: 128,
    yourDeviation: deviation ?? 55,
    top: [
      { rank: 1, nickname: 'K・T', deviation: 72.4, isYou: false },
      { rank: 2, nickname: 'logic王', deviation: 68.9, isYou: false },
      { rank: 3, nickname: 'あなた', deviation: deviation ?? 55, isYou: true },
      { rank: 4, nickname: 'Ryu', deviation: 61.2, isYou: false },
      { rank: 5, nickname: 'thinker23', deviation: 59.8, isYou: false },
    ]
  }), [deviation])

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/placement/ranking?guestId=${encodeURIComponent(getGuestId())}`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          // ユーザー数が5人未満の場合はダミーを使用
          const useReal = d?.top && d.top.length >= 5
          setRankData(useReal ? d : dummyRanking)
          setRankLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRankData(dummyRanking)
          setRankLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [dummyRanking])

  // 月カレンダー（今日は mount 時に固定）
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const studiedThisMonth = Array.from(studyDates).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length

  // 週グラフ（日別の学習回数）
  const weekStudyCounts = useMemo(() => {
    const todayDow = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - todayDow)
    return WEEK_DAYS_FULL.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      return studyDates.has(iso) ? 1 : 0
    })
  }, [studyDates, today])

  // 学習タイムライン (最新の完了レッスン)
  const recentLessons = useMemo(() => {
    return completedLessons
      .filter(k => k.startsWith('lesson-'))
      .map(k => parseInt(k.replace('lesson-', '')))
      .map(id => allLessons[id])
      .filter(Boolean)
      .slice(-10)
      .reverse()
  }, [completedLessons])

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>記録</div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        {/* Period selector */}
        <div style={{ display: 'flex', background: v3.color.card, borderRadius: 14, padding: 4, gap: 2, flexShrink: 0 }}>
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              style={{
                flex: 1,
                padding: 8,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: period === p ? v3.color.bg : v3.color.text2,
                background: period === p ? v3.color.accent : 'transparent',
                borderRadius: 10,
                cursor: 'pointer',
                border: 'none',
                font: 'inherit',
              }}
            >
              {p === 'day' ? '今日' : p === 'week' ? '週' : '月'}
            </button>
          ))}
        </div>

        {/* 概要ステータス3列 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, flexShrink: 0 }}>
          <SummaryStat val={String(completed)} label="完了レッスン" />
          <SummaryStat val={String(streak)} label="連続学習日" />
          <SummaryStat val={xp.toLocaleString()} label="総XP" />
        </div>

        {/* 偏差値・ランキングカード */}
        <div style={{ background: 'linear-gradient(140deg, #0F2E2D 0%, #1A4A48 100%)', borderRadius: v3.radius.card, padding: 20, color: '#fff', boxShadow: v3.shadow.hero, flexShrink: 0, border: '1px solid rgba(112,216,189,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>偏差値・ランキング</div>
          {!hasPlacement ? (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              実力診断テストを受けると偏差値・ランキングが表示されます
            </div>
          ) : (
            <>
              {/* 偏差値大表示 */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {deviation != null ? Math.round(deviation) : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>偏差値</div>
                </div>
                {deviation != null && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{rankLabel(deviation).label}</div>
                    {!rankLoading && rankData && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        上位{rankData.total > 0 ? Math.round((rankData.yourRank / rankData.total) * 100) : '—'}%
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* 偏差値バー */}
              {deviation != null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    <span>25</span><span>50</span><span>75</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, ((deviation - 25) / 50) * 100))}%`, background: 'var(--bg-card)', borderRadius: 99 }}></div>
                  </div>
                </>
              )}
              {/* Top10ランキング */}
              {!rankLoading && rankData && rankData.top && rankData.top.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 600 }}>ランキング TOP 5</div>
                  {rankData.top.slice(0, 5).map((entry) => (
                    <div key={entry.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 800, color: entry.rank <= 3 ? '#FFD700' : 'rgba(255,255,255,0.5)', minWidth: 24 }}>#{entry.rank}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: entry.isYou ? 700 : 500, color: entry.isYou ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                        {entry.isYou ? '» ' : ''}{entry.nickname}
                      </div>
                      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{Math.round(entry.deviation)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {period === 'month' && (
          <>
            {/* Calendar */}
            <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '18px 16px', boxShadow: v3.shadow.card, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>{year}年{month + 1}月</div>
                <div style={{ fontSize: 12, color: v3.color.text2 }}>{studiedThisMonth}日学習</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {WEEK_DAYS_FULL.map(d => (
                  <div key={d} style={{ fontSize: 10, fontWeight: 700, color: v3.color.text3, textAlign: 'center', padding: '4px 0' }}>{d}</div>
                ))}
                {Array.from({ length: totalCells }).map((_, i) => {
                  const dayNum = i - startOffset + 1
                  const inMonth = dayNum >= 1 && dayNum <= daysInMonth
                  const dateStr = inMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : ''
                  const isToday = inMonth && dayNum === today.getDate()
                  const studied = studyDates.has(dateStr)
                  return (
                    <div
                      key={i}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: studied || isToday ? 700 : 500,
                        color: !inMonth ? v3.color.text3 : studied ? v3.color.bg : isToday ? v3.color.accent : v3.color.text,
                        borderRadius: '50%',
                        background: studied ? v3.color.accent : isToday ? v3.color.accentSoft : 'transparent',
                        border: isToday && !studied ? `1.5px solid ${v3.color.accent}` : 'none',
                      }}
                    >
                      {inMonth ? dayNum : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {period === 'week' && (
          <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, flexShrink: 0, boxShadow: v3.shadow.card }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>今週の学習リズム</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {WEEK_DAYS_FULL.map((d, i) => {
                const cnt = weekStudyCounts[i]
                const max = Math.max(...weekStudyCounts, 1)
                const h = (cnt / max) * 100
                return (
                  <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                      <div style={{ width: '100%', height: `${h}%`, minHeight: cnt > 0 ? 8 : 4, background: cnt > 0 ? v3.color.accent : v3.color.cardSoft, borderRadius: 6 }}></div>
                    </div>
                    <span style={{ fontSize: 11, color: v3.color.text3, fontWeight: 500 }}>{d}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {period === 'day' && (
          <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, flexShrink: 0, boxShadow: v3.shadow.card }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>今日の学習</div>
            <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.7 }}>
              {studyDates.has(today.toISOString().slice(0,10))
                ? '今日は学習済みです。引き続き他のレッスンも開いてみましょう。'
                : '今日はまだ学習していません。1レッスンから始めてみましょう。'}
            </div>
          </div>
        )}

        {/* AI Weekly Report */}
        <div style={{ background: `linear-gradient(140deg, ${v3.color.card2} 0%, ${v3.color.card} 100%)`, borderRadius: v3.radius.card, padding: 18, color: '#fff', boxShadow: v3.shadow.hero, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: v3.color.accent, marginBottom: 6 }}>今週のあなた</div>
          <div style={{ fontFamily: 'Noto Sans JP', fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{streak >= 5 ? `${streak}日連続学習中` : 'コツコツ続けていますね'}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.6 }}>
            {completed >= 3 ? `今週は${completed}レッスン完了。よいペースです。` : '今週もう1レッスン挑戦してみよう。'}
          </div>
        </div>

        {/* タイムライン */}
        {recentLessons.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 600, padding: '8px 4px 12px' }}>最近の学習</div>
            <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', boxShadow: v3.shadow.card }}>
              {recentLessons.map((lesson: LessonData, i: number) => (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderBottom: i < recentLessons.length - 1 ? `1px solid ${v3.color.line}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: v3.color.accent, color: v3.color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: 2 }}>{lesson.title}</div>
                    <div style={{ fontSize: 11, color: v3.color.text2 }}>{lesson.category}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.accent, fontFamily: "'Inter Tight', sans-serif" }}>+50</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryStat({ val, label }: { val: string; label: string }) {
  return (
    <div style={{ background: v3.color.card, borderRadius: 14, padding: 12, textAlign: 'center', boxShadow: v3.shadow.card }}>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: v3.color.accent, letterSpacing: '-.02em' }}>{val}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: v3.color.text2, letterSpacing: '.04em', marginTop: 2 }}>{label}</div>
    </div>
  )
}
