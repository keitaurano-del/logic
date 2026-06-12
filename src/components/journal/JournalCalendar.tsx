import { useEffect, useMemo, useRef, useState } from 'react'
import { MoodIcon } from './MoodWeatherIcons'
import { MoodSparkline } from './MoodSparkline'
import { JournalDetailSheet } from './JournalDetailSheet'
import { fetchJournalsBetween, fetchRecentJournals } from './journalDb'
import { displayMood, todayKey } from './types'
import type { DailyJournal } from './types'
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon } from '../../icons'
import { t, getLocale } from '../../i18n'

interface JournalCalendarProps {
  userId: string
  assistantName?: string
  /** ジャーナルを保存したときに親に通知（recent list の再フェッチ等で使用） */
  onSaved?: () => void
  /** JF-6: ジャーナル保存後にホームタブへ戻すための導線（AppV3 まで結線） */
  onNavigateHome?: () => void
}

const MONTH_LABEL_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTH_LABEL_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// 日曜始まり
const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number): string { return String(n).padStart(2, '0') }
function dateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export function JournalCalendar({ userId, onSaved, onNavigateHome }: JournalCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({})
  const [recent, setRecent] = useState<DailyJournal[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [initialPhase, setInitialPhase] = useState<'morning' | 'evening' | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const fabContainerRef = useRef<HTMLDivElement>(null)
  const today = todayKey()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const list = await fetchRecentJournals(userId, 30)
      if (!cancelled) setRecent(list)
    })()
    return () => { cancelled = true }
  }, [userId, refreshTick])

  const locale = getLocale()
  const monthLabel = (locale === 'en' ? MONTH_LABEL_EN : MONTH_LABEL_JA)[cursor.month]
  const dowLabels = locale === 'en' ? DOW_EN : DOW_JA

  // 月の日付グリッドを計算（前月末・翌月初を含む 6 週ぶん、日曜=0 始まり）
  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1)
    const firstDow = firstOfMonth.getDay() // 日曜=0
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const daysInPrev = new Date(cursor.year, cursor.month, 0).getDate()
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7
    const out: Array<{ year: number; month: number; day: number; inMonth: boolean }> = []
    for (let i = 0; i < totalCells; i++) {
      const offset = i - firstDow
      if (offset < 0) {
        out.push({ year: cursor.year, month: cursor.month - 1, day: daysInPrev + offset + 1, inMonth: false })
      } else if (offset >= daysInMonth) {
        out.push({ year: cursor.year, month: cursor.month + 1, day: offset - daysInMonth + 1, inMonth: false })
      } else {
        out.push({ year: cursor.year, month: cursor.month, day: offset + 1, inMonth: true })
      }
    }
    return out
  }, [cursor])

  // 該当範囲のジャーナルを取得
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const start = dateStr(cells[0].year, cells[0].month, cells[0].day)
      const last = cells[cells.length - 1]
      const end = dateStr(last.year, last.month, last.day)
      const list = await fetchJournalsBetween(userId, start, end)
      if (cancelled) return
      const map: Record<string, DailyJournal> = {}
      for (const j of list) map[j.date] = j
      setJournals(map)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, cells])

  const handlePrev = () => {
    setCursor((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 })
  }
  const handleNext = () => {
    setCursor((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 })
  }

  const handleRefresh = () => {
    setCursor((c) => ({ ...c }))
    setRefreshTick((t) => t + 1)
  }

  const handleAdd = () => {
    setFabOpen((v) => !v)
  }

  const handlePickPhase = (phase: 'morning' | 'evening') => {
    setInitialPhase(phase)
    setSelected(selected ?? today)
    setFabOpen(false)
  }

  // 外側タップで FAB を閉じる
  useEffect(() => {
    if (!fabOpen) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      const root = fabContainerRef.current
      if (!root) return
      if (e.target instanceof Node && !root.contains(e.target)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [fabOpen])

  return (
    <div className="journal-cal-root">
      {/* 直近 30 日の気分の推移 */}
      <div className="journal-cal-sparkline">
        <MoodSparkline journals={recent} days={30} />
      </div>

      <div className="journal-cal-header">
        <button type="button" className="journal-cal-nav" onClick={handlePrev} aria-label={t('journal.prevMonth')}>
          <ArrowLeftIcon width={20} height={20} />
        </button>
        <div className="journal-cal-title">
          {locale === 'en' ? `${monthLabel} ${cursor.year}` : `${cursor.year}年 ${monthLabel}`}
        </div>
        <button type="button" className="journal-cal-nav" onClick={handleNext} aria-label={t('journal.nextMonth')}>
          <ArrowRightIcon width={20} height={20} />
        </button>
      </div>

      <div className="journal-cal-grid">
        {dowLabels.map((d, i) => (
          <div
            key={d}
            className={`journal-cal-dow ${i === 0 ? 'journal-cal-dow--sun' : ''} ${i === 6 ? 'journal-cal-dow--sat' : ''}`}
          >
            {d}
          </div>
        ))}
        {cells.map((c) => {
          const key = dateStr(c.year, c.month, c.day)
          const j = journals[key]
          const m = displayMood(j)
          const isToday = key === today
          const label = isToday
            ? `${key} ${t('journal.todaySuffix')}${j ? ` · ${t('journal.cellHasEntry')}` : ''}`
            : `${key}${j ? ` · ${t('journal.cellHasEntry')}` : ''}`
          return (
            <button
              key={key + (c.inMonth ? '' : '-out')}
              type="button"
              className={`journal-cal-cell ${c.inMonth ? '' : 'journal-cal-cell--outside'} ${isToday ? 'journal-cal-cell--today' : ''}`}
              onClick={() => { setInitialPhase(null); setSelected(key) }}
              aria-label={label}
            >
              <span className="journal-cal-cell__day">{c.day}</span>
              {m && (
                <span className={`journal-emoji-icon journal-cal-cell__icon journal-cal-cell__mood--${m}`}>
                  <MoodIcon mood={m} size={22} />
                </span>
              )}
              {j && !m && (
                <span className="journal-cal-cell__dot" />
              )}
            </button>
          )
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
          {t('common.loading')}
        </div>
      )}

      <div
        ref={fabContainerRef}
        className={`journal-cal-fab-stack ${fabOpen ? 'journal-cal-fab-stack--open' : ''}`}
      >
        <button
          type="button"
          className="journal-cal-fab-sub journal-cal-fab-sub--morning"
          onClick={() => handlePickPhase('morning')}
          aria-label={t('journal.fabAddMorning')}
          tabIndex={fabOpen ? 0 : -1}
        >
          <span className="journal-cal-fab-sub__emoji" aria-hidden="true">☀️</span>
          <span className="journal-cal-fab-sub__label">{t('journal.fabLabelMorning')}</span>
        </button>
        <button
          type="button"
          className="journal-cal-fab-sub journal-cal-fab-sub--evening"
          onClick={() => handlePickPhase('evening')}
          aria-label={t('journal.fabAddEvening')}
          tabIndex={fabOpen ? 0 : -1}
        >
          <span className="journal-cal-fab-sub__emoji" aria-hidden="true">🌙</span>
          <span className="journal-cal-fab-sub__label">{t('journal.fabLabelEvening')}</span>
        </button>
        <button
          type="button"
          className={`journal-cal-fab ${fabOpen ? 'journal-cal-fab--open' : ''}`}
          onClick={handleAdd}
          aria-label={t('journal.fabAddEntry')}
          aria-expanded={fabOpen}
        >
          <PlusIcon width={28} height={28} />
        </button>
      </div>

      {selected && (
        <JournalDetailSheet
          userId={userId}
          date={selected}
          initialJournal={journals[selected] ?? null}
          initialPhase={initialPhase ?? undefined}
          onClose={() => { setSelected(null); setInitialPhase(null) }}
          onSaved={() => { handleRefresh(); onSaved?.() }}
          onNavigateHome={onNavigateHome ? () => {
            // シートを閉じてからホームタブへ（JF-6）
            setSelected(null)
            setInitialPhase(null)
            onNavigateHome()
          } : undefined}
        />
      )}
    </div>
  )
}
