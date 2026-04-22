import { getCompletedLessons, getStreak, getStudyHours } from './stats'
import { getCardStats } from './flashcardData'
import './DeviationScore.css'

type Props = { onBack: () => void }

const BASELINE = {
  completedLessons: { mean: 5, sd: 4 },
  streak: { mean: 3, sd: 5 },
  studyHours: { mean: 2, sd: 3 },
  flashcardMastered: { mean: 10, sd: 12 },
}

function calcDev(value: number, b: { mean: number; sd: number }): number {
  const z = (value - b.mean) / b.sd
  return Math.max(25, Math.min(75, Math.round(50 + z * 10)))
}

function rankLabel(dev: number): { label: string; color: string } {
  if (dev >= 65) return { label: 'トップクラス', color: '#D4915A' }
  if (dev >= 55) return { label: '優秀', color: '#5A8A5A' }
  if (dev >= 45) return { label: '平均的', color: '#5B7FB8' }
  if (dev >= 35) return { label: '伸びしろあり', color: '#9B8E7E' }
  return { label: 'これから', color: '#9B8E7E' }
}

export default function DeviationScore({ onBack }: Props) {
  const completedLessons = getCompletedLessons().length
  const streak = getStreak()
  const studyHoursStr = getStudyHours()
  const studyHoursNum = parseFloat(studyHoursStr.replace('h', '').replace('分', '')) || 0
  const studyHours = studyHoursStr.includes('分') ? studyHoursNum / 60 : studyHoursNum
  const cardStats = getCardStats()

  const items = [
    { label: '完了レッスン', value: completedLessons, dev: calcDev(completedLessons, BASELINE.completedLessons), unit: '個' },
    { label: '連続学習日数', value: streak, dev: calcDev(streak, BASELINE.streak), unit: '日' },
    { label: '学習時間', value: studyHours.toFixed(1), dev: calcDev(studyHours, BASELINE.studyHours), unit: 'h' },
    { label: '習得カード', value: cardStats.mastered || 0, dev: calcDev(cardStats.mastered || 0, BASELINE.flashcardMastered), unit: '枚' },
  ]

  const totalDev = Math.round(items.reduce((sum, i) => sum + i.dev, 0) / items.length)
  const totalRank = rankLabel(totalDev)

  return (
    <div className="dev-screen">
      <header className="dev-header">
        <button className="dev-back" onClick={onBack}>← 戻る</button>
        <h2>あなたの偏差値</h2>
      </header>

      <div className="dev-body">
        <div className="dev-hero">
          <div className="dev-hero-label">総合偏差値</div>
          <div className="dev-hero-number">{totalDev}</div>
          <div className="dev-hero-rank" style={{ color: totalRank.color }}>{totalRank.label}</div>

        </div>

        <div className="dev-items">
          {items.map((item) => {
            const rank = rankLabel(item.dev)
            return (
              <div key={item.label} className="dev-item">
                <div className="dev-item-row">
                  <div className="dev-item-label">{item.label}</div>
                  <div className="dev-item-value">
                    {item.value}<span className="dev-item-unit">{item.unit}</span>
                  </div>
                </div>
                <div className="dev-item-bar">
                  <div className="dev-item-bar-fill" style={{ width: `${(item.dev - 25) * 2}%`, background: rank.color }} />
                </div>
                <div className="dev-item-dev">偏差値 {item.dev}・{rank.label}</div>
              </div>
            )
          })}
        </div>

        <div className="dev-note">
          偏差値は学習データから推定した値です。<br/>
          学習を続けると数値が上がります。
        </div>
      </div>
    </div>
  )
}
