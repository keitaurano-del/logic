import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSituation, buildSetup } from '../situations'
import { isPremium } from '../subscription'
import { incrementRoleplayUsage } from '../roleplayUsage'
import { localeBody } from '../i18n'
import { CheckIcon, ThumbsUpIcon, LightbulbIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { API_BASE } from './apiBase'
import { v3 } from '../styles/tokensV3'

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

  // スクリプト駆動か否か
  const hasScript = !!(situation?.script && situation.script.length > 0)

  // スクリプト駆動の場合は初期メッセージ・選択肢を useState の initializer で設定（useEffect の同期 setState を避ける）
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (situation?.script && situation.script.length > 0) {
      return [{ role: 'assistant', content: situation.script[0].partnerLine }]
    }
    return []
  })
  const [choices, setChoices] = useState<string[]>(() => {
    if (situation?.script && situation.script.length > 0) {
      return situation.script[0].choices
    }
    return []
  })
  const [turnNumber, setTurnNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const incrementedRef = useRef(false)
  const startedRef = useRef(!!hasScript) // スクリプト駆動は initializer で開始済み
  const scrollRef = useRef<HTMLDivElement>(null)

  // setup をメモ化（situation が変わらない限り再生成しない）
  const setup = useMemo(
    () => (situation ? buildSetup(situation) : null),
    [situation],
  )

  // API駆動: ターン取得（useCallback で安定した参照を保つ）
  const fetchTurn = useCallback(async (history: Msg[], turn: number) => {
    if (!setup) return
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
  }, [setup])

  useEffect(() => {
    if (situation && !incrementedRef.current && !isPremium()) {
      incrementRoleplayUsage()
      incrementedRef.current = true
    }
  }, [situation])

  useEffect(() => {
    // API駆動のみ: initializer で未開始の場合にフェッチ
    if (situation && !startedRef.current) {
      startedRef.current = true
      fetchTurn([], 1)
    }
  }, [situation, fetchTurn])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading, choices])

  if (!situation) {
    return (
      <div className="stack">
        <Header onBack={onBack} />
        <div className="card empty">シナリオが見つかりません</div>
      </div>
    )
  }

  const maxTurns = hasScript ? situation.script!.length : MAX_TURNS

  // スクリプト駆動: ユーザーが選択肢を選んだとき
  const pickScriptChoice = (choice: string) => {
    haptic.light()
    const next: Msg[] = [...messages, { role: 'user', content: choice }]
    setMessages(next)
    setChoices([])

    const nextTurn = turnNumber + 1
    setTurnNumber(nextTurn)

    if (nextTurn > maxTurns) {
      // スクリプト終了 → 採点へ
      finish(next)
    } else {
      // 次のスクリプトターン
      const nextScript = situation.script![nextTurn - 1]
      if (nextScript) {
        setTimeout(() => {
          setMessages([...next, { role: 'assistant', content: nextScript.partnerLine }])
          setChoices(nextScript.choices)
        }, 400) // 少し間を置いて自然に
      } else {
        finish(next)
      }
    }
  }

  // API駆動: 選択肢タップ
  const pickApiChoice = (choice: string) => {
    if (loading) return
    haptic.light()
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

  const pickChoice = hasScript ? pickScriptChoice : pickApiChoice

  const finish = async (finalMessages: Msg[]) => {
    setScoring(true)
    setFinished(true)
    try {
      const [scoreRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/api/roleplay/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup: setup! })),
        }).then((r) => r.json()),
        fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup: setup! })),
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
      <Header
        title={situation.partnerName}
        onBack={onBack}
        trailing={(
          <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text2, paddingRight: 8 }}>
            残り <span style={{ color: v3.color.accent }}>{maxTurns - Math.min(turnNumber - 1, maxTurns)}</span> ターン
          </div>
        )}
      />
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 14, color: v3.color.text2, marginBottom: 10 }}>{situation.frameworkLabel}</div>
        {/* Progress bar */}
        <div style={{ height: 3, background: v3.color.accentSoft, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(Math.min(turnNumber, maxTurns) / maxTurns) * 100}%`, background: v3.color.accent, borderRadius: 99, transition: 'width 300ms ease' }} />
        </div>
      </div>

      {!finished && (
        <>
          {/* Context card */}
          <div style={{ background: v3.color.accentSoft, borderRadius: 12, padding: '10px 14px', fontSize: 13, color: v3.color.accent, lineHeight: 1.55 }}>
            <strong style={{ fontWeight: 700 }}>シナリオ: </strong>{situation.context}
          </div>

          {/* Chat messages */}
          <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? v3.color.accent : v3.color.card,
                color: m.role === 'user' ? '#fff' : v3.color.text,
                fontSize: 16,
                lineHeight: 1.65,
                border: m.role === 'user' ? 'none' : `1px solid ${v3.color.line}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                boxShadow: '0 1px 3px rgba(15,21,35,.06)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: v3.color.card, border: `1px solid ${v3.color.line}`, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: v3.color.accent, opacity: 0.5 + i * 0.15 }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: v3.color.text2 }}>返答を生成中</span>
              </div>
            )}
          </div>

          {/* 選択肢 */}
          {choices.length > 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text3, letterSpacing: '.04em', padding: '2px 2px 4px' }}>
                どう返しますか？
              </div>
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pickChoice(c)}
                  style={{
                    background: v3.color.card,
                    border: `1.5px solid ${v3.color.line}`,
                    borderRadius: 14, padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    fontSize: 15, color: v3.color.text, lineHeight: 1.6, width: '100%',
                    transition: 'border-color 120ms ease',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: v3.color.accent, flexShrink: 0, minWidth: 18, paddingTop: 1 }}>
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </button>
              ))}
            </div>
          )}

          {messages.length >= 2 && choices.length > 0 && (
            <button
              onClick={endEarly}
              style={{ background: 'none', border: 'none', color: v3.color.text2, fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}
            >
              終了して採点する
            </button>
          )}
        </>
      )}

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {scoring && (
            <div style={{ background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 14, padding: '24px 16px', textAlign: 'center', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: v3.color.text, marginBottom: 8 }}>採点中…</div>
              <p style={{ fontSize: 14, color: v3.color.text2, margin: 0 }}>AIがあなたの対話を評価しています</p>
            </div>
          )}

          {score && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: v3.color.text }}>採点完了</div>
              </div>
              <p style={{ fontSize: 16, color: v3.color.text, lineHeight: 1.6, marginBottom: 12 }}>{score.overall}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.scores.map((s) => (
                  <div key={s.name} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: v3.color.text }}>{s.name}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: v3.color.accent }}>{s.score} / {s.maxScore}</span>
                    </div>
                    <div style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.6 }}>{s.feedback}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div style={{ background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: v3.color.accent, marginBottom: 10 }}>総評</div>
              <p style={{ fontSize: 16, color: v3.color.text, lineHeight: 1.7, marginBottom: 14 }}>{summary.summary}</p>
              {summary.goodPoints.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: v3.color.accent, marginBottom: 6 }}>
                    <ThumbsUpIcon width={14} height={14} />
                    <span>良かった点</span>
                  </div>
                  <ul style={{ fontSize: 15, color: v3.color.text, lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {summary.improvements.length > 0 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>
                    <LightbulbIcon width={14} height={14} />
                    <span>改善点</span>
                  </div>
                  <ul style={{ fontSize: 15, color: v3.color.text, lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.improvements.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBack}
            style={{ background: v3.color.accent, border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(59,91,219,.25)', marginTop: 4 }}
          >
            別のシナリオに戻る
          </button>
        </div>
      )}
    </div>
  )
}
