import { useState, useEffect, useRef, useCallback } from 'react'
import { journalQuestions, accountQuestions, settlementQuestions } from './boki3Exercises'
import type { QuizOption } from './lessonData'
import './MockExam.css'

type Question = {
  id: string
  question: string
  options: QuizOption[]
  explanation: string
  section: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildExam(): { questions: Question[]; sectionSizes: number[] } {
  const s1 = shuffle(journalQuestions).slice(0, 15).map((q, i) => ({
    id: `s1-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 1,
  }))
  const s2 = shuffle(accountQuestions).slice(0, 5).map((q, i) => ({
    id: `s2-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 2,
  }))
  const s3 = shuffle(settlementQuestions).slice(0, 5).map((q, i) => ({
    id: `s3-${i}`, question: q.question, options: q.options, explanation: q.explanation, section: 3,
  }))
  return { questions: [...s1, ...s2, ...s3], sectionSizes: [s1.length, s2.length, s3.length] }
}

type ExamState = 'intro' | 'exam' | 'result'

export default function MockExam({ onBack, onComplete }: { onBack: () => void; onComplete?: () => void }) {
  const [state, setState] = useState<ExamState>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [sectionSizes, setSectionSizes] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(60 * 60) // 60 minutes
  const [showAnswer, setShowAnswer] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startExam = useCallback(() => {
    const { questions: q, sectionSizes: s } = buildExam()
    setQuestions(q)
    setSectionSizes(s)
    setCurrent(0)
    setAnswers({})
    setTimeLeft(60 * 60)
    setShowAnswer(false)
    setState('exam')
  }, [])

  useEffect(() => {
    if (state === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            setState('result')
            onComplete?.()
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [state])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleAnswer = (optIdx: number) => {
    if (showAnswer) return
    setAnswers((a) => ({ ...a, [questions[current].id]: optIdx }))
    setShowAnswer(true)
  }

  const handleNext = () => {
    setShowAnswer(false)
    if (current + 1 >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current)
      setState('result')
      onComplete?.()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  const getSectionLabel = (section: number) => {
    switch (section) {
      case 1: return '大問1：仕訳'
      case 2: return '大問2：勘定記入・補助簿'
      case 3: return '大問3：決算・精算表'
      default: return ''
    }
  }

  // --- Intro ---
  if (state === 'intro') {
    return (
      <div className="mock-screen">
        <header className="mock-header">
          <button className="mock-back" onClick={onBack}>←</button>
          <span>模擬試験</span>
          <div />
        </header>
        <div className="mock-intro">
          <h2>簿記3級 模擬試験</h2>
          <div className="mock-info-card">
            <div className="mock-info-row"><span>試験時間</span><strong>60分</strong></div>
            <div className="mock-info-row"><span>出題数</span><strong>25問（3大問）</strong></div>
            <div className="mock-info-row"><span>合格ライン</span><strong>70%（18問正解）</strong></div>
            <div className="mock-info-row"><span>構成</span><strong>仕訳15問 / 勘定5問 / 決算5問</strong></div>
          </div>
          <p className="mock-intro-note">問題はランダムに出題されます。制限時間内に全問解答してください。</p>
          <button className="mock-start-btn" onClick={startExam}>試験開始</button>
        </div>
      </div>
    )
  }

  // --- Result ---
  if (state === 'result') {
    let s1Correct = 0, s2Correct = 0, s3Correct = 0
    questions.forEach((q) => {
      const ans = answers[q.id]
      if (ans !== undefined && q.options[ans]?.correct) {
        if (q.section === 1) s1Correct++
        if (q.section === 2) s2Correct++
        if (q.section === 3) s3Correct++
      }
    })
    const total = s1Correct + s2Correct + s3Correct
    const totalQ = questions.length
    const pct = Math.round((total / totalQ) * 100)
    const passed = pct >= 70

    // 配点（本試験に近い）
    const s1Score = Math.round((s1Correct / sectionSizes[0]) * 45)
    const s2Score = Math.round((s2Correct / sectionSizes[1]) * 20)
    const s3Score = Math.round((s3Correct / sectionSizes[2]) * 35)
    const totalScore = s1Score + s2Score + s3Score

    // 弱点分析
    const topicMap: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q) => {
      const ans = answers[q.id]
      const isCorrect = ans !== undefined && q.options[ans]?.correct
      // Get topic from original question data
      if (!topicMap['全体']) topicMap['全体'] = { correct: 0, total: 0 }
      topicMap['全体'].total++
      if (isCorrect) topicMap['全体'].correct++
    })

    return (
      <div className="mock-screen">
        <header className="mock-header">
          <button className="mock-back" onClick={onBack}>←</button>
          <span>試験結果</span>
          <div />
        </header>
        <div className="mock-result">
          <div className={`mock-verdict ${passed ? 'pass' : 'fail'}`}>
            {passed ? '合格' : '不合格'}
          </div>
          <div className="mock-total-score">
            <span className="mock-score-num">{totalScore}</span>
            <span className="mock-score-den">/ 100点</span>
          </div>
          <div className="mock-score-bar-outer">
            <div className={`mock-score-bar-inner ${passed ? 'pass' : 'fail'}`} style={{ width: `${totalScore}%` }} />
            <div className="mock-pass-line" />
          </div>
          <p className="mock-pass-label">合格ライン: 70点</p>

          <div className="mock-section-scores">
            <div className="mock-sec-score">
              <span className="mock-sec-label">大問1 仕訳</span>
              <span className="mock-sec-detail">{s1Correct}/{sectionSizes[0]}問</span>
              <strong>{s1Score}/45点</strong>
            </div>
            <div className="mock-sec-score">
              <span className="mock-sec-label">大問2 勘定記入</span>
              <span className="mock-sec-detail">{s2Correct}/{sectionSizes[1]}問</span>
              <strong>{s2Score}/20点</strong>
            </div>
            <div className="mock-sec-score">
              <span className="mock-sec-label">大問3 決算</span>
              <span className="mock-sec-detail">{s3Correct}/{sectionSizes[2]}問</span>
              <strong>{s3Score}/35点</strong>
            </div>
          </div>

          <p className="mock-result-msg">
            {passed
              ? '合格ラインをクリアしました！この調子で本番も頑張りましょう。苦手な分野があれば復習しておくとさらに安心です。'
              : '惜しい結果でした。間違えた問題を復習して、もう一度チャレンジしましょう。繰り返し解くことで確実に力がつきます。'}
          </p>

          <div className="mock-result-actions">
            <button className="mock-retry-btn" onClick={startExam}>もう一度受験</button>
            <button className="mock-done-btn" onClick={onBack}>戻る</button>
          </div>
        </div>
      </div>
    )
  }

  // --- Exam ---
  const q = questions[current]
  const currentSection = q.section
  const prevSection = current > 0 ? questions[current - 1].section : 0
  const isNewSection = currentSection !== prevSection

  return (
    <div className="mock-screen">
      <header className="mock-header">
        <button className="mock-back" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onBack() }}>←</button>
        <span className="mock-timer">{formatTime(timeLeft)}</span>
        <span className="mock-progress">{current + 1}/{questions.length}</span>
      </header>

      <div className="mock-progress-bar">
        <div className="mock-progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="mock-exam-content">
        {isNewSection && (
          <div className="mock-section-label">{getSectionLabel(currentSection)}</div>
        )}

        <div className="mock-question">
          <p className="mock-q-text">{q.question}</p>
        </div>

        <div className="mock-options">
          {q.options.map((opt, i) => {
            let cls = 'mock-option'
            if (showAnswer) {
              if (opt.correct) cls += ' correct'
              else if (i === answers[q.id]) cls += ' wrong'
            } else if (i === answers[q.id]) {
              cls += ' selected'
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={showAnswer}>
                <span className="mock-opt-label">{['A', 'B', 'C', 'D'][i]}</span>
                {opt.label}
              </button>
            )
          })}
        </div>

        {showAnswer && (
          <div className={`mock-feedback ${q.options[answers[q.id]]?.correct ? 'correct' : 'wrong'}`}>
            <strong>{q.options[answers[q.id]]?.correct ? '正解！' : '不正解'}</strong>
            <p>{q.explanation}</p>
          </div>
        )}

        {showAnswer && (
          <button className="mock-next-btn" onClick={handleNext}>
            {current + 1 >= questions.length ? '結果を見る' : '次の問題'}
          </button>
        )}
      </div>
    </div>
  )
}
