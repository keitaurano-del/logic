import { useState, useRef, useEffect } from 'react'
import { getSituation, buildSetup } from './situations'
import { isPremium } from './subscription'
import { incrementRoleplayUsage } from './roleplayUsage'
import { t, localeBody } from './i18n'

type Msg = { role: 'user' | 'assistant'; content: string }
type ScoreItem = { name: string; score: number; maxScore: number; feedback: string }
type ScoreResult = { scores: ScoreItem[]; overall: string }
type SummaryResult = { summary: string; keyPoints: string[]; improvements: string[]; goodPoints: string[] }

import { API_BASE } from './apiBase'
const MAX_TURNS = 5

type Props = {
  situationId: string
  onBack: () => void
}

export default function RoleplayChat({ situationId, onBack }: Props) {
  const situation = getSituation(situationId)
  const [messages, setMessages] = useState<Msg[]>([])
  const [choices, setChoices] = useState<string[]>([])
  const [turnNumber, setTurnNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const incrementedRef = useRef(false)
  const startedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (situation && !incrementedRef.current && !isPremium()) {
      incrementRoleplayUsage()
      incrementedRef.current = true
    }
  }, [situation])

  // Auto-start: fetch the first partner line + choices
  // fetchTurn は下の function 宣言（hoist 済み）を参照する。React lint の immutability 警告は意図通り。
  // eslint-disable-next-line react-hooks/immutability, react-hooks/exhaustive-deps
  useEffect(() => {
    if (situation && !startedRef.current) {
      startedRef.current = true
      // eslint-disable-next-line react-hooks/immutability
      fetchTurn([], 1)
    }
  }, [situation])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, choices])

  if (!situation) {
    return (
      <div className="rp-screen">
        <header className="rp-header">
          <button className="rp-back" onClick={onBack}>‹</button>
          <span>{t('roleplay.notFound')}</span>
          <span className="rp-header-spacer" />
        </header>
      </div>
    )
  }

  const setup = buildSetup(situation)

  async function fetchTurn(history: Msg[], turn: number) {
    setLoading(true)
    setChoices([])
    try {
      const res = await fetch(`${API_BASE}/api/roleplay/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localeBody({ messages: history, setup, turnNumber: turn, maxTurns: MAX_TURNS, situationId })),
      })
      const data = await res.json()
      if (data.partner) {
        setMessages([...history, { role: 'assistant', content: data.partner }])
        setChoices(Array.isArray(data.choices) ? data.choices : [])
      }
    } catch (e) {
      console.error(e)
      setMessages([...history, { role: 'assistant', content: t('roleplay.commError') }])
    } finally {
      setLoading(false)
    }
  }

  const pickChoice = (choice: string) => {
    if (loading) return
    const next: Msg[] = [...messages, { role: 'user', content: choice }]
    setMessages(next)
    setChoices([])
    if (turnNumber >= MAX_TURNS) {
      finish(next)
    } else {
      const nextTurn = turnNumber + 1
      setTurnNumber(nextTurn)
      fetchTurn(next, nextTurn)
    }
  }

  const finish = async (finalMessages: Msg[]) => {
    setScoring(true)
    setFinished(true)
    try {
      const [scoreRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/api/roleplay/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup })),
        }).then((r) => r.json()),
        fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup })),
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

  const endEarly = () => {
    if (messages.length < 2) {
      onBack()
      return
    }
    finish(messages)
  }

  if (finished) {
    return (
      <div className="rp-screen">
        <header className="rp-header">
          <button className="rp-back" onClick={onBack}>‹</button>
          <span>{t('roleplay.resultTitle')}</span>
          <span className="rp-header-spacer" />
        </header>
        <div className="rp-content rp-result">
          {scoring && <p className="rp-loading">{t('roleplay.scoring')}</p>}
          {score && (
            <div className="rp-score-card">
              <h3>{t('roleplay.scoreH3')}</h3>
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
                <h4>{t('roleplay.overallH4')}</h4>
                <p>{score.overall}</p>
              </div>
            </div>
          )}
          {summary && (
            <div className="rp-summary-card">
              <h3>{t('roleplay.summaryH3')}</h3>
              <p className="rp-summary-text">{summary.summary}</p>
              {summary.goodPoints?.length > 0 && (
                <>
                  <h4>{t('roleplay.goodPointsH4')}</h4>
                  <ul>{summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </>
              )}
              {summary.improvements?.length > 0 && (
                <>
                  <h4>{t('roleplay.improvementsH4')}</h4>
                  <ul>{summary.improvements.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </>
              )}
            </div>
          )}
          <button className="rp-done-btn" onClick={onBack}>{t('roleplay.backToList')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rp-screen">
      <header className="rp-header">
        <button className="rp-back" onClick={onBack}>‹</button>
        <span>{situation.title}</span>
        <button className="rp-finish" onClick={endEarly}>{t('roleplay.finish')}</button>
      </header>

      <div className="rp-chat-context">
        <strong>{situation.frameworkLabel}</strong>
        <span>{t('roleplay.partnerLabel')} {situation.partnerName}（{situation.partnerRole}）</span>
        <span>{situation.goal}</span>
        <span className="rp-turn-indicator">{t('roleplay.turnIndicator', { n: Math.min(turnNumber, MAX_TURNS), total: MAX_TURNS })}</span>
      </div>

      <div className="rp-chat" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`rp-bubble ${m.role}`}>
            <div className="rp-bubble-name">{m.role === 'user' ? t('roleplay.you') : situation.partnerName}</div>
            <div className="rp-bubble-text">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="rp-bubble assistant">
            <div className="rp-bubble-name">{situation.partnerName}</div>
            <div className="rp-bubble-text rp-typing">{t('roleplay.thinking')}</div>
          </div>
        )}
      </div>

      {choices.length > 0 && !loading && (
        <div className="rp-choices">
          <div className="rp-choices-label">{t('roleplay.choicesLabel')}</div>
          {choices.map((c, i) => (
            <button key={i} className="rp-choice-btn" onClick={() => pickChoice(c)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                background: i === 0 ? 'rgba(108,142,245,0.2)' : i === 1 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)',
                color: i === 0 ? '#6C8EF5' : i === 1 ? '#FBBF24' : '#F87171',
                fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
              }}>{i + 1}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
