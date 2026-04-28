/**
 * LessonStoriesScreen - Logic v3 Stories-style lesson
 * 仕様: docs/DESIGN_V3.md §3.3
 * モックアップ: lv3-lesson.html
 */
import { useState, useMemo, useRef, useEffect } from 'react'
import { v3 } from '../styles/tokensV3'
import type { LessonSlide } from '../lessonSlides'
import { convertLessonToSlides } from '../lessonSlides'
import { allLessons } from '../lessonData'
import { addXp } from '../stats'
import { LessonThumbnail } from '../components/LessonThumbnail'
import { API_BASE } from './apiBase'

interface LessonStoriesScreenProps {
  lessonId: number
  onComplete: () => void
  onClose: () => void
}

export function LessonStoriesScreen(props: LessonStoriesScreenProps) {
  const { lessonId, onComplete, onClose } = props
  const lesson = allLessons[lessonId]
  const [index, setIndex] = useState(0)
  const [quizAnswered, setQuizAnswered] = useState<{ correct: boolean; selected: number; selectedMulti?: number[] } | null>(null)
  const [multiSelected, setMultiSelected] = useState<number[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportDetail, setReportDetail] = useState('')

  // ── タッチガード: スライド遷移後 280ms は全タッチを無視 ──
  const slideEnteredAt = useRef<number>(Date.now())
  const isGuarded = () => Date.now() - slideEnteredAt.current < 280
  useEffect(() => {
    slideEnteredAt.current = Date.now()
  }, [index])

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
    if (isGuarded()) return
    if (index < total - 1) {
      setIndex(index + 1)
      setQuizAnswered(null)
      setMultiSelected([])
    } else {
      // 完了
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
        <div
          onPointerDown={(e) => { e.stopPropagation(); onClose() }}
          style={{ width: 44, height: 44, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: '8px 24px 100px', position: 'relative', overflow: 'auto' }}>
        <div style={{ position: 'absolute', top: 8, right: 24, fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: v3.color.text3 }}>{index + 1} / {total}</div>

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
            setQuizAnswered({ correct, selected: -1, selectedMulti: multiSelected })
          }}
          onSelectQuiz={(idx) => {
            if (slide.kind !== 'quiz') return
            if (isGuarded()) return
            const correct = idx === slide.correctIndex
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
          <div
            onClick={() => { if (!isGuarded()) goPrev() }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto' }}
          />
          <div
            onClick={() => { if (!isGuarded()) goNext() }}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto' }}
          />
        </div>
      )}

      {/* クイズ正解後: 「次へ」ボタン（大） */}
      {isQuiz && quizAnswered?.correct && (
        <button
          onClick={goNext}
          style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 8, background: v3.color.accent, border: 'none', borderRadius: 99, padding: '18px 48px', fontSize: 16, fontWeight: 700, color: v3.color.bg, cursor: 'pointer', zIndex: 6, boxShadow: `0 4px 20px ${v3.color.accent}70`, WebkitTapHighlightColor: 'transparent' }}
        >
          次へ
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Tap hint (非クイズのみ) — 左右端ゾーンに対応した位置 */}
      {!isQuiz && (
        <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', zIndex: 6, pointerEvents: 'none', padding: '0 8px' }}>
          <span style={{ fontSize: 11, color: v3.color.text3, opacity: 0.5, width: '22%', textAlign: 'center' }}>◀</span>
          <span style={{ fontSize: 11, color: v3.color.text3, opacity: 0.5, width: '22%', textAlign: 'center' }}>▶</span>
        </div>
      )}

      {/* 誤りを報告 — 左下のボタン（サマリースライドでは非表示） */}
      <button
        onPointerDown={(e) => { e.stopPropagation(); setReportOpen(true) }}
        style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', left: 16, fontSize: 12, color: v3.color.text2, background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 99, cursor: 'pointer', zIndex: 7, padding: '8px 14px', display: slide.kind === 'summary' ? 'none' : 'flex', alignItems: 'center', gap: 5 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
        誤りを報告
      </button>

      {/* 誤り報告モーダル */}
      {reportOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerDown={() => setReportOpen(false)}>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{ background: v3.color.bg, borderRadius: '20px 20px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)', width: '100%' }}
          >
            {reportSent ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: v3.color.accent }}>報告を受け付けました</div>
                  <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 6 }}>ご協力ありがとうございます。内容を確認して改善します。</div>
                </div>
                <button onPointerDown={() => { setReportOpen(false); setReportSent(false); setReportText(''); setReportDetail('') }} style={{ width: '100%', background: v3.color.card, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: v3.color.text, cursor: 'pointer' }}>閉じる</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>誤りを報告</div>
                  <button
                    onPointerDown={() => setReportOpen(false)}
                    style={{ background: v3.color.card, border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: v3.color.text2, fontSize: 18, lineHeight: 1 }}
                  >×</button>
                </div>
                <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 16 }}>どのような誤りがありましたか？</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {['内容・説明が間違っている', '選択肢の正解が違う', '日本語がおかしい・誤字', 'その他'].map(opt => (
                    <button key={opt} onPointerDown={() => setReportText(opt)}
                      style={{ background: reportText === opt ? v3.color.accentSoft : v3.color.card, border: `1.5px solid ${reportText === opt ? v3.color.accent : 'transparent'}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, fontWeight: 500, color: v3.color.text, cursor: 'pointer', textAlign: 'left' }}
                    >{opt}</button>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 8 }}>詳しく教えてください（任意）</div>
                  <textarea
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    placeholder="どの箇所が、どのように間違っているか…"
                    rows={3}
                    style={{ width: '100%', background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: v3.color.text, resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}
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
                  style={{ width: '100%', background: reportText ? v3.color.accent : v3.color.card, border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, color: reportText ? v3.color.bg : v3.color.text3, cursor: reportText ? 'pointer' : 'default' }}
                >
                  送信する
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
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
        <div style={{ marginTop: 8, marginBottom: 24, borderRadius: 18, overflow: 'hidden', boxShadow: v3.shadow.hero }}>
          {slide.lessonId != null
            ? <LessonThumbnail lessonId={slide.lessonId} style={{ width: '100%', height: 200 }} />
            : <img src={slide.image} alt="" loading="lazy" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
          }
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
        <p style={{ fontSize: 17, lineHeight: 1.85, fontWeight: 400, color: v3.color.text, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: slide.body }}></p>
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
    const isMulti = !!slide.multi
    const correctSet = new Set(slide.correctIndexes ?? [slide.correctIndex])

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.warmSoft, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: v3.color.warm }}>確認問題</span>
          {isMulti && <span style={{ fontSize: 11, color: v3.color.text2, background: v3.color.card, borderRadius: 99, padding: '4px 10px', fontWeight: 600 }}>複数選択</span>}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: v3.color.text }}>{slide.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slide.choices.map((c, i) => {
            const answered = quizAnswered !== null
            const isCorrect = correctSet.has(i)

            if (isMulti) {
              const isPicked = multiSelected.includes(i)
              const wasSelected = quizAnswered?.selectedMulti?.includes(i)
              const bg: string = !answered
                ? (isPicked ? v3.color.accentSoft : v3.color.card)
                : (wasSelected && isCorrect ? v3.color.accent : wasSelected && !isCorrect ? '#4A1C1C' : isCorrect ? v3.color.accentSoft : v3.color.card)
              const color: string = !answered ? v3.color.text : (wasSelected && isCorrect ? v3.color.bg : v3.color.text)
              const border: string = !answered ? (isPicked ? `2px solid ${v3.color.accent}` : '2px solid transparent') : 'none'
              return (
                <div key={i} onClick={() => !answered && onToggleMulti(i)}
                  style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: v3.motion.tap, border, display: 'flex', alignItems: 'center', gap: 10, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${answered ? 'transparent' : isPicked ? v3.color.accent : v3.color.text3}`, background: isPicked && !answered ? v3.color.accent : answered && wasSelected && isCorrect ? v3.color.bg + '30' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(isPicked && !answered) || (answered && wasSelected) ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={answered && wasSelected && isCorrect ? v3.color.bg : v3.color.accent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : null}
                  </div>
                  {c}
                </div>
              )
            }

            // 単一選択
            const isSelected = quizAnswered?.selected === i
            const bg: string = !answered ? v3.color.card : isSelected && isCorrect ? v3.color.accent : isSelected && !isCorrect ? '#4A1C1C' : isCorrect && answered ? v3.color.accentSoft : v3.color.card
            const color: string = !answered ? v3.color.text : isSelected && isCorrect ? v3.color.bg : v3.color.text
            return (
              <div key={i} onClick={() => !answered && onSelectQuiz(i)}
                style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: v3.motion.tap, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >{c}</div>
            )
          })}
        </div>

        {/* 複数選択: 回答ボタン */}
        {isMulti && !quizAnswered && (
          <button
            onClick={onSubmitMulti}
            disabled={multiSelected.length === 0}
            style={{ marginTop: 20, width: '100%', background: multiSelected.length > 0 ? v3.color.accent : v3.color.card, color: multiSelected.length > 0 ? v3.color.bg : v3.color.text3, border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: multiSelected.length > 0 ? 'pointer' : 'default' }}
          >
            {multiSelected.length === 0 ? '選択してください' : `${multiSelected.length}つ選択中 — 回答する`}
          </button>
        )}

        {quizAnswered && (
          <div style={{ marginTop: 20, padding: 16, background: v3.color.card, borderRadius: 14, fontSize: 15, lineHeight: 1.75 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: quizAnswered.correct ? v3.color.accent : '#FCA5A5', marginBottom: 6 }}>{quizAnswered.correct ? '正解' : isMulti ? `不正解 — 正解は${[...correctSet].map(i => slide.choices[i]).join('、')}` : 'もう一度考えてみよう'}</div>
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
          <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>✨</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.4, color: v3.color.text, marginBottom: 4 }}>{slide.title}</h1>
          <p style={{ fontSize: 14, color: v3.color.text2 }}>学習が完了したよ！</p>
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, marginBottom: 28 }}>
          {slide.points.map((p, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: v3.color.card, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: v3.color.accent, color: v3.color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6 }}>{p}</div>
            </li>
          ))}
        </ul>
        {/* 次への導線 CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 99,
            background: v3.color.accent, color: v3.color.bg,
            fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 20px ${v3.color.accent}45`,
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            letterSpacing: '.02em',
          }}
        >
          結果を確認する →
        </button>
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

// ─────────────────────────────────────────────
// ThinkSlide: 自由記述思考問題 (type: 'think')
// ─────────────────────────────────────────────
function ThinkSlide({ slide, onNext }: { slide: Extract<import('../lessonSlides').LessonSlide, { kind: 'think' }>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <>
      {/* ヘッダーバッジ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${v3.color.warm}20`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: v3.color.warm, letterSpacing: '.04em' }}>
          💡 考えてみよう
        </span>
      </div>

      {/* 問い */}
      <h2 style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.55, marginBottom: 20, color: v3.color.text }}>
        {slide.question}
      </h2>

      {/* ヒント */}
      {slide.hint && (
        <div style={{ background: `${v3.color.accent}12`, border: `1px solid ${v3.color.accent}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: v3.color.text2, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: v3.color.accent }}>ヒント: </span>{slide.hint}
        </div>
      )}

      {/* 考える時間のプレースホルダー */}
      {!revealed && (
        <div style={{ background: v3.color.card, borderRadius: 16, padding: '20px', marginBottom: 20, border: `1.5px dashed ${v3.color.line}` }}>
          <div style={{ fontSize: 13, color: v3.color.text3, textAlign: 'center', lineHeight: 1.8 }}>
            🧠 自分なりの答えを考えてみよう<br />
            <span style={{ fontSize: 12 }}>準備ができたら「モデル解答を見る」を押してね</span>
          </div>
        </div>
      )}

      {/* モデル解答（開示後） */}
      {revealed && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.accent, letterSpacing: '.06em', marginBottom: 10 }}>モデル解答</div>
          <div style={{ background: v3.color.card, borderRadius: 16, padding: '18px 20px', fontSize: 14, lineHeight: 1.8, color: v3.color.text, marginBottom: 14, borderLeft: `3px solid ${v3.color.accent}` }}>
            {slide.modelAnswer}
          </div>

          {/* 考え方のポイント */}
          {slide.points.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.04em', marginBottom: 8 }}>考え方のポイント</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slide.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: v3.color.card, borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: v3.color.accentSoft, color: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: v3.color.text2 }}>{p}</div>
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
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: `1.5px solid ${v3.color.accent}`, background: 'transparent', color: v3.color.accent, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          モデル解答を見る
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: v3.color.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          次へ進む
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${v3.color.accent}20`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: v3.color.accent }}>
            ✅ ケース完了
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.5, marginBottom: 16, color: v3.color.text }}>フレームワークまとめ</h2>
        <div style={{ background: v3.color.card, borderRadius: 16, padding: '18px 20px', fontSize: 14, lineHeight: 1.9, color: v3.color.text2, marginBottom: 28, borderLeft: `3px solid ${v3.color.accent}` }}>
          {slide.conclusion}
        </div>
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: v3.color.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          次へ進む
        </button>
      </>
    )
  }

  return (
    <>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${v3.color.accent}16`, borderRadius: 99, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: v3.color.accent }}>
          📋 ケース — Phase {phaseIndex + 1}/{slide.phases.length}
        </span>
        <span style={{ fontSize: 11, color: v3.color.text3 }}>{slide.title}</span>
      </div>

      {/* 状況説明（Phase 1のみ） */}
      {phaseIndex === 0 && (
        <div style={{ background: `${v3.color.warm}14`, border: `1px solid ${v3.color.warm}30`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: v3.color.text2, lineHeight: 1.7 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.warm, marginBottom: 6 }}>状況</div>
          {slide.situation}
        </div>
      )}

      {/* フェーズ情報（追加開示） */}
      {phaseIndex > 0 && (
        <div style={{ background: v3.color.card, borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: v3.color.text2, lineHeight: 1.7, borderLeft: `3px solid ${v3.color.accent}50` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.text3, marginBottom: 6 }}>追加情報</div>
          {phase.info}
        </div>
      )}
      {phaseIndex === 0 && phase.info && (
        <div style={{ background: v3.color.card, borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: 13, color: v3.color.text2, lineHeight: 1.7 }}>
          {phase.info}
        </div>
      )}

      {/* 問い */}
      <h2 style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.55, marginBottom: 18, color: v3.color.text }}>{phase.question}</h2>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {phase.options.map((opt, i) => {
          const isSelected = answered?.selected === i
          const isCorrect = opt.correct
          const bg = !answered
            ? v3.color.card
            : isSelected && isCorrect ? v3.color.accent
            : isSelected && !isCorrect ? '#4A1C1C'
            : isCorrect && answered ? v3.color.accentSoft
            : v3.color.card
          const color = isSelected && isCorrect && answered ? '#fff' : v3.color.text
          return (
            <div key={i} onClick={() => handleSelect(i)}
              style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: 14, fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'background 0.2s', lineHeight: 1.5, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {opt.label}
            </div>
          )
        })}
      </div>

      {/* フィードバック */}
      {answered && (
        <div style={{ background: v3.color.card, borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: 13, lineHeight: 1.7, color: v3.color.text2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: answered.correct ? v3.color.accent : '#FCA5A5', marginBottom: 6 }}>
            {answered.correct ? '✅ 良い判断！' : '💡 惜しい！'}
          </div>
          {phase.options[answered.selected].feedback}
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: v3.color.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          {isLastPhase ? 'まとめを見る' : `次のフェーズへ (${phaseIndex + 2}/${slide.phases.length})`}
        </button>
      )}
    </>
  )
}
