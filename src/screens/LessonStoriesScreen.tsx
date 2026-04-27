/**
 * LessonStoriesScreen - Logic v3 Stories-style lesson
 * 仕様: docs/DESIGN_V3.md §3.3
 * モックアップ: lv3-lesson.html
 */
import { useState, useMemo, useRef } from 'react'
import { v3 } from '../styles/tokensV3'
import type { LessonSlide } from '../lessonSlides'
import { convertLessonToSlides } from '../lessonSlides'
import { allLessons } from '../lessonData'
import { addXp } from '../stats'

interface LessonStoriesScreenProps {
  lessonId: number
  onComplete: () => void
  onClose: () => void
}

export function LessonStoriesScreen(props: LessonStoriesScreenProps) {
  const { lessonId, onComplete, onClose } = props
  const lesson = allLessons[lessonId]
  const [index, setIndex] = useState(0)
  const [quizAnswered, setQuizAnswered] = useState<{ correct: boolean; selected: number } | null>(null)

  const slides: LessonSlide[] = useMemo(() => {
    if (!lesson) return []
    return convertLessonToSlides(lesson)
  }, [lesson])

  if (!lesson || slides.length === 0) {
    return (
      <div style={{ background: v3.color.bg, minHeight: '100vh', color: v3.color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div>レッスンが見つかりません</div>
          <button onClick={onClose} style={{ marginTop: 20, padding: '10px 20px', borderRadius: 12, background: v3.color.accent, color: v3.color.bg, border: 'none', fontWeight: 700 }}>戻る</button>
        </div>
      </div>
    )
  }

  const slide = slides[index]
  const total = slides.length
  const isQuiz = slide.kind === 'quiz'

  const goNext = () => {
    if (index < total - 1) {
      setIndex(index + 1)
      setQuizAnswered(null)
    } else {
      // 完了
      addXp('lesson')
      onComplete()
    }
  }
  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1)
      setQuizAnswered(null)
    }
  }

  // ===== Swipe 対応 =====
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)
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
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ background: v3.color.bg, height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text, position: 'relative', touchAction: 'pan-y' }}
    >
      {/* Progress bars — v3 mint accentでコントラストを上げる */}
      <div style={{ display: 'flex', gap: 5, padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 16px 12px' }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: v3.color.accent, width: i < index ? '100%' : i === index ? '55%' : '0%', transition: 'width .3s ease', boxShadow: i <= index ? `0 0 8px ${v3.color.accent}80` : 'none' }}></div>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={v3.color.accent}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: v3.color.accent }}>{lesson.category}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{lesson.title}</span>
          </div>
        </div>
        <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: '8px 24px 100px', position: 'relative', overflow: 'auto' }}>
        <div style={{ position: 'absolute', top: 8, right: 24, fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: v3.color.text3 }}>{index + 1} / {total}</div>

        <SlideContent slide={slide} quizAnswered={quizAnswered} onSelectQuiz={(idx) => {
          if (slide.kind !== 'quiz') return
          const correct = idx === slide.correctIndex
          setQuizAnswered({ correct, selected: idx })
          if (correct) {
            setTimeout(goNext, 1200)
          } else {
            // 不正解の場合 2.5秒後に再選択可能にする
            setTimeout(() => setQuizAnswered(null), 2500)
          }
        }} />
      </div>

      {/* Tap zones (クイズ以外) */}
      {!isQuiz && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5 }}>
          <div onClick={goPrev} style={{ flex: 1, cursor: 'pointer' }}></div>
          <div onClick={goNext} style={{ flex: 1, cursor: 'pointer' }}></div>
        </div>
      )}

      {/* クイズ画面だけ: 「前に戻る」ボタンを右下に表示 (タップで進めないため) */}
      {isQuiz && index > 0 && (
        <button
          onClick={goPrev}
          style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.card, border: '1px solid rgba(255,255,255,.08)', borderRadius: 99, padding: '10px 18px', fontSize: 12, fontWeight: 600, color: v3.color.text2, cursor: 'pointer', zIndex: 6 }}
          aria-label="前のスライドに戻る"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          前のスライド
        </button>
      )}

      {/* Tap hint */}
      {!isQuiz && (
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, background: v3.color.card, border: '1px solid rgba(255,255,255,.08)', borderRadius: 99, padding: '10px 18px', fontSize: 12, fontWeight: 500, color: v3.color.text2, zIndex: 6 }}>
          タップ / スワイプで進む
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </div>
      )}
    </div>
  )
}

