import { useEffect, useMemo, useState } from 'react'
import { MoodIcon } from './MoodWeatherIcons'
import { JournalDetailSheet } from './JournalDetailSheet'
import { fetchJournalsBetween } from './journalDb'
import { todayKey } from './types'
import type { DailyJournal, Mood } from './types'
import { ArrowLeftIcon, ArrowRightIcon } from '../../icons'
import { t, getLocale } from '../../i18n'

interface JournalCalendarProps {
  userId: string
}

const MONTH_LABEL_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const MONTH_LABEL_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DOW_JA = ['月', '火', '水', '木', '金', '土', '日']
const DOW_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pad(n: number): string { return String(n).padStart(2, '0') }
function dateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export function JournalCalendar({ userId }: JournalCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [journals, setJournals] = useState<Record<string, DailyJournal>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const today = todayKey()

  const locale = getLocale()
  const monthLabel = (locale === 'en' ? MONTH_LABEL_EN : MONTH_LABEL_JA)[cursor.month]
  const dowLabels = locale === 'en' ? DOW_EN : DOW_JA

  // 月の日付グリッドを計算（前月末・翌月初を含む 6 週ぶん）
  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.year, cursor.month, 1)
    const firstDow = (firstOfMonth.getDay() + 6) % 7 // 月曜=0
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
    // セルが変わらないと useEffect が再実行されないので、参照を作り直してフェッチ
    setCursor((c) => ({ ...c }))
  }

  return (
    <div>
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
        {dowLabels.map((d) => (
          <div key={d} className="journal-cal-dow">{d}</div>
        ))}
        {cells.map((c) => {
          const key = dateStr(c.year, c.month, c.day)
          const j = journals[key]
          const isToday = key === today
          const label = isToday
            ? `${key} ${t('journal.todaySuffix')}${j ? ` · ${t('journal.cellHasEntry')}` : ''}`
            : `${key}${j ? ` · ${t('journal.cellHasEntry')}` : ''}`
          return (
            <button
              key={key + (c.inMonth ? '' : '-out')}
              type="button"
              className={`journal-cal-cell ${c.inMonth ? '' : 'journal-cal-cell--outside'} ${isToday ? 'journal-cal-cell--today' : ''}`}
              onClick={() => setSelected(key)}
              aria-label={label}
            >
              <span className="journal-cal-cell__day">{c.day}</span>
              {j?.mood && (
                <span className="journal-cal-cell__icon" style={{ color: 'var(--brand)' }}>
                  <MoodIcon mood={j.mood as Mood} size={18} />
                </span>
              )}
              {j && !j.mood && (
                <span className="journal-cal-cell__dot" />
              )}
            </button>
          )
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
          {t('common.loading')}
        </div>
      )}

      {selected && (
        <JournalDetailSheet
          userId={userId}
          date={selected}
          initialJournal={journals[selected] ?? null}
          onClose={() => setSelected(null)}
          onSaved={() => { handleRefresh() }}
        />
      )}
    </div>
  )
}
