import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeftIcon, LightbulbIcon, BarChartIcon, MicIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { Button } from '../components/Button'
import { API_BASE } from './apiBase'
import { getDailyFermi, getDailyFermiIndex, FERMI_POOL, getDailyFermiStats } from '../fermiData'
import { t, getLocale } from '../i18n'
import { getGuestId } from '../guestId'
import { haptic } from '../platform/haptics'
import { useDailyGuide, GuideLabel, GuideStyle } from '../tutorial/dailyGuide'
import { isStandardPlan, isPremiumPlan } from '../subscription'
import { getDisplayName } from '../stats'
import { markDailyFermiDone } from './dailyFermiState'

// ── プラン別デイリー制限 ──────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10)
const DAILY_COUNT_KEY = 'logic-daily-fermi-count'
const REROLL_COUNT_KEY = 'logic-daily-fermi-reroll'

function getDailyCount(): number {
  try { const s = JSON.parse(localStorage.getItem(DAILY_COUNT_KEY) || '{}'); return s.date === TODAY ? (s.count ?? 0) : 0 } catch { return 0 }
}
function incrementDailyCount() {
  try { const c = getDailyCount(); localStorage.setItem(DAILY_COUNT_KEY, JSON.stringify({ date: TODAY, count: c + 1 })) } catch { /* */ }
}
function getRerollCount(): number {
  try { const s = JSON.parse(localStorage.getItem(REROLL_COUNT_KEY) || '{}'); return s.date === TODAY ? (s.count ?? 0) : 0 } catch { return 0 }
}
function incrementRerollCount() {
  try { const c = getRerollCount(); localStorage.setItem(REROLL_COUNT_KEY, JSON.stringify({ date: TODAY, count: c + 1 })) } catch { /* */ }
}

function getDailyFermiLimit(): number {
  if (isPremiumPlan()) return 10
  if (isStandardPlan()) return 5
  return 1 // フリープラン
}
function getDailyRerollLimit(): number {
  // SIT環境では無制限
  if (typeof window !== 'undefined' && window.location.hostname.includes('logic-sit')) return 999
  if (isPremiumPlan()) return 10
  if (isStandardPlan()) return 5
  return 0 // フリープラン
}

// 基礎統計データ（フェルミ推定時の参考値）
// 参考データは fermiData.ts の getDailyFermiStats() を使用