function SlideContent({ slide, quizAnswered, onSelectQuiz }: { slide: LessonSlide; quizAnswered: { correct: boolean; selected: number } | null; onSelectQuiz: (idx: number) => void }) {
  if (slide.kind === 'hero') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
        <div style={{ marginTop: 8, marginBottom: 24, borderRadius: 18, overflow: 'hidden', position: 'relative', boxShadow: v3.shadow.hero }}>
          <img src={slide.image} alt="" loading="lazy" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(8,33,33,0.85) 100%)' }}></div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.accentSoft, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: v3.color.accent, marginBottom: 16, width: 'fit-content' }}>{slide.category}</span>
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: 30, fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: v3.color.text }}>{slide.title}</h1>
        <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500 }}>{slide.meta}</div>
      </div>
    )
  }
  if (slide.kind === 'concept' || slide.kind === 'intro') {
    return (
      <>
        {slide.kind === 'concept' && (slide as any).tag && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.accentSoft, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: v3.color.accent, marginBottom: 24, marginTop: 24 }}>{(slide as any).tag}</span>}
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: 28, fontWeight: 700, lineHeight: 1.4, marginBottom: 20, marginTop: (slide as any).tag ? 0 : 32, letterSpacing: '.005em', color: v3.color.text }}>{slide.title}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.75, fontWeight: 400, color: v3.color.text, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: slide.body }}></p>
        {(slide as any).example && (
          <div style={{ background: v3.color.card, borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.accent, letterSpacing: '.08em', marginBottom: 8 }}>EXAMPLE</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: v3.color.text }}>{(slide as any).example}</div>
          </div>
        )}
      </>
    )
  }

  if (slide.kind === 'diagram') {
    return (
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.4, marginBottom: 24, marginTop: 32, color: v3.color.text }}>{slide.title}</h1>
        <div style={{ background: v3.color.card, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {slide.nodes.map((n, i) => (
            <div key={i} style={{ width: '100%' }}>
              <div style={{
                background: n.kind === 'conclusion' ? v3.color.accent : v3.color.cardSoft,
                color: n.kind === 'conclusion' ? v3.color.bg : v3.color.text,
                fontWeight: n.kind === 'conclusion' ? 700 : 600,
                borderRadius: 12,
                padding: '12px 18px',
                textAlign: 'center',
                fontSize: 14,
              }}>{n.label}</div>
              {i < slide.nodes.length - 1 && <div style={{ color: v3.color.text3, textAlign: 'center', fontSize: 18 }}>↓</div>}
            </div>
          ))}
        </div>
      </>
    )
  }

  if (slide.kind === 'quiz') {
    return (
      <>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.warmSoft, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: v3.color.warm, marginBottom: 24, marginTop: 24 }}>確認問題</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: v3.color.text }}>{slide.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slide.choices.map((c, i) => {
            const answered = quizAnswered !== null
            const isSelected = quizAnswered?.selected === i
            const isCorrect = i === slide.correctIndex
            const bg = !answered ? v3.color.card : isSelected && isCorrect ? v3.color.accent : isSelected && !isCorrect ? '#FCA5A5' : isCorrect ? v3.color.accentSoft : v3.color.card
            const color = !answered ? v3.color.text : isSelected && isCorrect ? v3.color.bg : isSelected && !isCorrect ? '#7F1D1D' : v3.color.text
            return (
              <div
                key={i}
                onClick={() => !answered && onSelectQuiz(i)}
                style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: v3.motion.tap }}
              >{c}</div>
            )
          })}
        </div>
        {quizAnswered && (
          <div style={{ marginTop: 20, padding: 16, background: v3.color.card, borderRadius: 14, fontSize: 14, lineHeight: 1.6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: quizAnswered.correct ? v3.color.accent : '#FCA5A5', marginBottom: 6 }}>{quizAnswered.correct ? '正解' : 'もう一度考えてみよう'}</div>
            {slide.explain}
          </div>
        )}
      </>
    )
  }

  if (slide.kind === 'summary') {
    return (
      <>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.4, marginBottom: 28, marginTop: 32, color: v3.color.text }}>{slide.title}</h1>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0 }}>
          {slide.points.map((p, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: v3.color.card, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: v3.color.accent, color: v3.color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6 }}>{p}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (slide.kind === 'compare') {
    return (
      <>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24, marginTop: 32, color: v3.color.text }}>{slide.title}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: v3.color.card, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.accent, marginBottom: 6 }}>{slide.left.label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{slide.left.body}</div>
          </div>
          <div style={{ background: v3.color.card, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.warm, marginBottom: 6 }}>{slide.right.label}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{slide.right.body}</div>
          </div>
        </div>
      </>
    )
  }

  if (slide.kind === 'quote') {
    return (
      <div style={{ marginTop: 80, padding: '0 8px' }}>
        <div style={{ fontSize: 56, color: v3.color.accent, lineHeight: 1, marginBottom: 8 }}>"</div>
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{slide.quote}</div>
        <div style={{ fontSize: 14, color: v3.color.text2 }}>— {slide.author}</div>
      </div>
    )
  }

  return null
}
