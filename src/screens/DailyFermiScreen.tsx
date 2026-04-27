import React, { useState, useEffect, useRef } from 'react'
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

/** マイクボタンコンポーネント */
function MicButton({ onTranscript, locale, disabled }: {
  onTranscript: (text: string) => void
  locale: string
  disabled?: boolean
}) {
  const [listening, setListening] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR: any = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  if (!SR) return null

  const toggle = () => {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const recog = new SR()
    recog.lang = locale === 'en' ? 'en-US' : 'ja-JP'
    recog.continuous = true
    recog.interimResults = false
    recog.onresult = (e: any) => {
      const transcript = Array.from({ length: e.results.length }, (_: any, i: number) => e.results[i][0].transcript).join('')
      onTranscript(transcript)
    }
    recog.onerror = () => { setListening(false) }
    recog.onend = () => { setListening(false) }
    recog.start()
    recogRef.current = recog
    setListening(true)
  }

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title={listening ? '録音を停止' : '音声入力'}
      style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: listening ? '2px solid var(--danger)' : '1.5px solid var(--border)',
        background: listening ? 'rgba(220,38,38,0.08)' : 'var(--bg-card)',
        color: listening ? 'var(--danger)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {listening ? (
        // 録音中: 停止アイコン（点滅）
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'pulse 1s infinite' }}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        // マイクアイコン
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      )}
    </button>
  )
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** 前提確認チャットモーダル */
function FermiChatModal({ question, locale, onClose }: {
  question: string
  locale: string
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '前提や数字について何でも聞いてください。ただし、答えそのものは教えられません。' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, messages: newMessages, locale }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    // オーバーレイ
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%',
        maxHeight: '80vh',
        background: 'var(--bg-card)',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slide-up 0.25s ease-out both',
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>前提を確認する</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>答えは教えません。前提の整理を手伝います。</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* メッセージ一覧 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--brand)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 15,
                lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 15,
              }}>
                考えています...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 入力エリア */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="質問を入力（音声入力も使えます）"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 44px 10px 12px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: 15,
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <MicButton
              onTranscript={(text) => setInput(prev => prev + text)}
              locale={locale}
              disabled={loading}
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: input.trim() && !loading ? 'var(--brand)' : 'var(--bg-muted)',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

interface DailyFermiScreenProps {
  onBack: () => void
  onReport?: (context: { lessonTitle: string; question: string }) => void
}

interface FermiFeedback {
  feedback: string
  score?: number
  scoreBreakdown?: string
}

// 提出フロー状態
type SubmitPhase = 'idle' | 'scoring' | 'done' | 'result'

