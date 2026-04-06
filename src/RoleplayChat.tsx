import { useState, useRef, useEffect } from 'react'
import { getSituation, buildSetup } from './situations'
import { isPremium } from './subscription'
import { incrementRoleplayUsage } from './roleplayUsage'

type Msg = { role: 'user' | 'assistant'; content: string }
type ScoreItem = { name: string; score: number; maxScore: number; feedback: string }
type ScoreResult = { scores: ScoreItem[]; overall: string }
type SummaryResult = { summary: string; keyPoints: string[]; improvements: string[]; goodPoints: string[] }

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

type Props = {
  situationId: string
  onBack: () => void
}

export default function RoleplayChat({ situationId, onBack }: Props) {
  const situation = getSituation(situationId)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const incrementedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (situation && !incrementedRef.current && !isPremium()) {
      incrementRoleplayUsage()
      incrementedRef.current = true
    }
  }, [situation])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  if (!situation) {
    return (
      <div className="rp-screen">
        <header className="rp-header">
          <button className="rp-back" onClick={onBack}>‹</button>
          <span>シチュエーション未検出</span>
          <span className="rp-header-spacer" />
        </header>
      </div>
    )
  }

  const setup = buildSetup(situation)

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/roleplay/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, setup }),
      })
      const data = await res.json()
      if (data.content) {
        setMessages([...next, { role: 'assistant', content: data.content }])
      }
    } catch (e) {
      console.error(e)
      setMessages([...next, { role: 'assistant', content: '(通信エラーが発生しました)' }])
    } finally {
      setLoading(false)
    }
  }

  const finish = async () => {
    if (messages.length < 2) {
      setFinished(true)
      return
    }
    setScoring(true)
    setFinished(true)
    try {
      const [scoreRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/api/roleplay/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, setup }),
        }).then((r) => r.json()),
        fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, setup }),
        }).then((r) => r.json()),
      ])
      if (scoreRes.scores) setScore(scoreRes)
      if (sumRes.summary) setSummary(sumRes)
    } catch (e) {
      console.error(e)
    } finally {
      setScoring(false)
    }
  }

  if (finished) {
    return (
      <div className="rp-screen">
        <header className="rp-header">
          <button className="rp-back" onClick={onBack}>‹</button>
          <span>結果</span>
          <span className="rp-header-spacer" />
        </header>
        <div className="rp-content rp-result">
          {scoring && <p className="rp-loading">採点中...</p>}
          {score && (
            <div className="rp-score-card">
              <h3>採点</h3>
              {score.scores.map((s) => (
                <div key={s.name} className="rp-score-row">
                  <div className="rp-score-head">
                    <span>{s.name}</span>
                    <strong>{s.score}/{s.maxScore}</strong>
                  </div>
                  <p>{s.feedback}</p>
                </div>
              ))}
              <div className="rp-overall">
                <h4>総評</h4>
                <p>{score.overall}</p>
              </div>
            </div>
          )}
          {summary && (
            <div className="rp-summary-card">
              <h3>振り返り</h3>
              <p className="rp-summary-text">{summary.summary}</p>
              {summary.goodPoints?.length > 0 && (
                <>
                  <h4>👍 良かった点</h4>
                  <ul>{summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </>
              )}
              {summary.improvements?.length > 0 && (
                <>
                  <h4>💡 改善ポイント</h4>
                  <ul>{summary.improvements.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </>
              )}
            </div>
          )}
          <button className="rp-done-btn" onClick={onBack}>シチュエーション一覧へ</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-screen">
      <header className="rp-header">
        <button className="rp-back" onClick={onBack}>‹</button>
        <span>{situation.title}</span>
        <button className="rp-finish" onClick={finish}>終了</button>
      </header>

      <div className="rp-chat-context">
        <strong>{situation.frameworkLabel}</strong>
        <span>相手: {situation.partnerName}（{situation.partnerRole}）</span>
        <span>🎯 {situation.goal}</span>
      </div>

      <div className="rp-chat" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="rp-chat-empty">
            <p>{situation.context}</p>
            <p className="rp-chat-empty-hint">最初の発言からあなたが始めましょう。</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`rp-bubble ${m.role}`}>
            <div className="rp-bubble-name">{m.role === 'user' ? 'あなた' : situation.partnerName}</div>
            <div className="rp-bubble-text">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="rp-bubble assistant">
            <div className="rp-bubble-name">{situation.partnerName}</div>
            <div className="rp-bubble-text rp-typing">入力中...</div>
          </div>
        )}
      </div>

      <div className="rp-input-bar">
        <textarea
          className="rp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button className="rp-send-btn" onClick={send} disabled={loading || !input.trim()}>送信</button>
      </div>
    </div>
  )
}
