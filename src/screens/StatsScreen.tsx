import { useState, useMemo } from 'react'
import { getCompletedLessons, getStudyDates, getStreak, getStudyHours, getCompletedCount } from '../stats'
import { loadPlacementResult, rankLabel } from '../placementData'
import { allLessons, getAllLessonsFlat } from '../lessonData'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

type StatsTab = 'overview' | 'history' | 'analysis'

interface StatsScreenProps {
  onBack: () => void
  onTakeTest: () => void
}

// 今週 (月〜日) の日付リスト
function getThisWeek(): string[] {
  const today = new Date()
  const day = today.getDay() // 0=日, 1=月...
  const mon = new Date(today)
  mon.setDate(today.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  return ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
}

const CATEGORY_LABEL_JP: Record<string, string> = {
  fermi: 'フェルミ推定',
  logic: 'ロジカルシンキング',
  case: 'ケース面接',
  thinking: '思考法',
  critical: 'クリティカルシンキング',
  pm: 'プロジェクト管理',
  'formal-logic': '論理学',
  hypothesis: '仮説思考',
  'problem-setting': '課題設定',
  'design-thinking': 'デザインシンキング',
  lateral: 'ラテラルシンキング',
  analogy: 'アナロジー思考',
  systems: 'システムシンキング',
  proposal: '提案・伝える技術',
  philosophy: '哲学・思考の原理',
}
function catLabel(cat: string): string {
  return CATEGORY_LABEL_JP[cat] ?? cat
}

// 完了レッスンのカテゴリ別集計
function getCategoryStats() {
  const completed = new Set(getCompletedLessons())
  const flat = getAllLessonsFlat()
  const map = new Map<string, { total: number; done: number }>()
  for (const lesson of Object.values(flat)) {
    const cat = lesson.category ?? 'その他'
    if (!map.has(cat)) map.set(cat, { total: 0, done: 0 })
    const e = map.get(cat)!
    e.total++
    if (completed.has(`lesson-${lesson.id}`)) e.done++
  }
  return Array.from(map.entries())
    .map(([cat, { total, done }]) => ({ cat, total, done, rate: total > 0 ? done / total : 0 }))
    .sort((a, b) => b.rate - a.rate)
}

// 完了キーから表示名を解決
function lessonKeyToLabel(key: string): { title: string; type: string; category: string } {
  if (key.startsWith('lesson-')) {
    const id = parseInt(key.replace('lesson-', ''))
    const l = allLessons[id]
    if (l) return { title: l.title ?? `レッスン ${id}`, type: 'レッスン', category: l.category ?? '' }
  }
  if (key.startsWith('ai-problem-')) return { title: 'AI生成問題', type: 'AI問題', category: '' }
  if (key.startsWith('fermi-')) return { title: 'フェルミ推定', type: 'フェルミ', category: '' }
  if (key === 'daily-fermi') return { title: 'デイリーフェルミ', type: 'フェルミ', category: '' }
  return { title: key, type: 'その他', category: '' }
}

function typeColor(type: string): string {
  if (type === 'レッスン') return '#3B5BDB'
  if (type === 'AI問題') return '#7C3AED'
  if (type === 'フェルミ') return '#F59E0B'
  return '#94A3B8'
}
function typeLabel(type: string): string {
  if (type === 'レッスン') return 'L'
  if (type === 'AI問題') return 'AI'
  if (type === 'フェルミ') return 'F'
  return '?'
}

function rateColor(rate: number): string {
  if (rate >= 0.8) return '#059669'
  if (rate >= 0.5) return '#3B5BDB'
  if (rate >= 0.3) return '#D97706'
  return '#DC2626'
}

export function StatsScreen({ onBack, onTakeTest }: StatsScreenProps) {
  const [tab, setTab] = useState<StatsTab>('overview')

  const placement = loadPlacementResult()
  const completedLessons = getCompletedLessons()
  const studyDates = useMemo(() => new Set(getStudyDates()), [])
  const thisWeek = useMemo(() => getThisWeek(), [])
  const categoryStats = useMemo(() => getCategoryStats(), [])
  const streak = getStreak()
  const studyHours = getStudyHours()
  const completedCount = getCompletedCount()

  // 今週の各曜日の学習カウント（学習したか否か）
  const weekActivity = thisWeek.map(d => studyDates.has(d))
  const weekActiveCount = weekActivity.filter(Boolean).length

  // 履歴: 完了レッスンを配列に変換（最新順）
  const historyItems = useMemo(() => {
    return [...completedLessons]
      .reverse()
      .slice(0, 20)
      .map(key => ({ key, ...lessonKeyToLabel(key) }))
  }, [completedLessons])

  // 得意・苦手
  const bestCat = categoryStats[0]
  const worstCat = [...categoryStats].sort((a, b) => a.rate - b.rate)[0]

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', textAlign: 'center',
    fontSize: 14, fontWeight: 700,
    color: active ? '#3B5BDB' : '#7A849E',
    background: active ? '#fff' : 'transparent',
    borderRadius: 10, border: 'none', cursor: 'pointer',
    transition: 'all .15s',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
  })

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">統計</div>
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', background: '#E8EEFF', borderRadius: 12, padding: 3, gap: 0 }}>
        <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>概要</button>
        <button style={tabStyle(tab === 'history')} onClick={() => setTab('history')}>履歴</button>
        <button style={tabStyle(tab === 'analysis')} onClick={() => setTab('analysis')}>分析</button>
      </div>

      {/* ===== 概要タブ ===== */}
      {tab === 'overview' && (
        <>
          {/* 4指標グリッド */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: '連続学習', value: `${streak}日`, sub: streak > 0 ? '継続中' : '今日から始めよう' },
              { label: '完了レッスン', value: `${completedCount}`, sub: '累計' },
              { label: '学習時間', value: studyHours, sub: '累計' },
              { label: '偏差値', value: placement ? placement.deviation.toFixed(1) : '—', sub: placement ? rankLabel(placement.deviation).label : 'テスト未実施' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: '#7A849E', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0F1523', letterSpacing: '-0.03em', marginTop: 4 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* 今週の学習 */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', letterSpacing: '.06em', marginBottom: 14 }}>今週の学習</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
              {thisWeek.map((date, i) => {
                const active = weekActivity[i]
                const isToday = date === new Date().toISOString().slice(0, 10)
                return (
                  <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: 40,
                      borderRadius: 8,
                      background: active ? '#3B5BDB' : '#E8EEFF',
                      border: isToday ? '2px solid #3B5BDB' : '2px solid transparent',
                      transition: 'background .2s',
                    }} />
                    <div style={{ fontSize: 11, color: isToday ? '#3B5BDB' : '#7A849E', fontWeight: isToday ? 700 : 600 }}>
                      {dayLabel(date)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: '#7A849E' }}>
              今週 <strong style={{ color: '#0F1523' }}>{weekActiveCount}日</strong> 学習したよ
            </div>
          </div>

          {/* プレースメントテスト案内 */}
          {!placement && (
            <div className="card" style={{ background: '#EEF2FF', border: '1.5px solid #C5D0FB' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#3B5BDB', marginBottom: 6 }}>偏差値を測定しよう</div>
              <div style={{ fontSize: 14, color: '#5A6478', marginBottom: 12, lineHeight: 1.6 }}>
                プレースメントテストを受けると、自分のレベルと弱点がわかるよ
              </div>
              <button
                onClick={onTakeTest}
                style={{ padding: '10px 20px', background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                テストを受ける
              </button>
            </div>
          )}
        </>
      )}

      {/* ===== 履歴タブ ===== */}
      {tab === 'history' && (
        <>
          {historyItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 15, color: '#7A849E' }}>まだ学習履歴がないよ</div>
              <div style={{ fontSize: 14, color: '#B0B8D0', marginTop: 8 }}>レッスンを完了すると記録されるよ</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historyItems.map((item, i) => (
                <div key={`${item.key}-${i}`} className="card card-compact" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: typeColor(item.type),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#fff',
                  }}>
                    {typeLabel(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1523', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#7A849E', marginTop: 2 }}>
                      {item.type}{item.category ? ` — ${item.category}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#059669', fontWeight: 700, flexShrink: 0 }}>完了</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== 分析タブ ===== */}
      {tab === 'analysis' && (
        <>
          {/* 偏差値カード */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', marginBottom: 4 }}>偏差値</div>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', color: '#0F1523' }}>
                {placement ? placement.deviation.toFixed(1) : '—'}
              </div>
              {placement && (
                <div style={{ fontSize: 13, color: rankLabel(placement.deviation).color, fontWeight: 700, marginTop: 2 }}>
                  {rankLabel(placement.deviation).label}
                </div>
              )}
            </div>
            {placement && (
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: '#E8EEFF', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, ((placement.deviation - 30) / 40) * 100)}%`,
                    background: '#3B5BDB', borderRadius: 99
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#7A849E' }}>
                  {placement.correctCount}/{placement.totalCount} 問正解
                </div>
              </div>
            )}
            {!placement && (
              <button onClick={onTakeTest} style={{ padding: '8px 16px', background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                テストを受ける
              </button>
            )}
          </div>

          {/* 分野別進捗 — 全カテゴリを常時表示（0%も含む） */}
          {categoryStats.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', letterSpacing: '.06em', marginBottom: 14 }}>
                {t('home.category.logic') === 'ロジカルシンキング' ? '分野別進捗' : 'Progress by Category'}
              </div>
              {categoryStats.map(({ cat, total, done, rate }) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1523', minWidth: 110 }}>{catLabel(cat)}</div>
                  <div style={{ flex: 1, height: 8, background: '#E8EEFF', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rate * 100}%`, background: rateColor(rate), borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: rateColor(rate), minWidth: 36, textAlign: 'right' }}>
                    {done}/{total}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 得意・苦手サマリー */}
          {categoryStats.length >= 2 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {bestCat && bestCat.total > 0 && (
                <div style={{ flex: 1, background: '#ECFDF5', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 6 }}>得意分野</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F1523' }}>{catLabel(bestCat.cat)}</div>
                  <div style={{ fontSize: 13, color: '#7A849E' }}>{bestCat.done}/{bestCat.total} 完了</div>
                </div>
              )}
              {worstCat && worstCat.total > 0 && worstCat.done < worstCat.total && (
                <div style={{ flex: 1, background: '#FEF2F2', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>伸びしろ</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F1523' }}>{catLabel(worstCat.cat)}</div>
                  <div style={{ fontSize: 13, color: '#7A849E' }}>{worstCat.done}/{worstCat.total} 完了</div>
                </div>
              )}
            </div>
          )}

          {/* 学習統計 */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', letterSpacing: '.06em', marginBottom: 12 }}>学習統計</div>
            {[
              { label: '総学習日数', value: `${getStudyDates().length}日` },
              { label: '連続学習', value: `${streak}日` },
              { label: '学習時間', value: studyHours },
              { label: '完了レッスン数', value: `${completedCount}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F4FF' }}>
                <div style={{ fontSize: 14, color: '#5A6478' }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523' }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
