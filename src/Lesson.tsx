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
  DeductionDiagram,
  InductionDiagram,
  ContrapositiveDiagram,
} from './LessonDiagrams'
import type { LessonData, LessonStep } from './lessonData'
import { generateFromLesson, addCards } from './flashcardData'
import ReportProblem from './ReportProblem'
import { t, localeBody } from './i18n'
import './Lesson.css'

import { API_BASE } from './apiBase'

async function generateAiCards(lessonTitle: string, category: string, wrongAnswers: { question: string; correctAnswer: string }[]) {
  try {
    const res = await fetch(`${API_BASE}/api/flashcards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localeBody({ wrongAnswers, category, lessonTitle })),
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
  DeductionDiagram,
  InductionDiagram,
  ContrapositiveDiagram,
}

type Props = {
  lesson: LessonData
  onBack: () => void
  onComplete?: () => void
  onNextLesson?: () => void
}

export default function Lesson({ lesson, onBack, onComplete, onNextLesson }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showReport, setShowReport] = useState(false)
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
    const isPerfect = correctCount === quizCount
    const isGood = correctCount >= quizCount * 0.7
    const scorePct = quizCount > 0 ? (correctCount / quizCount) * 100 : 0
    // SVG ring params
    const R = 54
    const C = 2 * Math.PI * R
    const dash = (scorePct / 100) * C
    return (
      <div className="lesson-screen">
        <header className="ls-header">
          <button className="ls-back" onClick={onBack}>←</button>
          <span className="ls-title">{lesson.title}</span>
          <div />
        </header>
        <div className="ls-complete">
          {/* Score ring */}
          <div className="ls-score-ring-wrap">
            <svg className="ls-score-ring" width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r={R}
                fill="none"
                stroke={isPerfect ? 'var(--success)' : isGood ? 'var(--accent)' : 'var(--text-muted)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${C}`}
                strokeDashoffset={C * 0.25}
                className="ls-score-ring-fill"
              />
            </svg>
            <div className="ls-score-ring-inner">
              <span className="ls-score-ring-num">{correctCount}<span className="ls-score-ring-total">/{quizCount}</span></span>
              <span className="ls-score-ring-label">SCORE</span>
            </div>
          </div>

          <h2>{t('lesson.completedH1')}</h2>
          <p className="ls-complete-msg">
            {isPerfect
              ? t('lesson.completedPerfect')
              : isGood
                ? t('lesson.completedGood')
                : t('lesson.completedRetry')}
          </p>
          <div className="ls-complete-actions">
            {onNextLesson && (
              <button className="ls-next-lesson-btn" onClick={onNextLesson}>
                {t('lesson.nextLesson')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}
            <button className="ls-done-btn" onClick={onBack}>
              {t('lesson.backHome')}
            </button>
          </div>
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
              {t('lesson.next')}
            </button>
          </div>
        ) : step.type === 'quiz' ? (
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
                <div className="ls-feedback-header">
                  <span className="ls-feedback-icon">
                    {step.options[selectedOption!].correct
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                  </span>
                  <p className="ls-feedback-title">
                    {step.options[selectedOption!].correct ? t('lesson.correctMark') : t('lesson.wrongMark')}
                  </p>
                </div>
                <p className="ls-feedback-text">{step.explanation}</p>
              </div>
            )}
            {showResult && (
              <button className="ls-next-btn" onClick={handleNext}>
                {currentStep + 1 >= totalSteps ? t('lesson.viewResult') : t('lesson.next')}
              </button>
            )}
            <button className="ls-report-btn" onClick={() => setShowReport(true)}>
              {t('lesson.report')}
            </button>
          </div>
        ) : null}
      </div>
      {showReport && step.type === 'quiz' && (
        <ReportProblem
          lessonTitle={lesson.title}
          lessonId={lesson.id}
          question={step.question}
          options={step.options}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
