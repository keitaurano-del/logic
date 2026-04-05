import { useState, useRef, type ComponentType } from 'react'
import {
  TAccountDiagram,
  AccountGroupsDiagram,
  JournalEntryDiagram,
  SettlementFlowDiagram,
  FinancialStatementsDiagram,
  AdjustmentsDiagram,
  ConsolidationDiagram,
  TaxEffectDiagram,
  LeaseDiagram,
  SecuritiesDiagram,
  CostFlowDiagram,
  VarianceAnalysisDiagram,
  CVPDiagram,
  MecePatternsDiagram,
  MeceCaseDiagram,
  LogicTreeDiagram,
  LogicTreeCaseDiagram,
  SoWhatDiagram,
  PyramidDiagram,
  PrepDiagram,
} from './LessonDiagrams'
import type { LessonData, LessonStep } from './lessonData'
import { generateFromLesson, addCards } from './flashcardData'
import './Lesson.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

async function generateAiCards(lessonTitle: string, category: string, wrongAnswers: { question: string; correctAnswer: string }[]) {
  try {
    const res = await fetch(`${API_BASE}/api/flashcards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrongAnswers, category, lessonTitle }),
    })
    if (!res.ok) return
    const data = await res.json()
    if (data.cards) {
      addCards(data.cards.map((c: { front: string; back: string }) => ({
        front: c.front,
        back: c.back,
        category: lessonTitle,
        source: 'ai-weak',
      })))
    }
  } catch { /* silent */ }
}

const diagramMap: Record<string, ComponentType> = {
  TAccountDiagram,
  AccountGroupsDiagram,
  JournalEntryDiagram,
  SettlementFlowDiagram,
  FinancialStatementsDiagram,
  AdjustmentsDiagram,
  ConsolidationDiagram,
  TaxEffectDiagram,
  LeaseDiagram,
  SecuritiesDiagram,
  CostFlowDiagram,
  VarianceAnalysisDiagram,
  CVPDiagram,
  MecePatternsDiagram,
  MeceCaseDiagram,
  LogicTreeDiagram,
  LogicTreeCaseDiagram,
  SoWhatDiagram,
  PyramidDiagram,
  PrepDiagram,
}

type Props = {
  lesson: LessonData
  onBack: () => void
  onComplete?: () => void
}

export default function Lesson({ lesson, onBack, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const wrongAnswersRef = useRef<{ question: string; correctAnswer: string; explanation: string }[]>([])

  const step: LessonStep | undefined = lesson.steps[currentStep]
  const totalSteps = lesson.steps.length
  const progress = ((currentStep + (showResult || step?.type === 'explain' ? 1 : 0)) / totalSteps) * 100

  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelectedOption(index)
    setShowResult(true)
    if (step.type === 'quiz') {
      if (step.options[index].correct) {
        setCorrectCount((c) => c + 1)
      } else {
        const correct = step.options.find((o) => o.correct)
        wrongAnswersRef.current.push({
          question: step.question,
          correctAnswer: correct?.label || '',
          explanation: step.explanation,
        })
      }
    }
  }

  const handleNext = () => {
    if (currentStep + 1 >= totalSteps) {
      setFinished(true)
      // Generate flashcards from wrong answers + explain steps
      const explainSteps = lesson.steps
        .filter((s): s is import('./lessonData').ExplainStep => s.type === 'explain')
        .map((s) => ({ title: s.title, content: s.content }))
      generateFromLesson(lesson.id, lesson.title, wrongAnswersRef.current, explainSteps)
      // AI-generate extra cards for wrong answers
      if (wrongAnswersRef.current.length > 0) {
        generateAiCards(lesson.title, lesson.category, wrongAnswersRef.current)
      }
      onComplete?.()
    } else {
      setCurrentStep((s) => s + 1)
      setSelectedOption(null)
      setShowResult(false)
    }
  }

  const quizCount = lesson.steps.filter((s) => s.type === 'quiz').length

  if (finished) {
    return (
      <div className="lesson-screen">
        <header className="ls-header">
          <button className="ls-back" onClick={onBack}>←</button>
          <span className="ls-title">{lesson.title}</span>
          <div />
        </header>
        <div className="ls-complete">
          <h2>レッスン完了！</h2>
          <p className="ls-score">{correctCount} / {quizCount} 問正解</p>
          <div className="ls-score-bar">
            <div
              className="ls-score-fill"
              style={{ width: `${(correctCount / quizCount) * 100}%` }}
            />
          </div>
          <p className="ls-complete-msg">
            {correctCount === quizCount
              ? 'パーフェクト！素晴らしい理解力です。'
              : correctCount >= quizCount * 0.7
                ? 'よくできました！復習して完璧にしましょう。'
                : 'もう一度復習してみましょう！'}
          </p>
          <button className="ls-done-btn" onClick={onBack}>
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-screen">
      {/* Header */}
      <header className="ls-header">
        <button className="ls-back" onClick={onBack}>←</button>
        <span className="ls-title">{lesson.title}</span>
        <span className="ls-step-count">{currentStep + 1}/{totalSteps}</span>
      </header>

      {/* Progress bar */}
      <div className="ls-progress">
        <div className="ls-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className="ls-content">
        {step.type === 'explain' ? (
          <div className="ls-explain">
            <div className="ls-explain-header">
              <h3>{step.title}</h3>
            </div>
            <div className="ls-explain-body">
              {step.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
              {step.visual && diagramMap[step.visual] && (() => {
                const Diagram = diagramMap[step.visual!]
                return <Diagram />
              })()}
            </div>
            <button className="ls-next-btn" onClick={handleNext}>
              次へ
            </button>
          </div>
        ) : (
          <div className="ls-quiz">
            <div className="ls-quiz-header">
              <h3>{step.question}</h3>
            </div>
            <div className="ls-options">
              {step.options.map((opt, i) => {
                let cls = 'ls-option'
                if (showResult) {
                  if (opt.correct) cls += ' correct'
                  else if (i === selectedOption) cls += ' wrong'
                }
                if (i === selectedOption && !showResult) cls += ' selected'
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleAnswer(i)}
                    disabled={showResult}
                  >
                    <span className="ls-option-label">
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {showResult && (
              <div className={`ls-feedback ${step.options[selectedOption!].correct ? 'correct' : 'wrong'}`}>
                <p className="ls-feedback-title">
                  {step.options[selectedOption!].correct ? '正解！' : '不正解...'}
                </p>
                <p className="ls-feedback-text">{step.explanation}</p>
              </div>
            )}
            {showResult && (
              <button className="ls-next-btn" onClick={handleNext}>
                {currentStep + 1 >= totalSteps ? '結果を見る' : '次へ'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