export function DailyFermiScreen({ onBack, onReport }: DailyFermiScreenProps) {
  const locale = getLocale()

  const [question, setQuestion] = useState('')
  const [hint, setHint] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(true)
  const [questionError, setQuestionError] = useState('')

  const [answer, setAnswer] = useState('')
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle')
  const [feedback, setFeedback] = useState<FermiFeedback | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // タイマー
  const [elapsedSec, setElapsedSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  useEffect(() => {
    setLoadingQuestion(true)
    setQuestionError('')
    fetch(`${API_BASE}/api/daily-fermi?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setQuestion(data.question || '')
        setHint(data.hint || '')
        setElapsedSec(0)
        setTimerRunning(true)
      })
      .catch((e: Error) => setQuestionError(e.message || t('common.error')))
      .finally(() => setLoadingQuestion(false))
  }, [locale])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setTimerRunning(false)
    setSubmitPhase('scoring')
    setSubmitError('')
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userInput: answer, locale, hintUsed, elapsedSec }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || t('common.error'))
      setFeedback(data)
      markDailyFermiDone()
      setSubmitPhase('done')
    } catch (e: unknown) {
      setSubmitError((e as Error).message || t('common.error'))
      setSubmitPhase('idle')
      setTimerRunning(true)
    }
  }

  return (
    <div className="stack">
      {/* チャットモーダル */}
      {showChat && (
        <FermiChatModal
          question={question}
          locale={locale}
          onClose={() => setShowChat(false)}
        />
      )}

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChartIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>
                    {t('fermi.questionTag')}
                  </span>
                </div>
                {/* タイマー */}
                {submitPhase === 'idle' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: elapsedSec >= 120 ? 'var(--danger)' : 'var(--text-muted)', fontFamily: "'Inter Tight', monospace" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {String(Math.floor(elapsedSec / 60)).padStart(2,'0')}:{String(elapsedSec % 60).padStart(2,'0')}
                  </div>
                )}
              </div>
              <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.55, letterSpacing: '-0.01em' }}>
                {question}
              </p>
            </div>
          </div>

          {/* ヒント */}
          {hint && submitPhase === 'idle' && (
            <div>
              {!showHint ? (
                <button
                  onClick={() => { setShowHint(true); setHintUsed(true) }}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LightbulbIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        HINT
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, background: 'rgba(220,38,38,0.08)', padding: '2px 8px', borderRadius: 99 }}>− 10点</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', margin: '0 0 12px', fontWeight: 500 }}>{hint}</p>
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

          {/* 回答入力エリア */}
          {submitPhase === 'idle' && (
            <div className="stack-sm">
              <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('dailyFermi.answerLabel')}
              </label>
              <div style={{
                fontSize: 13, color: 'var(--text-muted)',
                background: 'var(--bg-muted)', borderRadius: 8,
                padding: '8px 12px', lineHeight: 1.6,
              }}>
                数字に追われなくていい。「対象・場所・頻度」の順に考えてみると分解しやすい。
              </div>

              {/* textareaとマイクボタン */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('fermi.placeholder')}
                  style={{
                    width: '100%',
                    minHeight: 160,
                    padding: '12px 50px 12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <MicButton
                  onTranscript={(text) => setAnswer(prev => prev + text)}
                  locale={locale}
                />
              </div>

              {submitError && (
                <div style={{ fontSize: 15, color: 'var(--danger)' }}>{submitError}</div>
              )}

              {/* ボタン2つ */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowChat(true)}
                  style={{
                    flex: 1,
                    padding: '13px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  前提を確認する
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  style={{
                    flex: 1,
                    padding: '13px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: answer.trim() ? 'var(--brand)' : 'var(--bg-muted)',
                    color: answer.trim() ? '#fff' : 'var(--text-muted)',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: answer.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  回答を提出する
                </button>
              </div>
            </div>
          )}

          {/* 採点中 */}
          {submitPhase === 'scoring' && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--brand)',
                borderTopColor: 'transparent',
                margin: '0 auto 20px',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                採点しています
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                AIが回答を分析しています...
              </div>
            </div>
          )}

          {/* 採点完了 */}
          {submitPhase === 'done' && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                border: '2px solid #22C55E',
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                採点が終わりました。
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
                結果を確認してみてください。
              </div>
              <Button variant="primary" size="lg" block onClick={() => setSubmitPhase('result')}>
                結果を確認する
              </Button>
            </div>
          )}

          {/* 採点結果 */}
          {submitPhase === 'result' && feedback && (
            <div className="stack-sm">
              {/* スコアバッジ */}
              {feedback.score != null && (
                <div style={{
                  animation: 'scale-in 0.3s ease-out both',
                  background: 'linear-gradient(135deg, #1E2D6B 0%, #3B5BDB 100%)',
                  borderRadius: 20, padding: '24px 20px', textAlign: 'center',
                  boxShadow: '0 4px 24px rgba(59,91,219,0.35)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>採点結果</div>
                  <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 4 }}>
                    {feedback.score}
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: feedback.scoreBreakdown ? 14 : 0 }}>/ 100点満点</div>
                  {feedback.scoreBreakdown && (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', marginTop: 4 }}>
                      {feedback.scoreBreakdown}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    <span>経過時間 {String(Math.floor(elapsedSec / 60)).padStart(2,'0')}:{String(elapsedSec % 60).padStart(2,'0')}</span>
                    {hintUsed && <span>ヒント使用 (-10点)</span>}
                  </div>
                </div>
              )}

              <div className="feedback-card" style={{ animation: 'scale-in 0.2s ease-out both' }}>
                <div className="feedback-head">
                  <div className="feedback-check">
                    <BarChartIcon width={16} height={16} />
                  </div>
                  <div className="feedback-title">AIからのフィードバック</div>
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
