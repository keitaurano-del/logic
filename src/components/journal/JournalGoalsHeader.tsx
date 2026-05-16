import { useEffect, useState } from 'react'
import { fetchCurrentGoalsAllPeriods } from './journalDb'
import { periodKeyFor } from './types'
import type { Goal, PeriodType } from './types'
import { CategoryChip, JournalGoals } from './JournalGoals'
import { ChevronDownIcon, XIcon } from '../../icons'
import { t } from '../../i18n'

interface JournalGoalsHeaderProps {
  userId: string
  /** 親が編集→Header に戻ったときの再フェッチをトリガーするためのキー */
  reloadKey?: number
}

const ROWS: Array<{ period: PeriodType; emptyKey: string }> = [
  { period: 'yearly',  emptyKey: 'journal.goalSummaryEmptyYearly' },
  { period: 'monthly', emptyKey: 'journal.goalSummaryEmptyMonthly' },
  { period: 'weekly',  emptyKey: 'journal.goalSummaryEmptyWeekly' },
]

const PERIOD_LABEL_KEY: Record<PeriodType, string> = {
  weekly:  'journal.periodWeekly',
  monthly: 'journal.periodMonthly',
  yearly:  'journal.periodYearly',
}

const ROW_VISIBLE_LIMIT = 2

export function JournalGoalsHeader({ userId, reloadKey }: JournalGoalsHeaderProps) {
  const [byPeriod, setByPeriod] = useState<Record<PeriodType, Goal[]>>({ weekly: [], monthly: [], yearly: [] })
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [fullOpen, setFullOpen] = useState<PeriodType | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const keys = {
        weekly:  periodKeyFor('weekly'),
        monthly: periodKeyFor('monthly'),
        yearly:  periodKeyFor('yearly'),
      }
      const result = await fetchCurrentGoalsAllPeriods(userId, keys)
      if (cancelled) return
      setByPeriod(result)
      setLoaded(true)
    })()
    return () => { cancelled = true }
  }, [userId, reloadKey])

  if (!loaded) return null

  const totalGoals = byPeriod.yearly.length + byPeriod.monthly.length + byPeriod.weekly.length

  // 折りたたみ時のサマリー：最も近い期間（週次優先）の1件＋件数表示
  const compactPreview = (() => {
    const order: PeriodType[] = ['weekly', 'monthly', 'yearly']
    for (const p of order) {
      const goals = byPeriod[p]
      if (goals.length > 0) {
        return { period: p, goal: goals[0], rest: totalGoals - 1 }
      }
    }
    return null
  })()

  return (
    <div className={`journal-goals-header ${expanded ? 'journal-goals-header--expanded' : 'journal-goals-header--collapsed'}`}>
      <button
        type="button"
        className="journal-goals-header__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={t('journal.goalSummaryTitle')}
      >
        <span className="journal-goals-header__title">{t('journal.goalSummaryTitle')}</span>
        {!expanded && compactPreview && (
          <span className="journal-goals-header__compact">
            <span className="journal-goals-header__compact-period">{t(PERIOD_LABEL_KEY[compactPreview.period])}</span>
            {compactPreview.goal.category && <CategoryChip category={compactPreview.goal.category} compact />}
            <span className="journal-goals-header__compact-title">{compactPreview.goal.title}</span>
            {compactPreview.rest > 0 && (
              <span className="journal-goals-header__more">{t('journal.goalSummaryMore', { n: String(compactPreview.rest) })}</span>
            )}
          </span>
        )}
        {!expanded && !compactPreview && (
          <span className="journal-goals-header__compact-empty">{t('journal.goalSummaryEmptyAll')}</span>
        )}
        <span className={`journal-goals-header__chev ${expanded ? 'is-open' : ''}`} aria-hidden="true">
          <ChevronDownIcon width={16} height={16} />
        </span>
      </button>

      {expanded && (
        <div className="journal-goals-header__rows">
          {ROWS.map(({ period, emptyKey }) => {
            const goals = byPeriod[period]
            const visible = goals.slice(0, ROW_VISIBLE_LIMIT)
            const more = goals.length - visible.length
            const periodLabel = t(PERIOD_LABEL_KEY[period])
            return (
              <button
                key={period}
                type="button"
                className="journal-goals-header__row"
                onClick={() => setFullOpen(period)}
                aria-label={t('journal.goalSummaryRowAria', { period: periodLabel })}
              >
                <span className="journal-goals-header__period">{periodLabel}</span>
                {visible.length > 0 ? (
                  <span className="journal-goals-header__content">
                    {visible.map((g) => (
                      <span key={g.id} className="journal-goals-header__item">
                        {g.category && <CategoryChip category={g.category} compact />}
                        <span className="journal-goals-header__title-text">{g.title}</span>
                      </span>
                    ))}
                    {more > 0 && (
                      <span className="journal-goals-header__more">{t('journal.goalSummaryMore', { n: String(more) })}</span>
                    )}
                  </span>
                ) : (
                  <span className="journal-goals-header__empty">{t(emptyKey)}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {fullOpen && (
        <div className="journal-search-overlay" role="dialog" aria-modal="true" aria-label={t('journal.tabGoals')}>
          <div className="journal-search-overlay__sheet">
            <div className="journal-search-overlay__head">
              <div className="journal-search-overlay__title">{t('journal.tabGoals')}</div>
              <button
                type="button"
                className="journal-search-overlay__close"
                onClick={() => setFullOpen(null)}
                aria-label={t('common.close')}
              >
                <XIcon width={20} height={20} />
              </button>
            </div>
            <div className="journal-search-overlay__body">
              <JournalGoals userId={userId} initialPeriod={fullOpen} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
