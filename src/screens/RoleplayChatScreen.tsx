import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSituation, buildSetup } from '../situations'
import { localeBody, t } from '../i18n'
import { CheckIcon, ThumbsUpIcon, LightbulbIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { recordActivity } from '../activityLog'
import { API_BASE } from './apiBase'
import type { CharacterState } from '../components/RoleplayCharacter3D'

const RoleplayCharacter3D = lazy(() =>
  import('../components/RoleplayCharacter3D').then((m) => ({ default: m.RoleplayCharacter3D })),
)

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
  const [isTalking, setIsTalking] = useState(false)
  const startedRef = useRef(!!hasScript) // スクリプト駆動は initializer で開始済み
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const talkingTimerRef = useRef<number | null>(null)

  // アンマウント時に進行中のfetchをキャンセル
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (talkingTimerRef.current != null) {
        window.clearTimeout(talkingTimerRef.current)
      }
    }
  }, [])

  // assistant メッセージ追加時に talking 状態を一時的に ON
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return
    setIsTalking(true)
    if (talkingTimerRef.current != null) {
      window.clearTimeout(talkingTimerRef.current)
    }
    // セリフ長に応じて 1.6s + 30ms/char、最大 6s
    const duration = Math.min(6000, 1600 + last.content.length * 30)
    talkingTimerRef.current = window.setTimeout(() => {
      setIsTalking(false)
      talkingTimerRef.current = null
    }, duration)
  }, [messages])

  const characterState: CharacterState = loading
    ? 'thinking'
    : isTalking
      ? 'talking'
      : 'idle'

  // setup をメモ化（situation が変わらない限り再生成しない）
  const setup = useMemo(
    () => (situation ? buildSetup(situation) : null),
    [situation],
  )

  // API駆動: ターン取得（useCallback で安定した参照を保つ）
  const fetchTurn = useCallback(async (history: Msg[], turn: number) => {
    if (!setup) return
    // 前のリクエストをキャンセルして新しいコントローラを作成
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
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
        signal,
      })
      const data = await res.json()
      if (data.partner) {
        setMessages([...history, { role: 'assistant', content: data.partner }])
        setChoices(Array.isArray(data.choices) ? data.choices : [])
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return // アンマウント後のキャンセルは無視
      console.error(e)
      setMessages([
        ...history,
        { role: 'assistant', content: t('roleplay.commErrorPlain') },
      ])
    } finally {
      setLoading(false)
    }
  }, [setup])

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
        <div className="card empty">{t('roleplay.scenarioNotFound')}</div>
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
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    setScoring(true)
    setFinished(true)
    try {
      const [scoreRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/api/roleplay/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup: setup! })),
          signal,
        }).then((r) => r.json()),
        fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localeBody({ messages: finalMessages, setup: setup! })),
          signal,
        }).then((r) => r.json()),
      ])
      if (scoreRes.scores) setScore(scoreRes)
      if (sumRes.summary) setSummary(sumRes)
      recordActivity({
        type: 'roleplay',
        id: situationId,
        title: situation?.title,
        meta: typeof scoreRes?.scores?.[0]?.score === 'number'
          ? {
              score: scoreRes.scores.reduce(
                (sum: number, s: ScoreItem) => sum + s.score,
                0,
              ),
            }
          : undefined,
      })
    } catch (e) {
      if (e instanceof DOMException && (e as DOMException).name === 'AbortError') return
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
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', paddingRight: 8 }}>
            {t('roleplay.remainingTurns', { n: String(maxTurns - Math.min(turnNumber - 1, maxTurns)) })}
          </div>
        )}
      />
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{situation.frameworkLabel}</div>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--accent-soft)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(Math.min(turnNumber, maxTurns) / maxTurns) * 100}%`, background: 'var(--brand)', borderRadius: 99, transition: 'width 300ms ease' }} />
        </div>
      </div>

      {!finished && (
        <>
          {/* 3D キャラクター */}
          <div style={{ padding: '0 16px' }}>
            <Suspense
              fallback={(
                <div
                  style={{
                    width: '100%',
                    height: 260,
                    borderRadius: 18,
                    background: 'linear-gradient(160deg, var(--accent-soft) 0%, #dfe6fd 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  キャラクターを準備中…
                </div>
              )}
            >
              <RoleplayCharacter3D characterId={situation.id} state={characterState} height={260} />
            </Suspense>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{situation.partnerName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{situation.partnerRole}</div>
            </div>
          </div>

          {/* Context card */}
          <div style={{ margin: '0 16px', background: 'var(--accent-soft)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--brand)', lineHeight: 1.55 }}>
            <strong style={{ fontWeight: 700 }}>{t('roleplay.scenarioLabel')}</strong>{situation.context}
          </div>

          {/* Chat messages */}
          <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'var(--brand)' : 'var(--bg-card)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 16,
                lineHeight: 1.65,
                border: m.role === 'user' ? 'none' : `1px solid ${'var(--border)'}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                boxShadow: '0 1px 3px rgba(15,21,35,.06)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', opacity: 0.5 + i * 0.15 }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t('roleplay.generating')}</span>
              </div>
            )}
          </div>

          {/* 選択肢 */}
          {choices.length > 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.04em', padding: '2px 2px 4px' }}>
                {t('roleplay.howRespond')}
              </div>
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => pickChoice(c)}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1.5px solid ${'var(--border)'}`,
                    borderRadius: 14, padding: '14px 16px',
                    cursor: 'pointer', textAlign: 'left',
                    fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, width: '100%',
                    transition: 'border-color 120ms ease',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand)', flexShrink: 0, minWidth: 18, paddingTop: 1 }}>
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
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}
            >
              {t('roleplay.endAndScore')}
            </button>
          )}
        </>
      )}

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {scoring && (
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, borderRadius: 14, padding: '24px 16px', textAlign: 'center', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{t('roleplay.scoring')}</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{t('roleplay.scoringDesc')}</p>
            </div>
          )}

          {score && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{t('roleplay.scoreComplete')}</div>
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>{score.overall}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {score.scores.map((s) => (
                  <div key={s.name} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand)' }}>{s.score} / {s.maxScore}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.feedback}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 10 }}>{t('roleplay.overallH4')}</div>
              <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 14 }}>{summary.summary}</p>
              {summary.goodPoints.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>
                    <ThumbsUpIcon width={14} height={14} />
                    <span>{t('roleplay.goodPointsH4')}</span>
                  </div>
                  <ul style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              {summary.improvements.length > 0 && (
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>
                    <LightbulbIcon width={14} height={14} />
                    <span>{t('roleplay.improvementsLabel')}</span>
                  </div>
                  <ul style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
                    {summary.improvements.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBack}
            style={{ background: 'var(--brand)', border: 'none', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(59,91,219,.25)', marginTop: 4 }}
          >
            {t('roleplay.backToOther')}
          </button>
        </div>
      )}
    </div>
  )
}
