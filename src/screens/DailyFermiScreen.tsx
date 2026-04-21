import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon, LightbulbIcon, BarChartIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { API_BASE } from './apiBase'
import { t, getLocale } from '../i18n'

// デイリーフェルミ完了状態管理
const DAILY_FERMI_KEY = 'logic-daily-fermi-done'
export function isDailyFermiDone(): boolean {
  const saved = localStorage.getItem(DAILY_FERMI_KEY)
  if (!saved) return false
  return saved === new Date().toISOString().slice(0, 10)
}
function markDailyFermiDone() {
  localStorage.setItem(DAILY_FERMI_KEY, new Date().toISOString().slice(0, 10))
}

// 基礎統計データ（フェルミ推定時の参考値）
const BASE_STATS = [
  { label: '日本の人口', value: '約1億2,400万人' },
  { label: '世帯数', value: '約5,700万世帯' },
  { label: '平均世帯人数', value: '2.17人' },
  { label: '労働力人口', value: '約6,900万人' },
  { label: '東京都の人口', value: '約1,400万人' },
  { label: '国土面積', value: '約37.8万km²' },
  { label: 'コンビニ数', value: '約5.6万店' },
  { label: '電柱数', value: '約3,500万本' },
  { label: '自動車保有数', value: '約7,800万台' },
  { label: '小学校数', value: '約1.9万校' },
  { label: '鉄道利用者数/日', value: '約4,800万人' },
  { label: 'GDP', value: '約600兆円' },
  { label: '平均年収', value: '約460万円' },
  { label: 'スマホ普及率', value: '約97%' },
  { label: '平均寿命', value: '約84歳' },
  { label: '会社数', value: '約368万社' },
]

/** Convert **bold** to <strong> */
function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--accent)">$1</strong>')
}

/** Minimal markdown→JSX for AI feedback */
function renderFeedbackMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.JSX.Element[] = []
  let key = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { elements.push(<div key={key++} style={{ height: 8 }} />); continue }
    if (trimmed.startsWith('## ')) {
      elements.push(<div key={key++} className="eyebrow accent" style={{ marginTop: 'var(--s-3)', marginBottom: 'var(--s-1)', fontSize: 14 }}>{trimmed.slice(3)}</div>)
      continue
    }
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (numMatch) {
      elements.push(<div key={key++} style={{ display: 'flex', gap: 8, fontSize: 15, lineHeight: 1.7, marginBottom: 2 }}><span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: 20 }}>{numMatch[1]}.</span><span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} /></div>)
      continue
    }
    if (trimmed.startsWith('- ')) {
      elements.push(<div key={key++} style={{ display: 'flex', gap: 8, fontSize: 15, lineHeight: 1.7, marginBottom: 2, paddingLeft: 4 }}><span style={{ color: 'var(--text-muted)' }}>•</span><span dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }} /></div>)
      continue
    }
    elements.push(<div key={key++} style={{ fontSize: 15, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />)
  }
  return elements
}

interface DailyFermiScreenProps {
  onBack: () => void
  onReport?: (context: { lessonTitle: string; question: string }) => void
}

interface FermiFeedback {
  feedback: string
}

export function DailyFermiScreen({ onBack, onReport }: DailyFermiScreenProps) {
  const locale = getLocale()

  const [question, setQuestion] = useState('')
  const [hint, setHint] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [questionError, setQuestionError] = useState('')

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FermiFeedback | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    setLoadingQuestion(true)
    setQuestionError('')
    fetch(`${API_BASE}/api/daily-fermi?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setQuestion(data.question || '')
        setHint(data.hint || '')
      })
      .catch((e: Error) => setQuestionError(e.message || t('common.error')))
      .finally(() => setLoadingQuestion(false))
  }, [locale])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    setSubmitError('')
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userInput: answer, locale }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || t('common.error'))
      setFeedback(data)
      markDailyFermiDone()
    } catch (e: unknown) {
      setSubmitError((e as Error).message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('dailyFermi.title')}</div>
      </div>

      <div className="eyebrow accent">デイリーフェルミ</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        {t('dailyFermi.heading')}
      </h1>

      {loadingQuestion && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 16 }}>
          {t('common.loading')}
        </div>
      )}

      {questionError && (
        <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16 }}>
          {questionError}
        </div>
      )}

      {!loadingQuestion && question && (
        <>
          {/* 問題カード */}
          <div className="card" style={{
            background: 'linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
            borderColor: 'var(--brand)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(61,95,196,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <BarChartIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>
                  {t('fermi.questionTag')}
                </span>
              </div>
              <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.55, letterSpacing: '-0.01em' }}>
                {question}
              </p>
            </div>
          </div>

          {/* ヒント */}
          {hint && (
            <div>
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--brand)', fontSize: 16, fontWeight: 600, padding: 0,
                  }}
                >
                  <LightbulbIcon width={15} height={15} />
                  {t('dailyFermi.showHint')}
                </button>
              ) : (
                <div className="card" style={{ background: 'var(--brand-soft)', borderColor: 'var(--brand)', fontSize: 16, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <LightbulbIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      HINT
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{hint}</p>
                  {/* 基礎統計データ */}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>参考データ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                      {BASE_STATS.map((s) => (
                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '2px 0' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* フィードバックが出ていない場合は回答入力 */}
          {!feedback && (
            <div className="stack-sm">
              <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('dailyFermi.answerLabel')}
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('fermi.placeholder')}
                disabled={submitting}
                style={{
                  width: '100%',
                  minHeight: 160,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: 16,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />

              {submitError && (
                <div style={{ fontSize: 16, color: 'var(--danger)' }}>{submitError}</div>
              )}

              <Button
                variant="primary"
                size="lg"
                block
                disabled={!answer.trim() || submitting}
                onClick={handleSubmit}
              >
                {submitting ? t('fermi.submitting') : t('fermi.submitButton')}
              </Button>
            </div>
          )}

          {/* AI フィードバック表示 */}
          {feedback && (
            <div className="stack-sm">
              <div className="feedback-card" style={{ animation: 'scale-in 0.2s ease-out both' }}>
                <div className="feedback-head">
                  <div className="feedback-check">
                    <BarChartIcon width={16} height={16} />
                  </div>
                  <div className="feedback-title">{t('dailyFermi.feedbackTitle')}</div>
                </div>
                <div className="feedback-text">
                  {renderFeedbackMarkdown(feedback.feedback)}
                </div>
                {onReport && (
                  <button
                    onClick={() => onReport({ lessonTitle: t('report.dailyFermiTitle'), question })}
                    style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    {t('report.linkText')}
                  </button>
                )}
              </div>

              <Button variant="default" size="md" block onClick={onBack}>
                {t('common.back')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
