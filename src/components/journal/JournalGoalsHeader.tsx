import { useEffect, useState } from 'react'
import { fetchCurrentGoalsAllPeriods } from './journalDb'
import { periodKeyFor } from './types'
import type { Goal, PeriodType } from './types'
import { CategoryChip } from './JournalGoals'
import { t } from '../../i18n'

interface JournalGoalsHeaderProps {
  userId: string
  /** 「すべて見る」を押したときに「目標」サブタブへ遷移するコールバック。階層を渡せる */
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

  // 全部空でもプロンプトとして表示する（目標設定を促す）
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
          const head = goals[0]
          const more = goals.length > 1 ? goals.length - 1 : 0
          return (
            <button
              key={period}
              type="button"
              className="journal-goals-header__row"
              onClick={() => onOpenAll(period)}
            >
              <span className="journal-goals-header__period">{t(PERIOD_LABEL_KEY[period])}</span>
              {head ? (
                <span className="journal-goals-header__content">
                  {head.category && <CategoryChip category={head.category} compact />}
                  <span className="journal-goals-header__title-text">{head.title}</span>
                  {more > 0 && (
                    <span className="journal-goals-header__more">{t('journal.goalSummaryMore', { n: String(more) })}</span>
                  )}
                </span>
              ) : (
                <span className="journal-goals-header__empty">{t(emptyKey)}</span>
              )}
              <span className="journal-goals-header__chev" aria-hidden="true">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
