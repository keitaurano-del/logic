import { useState, useRef, useMemo, type ComponentType } from 'react'
import {
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
import { addWrongAnswers } from './wrongAnswerStore'
import ReportProblem from './ReportProblem'
import { t, localeBody, getLocale } from './i18n'
import { getStepAnnotation, hasAnyAnnotation, savePhraseToFlashcards, type Phrase } from './englishLearningData'
import { isPremium } from './subscription'
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
  const [showTranslation, setShowTranslation] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)
  const [savedPhrases, setSavedPhrases] = useState<Set<string>>(new Set())
  const wrongAnswersRef = useRef<{
    question: string
    correctAnswer: string
    selectedAnswer: string
    explanation: string
    options: { label: string; correct: boolean }[]
  }[]>([])

  const step: LessonStep | undefined = lesson.steps[currentStep]
  const totalSteps = lesson.steps.length
  const progress = ((currentStep + (showResult || step?.type === 'explain' ? 1 : 0)) / totalSteps) * 100

  // English learning mode: premium users on English locale see translation/phrase helpers
  // when annotations exist for this lesson.
  const englishMode = useMemo(
    () => getLocale() === 'en' && isPremium() && hasAnyAnnotation(lesson.id),
    [lesson.id],
  )
  const stepAnnotation = englishMode ? getStepAnnotation(lesson.id, currentStep) : undefined
  const hasTranslation =
    !!stepAnnotation &&
    !!(stepAnnotation.titleJa || stepAnnotation.contentJa || stepAnnotation.questionJa || stepAnnotation.explanationJa || (stepAnnotation.optionsJa && stepAnnotation.optionsJa.length > 0))
  const hasPhrases = !!stepAnnotation?.phrases && stepAnnotation.phrases.length > 0

  const handleSavePhrase = (phrase: Phrase) => {
    savePhraseToFlashcards(phrase, lesson.id, lesson.title)
    setSavedPhrases((prev) => new Set(prev).add(phrase.en))
  }

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
          selectedAnswer: step.options[index]?.label || '',
          explanation: step.explanation,
          options: step.options.map((o) => ({ label: o.label, correct: !!o.correct })),
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
      // 誤答リスト用の永続化（フラッシュカードとは独立）
      if (wrongAnswersRef.current.length > 0) {
        addWrongAnswers(
          wrongAnswersRef.current.map((w) => ({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            category: lesson.category,
            question: w.question,
            correctAnswer: w.correctAnswer,
            selectedAnswer: w.selectedAnswer,
            explanation: w.explanation,
            options: w.options,
          })),
        )
        // AI-generate extra cards for wrong answers
        generateAiCards(lesson.title, lesson.category, wrongAnswersRef.current)
      }
      onComplete?.()
    } else {
      setCurrentStep((s) => s + 1)
      setSelectedOption(null)
      setShowResult(false)
      setShowTranslation(false)
      setShowPhrases(false)
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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

      {/* English-learning toolbar (premium + en locale + annotations available) */}
      {englishMode && (hasTranslation || hasPhrases) && (
        <div className="ls-en-toolbar" role="toolbar" aria-label={t('englishLearning.toolbarLabel')}>
          {hasTranslation && (
            <button
              type="button"
              className={`ls-en-toolbar-btn${showTranslation ? ' active' : ''}`}
              onClick={() => setShowTranslation((v) => !v)}
              aria-pressed={showTranslation}
            >
              <span aria-hidden="true">あ</span>
              {showTranslation ? t('englishLearning.hideTranslation') : t('englishLearning.showTranslation')}
            </button>
          )}
          {hasPhrases && (
            <button
              type="button"
              className={`ls-en-toolbar-btn${showPhrases ? ' active' : ''}`}
              onClick={() => setShowPhrases((v) => !v)}
              aria-pressed={showPhrases}
            >
              <span aria-hidden="true">📖</span>
              {showPhrases ? t('englishLearning.hidePhrases') : t('englishLearning.showPhrases')}
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="ls-content">
        {step.type === 'explain' ? (
          <div className="ls-explain">
            <div className="ls-explain-header">
              <h3>{step.title}</h3>
              {showTranslation && stepAnnotation?.titleJa && (
                <p className="ls-en-translation ls-en-translation-title">{stepAnnotation.titleJa}</p>
              )}
            </div>
            <div className="ls-explain-body">
              {step.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
              {showTranslation && stepAnnotation?.contentJa && (
                <div className="ls-en-translation ls-en-translation-body">
                  {stepAnnotation.contentJa.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
              )}
              {step.visual && diagramMap[step.visual] && (() => {
                const Diagram = diagramMap[step.visual!]
                return <Diagram />
              })()}
            </div>
            {showPhrases && stepAnnotation?.phrases && (
              <PhrasePanel
                phrases={stepAnnotation.phrases}
                savedPhrases={savedPhrases}
                onSave={handleSavePhrase}
              />
            )}
            <button className="ls-next-btn" onClick={handleNext}>
              {t('lesson.next')}
            </button>
          </div>
        ) : step.type === 'quiz' ? (
          <div className="ls-quiz">
            <div className="ls-quiz-header">
              <h3>{step.question}</h3>
            </div>
            {showTranslation && stepAnnotation?.questionJa && (
              <p className="ls-en-translation ls-en-translation-title">{stepAnnotation.questionJa}</p>
            )}
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
                    <span className="ls-option-text">
                      {opt.label}
                      {showTranslation && stepAnnotation?.optionsJa?.[i] && (
                        <span className="ls-en-translation ls-en-translation-inline">
                          {stepAnnotation.optionsJa[i]}
                        </span>
                      )}
                    </span>
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
                {showTranslation && stepAnnotation?.explanationJa && (
                  <p className="ls-en-translation ls-en-translation-feedback">{stepAnnotation.explanationJa}</p>
                )}
              </div>
            )}
            {showPhrases && stepAnnotation?.phrases && (
              <PhrasePanel
                phrases={stepAnnotation.phrases}
                savedPhrases={savedPhrases}
                onSave={handleSavePhrase}
              />
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

type PhrasePanelProps = {
  phrases: Phrase[]
  savedPhrases: Set<string>
  onSave: (phrase: Phrase) => void
}

function PhrasePanel({ phrases, savedPhrases, onSave }: PhrasePanelProps) {
  return (
    <div className="ls-en-phrases" role="region" aria-label={t('englishLearning.phrasesLabel')}>
      <div className="ls-en-phrases-header">
        <span className="ls-en-phrases-title">{t('englishLearning.phrasesTitle')}</span>
        <span className="ls-en-phrases-hint">{t('englishLearning.phrasesHint')}</span>
      </div>
      <ul className="ls-en-phrases-list">
        {phrases.map((p) => {
          const saved = savedPhrases.has(p.en)
          return (
            <li key={p.en} className="ls-en-phrase">
              <div className="ls-en-phrase-main">
                <p className="ls-en-phrase-en">{p.en}</p>
                <p className="ls-en-phrase-ja">{p.ja}</p>
                {p.note && <p className="ls-en-phrase-note">{p.note}</p>}
              </div>
              <button
                type="button"
                className={`ls-en-phrase-save${saved ? ' saved' : ''}`}
                onClick={() => onSave(p)}
                disabled={saved}
                aria-label={saved ? t('englishLearning.phraseSaved') : t('englishLearning.savePhrase')}
              >
                {saved ? t('englishLearning.phraseSaved') : t('englishLearning.savePhrase')}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
