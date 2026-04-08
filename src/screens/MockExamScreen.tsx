import { useEffect, useMemo, useRef, useState } from 'react'
import { journalQuestions, accountQuestions, settlementQuestions } from '../boki3Exercises'
import type { QuizOption } from '../lessonData'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface MockExamScreenProps {
  onBack: () => void
}

interface Question {
  id: string
  question: string
  options: QuizOption[]
  explanation: string
  section: number
}

type State = 'intro' | 'exam' | 'result'

const EXAM_DURATION_MS = 60 * 60 * 1000 // 60 minutes

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildExam(): Question[] {
  const s1 = shuffle(journalQuestions).slice(0, 15).map((q, i) => ({
    id: `s1-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 1,
  }))
  const s2 = shuffle(accountQuestions).slice(0, 5).map((q, i) => ({
    id: `s2-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 2,
  }))
  const s3 = shuffle(settlementQuestions).slice(0, 5).map((q, i) => ({
    id: `s3-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 3,
  }))
  return [...s1, ...s2, ...s3]
}

function formatTime(ms: number): string {
  if (ms < 0) ms = 0
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MockExamScreen({ onBack }: MockExamScreenProps) {
  const [state, setState] = useState<State>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [idx, setIdx] = useState(0)
  const [remaining, setRemaining] = useState(EXAM_DURATION_MS)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (state !== 'exam') return
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const left = EXAM_DURATION_MS - elapsed
      setRemaining(left)
      if (left <= 0) {
        clearInterval(interval)
        setState('result')
        recordCompletion('mock-exam')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [state])

  const startExam = () => {
    setQuestions(buildExam())
    setAnswers({})
    setIdx(0)
    startRef.current = Date.now()
    setRemaining(EXAM_DURATION_MS)
    setState('exam')
  }

  const submitExam = () => {
    recordCompletion('mock-exam')
    setState('result')
  }

  const score = useMemo(() => {
    if (state !== 'result') return { correct: 0, total: 0 }
    let correct = 0
    for (const q of questions) {
      const ans = answers[q.id]
      if (ans != null && q.options[ans]?.correct) correct++
    }
    return { correct, total: questions.length }
  }, [state, questions, answers])

  if (state === 'intro') {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
          <div className="progress-text">MOCK EXAM</div>
        </div>

        <div className="eyebrow accent">PRACTICE TEST</div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          簿記3級 模擬試験
        </h1>

        <div className="card" style={{ marginTop: 'var(--s-4)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>テスト概要</div>
          <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 'var(--s-4)' }}>
            <li>制限時間: <b>60 分</b></li>
            <li>問題数: <b>25 問</b>（第1問 15 / 第2問 5 / 第3問 5）</li>
            <li>合格ライン: <b>70%</b></li>
            <li>途中でタブを閉じると回答は失われます</li>
          </ul>
        </div>

        <Button variant="primary" size="lg" block onClick={startExam} style={{ marginTop: 'var(--s-4)' }}>
          テスト開始
          <ArrowRightIcon width={16} height={16} />
        </Button>
      </div>
    )
  }

  if (state === 'exam') {
    const q = questions[idx]
    const progress = ((idx + 1) / questions.length) * 100
    const selected = answers[q.id]
    const answered = Object.keys(answers).length

    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={() => confirm('テストを中断しますか?') && setState('intro')}>
            <ArrowLeftIcon />
          </IconButton>
          <div className="progress-text">
            <b>{idx + 1}</b> / {questions.length}
          </div>
          <div
            className="mono"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: remaining < 5 * 60 * 1000 ? 'var(--danger)' : 'var(--brand)',
            }}
          >
            {formatTime(remaining)}
          </div>
        </div>

        <div className="progress">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>
          第{q.section}問
        </div>
        <h2
          style={{
            fontSize: 20,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-display)',
          }}
        >
          {q.question}
        </h2>

        <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            return (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className="card card-compact"
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: 14,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--s-3)',
                  borderColor: isSelected ? 'var(--brand)' : undefined,
                  background: isSelected ? 'var(--brand-soft)' : undefined,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '999px',
                    border: '1.5px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    color: isSelected ? 'var(--brand)' : 'var(--text-muted)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
              </button>
            )
          })}
        </div>

        <div className="row-between" style={{ marginTop: 'var(--s-4)', gap: 'var(--s-2)' }}>
          <Button
            variant="default"
            size="md"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            前へ
          </Button>
          <span className="muted" style={{ fontSize: 12 }}>
            {answered} / {questions.length} 回答済み
          </span>
          {idx < questions.length - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIdx((i) => i + 1)}
            >
              次へ
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={submitExam}>
              提出
            </Button>
          )}
        </div>
      </div>
    )
  }

  // result state
  const passed = score.total > 0 && score.correct / score.total >= 0.7
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">RESULT</div>
      </div>

      <div className="eyebrow accent">MOCK EXAM RESULT</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>模擬試験の結果</h1>

      <section className="profile-hero" style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div
            className="eyebrow"
            style={{
              color: 'rgba(255,255,255,0.65)',
              marginBottom: 'var(--s-3)',
            }}
          >
            SCORE
          </div>
          <div
            className="display"
            style={{
              fontSize: 80,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
            }}
          >
            {pct}%
          </div>
          <div
            style={{
              marginTop: 'var(--s-3)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
            }}
          >
            {score.correct} / {score.total} 問正解
          </div>
          <div
            className="badge"
            style={{
              marginTop: 'var(--s-3)',
              background: passed ? 'var(--success)' : 'rgba(255,255,255,0.16)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12,
              padding: '6px 14px',
            }}
          >
            {passed ? '合格' : '不合格（70% 必要）'}
          </div>
        </div>
      </section>

      {passed && (
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check">
              <CheckIcon />
            </div>
            <div className="feedback-title">Congratulations!</div>
          </div>
          <div className="feedback-text">合格ラインを超えました。次の試験に向けてさらに学習を続けましょう。</div>
        </div>
      )}

      <Button variant="default" size="lg" block onClick={() => setState('intro')}>
        もう一度受ける
      </Button>
      <Button variant="primary" size="lg" block onClick={onBack}>
        ホームに戻る
      </Button>
    </div>
  )
}
