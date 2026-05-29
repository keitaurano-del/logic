import { useMemo, useState } from 'react'
import { displayMood } from './types'
import type { DailyJournal, Mood } from './types'
import { MoodIcon } from './MoodWeatherIcons'
import { XIcon } from '../../icons'
import { t, getLocale } from '../../i18n'

interface MoodSparklineProps {
  journals: DailyJournal[]
  days?: number
}

const MOOD_LABEL_KEY: Record<Mood, string> = {
  1: 'journal.moodVeryBad',
  2: 'journal.moodBad',
  3: 'journal.moodNeutral',
  4: 'journal.moodGood',
  5: 'journal.moodGreat',
}

const SUMMARY_MAX = 120

/** その日のジャーナルから要約テキストを組み立てる。
 * 優先順: ai_summary → 夜の振り返り → 朝の意図・予定 → 朝メモ。
 * 全文ではなく冒頭抜粋（最大 SUMMARY_MAX 文字）にする。 */
function buildSummary(j: DailyJournal | undefined): string | null {
  if (!j) return null
  const source =
    (j.ai_summary && j.ai_summary.trim()) ||
    (j.evening_reflection && j.evening_reflection.trim()) ||
    (j.schedule_notes && j.schedule_notes.trim()) ||
    (j.morning_memo && j.morning_memo.trim()) ||
    ''
  if (!source) return null
  const collapsed = source.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= SUMMARY_MAX) return collapsed
  return collapsed.slice(0, SUMMARY_MAX).trimEnd() + '…'
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10))
  if (getLocale() === 'en') {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${MONTHS[m - 1]} ${d}, ${y}`
  }
  return `${y}年${m}月${d}日`
}

/**
 * 過去 N 日（default 30）の mood をスパークラインで描画。
 * journals は date 昇順想定。欠損日は null として補完。
 * 記録のある点をタップするとその日のジャーナル要約を下に展開する。
 */
export function MoodSparkline({ journals, days = 30 }: MoodSparklineProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const points = useMemo(() => {
    const today = new Date()
    const arr: Array<{ date: string; mood: Mood | null; journal: DailyJournal | undefined }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000)
      const iso = d.toISOString().slice(0, 10)
      const j = journals.find((x) => x.date === iso)
      arr.push({ date: iso, mood: displayMood(j), journal: j })
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

  const selectedPoint = selectedDate ? points.find((p) => p.date === selectedDate) ?? null : null
  const selectedSummary = selectedPoint ? buildSummary(selectedPoint.journal) : null

  // タップ可能領域（hit area）の半幅。点同士が近いので最小タップ寸法を確保。
  const hitW = Math.max(stepX, 14)

  return (
    <div className="journal-sparkline">
      <div
        className="journal-sparkline__chart"
        role="img"
        aria-label={t('journal.sparklineAria', { days: String(days), avg: average.toFixed(1) })}
      >
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* 中央ライン (mood=3) */}
          <line
            x1={padX} x2={width - padX}
            y1={valueY(3)} y2={valueY(3)}
            stroke="var(--border)"
            strokeDasharray="2 3"
            strokeWidth="1"
            aria-hidden="true"
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
              aria-hidden="true"
            />
          ))}
          {/* 点描画 + タップ領域（記録のある日のみ） */}
          {points.map((p, i) => {
            if (p.mood === null) return null
            const cx = padX + stepX * i
            const cy = valueY(p.mood)
            const isSelected = p.date === selectedDate
            const moodLabel = t(MOOD_LABEL_KEY[p.mood])
            return (
              <g key={p.date}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 4 : 2.5}
                  fill="var(--brand)"
                  aria-hidden="true"
                />
                {/* 透明な hit area。height 全体を覆ってタップしやすくする */}
                <rect
                  x={cx - hitW / 2}
                  y={0}
                  width={hitW}
                  height={height}
                  fill="transparent"
                  className="journal-sparkline__hit"
                  data-testid={`mood-point-${p.date}`}
                  role="button"
                  tabIndex={0}
                  aria-label={t('journal.sparklinePointAria', {
                    date: formatDate(p.date),
                    mood: moodLabel,
                  })}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDate(isSelected ? null : p.date)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedDate(isSelected ? null : p.date)
                    }
                  }}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {selectedPoint && selectedPoint.mood !== null && (
        <div className="journal-sparkline__detail" data-testid="mood-point-detail">
          <div className="journal-sparkline__detail-head">
            <span className="journal-sparkline__detail-mood journal-emoji-icon">
              <MoodIcon mood={selectedPoint.mood} size={20} />
            </span>
            <span className="journal-sparkline__detail-date">{formatDate(selectedPoint.date)}</span>
            <span className="journal-sparkline__detail-moodlabel">
              {t(MOOD_LABEL_KEY[selectedPoint.mood])}
            </span>
            <button
              type="button"
              className="journal-sparkline__detail-close"
              onClick={() => setSelectedDate(null)}
              aria-label={t('journal.closeSheet')}
            >
              <XIcon width={16} height={16} />
            </button>
          </div>
          <p className="journal-sparkline__detail-body">
            {selectedSummary ?? t('journal.sparklineNoText')}
          </p>
        </div>
      )}

      <div className="journal-sparkline__caption">
        {t('journal.sparklineCaption', { days: String(days), avg: average.toFixed(1) })}
      </div>
    </div>
  )
}
