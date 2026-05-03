import { useEffect, useState, useMemo } from 'react'
import { getGuestId } from '../guestId'
import { hasCompletedPlacement, loadPlacementResult } from '../placementData'
import { API_BASE } from './apiBase'
import { getStreak, getStudyDates, getCompletedLessons, getXp } from '../stats'
import { getPoints } from './homeHelpers'


interface RankingScreenProps {
  onBack: () => void
  onTakeTest: () => void
}

type RankEntry = { rank: number; nickname: string; deviation: number; xp: number; isYou: boolean }
type RankingData = { total: number; top: RankEntry[]; yourRank: number; yourDeviation: number; yourXp: number }

export function RankingScreen({ onTakeTest }: RankingScreenProps) {
  const [rankData, setRankData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankTab, setRankTab] = useState<'week' | 'all'>('week')

  const streak = getStreak()
  const points = getPoints()
  const xp = getXp()
  const placement = loadPlacementResult()
  const deviation = placement?.deviation ?? null
  const completed = hasCompletedPlacement() && (placement?.totalCount ?? 0) > 0

  // 今週の曜日計算
  const todayDow = (new Date().getDay() + 6) % 7 // 0=月, 1=火, ..., 5=土, 6=日
  const weekDays = ['月', '火', '水', '木', '金', '土']

  // 今週（月曜始まり）の各日付を生成して、studyDatesと照合
  const studyDateSet = useMemo(() => new Set(getStudyDates()), [])
  const thisWeekDates = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - todayDow)
    return weekDays.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().slice(0, 10) // YYYY-MM-DD
    })
  }, [todayDow])

  useEffect(() => {
    let cancelled = false
    const guestId = getGuestId()
    // 自分の最新XPをサーバに同期してからランキングを取得（サーバ未対応時は無視して続行）
    const syncThenFetch = async () => {
      try {
        await fetch(`${API_BASE}/api/placement/sync-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId, xp }),
        })
      } catch { /* オフライン・未対応サーバは無視 */ }
      try {
        const r = await fetch(`${API_BASE}/api/placement/ranking?guestId=${encodeURIComponent(guestId)}`)
        const d = await r.json()
        if (!cancelled) { setRankData(d); setLoading(false) }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    syncThenFetch()
    return () => { cancelled = true }
  }, [xp])

  // 最近の活動 — 実データから生成
  const recentActivity = useMemo(() => {
    const completed = getCompletedLessons()
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const studyDatesArr = getStudyDates()

    const titleMap: Record<string, string> = {
      'lesson-20': 'MECE — 漏れなくダブりなく',
      'lesson-21': 'ロジックツリー',
      'lesson-22': 'So What / Why So',
      'lesson-23': 'ピラミッド原則',
      'lesson-24': 'ケーススタディ総合演習',
      'lesson-25': '演繹法',
      'lesson-26': '帰納法',
      'lesson-27': '形式論理',
      'lesson-28': 'ケース面接入門',
      'lesson-29': 'プロフィタビリティケース',
      'lesson-40': 'クリティカルシンキング入門',
      'lesson-41': '論理的誤謬を見破る',
      'lesson-42': 'データを正しく読む',
      'lesson-43': '問いを立てる力',
      'mock-exam': '模擬試験',
      'journal-input': 'ジャーナル',
      'worksheet': 'ワークシート',
    }

    const lessonIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B5BDB"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>

    if (completed.length === 0) return []

    return completed.slice(-4).reverse().map((key) => {
      const name = titleMap[key] || key.replace('lesson-', 'Lesson ')
      const isToday = studyDatesArr.includes(today)
      const isYesterday = !isToday && studyDatesArr.includes(yesterday)
      const dateLabel = isToday ? '今日' : isYesterday ? '昨日' : ''
      return { name, date: dateLabel, pts: '+20', icon: lessonIcon }
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F4FF' }}>

      {/* ナビバー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 12px', background: 'rgba(240,244,255,.95)', borderBottom: '1px solid #E2E8FF' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: '#3B5BDB', letterSpacing: '-.04em' }}>統計</div>
      </div>

      <div style={{ padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

        {/* スコアヒーロー */}
        <div style={{ background: '#3B5BDB', borderRadius: 28, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr 1px 1fr' }}>
            <div style={{ textAlign: 'center', padding: '0 2px' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginTop: 5 }}>連続</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.15)', margin: '4px 0' }} />
            <div style={{ textAlign: 'center', padding: '0 2px' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>{xp}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginTop: 5 }}>XP</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.15)', margin: '4px 0' }} />
            <div style={{ textAlign: 'center', padding: '0 2px' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>{points}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginTop: 5 }}>ポイント</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.15)', margin: '4px 0' }} />
            <div style={{ textAlign: 'center', padding: '0 2px' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>{deviation != null ? Math.round(deviation) : '—'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginTop: 5 }}>偏差値</div>
            </div>
          </div>
        </div>


        {/* 今週の記録 */}
        <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523', letterSpacing: '-.02em', marginBottom: 12 }}>今週の記録</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weekDays.map((day, i) => {
              const isDone = studyDateSet.has(thisWeekDates[i])
              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: isDone ? '#EEF2FF' : '#E8EEFF', border: isDone ? '1.5px solid #DBE4FF' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#7A849E' }}>{day}</div>
                </div>
              )
            })}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3B5BDB', boxShadow: '0 2px 8px rgba(59,91,219,.4)' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3B5BDB' }}>今日</div>
            </div>
          </div>
        </div>

        {/* ランキング */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523', marginBottom: 0 }}>ランキング</div>
          {/* タブ */}
          <div style={{ display: 'flex', background: '#E8EEFF', borderRadius: 10, padding: 3, gap: 3 }}>
            {(['week', 'all'] as const).map((tab) => (
              <div key={tab} onClick={() => setRankTab(tab)} style={{ flex: 1, textAlign: 'center', padding: 7, fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 6, background: rankTab === tab ? '#fff' : 'transparent', color: rankTab === tab ? '#3B5BDB' : '#7A849E', boxShadow: rankTab === tab ? '0 1px 3px rgba(15,21,35,.08)' : 'none', transition: 'all .15s' }}>
                {tab === 'week' ? '週間' : '全期間'}
              </div>
            ))}
          </div>

          {/* プレースメント未受検 */}
          {!completed && (
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, color: '#7A849E', marginBottom: 12 }}>プレースメントテストを受けて<br />全国ランキングに参加しよう</div>
              <button onClick={onTakeTest} style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                テストを受ける
              </button>
            </div>
          )}

          {/* ランキングリスト */}
          {loading && <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: 16, textAlign: 'center', color: '#7A849E', fontSize: 16 }}>読み込み中…</div>}
          {!loading && rankData && rankData.total > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rankData.top.map((e) => {
                const posColor = e.rank === 1 ? '#D97706' : e.rank === 2 ? '#9CA3AF' : e.rank === 3 ? '#B45309' : '#7A849E'
                return (
                  <div key={`${e.rank}-${e.nickname}`} style={{ background: e.isYou ? '#EEF2FF' : '#fff', border: `1px solid ${e.isYou ? '#DBE4FF' : '#E2E8FF'}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
                    <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, color: posColor, width: 24, textAlign: 'center', flexShrink: 0 }}>{e.rank}</div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B5BDB, #748FFC)', flexShrink: 0, boxShadow: e.isYou ? '0 0 0 2px #3B5BDB' : 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F1523', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.nickname}
                        {e.isYou && <span style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB', background: '#EEF2FF', borderRadius: 4, padding: '1px 5px', marginLeft: 6 }}>あなた</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#7A849E', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2L15 8.5l7 1-5 4.7 1.5 7L12 17.8 5.5 21.2 7 14.2 2 9.5l7-1z"/></svg>
                        <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700 }}>{e.xp.toLocaleString()}</span>
                        <span>XP</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, color: '#3B5BDB', lineHeight: 1 }}>{e.deviation}</div>
                      <div style={{ fontSize: 10, color: '#7A849E', fontWeight: 700, letterSpacing: '.06em', marginTop: 3 }}>偏差値</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!loading && (!rankData || rankData.total === 0) && completed && (
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: 16, textAlign: 'center', color: '#7A849E', fontSize: 16 }}>まだ参加者がいません</div>
          )}
        </div>

        {/* 最近の活動 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523' }}>最近の活動</div>
          {recentActivity.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💪</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', marginBottom: 4 }}>最初のレッスンを始めよう！</div>
              <div style={{ fontSize: 14, color: '#7A849E' }}>レッスンを完了すると、ここに学習記録が表示されます</div>
            </div>
          ) : (
            recentActivity.map((act, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: '#EEF2FF', border: '1px solid #DBE4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {act.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', marginBottom: 1 }}>{act.name}</div>
                  <div style={{ fontSize: 14, color: '#7A849E' }}>{act.date}</div>
                </div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, color: '#3B5BDB' }}>{act.pts}</div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
