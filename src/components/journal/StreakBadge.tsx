import { t } from '../../i18n'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'lg'
}

export function StreakBadge({ streak, size = 'sm' }: StreakBadgeProps) {
  const dim = streak === 0
  const fontSize = size === 'lg' ? 24 : 16
  return (
    <span
      className={`journal-streak-badge ${dim ? 'journal-streak-badge--dim' : ''} ${size === 'lg' ? 'journal-streak-badge--lg' : ''}`}
      aria-label={t('journal.streakAria', { n: String(streak) })}
    >
      <span className="journal-streak-badge__icon" style={{ fontSize }} aria-hidden="true">🔥</span>
      <span className="journal-streak-badge__count">{streak}</span>
      <span className="journal-streak-badge__unit">{t('journal.streakDayUnit')}</span>
    </span>
  )
}
