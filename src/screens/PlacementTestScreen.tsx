import { useState } from 'react'
import {
  PLACEMENT_QUESTIONS,
  calcDeviation,
  savePlacementResult,
  skipPlacement,
  recommendedLessons,
  type PlacementResult,
} from '../placementData'
import { getGuestId, getNickname, setNickname, defaultNickname } from '../guestId'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { API_BASE } from './apiBase'

interface PlacementTestScreenProps {
  onComplete: () => void
  onBack?: () => void
  onSkip?: () => void
}

async function submitPlacement(deviation: number, correctCount: number, totalCount: number, nickname: string) {
  try {
    await fetch(`${API_BASE}/api/placement/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: getGuestId(), nickname, deviation, correctCount, totalCount }),
    })
  } catch { /* silent */ }
}

export function PlacementTestScreen({ onComplete, onBack, onSkip }: PlacementTestScreenProps) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [nicknameInput, setNicknameInput] = useState(getNickname() || defaultNickname(getGuestId()))

  const total = PLACEMENT_QUESTIONS.length
  const q = PLACEMENT_QUESTIONS[questionIdx]
  const dev = calcDeviation(correctCount, total)
  const progress = step === 'quiz' ? ((questionIdx + 1) / total) * 100 : 0

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

  const handleNext = () => {
    if (questionIdx + 1 >= total) {
        const actualDev = calcDeviation(correctCount, total)
      const result: PlacementResult = {
        deviation: actualDev,
        correctCount,
        totalCount: total,
        completedAt: new Date().toISOString(),
        recommendedLessonIds: recommendedLessons(actualDev),
      }
      savePlacementResult(result)
      submitPlacement(actualDev, correctCount, total, nicknameInput)
      setNickname(nicknameInput)
      setStep('result')
    } else {
      setQuestionIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const handleSkip = () => {
    skipPlacement()
    onSkip?.()
    onComplete()
  }

  if (step === 'intro') {
    return (
      <div className="stack">
        {onBack && (
          <div className="screen-header">
            <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
            <div className="progress-text">PLACEMENT TEST</div>
          </div>
        )}
        <div className="eyebrow accent" style={{ marginTop: onBack ? undefined : 'var(--s-6)' }}>PLACEMENT TEST</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.025em', lineHeight: 1.2 }}>実力診断テスト</h1>
        <div className="card" style={{ marginTop: 'var(--s-4)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>テスト概要</div>
          <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 'var(--s-4)' }}>
            <li>問題数: <b>{total} 問</b></li>
            <li>所要時間: 約 <b>5 分</b></li>
            <li>結果に基づいて偏差値と全国ランキングを算出</li>
            <li>おすすめレッスンもご提案します</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: 'var(--s-3)' }}>
          <label className="label">ニックネーム（ランキング表示用）</label>
          <input
            className="input"
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            maxLength={20}
            placeholder="ニックネームを入力"
          />
        </div>

        <Button variant="primary" size="lg" block onClick={start} style={{ marginTop: 'var(--s-4)' }}>
          テスト開始
          <ArrowRightIcon width={16} height={16} />
        </Button>
        {onSkip && (
          <Button variant="default" size="lg" block onClick={handleSkip}>
            スキップ
          </Button>
        )}
      </div>
    )
  }

  if (step === 'result') {
    const pct = Math.round(dev)
    return (
      <div className="stack">
        <div className="screen-header">
          {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>}
          <div className="progress-text">結果</div>
        </div>
        <div className="eyebrow accent">テスト結果</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>診断結果</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>偏差値</div>
          <div className="display" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {correctCount} / {total} 問正解
          </div>
        </section>
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">診断完了！</div>
          </div>
          <div className="feedback-text">
            偏差値 {pct} でランキングに登録されました。プロフィール画面で全国ランキングを確認できます。
          </div>
        </div>
        <Button variant="primary" size="lg" block onClick={onComplete}>
          結果を確認する
        </Button>
      </div>
    )
  }

  // Quiz step
  return (
    <div className="stack">
      <div className="screen-header">
        {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>}
        <div className="progress-text"><b>{questionIdx + 1}</b> / {total}</div>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>
        {q.topic} · {q.difficulty}
      </div>
      <h2 style={{ fontSize: 20, lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
        {q.question}
      </h2>
      <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const showCorrect = answered && opt.correct
          const showWrong = answered && isSelected && !opt.correct
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="card card-compact"
              style={{
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s-3)',
                borderColor: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : undefined,
                background: showCorrect ? 'rgba(16,185,129,0.06)' : showWrong ? 'rgba(220,38,38,0.06)' : isSelected ? 'var(--brand-soft)' : undefined,
              }}
            >
              <span style={{
                width: 26, height: 26,
                borderRadius: '999px',
                border: '1.5px solid currentColor',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                color: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : 'var(--text-muted)',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1 }}>{opt.label}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <Button variant="primary" size="lg" block onClick={handleNext} style={{ marginTop: 'var(--s-4)' }}>
          {questionIdx + 1 >= total ? '結果を見る' : '次の問題'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
