import { useMemo } from 'react'
import { displayMood } from './types'
import type { DailyJournal, Mood } from './types'
import { t } from '../../i18n'

interface MoodSparklineProps {
  journals: DailyJournal[]
  days?: number
}

/**
 * 過去 N 日（default 30）の mood をスパークラインで描画。
 * journals は date 昇順想定。欠損日は null として補完。
 */
export function MoodSparkline({ journals, days = 30 }: MoodSparklineProps) {
  const points = useMemo(() => {
    const today = new Date()
    const arr: Array<{ date: string; mood: Mood | null }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000)
      const iso = d.toISOString().slice(0, 10)
      const j = journals.find((x) => x.date === iso)
      arr.push({ date: iso, mood: displayMood(j) })
    }
    return arr
  }, [journals, days])

  const valid = points.filter((p) => p.mood !== null)
  if (valid.length === 0) {
    return (
      <div className="journal-sparkline journal-sparkline--empty">
        {t('journal.sparklineEmpty')}
      </div>
    )
  }

  const width = 300
  const height = 60
  const padX = 6
  const padY = 8
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  const stepX = innerW / Math.max(points.length - 1, 1)
  const valueY = (m: Mood) => padY + innerH - ((m - 1) / 4) * innerH

  // 線分用ポリライン（欠損は線を断ち切る）
  const segments: string[] = []
  let current: string[] = []
  points.forEach((p, i) => {
    const x = padX + stepX * i
    if (p.mood !== null) {
      current.push(`${x.toFixed(1)},${valueY(p.mood).toFixed(1)}`)
    } else if (current.length > 0) {
      segments.push(current.join(' '))
      current = []
    }
  })
  if (current.length > 0) segments.push(current.join(' '))

  const average = valid.reduce((s, p) => s + (p.mood as number), 0) / valid.length

  return (
    <div className="journal-sparkline" role="img" aria-label={t('journal.sparklineAria', { days: String(days), avg: average.toFixed(1) })}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {/* 中央ライン (mood=3) */}
        <line
          x1={padX} x2={width - padX}
          y1={valueY(3)} y2={valueY(3)}
          stroke="var(--border)"
          strokeDasharray="2 3"
          strokeWidth="1"
        />
        {/* mood セグメント */}
        {segments.map((pts, i) => (
          <polyline
            key={i}
            points={pts}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* 点描画 */}
        {points.map((p, i) => p.mood !== null ? (
          <circle
            key={i}
            cx={padX + stepX * i}
            cy={valueY(p.mood)}
            r="2.5"
            fill="var(--brand)"
          />
        ) : null)}
      </svg>
      <div className="journal-sparkline__caption">
        {t('journal.sparklineCaption', { days: String(days), avg: average.toFixed(1) })}
      </div>
    </div>
  )
}
