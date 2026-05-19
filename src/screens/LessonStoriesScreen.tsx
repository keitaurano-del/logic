/**
 * LessonStoriesScreen - Logic v3 Stories-style lesson
 * 仕様: docs/DESIGN_V3.md §3.3
 * モックアップ: lv3-lesson.html
 */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { BookmarkIcon, BookmarkFilledIcon, CheckIcon, SparklesIcon, LightbulbIcon, BrainIcon, ClipboardListIcon } from '../icons'
import type { LessonSlide } from '../lessonSlides'
import { convertLessonToSlides } from '../lessonSlides'
import { allLessons } from '../lessonData'
import { addXp } from '../stats'
import { LessonThumbnail } from '../components/LessonThumbnail'
import { API_BASE } from './apiBase'
import { t } from '../i18n'
import { tutorial } from '../tutorial/tutorialStorage'
import { addWrongAnswers } from '../wrongAnswerStore'
import { generateFromLesson } from '../flashcardData'
import { isSaved, toggleSaved } from '../savedItemsStore'
import { haptic } from '../platform/haptics'

type WrongAnswerCapture = {
  slideIndex: number
  question: string
  correctAnswer: string
  selectedAnswer: string
  explanation: string
  options: { label: string; correct: boolean }[]
}

interface LessonStoriesScreenProps {
  lessonId: number
  startStep?: number
  onComplete: () => void
  onClose: () => void
}

