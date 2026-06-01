/**
 * CustomCourseSheet
 * 「AIで自分専用コースを作る」入力モーダル（ボトムシート）。
 *   入力 → 生成中ローディング → 結果プレビュー → 保存
 * 課金: 無料は残り回数表示、上限到達時はアップグレード導線。
 */
import { useState } from 'react'
import { t } from '../i18n'
import { isPaid } from '../subscription'
import {
  generateCustomCourse,
  saveCustomCourse,
  getRemainingFreeGenerations,
  type CustomCourse,
} from '../customCourseStore'
import { getAllLessonsFlat } from '../lessonData'
import { SparklesIcon } from '../icons'

type Phase = 'input' | 'generating' | 'preview'

interface CustomCourseSheetProps {
  onClose: () => void
  /** 保存後にそのコースを開く（任意） */
  onSaved: (course: CustomCourse) => void
  /** アップグレード導線（課金画面へ） */
  onUpgrade?: () => void
}

export function CustomCourseSheet({ onClose, onSaved, onUpgrade }: CustomCourseSheetProps) {
  const [phase, setPhase] = useState<Phase>('input')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [course, setCourse] = useState<CustomCourse | null>(null)

  const paid = isPaid()
  const remaining = getRemainingFreeGenerations()
  const atLimit = !paid && remaining <= 0

  const examples = [t('customCourse.example1'), t('customCourse.example2'), t('customCourse.example3')]

  const handleGenerate = async () => {
    if (!prompt.trim() || phase === 'generating') return
    setError('')
    setLimitReached(false)
    setPhase('generating')
    try {
      const c = await generateCustomCourse(prompt.trim())
      setCourse(c)
      setPhase('preview')
    } catch (e: unknown) {
      const err = e as Error & { limitReached?: boolean }
      if (err.limitReached) {
        setLimitReached(true)
        setError(t('customCourse.limitReached'))
      } else {
        setError(err.message || t('customCourse.errGeneric'))
      }
      setPhase('input')
    }
  }

  const lessonCount = course
    ? course.lessonIds.filter(id => !!getAllLessonsFlat()[id]).length
    : 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('customCourse.sheetTitle')}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
      onClick={phase === 'generating' ? undefined : onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
          padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {/* 見出し */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in srgb, var(--brand) 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
            <SparklesIcon width={18} height={18} />
          </div>
          <div style={{ fontSize: '1.1333rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('customCourse.sheetTitle')}</div>
        </div>

        {/* ===== 入力フェーズ ===== */}
        {phase === 'input' && (
          <>
            <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{t('customCourse.sheetDesc')}</div>

            {/* 残り回数 / プラン表示 */}
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 10, color: atLimit ? 'var(--md-sys-color-error)' : 'var(--brand)' }}>
              {paid
                ? t('customCourse.unlimited')
                : atLimit
                  ? t('customCourse.remainingZero')
                  : t('customCourse.remaining', { n: remaining })}
            </div>

            <textarea
              aria-label={t('customCourse.inputAria')}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t('customCourse.inputPlaceholder')}
              rows={3}
              maxLength={1000}
              disabled={atLimit}
              style={{ width: '100%', boxSizing: 'border-box', background: `color-mix(in srgb, var(--brand) 3%, transparent)`, border: `1px solid var(--border)`, borderRadius: 10, padding: '10px 12px', fontSize: '0.9333rem', color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", opacity: atLimit ? 0.6 : 1 }}
            />

            {/* 入力ヒント（タップで反映） */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', marginBottom: 8 }}>{t('customCourse.examplesHeading')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !atLimit && setPrompt(ex)}
                    disabled={atLimit}
                    style={{ textAlign: 'left', background: 'transparent', border: `1px solid var(--border)`, borderRadius: 10, padding: '10px 12px', fontSize: '0.8667rem', color: 'var(--text-primary)', cursor: atLimit ? 'not-allowed' : 'pointer', lineHeight: 1.5, opacity: atLimit ? 0.6 : 1, fontFamily: 'inherit' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ fontSize: '0.8667rem', color: 'var(--md-sys-color-error)', marginTop: 14, lineHeight: 1.6 }}>{error}</div>
            )}

            {/* アクション */}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atLimit || limitReached ? (
                onUpgrade && (
                  <button onClick={onUpgrade} style={{ width: '100%', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', border: 'none', borderRadius: 12, padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                    {t('customCourse.upgrade')}
                  </button>
                )
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  style={{ width: '100%', background: prompt.trim() ? 'var(--brand)' : 'var(--bg-secondary)', color: prompt.trim() ? 'var(--brand-fg)' : 'var(--text-muted)', border: 'none', borderRadius: 12, padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: prompt.trim() ? 'pointer' : 'not-allowed' }}
                >
                  {t('customCourse.generate')}
                </button>
              )}
              <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9333rem', fontWeight: 500, cursor: 'pointer', padding: '6px 0' }}>
                {t('customCourse.cancel')}
              </button>
            </div>
          </>
        )}

        {/* ===== 生成中フェーズ ===== */}
        {phase === 'generating' && (
          <div style={{ padding: '32px 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div className="custom-course-spinner" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid color-mix(in srgb, var(--brand) 20%, transparent)', borderTopColor: 'var(--brand)' }} aria-hidden="true" />
            <div style={{ fontSize: '0.9333rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('customCourse.generating')}</div>
            <style>{`@keyframes customCourseSpin { to { transform: rotate(360deg); } } .custom-course-spinner { animation: customCourseSpin 0.8s linear infinite; }`}</style>
          </div>
        )}

        {/* ===== プレビューフェーズ ===== */}
        {phase === 'preview' && course && (
          <>
            <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginBottom: 14 }}>{t('customCourse.previewTitle')}</div>
            <div style={{ background: `color-mix(in srgb, var(--brand) 5%, transparent)`, borderRadius: 14, padding: '16px 18px', border: `1.5px solid color-mix(in srgb, var(--brand) 22%, transparent)`, marginBottom: 18 }}>
              <div style={{ fontSize: '1.0667rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 8 }}>{course.title}</div>
              {course.description && (
                <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{course.description}</div>
              )}
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)' }}>{t('customCourse.previewLessons', { count: lessonCount })}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => { saveCustomCourse(course); onSaved(course) }}
                style={{ width: '100%', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', border: 'none', borderRadius: 12, padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('customCourse.save')}
              </button>
              <button
                onClick={() => { setCourse(null); setPhase('input') }}
                style={{ width: '100%', background: 'transparent', border: `1px solid var(--brand)`, color: 'var(--brand)', borderRadius: 12, padding: '12px', fontSize: '0.9333rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {t('customCourse.regenerate')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
