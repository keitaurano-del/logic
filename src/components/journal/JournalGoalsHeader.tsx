import { useEffect, useState } from 'react'
import { fetchCurrentGoalsAllPeriods } from './journalDb'
import { periodKeyFor } from './types'
import type { Goal, PeriodType } from './types'
import { CategoryChip } from './JournalGoals'
import { ChevronRightIcon } from '../../icons'
import { t } from '../../i18n'

interface JournalGoalsHeaderProps {
  userId: string
  /** 「目標タブを開く」ボタンや行をタップしたときに「目標」サブタブへ遷移する。階層を渡せる */
  onOpenAll: (period?: PeriodType) => void
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

// 1 行に並べる目標の最大件数（残りは +N で集約）
const ROW_VISIBLE_LIMIT = 2

export function JournalGoalsHeader({ userId, onOpenAll, reloadKey }: JournalGoalsHeaderProps) {
  const [byPeriod, setByPeriod] = useState<Record<PeriodType, Goal[]>>({ weekly: [], monthly: [], yearly: [] })
  const [loaded, setLoaded] = useState(false)

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

  return (
    <div className="journal-goals-header">
      <div className="journal-goals-header__head">
        <div className="journal-goals-header__title">{t('journal.goalSummaryTitle')}</div>
        <button
          type="button"
          className="journal-goals-header__link"
          onClick={() => onOpenAll()}
        >
          {t('journal.goalSummaryOpenAll')}
        </button>
      </div>

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
              onClick={() => onOpenAll(period)}
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
              <span className="journal-goals-header__chev" aria-hidden="true">
                <ChevronRightIcon width={16} height={16} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