/** Convert **bold** to <strong> */
function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--brand)">$1</strong>')
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
      elements.push(<div key={key++} style={{ display: 'flex', gap: 8, fontSize: 15, lineHeight: 1.7, marginBottom: 2 }}><span style={{ color: 'var(--brand)', fontWeight: 700, minWidth: 20 }}>{numMatch[1]}.</span><span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} /></div>)
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
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>ヒントを聞く</div>
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
              placeholder="質問を入力してください。"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
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
  const { active: guideActive, dismiss: dismissGuide } = useDailyGuide()

  // プラン別制限
  const dailyLimit = getDailyFermiLimit()
  const rerollLimit = getDailyRerollLimit()
  const [dailyCount, setDailyCount] = useState(getDailyCount)
  const [rerollCount, setRerollCount] = useState(getRerollCount)
  const canAnswer = dailyCount < dailyLimit
  const canReroll = rerollCount < rerollLimit && canAnswer

  const [question, setQuestion] = useState(() => getDailyFermi().question)
  const [hint, setHint] = useState(() => getDailyFermi().hint)
  const loadingQuestion = false
  const questionError = ''

  const [answer, setAnswer] = useState('')
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle')
  const [feedback, setFeedback] = useState<FermiFeedback | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // タイマー
  const [elapsedSec, setElapsedSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const [excludedIndexes, setExcludedIndexes] = useState<number[]>([getDailyFermiIndex()])
  const [currentPoolIndex, setCurrentPoolIndex] = useState<number>(getDailyFermiIndex())

  const handleReroll = () => {
    if (!canReroll) return
    incrementRerollCount()
    setRerollCount(getRerollCount())
    setAnswer('')
    setFeedback(null)
    setSubmitPhase('idle')
    setShowHint(false)
    setHintUsed(false)
    // 除外済みインデックス以外からランダムに選ぶ
    const excluded = new Set([...excludedIndexes, currentPoolIndex].filter(i => i >= 0))
    const available = FERMI_POOL.map((_, i) => i).filter(i => !excluded.has(i))
    const nextIdx = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : Math.floor(Math.random() * FERMI_POOL.length)
    const next = FERMI_POOL[nextIdx]
    setQuestion(next.question)
    setHint(next.hint)
    setCurrentPoolIndex(nextIdx)
    setExcludedIndexes(prev => [...prev, nextIdx])
    setElapsedSec(0)
    setTimerRunning(true)
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return
    haptic.medium()
    setTimerRunning(false)
    setSubmitPhase('scoring')
    setSubmitError('')
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userInput: answer, locale, hintUsed, elapsedSec, guestId: getGuestId() }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || t('common.error'))
      setFeedback(data)
      markDailyFermiDone()
      incrementDailyCount()
      setDailyCount(getDailyCount())
      setSubmitPhase('done')
      // スコアをランキングに記録
      if (data.score != null) {
        fetch(`${API_BASE}/api/fermi/record-score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getGuestId(),
            userName: getDisplayName(),
            score: data.score,
            questionIndex: currentPoolIndex,
            elapsedSec,
            hintUsed,
          }),
        }).catch(() => {})
      }
    } catch (e: unknown) {
      setSubmitError((e as Error).message || t('common.error'))
      setSubmitPhase('idle')
      setTimerRunning(true)
    }
  }

  return (
    <div className="stack">
      {guideActive && <GuideStyle />}
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

          {/* プラン別制限・別の問題を選ぶボタン */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {dailyCount + 1} / {dailyLimit}問目
              {rerollLimit > 0 && (
                <span style={{ marginLeft: 8, opacity: 0.7 }}>
                  (別問題: {rerollCount}/{rerollLimit}回使用済)
                </span>
              )}
            </div>
            {canReroll && submitPhase === 'idle' && (
              <button
                onClick={handleReroll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: '1.5px solid var(--brand)',
                  borderRadius: 20, padding: '6px 14px',
                  color: 'var(--brand)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                別の問題を選ぶ
              </button>
            )}
            {!canAnswer && (
              <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
                今日の回答数上限に達しました
              </span>
            )}
          </div>

          {/* ヒント */}
          {hint && submitPhase === 'idle' && (
            <div style={{ marginBottom: guideActive && !showHint ? 28 : 0 }}>
              {!showHint ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => { setShowHint(true); setHintUsed(true) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--brand)', fontSize: 16, fontWeight: 600, padding: 0,
                      animation: guideActive ? 'tut-pulse 1.2s ease 2' : 'none',
                    }}
                  >
                    <LightbulbIcon width={15} height={15} />
                    {t('dailyFermi.showHint')}
                  </button>
                  {guideActive && <GuideLabel text="詰まったら見てみましょう" position="bottom" />}
                </div>
              ) : (
                <div style={{
                  borderRadius: 16,
                  border: '1.5px solid rgba(107,133,214,0.4)',
                  background: 'rgba(107,133,214,0.08)',
                  padding: '16px',
                  fontSize: 16,
                  lineHeight: 1.6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <LightbulbIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                    <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      ヒント
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 500, fontSize: 15, lineHeight: 1.7, flex: 1 }}>{hint}</p>
                    <button
                      onClick={() => setShowHint(false)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 16, padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 24, minHeight: 24,
                      }}
                      title="ヒントを閉じる"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  {/* 基礎統計データ */}
                  <div style={{ paddingTop: 12, borderTop: '1px solid rgba(107,133,214,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>参考データ</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {getDailyFermiStats().map((s) => (
                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: 12 }}>{s.value}</span>
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
                まずは「誰が・どこで・どれくらいの頻度で」を考えてみよう。数字は大まかでOK！
              </div>

              <div style={{ position: 'relative', marginTop: guideActive ? 28 : 0 }}>
                {guideActive && <GuideLabel text="まず自分の考えを書いてみましょう" position="top" />}
                <textarea
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); if (guideActive) dismissGuide() }}
                  placeholder={t('fermi.placeholder')}
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
                    boxSizing: 'border-box',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <MicIcon width={14} height={14} style={{ flexShrink: 0, opacity: 0.8 }} />
                <span>{t('fermi.voiceHint')}</span>
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
                  ヒントを聞く
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'scale-in 0.25s ease-out both' }}>

              {/* スコアカード */}
              <div style={{
                background: 'linear-gradient(135deg, #0F2E2D 0%, #1A4A48 100%)',
                borderRadius: 20,
                padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(112,216,189,0.25)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>採点結果</div>

                {/* スコア数字 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {feedback.score ?? '—'}
                  </span>
                  <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingBottom: 10 }}>/100</span>
                </div>

                {/* スコアバー */}
                {feedback.score != null && (
                  <div style={{ margin: '0 auto 16px', maxWidth: 200 }}>
                    <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${feedback.score}%`,
                        background: feedback.score >= 80 ? '#4ADE80' : feedback.score >= 60 ? '#FCD34D' : 'var(--md-sys-color-error)',
                        transition: 'width 0.8s ease-out',
                      }} />
                    </div>
                  </div>
                )}

                {/* 内訳 */}
                {feedback.scoreBreakdown && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', marginBottom: 14, lineHeight: 1.7 }}>
                    {feedback.scoreBreakdown}
                  </div>
                )}

                {/* メタ情報 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  <span>経過時間 {String(Math.floor(elapsedSec / 60)).padStart(2,'0')}:{String(elapsedSec % 60).padStart(2,'0')}</span>
                  {hintUsed && <span>ヒント使用</span>}
                </div>
              </div>

              {/* フィードバック本文 */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                }}>
                  <BarChartIcon width={15} height={15} style={{ color: 'var(--brand)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AIからのフィードバック</span>
                </div>
                <div style={{ padding: '16px 18px', fontSize: 15, lineHeight: 1.75, color: 'var(--text-primary)' }}>
                  {renderFeedbackMarkdown(feedback.feedback)}
                </div>
                {onReport && (
                  <div style={{ padding: '0 18px 14px' }}>
                    <button
                      onClick={() => onReport({ lessonTitle: t('report.dailyFermiTitle'), question })}
                      style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                      {t('report.linkText')}
                    </button>
                  </div>
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
