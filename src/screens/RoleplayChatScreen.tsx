import { useEffect, useRef, useState } from 'react'
import { getSituation, buildSetup } from '../situations'
import { isPremium } from '../subscription'
import { incrementRoleplayUsage } from '../roleplayUsage'
import { localeBody } from '../i18n'
import { ArrowLeftIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
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
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div>
          <div
            className="eyebrow accent"
            style={{ fontSize: 10, marginBottom: 2 }}
          >
            {situation.frameworkLabel}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {situation.partnerName}
          </div>
        </div>
        <div className="progress-text">
          Turn <b>{Math.min(turnNumber, MAX_TURNS)}</b> / {MAX_TURNS}
        </div>
      </div>

      {!finished && (
        <>
          <div className="progress" style={{ marginBottom: 'var(--s-3)' }}>
            <div
              className="progress-fill"
              style={{
                width: `${(Math.min(turnNumber, MAX_TURNS) / MAX_TURNS) * 100}%`,
              }}
            />
          </div>

          <div
            className="card card-compact"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              SCENARIO
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              {situation.context}
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--brand)',
                marginTop: 8,
                fontWeight: 600,
              }}
            >
              🎯 {situation.goal}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="chat-list"
            style={{ maxHeight: 380, overflowY: 'auto' }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <span className="muted">考え中…</span>
              </div>
            )}
          </div>

          {choices.length > 0 && !loading && (
            <div
              className="stack-sm"
              style={{ marginTop: 'var(--s-3)' }}
            >
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                あなたの返答
              </div>
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pickChoice(c)}
                  className="card card-compact"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    border: '1.5px solid var(--border)',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {messages.length >= 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={endEarly}
              style={{ marginTop: 'var(--s-3)' }}
            >
              終了して採点する
            </Button>
          )}
        </>
      )}

      {finished && (
        <div className="stack">
          {scoring && (
            <div className="card empty">
              <div className="display" style={{ fontSize: 16, marginBottom: 'var(--s-2)' }}>
                採点中…
              </div>
              <p className="muted" style={{ fontSize: 12 }}>
                AI があなたの対話を 5 項目で評価しています
              </p>
            </div>
          )}

          {score && (
            <section className="feedback-card">
              <div className="feedback-head">
                <div className="feedback-check">
                  <CheckIcon />
                </div>
                <div className="feedback-title">Scoring complete</div>
              </div>
              <div className="feedback-text" style={{ marginBottom: 'var(--s-3)' }}>
                {score.overall}
              </div>
              <div className="stack-sm">
                {score.scores.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      padding: 'var(--s-3)',
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}
                      >
                        {s.name}
                      </span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--success)',
                        }}
                      >
                        {s.score} / {s.maxScore}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#047857',
                        lineHeight: 1.6,
                      }}
                    >
                      {s.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {summary && (
            <section className="card" style={{ marginTop: 'var(--s-3)' }}>
              <div className="eyebrow accent" style={{ marginBottom: 'var(--s-2)' }}>
                SUMMARY
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 'var(--s-4)' }}>
                {summary.summary}
              </p>

              {summary.goodPoints.length > 0 && (
                <div style={{ marginBottom: 'var(--s-3)' }}>
                  <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--success)' }}>
                    ✓ 良かった点
                  </div>
                  <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 'var(--s-4)' }}>
                    {summary.goodPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.improvements.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--warning)' }}>
                    △ 改善点
                  </div>
                  <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 'var(--s-4)' }}>
                    {summary.improvements.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <Button
            variant="primary"
            size="lg"
            block
            onClick={onBack}
            style={{ marginTop: 'var(--s-4)' }}
          >
            別のシナリオに戻る
          </Button>
        </div>
      )}
    </div>
  )
}
