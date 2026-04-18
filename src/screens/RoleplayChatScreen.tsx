import { useEffect, useRef, useState } from 'react'
import { getSituation, buildSetup } from '../situations'
import { isPremium } from '../subscription'
import { incrementRoleplayUsage } from '../roleplayUsage'
import { localeBody } from '../i18n'
import { ArrowLeftIcon, CheckIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { API_BASE } from './apiBase'

interface RoleplayChatScreenProps {
  situationId: string
  onBack: () => void
}

type Msg = { role: 'user' | 'assistant'; content: string }
type ScoreItem = { name: string; score: number; maxScore: number; feedback: string }
type ScoreResult = { scores: ScoreItem[]; overall: string }
type SummaryResult = {
  summary: string
  keyPoints: string[]
  improvements: string[]
  goodPoints: string[]
}

const MAX_TURNS = 5

export function RoleplayChatScreen({ situationId, onBack }: RoleplayChatScreenProps) {
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

  useEffect(() => {
    if (situation && !startedRef.current) {
      startedRef.current = true
      fetchTurn([], 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading, choices])

  if (!situation) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
        </div>
        <div className="card empty">シナリオが見つかりません</div>
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
        body: JSON.stringify(
          localeBody({
            messages: history,
            setup,
            turnNumber: turn,
            maxTurns: MAX_TURNS,
          }),
        ),
      })
      const data = await res.json()
      if (data.partner) {
        setMessages([...history, { role: 'assistant', content: data.partner }])
        setChoices(Array.isArray(data.choices) ? data.choices : [])
      }
    } catch (e) {
      console.error(e)
      setMessages([
        ...history,
        { role: 'assistant', content: '通信エラーが発生しました' },
      ])
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
          body: JSON.stringify(
            localeBody({ messages: finalMessages, setup }),
          ),
        }).then((r) => r.json()),
        fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            localeBody({ messages: finalMessages, setup }),
          ),
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 0' }}>
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 2 }}>
            {situation.frameworkLabel}
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523', letterSpacing: '-.02em' }}>
            {situation.partnerName}
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7A849E' }}>
          Turn <span style={{ color: '#3B5BDB' }}>{Math.min(turnNumber, MAX_TURNS)}</span> / {MAX_TURNS}
        </div>
      </div>

      {!finished && (
        <>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#EEF2FF', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${(Math.min(turnNumber, MAX_TURNS) / MAX_TURNS) * 100}%`, background: '#3B5BDB', borderRadius: 99, transition: 'width 300ms ease' }} />
          </div>

          {/* Scenario card */}
          <div style={{ background: '#F8F9FF', border: '1px solid #E2E8FF', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7A849E', marginBottom: 6 }}>
              SCENARIO
            </div>
            <div style={{ fontSize: 13, color: '#0F1523', lineHeight: 1.6 }}>
              {situation.context}
            </div>
            <div style={{ fontSize: 13, color: '#3B5BDB', marginTop: 8, fontWeight: 600 }}>
              🎯 {situation.goal}
            </div>
          </div>

          {/* Chat messages */}
          <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user' ? '#3B5BDB' : '#fff',
                color: m.role === 'user' ? '#fff' : '#0F1523',
                fontSize: 14,
                lineHeight: 1.6,
                border: m.role === 'user' ? 'none' : '1px solid #E2E8FF',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                boxShadow: '0 1px 2px rgba(15,21,35,.06)',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#fff', border: '1px solid #E2E8FF', fontSize: 14, color: '#7A849E', alignSelf: 'flex-start' }}>
                考え中…
              </div>
            )}
          </div>

          {/* Choices */}
          {choices.length > 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7A849E', marginBottom: 2 }}>
                あなたの返答
              </div>
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pickChoice(c)}
                  style={{
                    background: '#fff',
                    border: '1.5px solid #DBE4FF',
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 14,
                    color: '#0F1523',
                    lineHeight: 1.6,
                    width: '100%',
                    transition: 'border-color 120ms ease',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {messages.length >= 2 && (
            <button
              onClick={endEarly}
              style={{ background: 'none', border: 'none', color: '#7A849E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}
            >
              終了して採点する
            </button>
          )}
        </>
      )}

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {scoring && (
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '24px 16px', textAlign: 'center', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523', marginBottom: 8 }}>採点中…</div>
              <p style={{ fontSize: 12, color: '#7A849E', margin: 0 }}>AI があなたの対話を 5 項目で評価しています</p>
            </div>
          )}

          {score && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 15, fontWeight: 800, color: '#15803D' }}>採点完了</div>
              </div>
              <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.6, marginBottom: 12 }}>{score.overall}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.scores.map((s) => (
                  <div key={s.name} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>{s.name}</span>
                      <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{s.score} / {s.maxScore}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>{s.feedback}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#3B5BDB', marginBottom: 10 }}>SUMMARY</div>
              <p style={{ fontSize: 14, color: '#0F1523', lineHeight: 1.7, marginBottom: 14 }}>{summary.summary}</p>
              {summary.goodPoints.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>✓ 良かった点</div>
                  <ul style={{ fontSize: 13, color: '#0F1523', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {summary.improvements.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>△ 改善点</div>
                  <ul style={{ fontSize: 13, color: '#0F1523', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.improvements.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBack}
            style={{ background: '#3B5BDB', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: "'Inter Tight', sans-serif", cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(59,91,219,.25)', marginTop: 4 }}
          >
            別のシナリオに戻る
          </button>
        </div>
      )}
    </div>
  )
}
