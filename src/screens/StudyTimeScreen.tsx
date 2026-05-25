import { useEffect, useMemo, useState } from 'react'
import {
  getStudyTimeMs,
  getStudyDates,
  getTotalStudyDays,
  localDateStr,
  getStudyDaily,
  type StudyDailyMap,
} from '../stats'
import { ClockIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'
import { getSyncUser } from '../syncService'
import { API_BASE } from './apiBase'
import { resolveLessonName, resolveCategory, categoryLabel } from './lessonNames'

interface StudyTimeScreenProps {
  onBack: () => void
}

type Range = 7 | 30

interface DayRow {
  ds: string
  ms: number
  hasActivity: boolean
}

interface BreakdownItem {
  /** 表示名（レッスンタイトル / 「フェルミ推定」など） */
  name: string
  /** カテゴリ表示名 */
  category: string
  /** その日の同一アクティビティ合計 ms */
  ms: number
  /** 出現回数（同じレッスンを複数回やった場合の count） */
  count: number
}

function formatMs(ms: number): string {
  if (ms < 60000) return t('studytime.unitSec', { n: Math.max(1, Math.round(ms / 1000)) })
  if (ms < 3600000) return t('studytime.unitMin', { n: Math.round(ms / 60000) })
  const h = Math.floor(ms / 3600000)
  const m = Math.round((ms % 3600000) / 60000)
  return m > 0 ? t('studytime.unitHourMin', { h, m }) : t('studytime.unitHour', { h })
}

function formatDate(ds: string): string {
  // ds = "YYYY-MM-DD"
  const [y, m, d] = ds.split('-').map((n) => Number(n))
  if (!y || !m || !d) return ds
  const date = new Date(y, m - 1, d)
  const dayKeys = [
    'studytime.daySun',
    'studytime.dayMon',
    'studytime.dayTue',
    'studytime.dayWed',
    'studytime.dayThu',
    'studytime.dayFri',
    'studytime.daySat',
  ]
  return t('studytime.dateFormat', { m, d, w: t(dayKeys[date.getDay()]) })
}

/**
 * サーバーから返る raw session を localDate にマージして StudyDailyMap 互換に変換。
 * 既存の localStorage 日別データに被せて合計を取りたい場合の素材として使う。
 */
function sessionsToDailyMap(
  sessions: Array<{ activity_type: string | null; activity_id: string | null; started_at: string | null; duration_ms: number }>,
): StudyDailyMap {
  const map: StudyDailyMap = {}
  for (const s of sessions) {
    if (!s.started_at || !s.activity_type) continue
    const ts = new Date(s.started_at).getTime()
    if (!Number.isFinite(ts)) continue
    const ds = localDateStr(ts)
    const key = s.activity_id ? `${s.activity_type}:${s.activity_id}` : s.activity_type
    const ms = Math.max(0, Number(s.duration_ms) || 0)
    const day = map[ds] ?? { ms: 0, items: [] }
    day.ms += ms
    day.items.push({ key, ts, ms })
    map[ds] = day
  }
  return map
}

/**
 * 2 つの StudyDailyMap を結合。一方にしか無い日付はそのまま、両方にある日付は
 * 上書きせず追加結合する戦略（StudyTimeScreen 内では「server 優先 + local 補完」用に使う）。
 */
function mergeDailyMaps(a: StudyDailyMap, b: StudyDailyMap): StudyDailyMap {
  const out: StudyDailyMap = {}
  for (const ds of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const av = a[ds] ?? { ms: 0, items: [] }
    const bv = b[ds] ?? { ms: 0, items: [] }
    out[ds] = {
      ms: av.ms + bv.ms,
      items: [...av.items, ...bv.items],
    }
  }
  return out
}

export function StudyTimeScreen({ onBack }: StudyTimeScreenProps) {
  const totalMs = getStudyTimeMs()
  const totalDays = getTotalStudyDays()
  const studyDates = useMemo(() => getStudyDates(), [])
  const avgMs = totalDays > 0 ? Math.round(totalMs / totalDays) : 0

  // 範囲切替（7 日 / 30 日）
  const [range, setRange] = useState<Range>(7)

  // 日別データ: localStorage（即時） + server（取れたら上書き）
  const [localDaily] = useState<StudyDailyMap>(() => getStudyDaily())
  const [serverDaily, setServerDaily] = useState<StudyDailyMap | null>(null)

  // 選択中の日付（デフォルト: 今日）
  const todayStr = localDateStr()
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  // server stats を取りに行く（ログイン済みのみ）
  useEffect(() => {
    const uid = getSyncUser()
    if (!uid) return
    let cancelled = false
    const days = 30
    fetch(`${API_BASE}/api/study-sessions/stats?user_id=${encodeURIComponent(uid)}&days=${days}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.sessions)) return
        setServerDaily(sessionsToDailyMap(data.sessions))
      })
      .catch(() => { /* オフライン / 503 は無視 */ })
    return () => { cancelled = true }
  }, [])

  // 有効な日別マップ: server が取れていれば server を優先し、localStorage 側にしかない
  // 古い日（例: ログイン前の guest 期間）を補完用にマージする。
  const effectiveDaily: StudyDailyMap = useMemo(() => {
    if (serverDaily) {
      const supplement: StudyDailyMap = {}
      for (const [ds, v] of Object.entries(localDaily)) {
        if (!(ds in serverDaily)) supplement[ds] = v
      }
      return mergeDailyMaps(serverDaily, supplement)
    }
    return localDaily
  }, [serverDaily, localDaily])

  // 範囲分の日付配列を生成
  const dayRows: DayRow[] = useMemo(() => {
    const studySet = new Set(studyDates)
    const base = new Date()
    return Array.from({ length: range }, (_, i) => {
      const d = new Date(base)
      d.setDate(d.getDate() - (range - 1 - i))
      const ds = localDateStr(d)
      const entry = effectiveDaily[ds]
      const ms = entry?.ms ?? 0
      // ms が 0 でも legacy studyDates にあれば「学習あり」扱い
      const hasActivity = ms > 0 || studySet.has(ds)
      return { ds, ms, hasActivity }
    })
  }, [range, effectiveDaily, studyDates])

  // 範囲内の最大 ms（棒の高さ正規化用）
  const maxMs = useMemo(() => {
    return dayRows.reduce((m, r) => (r.ms > m ? r.ms : m), 0)
  }, [dayRows])

  // 選択日の内訳
  const breakdown: BreakdownItem[] = useMemo(() => {
    const entry = effectiveDaily[selectedDate]
    if (!entry || entry.items.length === 0) return []
    // 同じ名前で集約（lesson:23 と lesson-23 が同じレッスンタイトルになる場合も合算）
    const acc = new Map<string, BreakdownItem>()
    for (const it of entry.items) {
      const name = resolveLessonName(it.key)
      const category = categoryLabel(resolveCategory(it.key))
      const cur = acc.get(name) ?? { name, category, ms: 0, count: 0 }
      cur.ms += it.ms ?? 0
      cur.count += 1
      acc.set(name, cur)
    }
    // 時間が長い順、同じなら回数が多い順
    return Array.from(acc.values()).sort((a, b) => (b.ms - a.ms) || (b.count - a.count))
  }, [effectiveDaily, selectedDate])

  const selectedEntryMs = effectiveDaily[selectedDate]?.ms ?? 0

  return (
    <div className="stack">
      <Header title={t('studytime.title')} onBack={onBack} />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'var(--s-5) 0 var(--s-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--s-3)', color: 'var(--brand)' }}>
          <ClockIcon width={40} height={40} />
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--brand)' }}>
          {formatMs(totalMs)}
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 'var(--s-2)', fontWeight: 600 }}>
          {t('studytime.totalLabel')}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{totalDays}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('studytime.studyDays')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{formatMs(avgMs)}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{t('studytime.avgPerDay')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', padding: 'var(--s-4)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
            {dayRows.filter((d) => d.hasActivity).length}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {range === 7 ? t('studytime.recentDays') : t('studytime.last30Days')}
          </div>
        </div>
      </div>

      {/* Daily chart */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            {t('studytime.dailyTitle')}
          </h2>
          {/* Range toggle */}
          <div role="tablist" aria-label="range" style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 3, borderRadius: 999 }}>
            {([7, 30] as Range[]).map((r) => {
              const active = r === range
              return (
                <button
                  key={r}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(r)}
                  style={{
                    border: 'none',
                    background: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {r === 7 ? t('studytime.range7d') : t('studytime.range30d')}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
          {t('studytime.dailySubtitle')}
        </div>

        {/* Bar chart */}
        <div
          role="group"
          aria-label="daily-bars"
          style={{
            display: 'flex',
            gap: range === 7 ? 6 : 3,
            alignItems: 'flex-end',
            height: 96,
          }}
        >
          {dayRows.map((row) => {
            const isSelected = row.ds === selectedDate
            const isToday = row.ds === todayStr
            // 高さ: ms ベース、最低 6px、上限 96px
            const ratio = maxMs > 0 ? row.ms / maxMs : 0
            const minBar = row.hasActivity ? 8 : 4
            const height = Math.max(minBar, Math.round(ratio * 96))
            const tooltip = row.ms > 0
              ? t('studytime.barTooltip', { date: formatDate(row.ds), duration: formatMs(row.ms) })
              : t('studytime.barTooltipEmpty', { date: formatDate(row.ds) })
            return (
              <button
                key={row.ds}
                type="button"
                title={tooltip}
                aria-label={tooltip}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(row.ds)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'stretch',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    height,
                    borderRadius: 4,
                    background: row.hasActivity
                      ? (isSelected ? 'var(--brand)' : 'var(--brand-soft)')
                      : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--brand)' : '2px solid transparent',
                    boxSizing: 'border-box',
                    transition: 'height 0.2s, background 0.15s',
                  }}
                />
                {range === 7 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: isToday ? 'var(--brand)' : 'var(--text-muted)',
                      fontWeight: isToday ? 700 : 500,
                      textAlign: 'center',
                      marginTop: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.ds.slice(5)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {range === 30 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s-2)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{t('label.daysAgo', { n: 30 })}</span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{t('label.today')}</span>
          </div>
        )}
      </div>

      {/* Breakdown for selected day */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0, marginBottom: 'var(--s-1)' }}>
          {t('studytime.breakdownTitle', {
            date: selectedDate === todayStr ? t('studytime.todayLabel') : formatDate(selectedDate),
          })}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('studytime.breakdownTotal')}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>
            {selectedEntryMs > 0 ? formatMs(selectedEntryMs) : t('studytime.noTime')}
          </span>
        </div>

        {breakdown.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: 'var(--s-5) 0' }}>
            {t('studytime.breakdownEmpty')}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--s-2)' }}>
              {t('studytime.breakdownLessons')}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {breakdown.map((item, i) => (
                <li key={`${item.name}-${i}`}>
                  {i > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', padding: 'var(--s-3) 0' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.category}
                        {item.count > 1 ? ` ${t('studytime.itemCountSuffix', { n: item.count })}` : ''}
                      </div>
                    </div>
                    {item.ms > 0 && (
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)', flexShrink: 0 }}>
                        {formatMs(item.ms)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
