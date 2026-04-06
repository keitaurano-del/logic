import { useState } from 'react'
import {
  PLACEMENT_QUESTIONS,
  calcDeviation,
  rankLabel,
  recommendedLessons,
  savePlacementResult,
  skipPlacement,
} from './placementTest'
import './PlacementTest.css'

type Props = {
  onComplete: () => void
  onSkip?: () => void
}

export default function PlacementTest({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const total = PLACEMENT_QUESTIONS.length
  const q = PLACEMENT_QUESTIONS[questionIdx]
  const dev = calcDeviation(correctCount, total)

  const start = () => {
    setStep('quiz')
    setQuestionIdx(0)
    setSelected(null)
    setAnswered(false)
    setCorrectCount(0)
  }

  const handleAnswer = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (q.options[i].correct) setCorrectCount((c) => c + 1)
  }

  const next = () => {
    if (questionIdx + 1 >= total) {
      // Save result
      savePlacementResult({
        deviation: dev,
        correctCount,
        totalCount: total,
        completedAt: new Date().toISOString(),
        recommendedLessonIds: recommendedLessons(dev),
      })
      setStep('result')
    } else {
      setQuestionIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const handleSkip = () => {
    skipPlacement()
    if (onSkip) onSkip()
    else onComplete()
  }

  if (step === 'intro') {
    return (
      <div className="pt-screen">
        <div className="pt-intro">
          <div className="pt-emoji">📋</div>
          <h1>プレイスメントテスト</h1>
          <p className="pt-lead">
            あなたの論理思考力を 8 問でチェックします。所要時間は約 3 分。<br />
            結果から偏差値を出し、レベルに合ったおすすめレッスンを表示します。
          </p>
          <div className="pt-info">
            <div><strong>{total} 問</strong>・約 3 分</div>
            <div>MECE / 演繹 / 帰納 / 形式論理</div>
          </div>
          <button className="pt-start-btn" onClick={start}>はじめる</button>
          <button className="pt-skip-btn" onClick={handleSkip}>あとでやる</button>
        </div>
      </div>
    )
  }

  if (step === 'quiz') {
    const isCorrect = selected !== null && q.options[selected].correct
    return (
      <div className="pt-screen">
        <div className="pt-progress-bar">
          <div className="pt-progress-fill" style={{ width: `${((questionIdx + (answered ? 1 : 0)) / total) * 100}%` }} />
        </div>
        <div className="pt-quiz">
          <div className="pt-q-num">Q{questionIdx + 1} / {total}</div>
          <h2 className="pt-q-text">{q.question}</h2>
          <div className="pt-options">
            {q.options.map((opt, i) => {
              let cls = 'pt-option'
              if (answered) {
                if (opt.correct) cls += ' correct'
                else if (i === selected) cls += ' wrong'
              } else if (i === selected) cls += ' selected'
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
                  {opt.label}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className={`pt-feedback ${isCorrect ? 'ok' : 'ng'}`}>
              {isCorrect ? '✓ 正解' : '✗ 不正解'}
            </div>
          )}
          {answered && (
            <button className="pt-next-btn" onClick={next}>
              {questionIdx + 1 >= total ? '結果を見る' : '次の問題へ'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Result
  const rank = rankLabel(dev)
  const recIds = recommendedLessons(dev)
  return (
    <div className="pt-screen">
      <div className="pt-result">
        <div className="pt-result-emoji">📊</div>
        <h1>あなたの偏差値</h1>
        <div className="pt-dev-circle" style={{ borderColor: rank.color }}>
          <span className="pt-dev-num" style={{ color: rank.color }}>{dev}</span>
        </div>
        <div className="pt-rank-label" style={{ color: rank.color }}>{rank.label}</div>
        <div className="pt-correct-count">{correctCount} / {total} 問正解</div>
        <p className="pt-comment">{rank.comment}</p>

        <div className="pt-rec">
          <h3>あなたへのおすすめレッスン</h3>
          <p className="pt-rec-desc">レベルに合わせて、この順番で学ぶのがおすすめです。</p>
          <div className="pt-rec-list">
            {recIds.map((id, i) => {
              const titles: Record<number, string> = {
                20: 'MECE — 漏れなくダブりなく',
                21: 'ロジックツリー — 問題を分解する',
                22: 'So What / Why So — 論理の検証',
                23: 'ピラミッド原則 — 伝わる話し方',
                24: 'ケーススタディ — 総合演習',
                25: '演繹法 — 一般から個別を導く',
                26: '帰納法 — 個別事例から法則を見つける',
                27: '形式論理 — 「A ならば B」の世界',
              }
              return (
                <div key={id} className="pt-rec-item">
                  <span className="pt-rec-num">{i + 1}</span>
                  <span className="pt-rec-title">{titles[id] || `Lesson ${id}`}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="pt-done-btn" onClick={onComplete}>始める</button>
      </div>
    </div>
  )
}
