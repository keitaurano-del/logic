// ロールプレイ会話画面（キャラ軸版）
// 2026-05-19 シチュエーション軸 → キャラ軸に全面リプレース。
// 画面上半分にキャラ立ち絵 + まばたき + 送信時バウンド、下半分にチャット UI。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { localeBody, t } from '../i18n'
import { CheckIcon, ThumbsUpIcon, LightbulbIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { recordActivity } from '../activityLog'
import { API_BASE } from './apiBase'
import { getCharacter, buildCharacterSetup, localized, type Character } from '../roleplayCharacters'

interface RoleplayChatScreenProps {
  characterId: string
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

// キャラ立ち絵 placeholder（画像が無い間表示）— 画像が出来たら img タグに差し替え
function CharacterPortrait({ character, bouncing }: { character: Character; bouncing: boolean }) {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    let cancelled = false
    const loop = () => {
      if (cancelled) return
      // 4〜6 秒間隔のまばたき
      const delay = 4000 + Math.random() * 2000
      setTimeout(() => {
        if (cancelled) return
        setBlink(true)
        setTimeout(() => {
          if (cancelled) return
          setBlink(false)
          loop()
        }, 120)
      }, delay)
    }
    loop()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{
      width: 120, height: 120, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${character.accentColor} 65%, white) 0%, ${character.accentColor} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Caveat, "Noto Serif JP", serif',
      fontSize: 64,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.92)',
      boxShadow: `0 10px 26px color-mix(in srgb, ${character.accentColor} 35%, transparent)`,
      letterSpacing: '0.02em',
      userSelect: 'none',
      transform: bouncing ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'transform 180ms ease, opacity 100ms ease',
      opacity: blink ? 0.3 : 1,
    }} aria-hidden="true">
      {character.initial}
    </div>
  )
}

export function RoleplayChatScreen({ characterId, onBack }: RoleplayChatScreenProps) {
  const character = getCharacter(characterId)

  const [messages, setMessages] = useState<Msg[]>([])
  const [choices, setChoices] = useState<string[]>([])
  const [turnNumber, setTurnNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const startedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  // setup をメモ化
  const setup = useMemo(
    () => (character ? buildCharacterSetup(character) : null),
    [character],
  )

  const fetchTurn = useCallback(async (history: Msg[], turn: number) => {
    if (!setup) return
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
      if (e instanceof DOMException && e.name === 'AbortError') return
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
    if (character && !startedRef.current) {
      startedRef.current = true
      fetchTurn([], 1)
    }
  }, [character, fetchTurn])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, loading, choices])

  if (!character) {
    return (
      <div className="stack">
        <Header onBack={onBack} />
        <div className="card empty">{t('roleplay.scenarioNotFound')}</div>
      </div>
    )
  }

  const pickChoice = (choice: string) => {
    if (loading) return
    haptic.light()
    // 送信時バウンド
    setBouncing(true)
    setTimeout(() => setBouncing(false), 220)
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
        id: characterId,
        title: localized(character.name),
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
        title={localized(character.name)}
        onBack={onBack}
        trailing={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8 }}>
            <span style={{
              background: 'color-mix(in srgb, var(--brand) 15%, transparent)',
              color: 'var(--brand)',
              borderRadius: 99, padding: '2px 8px',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            }}>{t('roleplay.beta')}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('roleplay.remainingTurns', { n: String(MAX_TURNS - Math.min(turnNumber - 1, MAX_TURNS)) })}
            </div>
          </div>
        )}
      />

      {!finished && (
        <>
          {/* キャラ立ち絵エリア（画面上半分） */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '8px 16px 4px',
          }}>
            <CharacterPortrait character={character} bouncing={bouncing} />
            <div style={{ fontSize: 13, fontWeight: 700, color: character.accentColor, marginTop: 4 }}>
              {localized(character.role)}
            </div>
            {/* AI 応答中インジケータ */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: character.accentColor,
                      opacity: 0.4,
                      animation: `rp-blink 1.2s ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
                <span>{t('roleplay.thinking')}</span>
              </div>
            )}
          </div>

          <style>{`@keyframes rp-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }`}</style>

          {/* ターン進捗 */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ height: 3, background: 'var(--accent-soft)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(Math.min(turnNumber, MAX_TURNS) / MAX_TURNS) * 100}%`, background: 'var(--brand)', borderRadius: 99, transition: 'width 300ms ease' }} />
            </div>
          </div>

          {/* チャット履歴 */}
          <div ref={scrollRef} style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            maxHeight: 320, overflowY: 'auto',
            padding: '0 16px',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? 'var(--brand)' : 'var(--bg-card)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                fontSize: 15,
                lineHeight: 1.65,
                border: m.role === 'user' ? 'none' : `1px solid ${'var(--border)'}`,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                boxShadow: '0 1px 3px rgba(15,21,35,.06)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
          </div>

          {/* 選択肢 */}
          {choices.length > 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 16px' }}>
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
                  <span style={{ fontSize: 13, fontWeight: 800, color: character.accentColor, flexShrink: 0, minWidth: 18, paddingTop: 1 }}>
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
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'center' }}
            >
              {t('roleplay.endAndScore')}
            </button>
          )}

          {/* Live2D 注釈 */}
          <div style={{
            fontSize: 10, color: 'var(--text-muted)', textAlign: 'center',
            padding: '4px 16px',
          }}>
            {t('roleplay.live2dNote')}
          </div>
        </>
      )}

      {finished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 16px' }}>
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
