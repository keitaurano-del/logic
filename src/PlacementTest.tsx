import { useState } from 'react'
import {
  PLACEMENT_QUESTIONS,
  calcDeviation,
  rankLabel,
  recommendedLessons,
  savePlacementResult,
  skipPlacement,
} from './placementData'
import { getGuestId, getNickname, setNickname, defaultNickname } from './guestId'
import { t } from './i18n'
import './PlacementTest.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

async function submitPlacement(deviation: number, correctCount: number, totalCount: number, nickname: string) {
  try {
    await fetch(`${API_BASE}/api/placement/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestId: getGuestId(),
        nickname,
        deviation,
        correctCount,
        totalCount,
      }),
    })
  } catch { /* silent */ }
}

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
  const [nicknameInput, setNicknameInput] = useState(getNickname() || defaultNickname(getGuestId()))

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
      // Save locally
      savePlacementResult({
        deviation: dev,
        correctCount,
        totalCount: total,
        completedAt: new Date().toISOString(),
        recommendedLessonIds: recommendedLessons(dev),
      })
      // Submit to ranking server (fire-and-forget)
      const nick = nicknameInput.trim() || defaultNickname(getGuestId())
      setNickname(nick)
      submitPlacement(dev, correctCount, total, nick)
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
          <div className="pt-emoji"></div>
          <h1>{t('placement.title')}</h1>
          <p className="pt-lead" style={{ whiteSpace: 'pre-line' }}>{t('placement.lead')}</p>
          <div className="pt-info">
            <div><strong>{t('placement.questionCount', { count: total })}</strong></div>
            <div>{t('placement.topicLine')}</div>
          </div>
          <div className="pt-nick-row">
            <label>{t('placement.nicknameLabel')}</label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder={t('placement.nicknamePlaceholder')}
              maxLength={20}
              className="pt-nick-input"
            />
          </div>
          <button className="pt-start-btn" onClick={start}>{t('placement.startButton')}</button>
          <button className="pt-skip-btn" onClick={handleSkip}>{t('placement.skipButton')}</button>
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
          <div className="pt-q-num">{t('placement.questionPrefix', { n: questionIdx + 1, total })}</div>
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
              {isCorrect ? t('placement.correct') : t('placement.wrong')}
            </div>
          )}
          {answered && (
            <button className="pt-next-btn" onClick={next}>
              {questionIdx + 1 >= total ? t('placement.viewResult') : t('placement.nextQuestion')}
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
        <div className="pt-result-emoji" aria-hidden="true"></div>
        <h1>{t('placement.resultTitle')}</h1>
        <div className="pt-dev-circle" style={{ borderColor: rank.color }}>
          <span className="pt-dev-num" style={{ color: rank.color }}>{dev}</span>
        </div>
        <div className="pt-rank-label" style={{ color: rank.color }}>{rank.label}</div>
        <div className="pt-correct-count">{t('placement.correctCount', { correct: correctCount, total })}</div>
        <p className="pt-comment">{rank.comment}</p>

        <div className="pt-rec">
          <h3>{t('placement.recommended')}</h3>
          <p className="pt-rec-desc">{t('placement.recommendedDesc')}</p>
          <div className="pt-rec-list">
            {recIds.map((id, i) => {
              const en = (typeof navigator !== 'undefined' && (localStorage.getItem('logic-locale') || navigator.language).startsWith('en'))
              const titlesJa: Record<number, string> = {
                20: 'MECE — 漏れなくダブりなく',
                21: 'ロジックツリー — 問題を分解する',
                22: 'So What / Why So — 論理の検証',
                23: 'ピラミッド原則 — 伝わる話し方',
                24: 'ケーススタディ — 総合演習',
                25: '演繹法 — 一般から個別を導く',
                26: '帰納法 — 個別事例から法則を見つける',
                27: '形式論理 — 「A ならば B」の世界',
              }
              const titlesEn: Record<number, string> = {
                20: 'MECE — Mutually Exclusive, Collectively Exhaustive',
                21: 'Logic Tree — Decomposing Problems',
                22: 'So What / Why So — Validating Logic',
                23: 'Pyramid Principle — Communicating Clearly',
                24: 'Case Studies — Applied Practice',
                25: 'Deduction — From the General to the Specific',
                26: 'Induction — From Cases to Patterns',
                27: 'Formal Logic — The World of "A Implies B"',
              }
              const titles = en ? titlesEn : titlesJa
              return (
                <div key={id} className="pt-rec-item">
                  <span className="pt-rec-num">{i + 1}</span>
                  <span className="pt-rec-title">{titles[id] || `Lesson ${id}`}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="pt-done-btn" onClick={onComplete}>{t('placement.beginButton')}</button>
      </div>
    </div>
  )
}