export function LessonStoriesScreen(props: LessonStoriesScreenProps) {
  const { lessonId, startStep, onComplete, onClose } = props
  const lesson = allLessons[lessonId]
  const [index, setIndex] = useState(startStep ?? 0)
  const [quizAnswered, setQuizAnswered] = useState<{ correct: boolean; selected: number; selectedMulti?: number[] } | null>(null)
  const [multiSelected, setMultiSelected] = useState<number[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  // 初回レッスン時のタップヒント（右半分=次/左半分=前）
  const [showTapHint, setShowTapHint] = useState(() => !tutorial.hasSeenLesson())

  // ── タッチガード: スライド遷移後 280ms は全タッチを無視 ──
  const slideEnteredAt = useRef<number>(0)
  const isGuarded = () => Date.now() - slideEnteredAt.current < 280
  useEffect(() => {
    slideEnteredAt.current = Date.now()
  }, [index])

  // ===== Swipe 用 touchRef（早期 return より前で確保し Hooks 順を固定） =====
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)

  // 誤答キャプチャ：「最初に間違えた瞬間」だけ記録（Stories型UIは再挑戦できるため）
  const wrongAnswersRef = useRef<WrongAnswerCapture[]>([])
  const capturedSlideIndicesRef = useRef<Set<number>>(new Set())

  // 保存（ブックマーク）状態 — レッスン全体
  const [saved, setSaved] = useState<boolean>(() => isSaved('lesson', lessonId))
  // 保存（ブックマーク）状態 — 現在のページ。state ではなく毎レンダー算出
  const [, bumpSaved] = useState(0)
  const bumpPageSaved = () => bumpSaved((v) => v + 1)
  const pageSaved = isSaved('lesson-step', `${lessonId}:${index}`)

  const slides: LessonSlide[] = useMemo(() => {
    if (!lesson) return []
    return convertLessonToSlides(lesson)
  }, [lesson])

  if (!lesson || slides.length === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div>{t('stories.notFound')}</div>
          <button onClick={onClose} style={{ marginTop: 20, padding: '10px 20px', borderRadius: 12, background: 'var(--brand)', color: '#FFFFFF', border: 'none', fontWeight: 700 }}>{t('stories.back')}</button>
        </div>
      </div>
    )
  }

  const slide = slides[index]
  const total = slides.length
  const isQuiz = slide.kind === 'quiz'

  const goNext = () => {
    if (isGuarded()) return
    if (index < total - 1) {
      setIndex(index + 1)
      setQuizAnswered(null)
      setMultiSelected([])
    } else {
      // 完了：誤答リストを永続化（最初に間違えた瞬間に記録済み）
      if (lesson && wrongAnswersRef.current.length > 0) {
        addWrongAnswers(
          wrongAnswersRef.current.map((w) => ({
            lessonId,
            lessonTitle: lesson.title,
            category: lesson.category,
            question: w.question,
            correctAnswer: w.correctAnswer,
            selectedAnswer: w.selectedAnswer,
            explanation: w.explanation,
            options: w.options,
          })),
        )
      }
      // 完了：フラッシュカードを生成（誤答 + concept/summary/think スライドから自動でカード化）
      if (lesson) {
        const explainSteps: { title: string; content: string }[] = []
        for (const s of slides) {
          if (s.kind === 'concept' || s.kind === 'intro') {
            explainSteps.push({ title: s.title, content: s.body })
          } else if (s.kind === 'summary') {
            explainSteps.push({ title: s.title, content: s.points.join('\n') })
          } else if (s.kind === 'think') {
            explainSteps.push({ title: s.question, content: s.points.join('\n') })
          }
        }
        const wrongs = wrongAnswersRef.current.map((w) => ({
          question: w.question,
          correctAnswer: w.correctAnswer,
          explanation: w.explanation,
        }))
        if (wrongs.length > 0 || explainSteps.length > 0) {
          generateFromLesson(lessonId, lesson.title, wrongs, explainSteps)
        }
      }
      addXp('lesson')
      onComplete()
    }
  }
  const goPrev = () => {
    if (isGuarded()) return
    if (index > 0) {
      setIndex(index - 1)
      setQuizAnswered(null)
      setMultiSelected([])  // 戻り時もmultiSelectedをリセット
    }
  }

  // ===== Swipe 対応 =====
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const dt = Date.now() - start.t
    touchRef.current = null
    // 水平スワイプ識別: 50px以上、垂直より水平が長い、500ms以内
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      if (reportOpen) return  // モーダル表示中はスワイプ無効
      // クイズスライドは正解後のみ前進可（不正解時・未回答時は前進禁止）
      if (dx < 0 && isQuiz && !quizAnswered?.correct) return
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)', position: 'relative', touchAction: 'pan-y' }}
    >
      {/* Progress bars — v3 mint accentでコントラストを上げる */}
      <div style={{ display: 'flex', gap: 5, padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 16px 12px' }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--brand)', width: i < index ? '100%' : i === index ? '55%' : '0%', transition: 'width .3s ease', boxShadow: i <= index ? `0 0 8px color-mix(in srgb, var(--brand) 50%, transparent)` : 'none' }}></div>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={'var(--brand)'} aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)' }}>{lesson.category}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{lesson.title}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation()
              haptic.light()
              const next = toggleSaved({
                type: 'lesson',
                refId: lessonId,
                title: lesson.title,
                subtitle: lesson.category,
              })
              setSaved(next)
            }}
            aria-label={saved ? t('stories.unsaveAria') : t('stories.saveAria')}
            aria-pressed={saved}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              border: 'none', zIndex: 10, position: 'relative',
              flexShrink: 0,
              color: saved ? 'var(--brand)' : '#fff',
            }}
          >
            {saved ? <BookmarkFilledIcon width={18} height={18} /> : <BookmarkIcon width={18} height={18} />}
          </button>
          {/* SCRUM-226: ×ボタン — onClickも追加しzIndexをタップゾーンより上に */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }}
            onClick={(e) => { e.stopPropagation(); onClose() }}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', zIndex: 10, position: 'relative', flexShrink: 0 }}
            aria-label={t('stories.closeAria')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: '8px 24px 100px', position: 'relative', overflow: 'auto' }}>
        <div style={{ position: 'absolute', top: 8, right: 24, display: 'flex', alignItems: 'center', gap: 8, zIndex: 6 }}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation()
              haptic.light()
              toggleSaved({
                type: 'lesson-step',
                refId: `${lessonId}:${index}`,
                title: lesson.title,
                subtitle: `${lesson.category} · ${index + 1}/${total}`,
                stepIndex: index,
                parentLessonId: lessonId,
              })
              bumpPageSaved()
            }}
            aria-label={pageSaved ? t('savedItems.unsavePageAria') : t('savedItems.savePageAria')}
            aria-pressed={pageSaved}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: pageSaved ? `color-mix(in srgb, var(--brand) 18%, transparent)` : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              border: 'none', padding: 0,
              color: pageSaved ? 'var(--brand)' : 'var(--text-muted)',
            }}
          >
            {pageSaved ? <BookmarkFilledIcon width={14} height={14} /> : <BookmarkIcon width={14} height={14} />}
          </button>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1} / {total}</span>
        </div>

        <SlideContent
          slide={slide}
          quizAnswered={quizAnswered}
          multiSelected={multiSelected}
          onToggleMulti={(idx) => {
            if (isGuarded() || quizAnswered) return
            setMultiSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
          }}
          onSubmitMulti={() => {
            if (slide.kind !== 'quiz' || !slide.multi) return
            if (isGuarded()) return
            const correctSet = new Set(slide.correctIndexes ?? [slide.correctIndex])
            const selectedSet = new Set(multiSelected)
            const correct = correctSet.size === selectedSet.size && [...correctSet].every(i => selectedSet.has(i))
            if (!correct && !capturedSlideIndicesRef.current.has(index)) {
              capturedSlideIndicesRef.current.add(index)
              wrongAnswersRef.current.push({
                slideIndex: index,
                question: slide.question,
                correctAnswer: [...correctSet].map(i => slide.choices[i]).join('、'),
                selectedAnswer: multiSelected.map(i => slide.choices[i]).join('、'),
                explanation: slide.explain,
                options: slide.choices.map((label, i) => ({ label, correct: correctSet.has(i) })),
              })
            }
            setQuizAnswered({ correct, selected: -1, selectedMulti: multiSelected })
          }}
          onSelectQuiz={(idx) => {
            if (slide.kind !== 'quiz') return
            if (isGuarded()) return
            const correct = idx === slide.correctIndex
            if (!correct && !capturedSlideIndicesRef.current.has(index)) {
              capturedSlideIndicesRef.current.add(index)
              wrongAnswersRef.current.push({
                slideIndex: index,
                question: slide.question,
                correctAnswer: slide.choices[slide.correctIndex] ?? '',
                selectedAnswer: slide.choices[idx] ?? '',
                explanation: slide.explain,
                options: slide.choices.map((label, i) => ({ label, correct: i === slide.correctIndex })),
              })
            }
            setQuizAnswered({ correct, selected: idx })
            if (!correct) {
              setTimeout(() => setQuizAnswered(null), 2500)
            }
          }}
          onNext={goNext}
        />
      </div>

      {/* タップゾーン: クイズ以外・左右端20%のみ（コンテンツエリアに干渉しない） */}
      {!isQuiz && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5, pointerEvents: 'none' }}>
          <button
            type="button"
            aria-label={t('stories.prevSlide')}
            onClick={() => { if (!isGuarded()) goPrev() }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto', background: 'transparent', border: 'none', padding: 0 }}
          />
          <button
            type="button"
            aria-label={t('stories.nextSlide')}
            onClick={() => { if (!isGuarded()) goNext() }}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto', background: 'transparent', border: 'none', padding: 0 }}
          />
        </div>
      )}

      {/* SCRUM-214: デスクトップ向け明示的な次へ/前へボタン（非クイズ・非最初のスライド） */}
      {!isQuiz && (
        <>
          {index > 0 && (
            <button
              onClick={() => { if (!isGuarded()) goPrev() }}
              style={{ position: 'absolute', left: 12, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', zIndex: 8, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              aria-label={t('stories.prevAria')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <button
            onClick={() => { if (!isGuarded()) goNext() }}
            style={{ position: 'absolute', right: 12, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', zIndex: 8, background: 'var(--brand)', border: 'none', borderRadius: 99, height: 44, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: `0 4px 16px color-mix(in srgb, var(--brand) 38%, transparent)`, WebkitTapHighlightColor: 'transparent', fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}
            aria-label={t('stories.nextAria')}
          >
            {t('stories.next')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* クイズ正解後: 「次へ」ボタン（大） */}
      {isQuiz && quizAnswered?.correct && (
        <button
          onClick={goNext}
          style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand)', border: 'none', borderRadius: 99, padding: '18px 48px', fontSize: 16, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', zIndex: 6, boxShadow: `0 4px 20px color-mix(in srgb, var(--brand) 44%, transparent)`, WebkitTapHighlightColor: 'transparent' }}
        >
          {t('stories.next')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Tap hint — 初回レッスンのみ表示（右半分=次/左半分=前） */}
      {showTapHint && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('stories.tapHintTitle')}
          tabIndex={-1}
          onClick={() => { tutorial.markLesson(); setShowTapHint(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { tutorial.markLesson(); setShowTapHint(false) } }}
          onTouchEnd={(e) => { e.stopPropagation(); tutorial.markLesson(); setShowTapHint(false) }}
          style={{
            position: 'absolute', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.78)',
            display: 'flex', alignItems: 'stretch',
            color: '#fff',
            cursor: 'pointer',
            animation: 'tapHintFadeIn .25s ease-out',
          }}
        >
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
            borderRight: '1px dashed rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(255,255,255,0.06)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '.02em' }}>{t('stories.tapHintLeftHeading')}</div>
            <div style={{ fontSize: 13, opacity: 0.78, textAlign: 'center', padding: '0 24px', lineHeight: 1.55 }}>
              {t('stories.tapHintLeftBody')}
            </div>
          </div>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(108,142,245,0.18)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '.02em' }}>{t('stories.tapHintRightHeading')}</div>
            <div style={{ fontSize: 13, opacity: 0.78, textAlign: 'center', padding: '0 24px', lineHeight: 1.55 }}>
              {t('stories.tapHintRightBody')}
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)', left: 0, right: 0,
            textAlign: 'center', fontSize: 12, opacity: 0.6, fontWeight: 600, letterSpacing: '.05em',
          }}>
            {t('stories.tapHintDismiss')}
          </div>
          <style>{`@keyframes tapHintFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
      )}

      {/* SCRUM-215: 誤りを報告 — アイコンのみのコンパクト表示（誤タップ防止）、非クイズ時は次へボタンと重ならない位置へ */}
      <button
        onPointerDown={(e) => { e.stopPropagation(); setReportOpen(true) }}
        style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)', left: 16, fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, cursor: 'pointer', zIndex: 7, padding: '5px 10px', display: slide.kind === 'summary' ? 'none' : 'flex', alignItems: 'center', gap: 5, opacity: 0.9 }}
        title={t('stories.reportTitle')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>{t('stories.reportLink')}
      </button>

      {/* 誤り報告モーダル */}
      {reportOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerDown={() => setReportOpen(false)}>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-primary)', borderRadius: '20px 20px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)', width: '100%' }}
          >
            {reportSent ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: `color-mix(in srgb, var(--brand) 12%, transparent)`, color: 'var(--brand)', marginBottom: 10 }}>
                    <CheckIcon width={22} height={22} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand)' }}>{t('stories.reportReceivedTitle')}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{t('stories.reportReceivedDesc')}</div>
                </div>
                <button onPointerDown={() => { setReportOpen(false); setReportSent(false); setReportText(''); setReportDetail('') }} style={{ width: '100%', background: 'var(--bg-card)', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>{t('stories.close')}</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{t('stories.reportTitle')}</div>
                  <button
                    onPointerDown={() => setReportOpen(false)}
                    style={{ background: 'var(--bg-card)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1 }}
                  >×</button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{t('stories.reportPrompt')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[
                    { value: '内容・説明が間違っている', labelKey: 'stories.reportOpt.contentWrong' },
                    { value: '選択肢の正解が違う', labelKey: 'stories.reportOpt.choiceWrong' },
                    { value: '日本語がおかしい・誤字', labelKey: 'stories.reportOpt.typo' },
                    { value: 'その他', labelKey: 'stories.reportOpt.other' },
                  ].map(opt => (
                    <button key={opt.value} onPointerDown={() => setReportText(opt.value)}
                      style={{ background: reportText === opt.value ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1.5px solid ${reportText === opt.value ? 'var(--brand)' : 'transparent'}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}
                    >{t(opt.labelKey)}</button>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{t('stories.reportDetailLabel')}</div>
                  <textarea
                    aria-label={t('stories.reportDetailAria')}
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    placeholder={t('stories.reportDetailPlaceholder')}
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onPointerDown={async () => {
                    if (!reportText) return
                    try {
                      await fetch(`${API_BASE}/api/report-problem`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          lessonTitle: allLessons[lessonId]?.title ?? '',
                          lessonId,
                          question: '',
                          options: [],
                          issueType: reportText,
                          comment: reportDetail,
                        }),
                      })
                    } catch (e) {
                      console.warn('[report] API call failed (non-fatal):', e)
                    }
                    setReportSent(true)
                  }}
                  disabled={!reportText}
                  style={{ width: '100%', background: reportText ? 'var(--brand)' : 'var(--bg-card)', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: reportText ? '#FFFFFF' : 'var(--text-muted)', cursor: reportText ? 'pointer' : 'default' }}
                >
                  {t('stories.reportSend')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HeroImage({ image, lessonId }: { image: string; lessonId?: number }) {
  const [failed, setFailed] = useState(false)
  const handleError = useCallback(() => setFailed(true), [])
  if (failed && lessonId != null) {
    return <LessonThumbnail lessonId={lessonId} style={{ width: '100%', aspectRatio: '1 / 1' }} />
  }
  return (
    <img
      src={image}
      alt=""
      loading="lazy"
      onError={handleError}
      style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
    />
  )
}

function SlideContent({ slide, quizAnswered, multiSelected, onToggleMulti, onSubmitMulti, onSelectQuiz, onNext }: {
  slide: LessonSlide
  quizAnswered: { correct: boolean; selected: number; selectedMulti?: number[] } | null
  multiSelected: number[]
  onToggleMulti: (idx: number) => void
  onSubmitMulti: () => void
  onSelectQuiz: (idx: number) => void
  onNext: () => void
}) {
  if (slide.kind === 'hero') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
        <div style={{ marginTop: 8, marginBottom: 24, borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-v3-hero)' }}>
          <HeroImage image={slide.image} lessonId={slide.lessonId} />
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-soft)', borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--brand)', marginBottom: 16, width: 'fit-content' }}>{slide.category}</span>
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{slide.meta}</div>
      </div>
    )
  }
  if (slide.kind === 'concept' || slide.kind === 'intro') {
    const tag = slide.kind === 'concept' ? slide.tag : slide.tag
    const example = slide.kind === 'concept' ? slide.example : undefined
    return (
      <>
        {slide.kind === 'concept' && tag && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-soft)', borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--brand)', marginBottom: 24, marginTop: 24 }}>{tag}</span>}
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: 28, fontWeight: 700, lineHeight: 1.4, marginBottom: 20, marginTop: tag ? 0 : 32, letterSpacing: '.005em', color: 'var(--text-primary)' }}>{slide.title}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.85, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: slide.body }}></p>
        {example && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '.08em', marginBottom: 8 }}>EXAMPLE</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>{example}</div>
          </div>
        )}
      </>
    )
  }

  if (slide.kind === 'diagram') {
    return (
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.4, marginBottom: 24, marginTop: 32, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {slide.nodes.map((n, i) => (
            <div key={i} style={{ width: '100%' }}>
              <div style={{
                background: n.kind === 'conclusion' ? 'var(--brand)' : 'var(--bg-tertiary)',
                color: n.kind === 'conclusion' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: n.kind === 'conclusion' ? 700 : 600,
                borderRadius: 12,
                padding: '12px 18px',
                textAlign: 'center',
                fontSize: 14,
              }}>{n.label}</div>
              {i < slide.nodes.length - 1 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 18 }}>↓</div>}
            </div>
          ))}
        </div>
      </>
    )
  }

  if (slide.kind === 'quiz') {
    const isMulti = !!slide.multi
    const correctSet = new Set(slide.correctIndexes ?? [slide.correctIndex])

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--warm-soft)', borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--warm)' }}>{t('stories.checkBadge')}</span>
          {isMulti && <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 99, padding: '4px 10px', fontWeight: 600 }}>{t('stories.multiSelect')}</span>}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: 'var(--text-primary)' }}>{slide.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slide.choices.map((c, i) => {
            const answered = quizAnswered !== null
            const isCorrect = correctSet.has(i)

            if (isMulti) {
              const isPicked = multiSelected.includes(i)
              const wasSelected = quizAnswered?.selectedMulti?.includes(i)
              const bg: string = !answered
                ? (isPicked ? 'var(--accent-soft)' : 'var(--bg-card)')
                : (wasSelected && isCorrect ? 'var(--brand)' : wasSelected && !isCorrect ? '#4A1C1C' : isCorrect ? 'var(--accent-soft)' : 'var(--bg-card)')
              const color: string = !answered ? 'var(--text-primary)' : (wasSelected && isCorrect ? '#FFFFFF' : 'var(--text-primary)')
              const border: string = !answered ? (isPicked ? `2px solid ${'var(--brand)'}` : '2px solid transparent') : 'none'
              return (
                <button type="button" key={i} onClick={() => !answered && onToggleMulti(i)}
                  disabled={answered}
                  role="checkbox"
                  aria-checked={isPicked}
                  style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'var(--transition-tap)', border: border === 'none' ? 'none' : border, display: 'flex', alignItems: 'center', gap: 10, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${answered ? 'transparent' : isPicked ? 'var(--brand)' : 'var(--text-muted)'}`, background: isPicked && !answered ? 'var(--brand)' : answered && wasSelected && isCorrect ? 'var(--bg-primary)' + '30' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(isPicked && !answered) || (answered && wasSelected) ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={answered && wasSelected && isCorrect ? 'var(--bg-primary)' : 'var(--brand)'} strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> : null}
                  </div>
                  {c}
                </button>
              )
            }

            // 単一選択
            const isSelected = quizAnswered?.selected === i
            const bg: string = !answered ? 'var(--bg-card)' : isSelected && isCorrect ? 'var(--brand)' : isSelected && !isCorrect ? '#4A1C1C' : isCorrect && answered ? 'var(--accent-soft)' : 'var(--bg-card)'
            const color: string = !answered ? 'var(--text-primary)' : isSelected && isCorrect ? '#FFFFFF' : 'var(--text-primary)'
            return (
              <button type="button" key={i} onClick={() => !answered && onSelectQuiz(i)}
                disabled={answered}
                role="radio"
                aria-checked={isSelected ?? false}
                style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'var(--transition-tap)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', border: 'none', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
              >{c}</button>
            )
          })}
        </div>

        {/* 複数選択: 回答ボタン */}
        {isMulti && !quizAnswered && (
          <button
            onClick={onSubmitMulti}
            disabled={multiSelected.length === 0}
            style={{ marginTop: 20, width: '100%', background: multiSelected.length > 0 ? 'var(--brand)' : 'var(--bg-card)', color: multiSelected.length > 0 ? '#FFFFFF' : 'var(--text-muted)', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: multiSelected.length > 0 ? 'pointer' : 'default' }}
          >
            {multiSelected.length === 0 ? t('stories.pickPrompt') : t('stories.pickedAnswer', { n: multiSelected.length })}
          </button>
        )}

        {quizAnswered && (
          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-card)', borderRadius: 14, fontSize: 15, lineHeight: 1.75 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: quizAnswered.correct ? 'var(--brand)' : 'var(--md-sys-color-error)', marginBottom: 6 }}>{quizAnswered.correct ? t('stories.correct') : isMulti ? t('stories.wrongMulti', { list: [...correctSet].map(i => slide.choices[i]).join(t('stories.commaSep')) }) : t('stories.wrongSingle')}</div>
            {slide.explain}
          </div>
        )}
      </>
    )
  }

  // ── think スライド: 自由記述思考問題 ──
  if (slide.kind === 'think') {
    return <ThinkSlide slide={slide} onNext={onNext} />
  }

  // ── case スライド: ケース問題（段階開示） ──
  if (slide.kind === 'case') {
    return <CaseSlide slide={slide} onNext={onNext} />
  }

    if (slide.kind === 'summary') {
    return (
      <>
        {/* 完了アイコン */}
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: `color-mix(in srgb, var(--brand) 9%, transparent)`, color: 'var(--brand)', marginBottom: 12 }}>
            <SparklesIcon width={32} height={32} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: 4 }}>{slide.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('stories.completeDesc')}</p>
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, marginBottom: 28 }}>
          {slide.points.map((p, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6 }}>{p}</div>
            </li>
          ))}
        </ul>
        {/* 次への導線 CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 99,
            background: 'var(--brand)', color: '#FFFFFF',
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 20px color-mix(in srgb, var(--brand) 27%, transparent)`,
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            letterSpacing: '.02em',
          }}
        >
          {t('stories.viewResult')}
        </button>
      </>
    )
  }

  if (slide.kind === 'compare') {
    return (
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24, marginTop: 32, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>{slide.left.label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{slide.left.body}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warm)', marginBottom: 6 }}>{slide.right.label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{slide.right.body}</div>
          </div>
        </div>
      </>
    )
  }

  if (slide.kind === 'quote') {
    return (
      <div style={{ marginTop: 80, padding: '0 8px' }}>
        <div style={{ fontSize: 56, color: 'var(--brand)', lineHeight: 1, marginBottom: 8 }}>"</div>
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{slide.quote}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>— {slide.author}</div>
      </div>
    )
  }

  return null
}

// ─────────────────────────────────────────────
// ThinkSlide: 自由記述思考問題 (type: 'think')
// ─────────────────────────────────────────────
function ThinkSlide({ slide, onNext }: { slide: Extract<import('../lessonSlides').LessonSlide, { kind: 'think' }>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <>
      {/* ヘッダーバッジ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--warm) 13%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: 'var(--warm)', letterSpacing: '.04em' }}>
          <LightbulbIcon width={12} height={12} />
          {t('stories.thinkPrompt')}
        </span>
      </div>

      {/* 問い */}
      <h2 style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.55, marginBottom: 20, color: 'var(--text-primary)' }}>
        {slide.question}
      </h2>

      {/* ヒント */}
      {slide.hint && (
        <div style={{ background: `color-mix(in srgb, var(--brand) 7%, transparent)`, border: `1px solid color-mix(in srgb, var(--brand) 19%, transparent)`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{t('stories.hintPrefix')}</span>{slide.hint}
        </div>
      )}

      {/* 考える時間のプレースホルダー */}
      {!revealed && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px', marginBottom: 20, border: `1.5px dashed ${'var(--border)'}` }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--warm)', fontWeight: 700 }}>
              <BrainIcon width={14} height={14} />
              <span>{t('stories.thinkOwnAnswer')}</span>
            </span><br />
            <span style={{ fontSize: 12 }}>{t('stories.readyHint')}</span>
          </div>
        </div>
      )}

      {/* モデル解答（開示後） */}
      {revealed && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', letterSpacing: '.06em', marginBottom: 10 }}>{t('stories.modelAnswer')}</div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '18px 20px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 14, borderLeft: `3px solid ${'var(--brand)'}` }}>
            {slide.modelAnswer}
          </div>

          {/* 考え方のポイント */}
          {slide.points.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em', marginBottom: 8 }}>{t('stories.points')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slide.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--bg-card)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{p}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* アクションボタン */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: `1.5px solid ${'var(--brand)'}`, background: 'transparent', color: 'var(--brand)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.viewModel')}
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.proceed')}
        </button>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// CaseSlide: ケース問題（段階開示）(type: 'case')
// ─────────────────────────────────────────────
function CaseSlide({ slide, onNext }: { slide: Extract<import('../lessonSlides').LessonSlide, { kind: 'case' }>; onNext: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [answered, setAnswered] = useState<{ selected: number; correct: boolean } | null>(null)
  const [concluded, setConcluded] = useState(false)

  const phase = slide.phases[phaseIndex]
  const isLastPhase = phaseIndex === slide.phases.length - 1

  const handleSelect = (i: number) => {
    if (answered) return
    const correct = slide.phases[phaseIndex].options[i].correct
    setAnswered({ selected: i, correct })
  }

  const handleNext = () => {
    if (!answered) return
    if (isLastPhase) {
      setConcluded(true)
    } else {
      setPhaseIndex(p => p + 1)
      setAnswered(null)
    }
  }

  if (concluded) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--brand) 13%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>
            <CheckIcon width={12} height={12} />
            {t('stories.caseDone')}
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.5, marginBottom: 16, color: 'var(--text-primary)' }}>{t('stories.frameworkSummary')}</h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '18px 20px', fontSize: 14, lineHeight: 1.9, color: 'var(--text-secondary)', marginBottom: 28, borderLeft: `3px solid ${'var(--brand)'}`, whiteSpace: 'pre-line' }}>
          {slide.conclusion}
        </div>
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.proceed')}
        </button>
      </>
    )
  }

  return (
    <>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--brand) 9%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>
          <ClipboardListIcon width={12} height={12} />
          {t('stories.casePhase', { n: phaseIndex + 1, total: slide.phases.length })}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{slide.title}</span>
      </div>

      {/* 状況説明（Phase 1のみ） */}
      {phaseIndex === 0 && (
        <div style={{ background: `color-mix(in srgb, var(--warm) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--warm) 19%, transparent)`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warm)', marginBottom: 6 }}>{t('stories.situation')}</div>
          {slide.situation}
        </div>
      )}

      {/* フェーズ情報（追加開示） */}
      {phaseIndex > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: `3px solid color-mix(in srgb, var(--brand) 31%, transparent)` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{t('stories.extraInfo')}</div>
          {phase.info}
        </div>
      )}
      {phaseIndex === 0 && phase.info && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {phase.info}
        </div>
      )}

      {/* 問い */}
      <h2 style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.55, marginBottom: 18, color: 'var(--text-primary)' }}>{phase.question}</h2>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {phase.options.map((opt, i) => {
          const isSelected = answered?.selected === i
          const isCorrect = opt.correct
          const bg = !answered
            ? 'var(--bg-card)'
            : isSelected && isCorrect ? 'var(--brand)'
            : isSelected && !isCorrect ? '#4A1C1C'
            : isCorrect && answered ? 'var(--accent-soft)'
            : 'var(--bg-card)'
          const color = isSelected && isCorrect && answered ? '#fff' : 'var(--text-primary)'
          return (
            <button type="button" key={i} onClick={() => handleSelect(i)}
              disabled={!!answered}
              role="radio"
              aria-checked={isSelected ?? false}
              style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 16, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'background 0.2s', lineHeight: 1.5, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', border: 'none', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* フィードバック */}
      {answered && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: answered.correct ? 'var(--brand)' : 'var(--md-sys-color-error)', marginBottom: 6 }}>
            {answered.correct ? <CheckIcon width={12} height={12} /> : <LightbulbIcon width={12} height={12} />}
            <span>{answered.correct ? t('stories.goodCall') : t('stories.closeCall')}</span>
          </div>
          {phase.options[answered.selected].feedback}
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--brand)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {isLastPhase ? t('stories.viewSummary') : t('stories.nextPhase', { n: phaseIndex + 2, total: slide.phases.length })}
        </button>
      )}
    </>
  )
}
