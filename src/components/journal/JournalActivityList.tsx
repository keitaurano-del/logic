import { useMemo, type ComponentType, type SVGProps } from 'react'
import { getActivitiesByDate, type ActivityType, type ActivityEntry } from '../../activityLog'
import { BookOpenIcon, BarChartIcon, MessageSquareIcon, LightbulbIcon, SparklesIcon } from '../../icons'
import { t } from '../../i18n'

interface JournalActivityListProps {
  date: string // YYYY-MM-DD
  /** 表示件数の上限（デフォルト 20） */
  limit?: number
  /** 空状態を非表示にして null を返す */
  hideWhenEmpty?: boolean
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const TYPE_ICON: Record<ActivityType, IconComponent> = {
  lesson: BookOpenIcon,
  fermi: BarChartIcon,
  roleplay: MessageSquareIcon,
  'daily-problem': LightbulbIcon,
  'ai-problem': SparklesIcon,
}

const TYPE_LABEL_KEY: Record<ActivityType, string> = {
  lesson: 'journal.activityType.lesson',
  fermi: 'journal.activityType.fermi',
  roleplay: 'journal.activityType.roleplay',
  'daily-problem': 'journal.activityType.dailyProblem',
  'ai-problem': 'journal.activityType.aiProblem',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function JournalActivityList({ date, limit = 20, hideWhenEmpty }: JournalActivityListProps) {
  const entries = useMemo<ActivityEntry[]>(() => {
    const all = getActivitiesByDate(date)
    return all.slice(-limit).reverse() // 最新が上
  }, [date, limit])

  if (entries.length === 0) {
    if (hideWhenEmpty) return null
    return (
      <div className="journal-activity-empty">{t('journal.activityEmpty')}</div>
    )
  }

  return (
    <ul className="journal-activity-list" aria-label={t('journal.activityListAria')}>
      {entries.map((e, i) => {
        const Icon = TYPE_ICON[e.type]
        const typeLabel = t(TYPE_LABEL_KEY[e.type])
        const title = e.title || typeLabel
        return (
          <li key={`${e.ts}-${i}`} className="journal-activity-item">
            <span className={`journal-activity-item__icon journal-activity-item__icon--${e.type}`} aria-hidden="true">
              <Icon width={16} height={16} />
            </span>
            <div className="journal-activity-item__body">
              <div className="journal-activity-item__title" title={title}>{title}</div>
              <div className="journal-activity-item__meta">
                <span className="journal-activity-item__type">{typeLabel}</span>
                <span className="journal-activity-item__time">{formatTime(e.ts)}</span>
                {typeof e.meta?.score === 'number' && (
                  <span className="journal-activity-item__score">{t('journal.activityScore', { n: String(e.meta.score) })}</span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
