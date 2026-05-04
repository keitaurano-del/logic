import { useMemo, useState } from 'react'
import {
  startSession,
  getCurrentQuestion,
  recordAnswer,
  buildResultFromSession,
  computeAxisScores,
  calcDeviation,
  rankLabel,
  axisLabel,
  savePlacementResult,
  buildPersonalCourse,
  savePersonalCourse,
  detailedDiagnosis,
  levelLabel,
  type PlacementSession,
  type PlacementResult,
} from '../placementData'
import { getGuestId, getNickname, defaultNickname } from '../guestId'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { RadarChart } from '../components/RadarChart'
import { API_BASE } from './apiBase'
import { getXp } from '../stats'

interface PlacementTestScreenProps {
  /** 「終了する」を押下した直後（パーソナルコース生成完了時）に呼び出される */
  onComplete: () => void
  onBack?: () => void
}

const TOTAL_QUESTIONS = 10

async function submitPlacement(deviation: number, correctCount: number, totalCount: number, nickname: string) {
  try {
    await fetch(`${API_BASE}/api/placement/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: getGuestId(), nickname, deviation, correctCount, totalCount, xp: getXp() }),
    })
  } catch { /* silent */ }
}

export function PlacementTestScreen({ onComplete, onBack }: PlacementTestScreenProps) {
  // 「診断を受ける」をクリック → 即1問目スタートにするためイントロは廃止
  const [step, setStep] = useState<'quiz' | 'result'>('quiz')
  const [session, setSession] = useState<PlacementSession>(() => startSession())
  const [result, setResult] = useState<PlacementResult | null>(null)

  const currentQ = step === 'quiz' ? getCurrentQuestion(session) : null
  const progress = step === 'quiz' ? (session.cursor / TOTAL_QUESTIONS) * 100 : 0

  // 選択肢タップ → 即次の問題へ進む（解説・正解表示なし）
  const handleAnswer = (i: number) => {
    if (!currentQ) return
    const nextSession = recordAnswer(session, currentQ, i)
    setSession(nextSession)
    if (nextSession.cursor >= TOTAL_QUESTIONS) {
      const r = buildResultFromSession(nextSession)
      savePlacementResult(r)
      const nickname = getNickname() || defaultNickname(getGuestId())
      submitPlacement(r.deviation, r.correctCount, r.totalCount, nickname)
      setResult(r)
      setStep('result')
    }
  }

  // ── Result ──────────────────────────────────────────
  if (step === 'result' && result) {
    return <ResultView result={result} onComplete={onComplete} onBack={onBack} />
  }

  // ── Quiz ────────────────────────────────────────────
  if (!currentQ) {
    return (
      <div className="stack">
        <p style={{ padding: 'var(--s-6)', textAlign: 'center' }}>問題の読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="screen-header">
        {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>}
        <div className="progress-text"><b>{session.cursor + 1}</b> / {TOTAL_QUESTIONS}</div>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>
        {axisLabel(currentQ.axis).label}
      </div>
      <h2 style={{ fontSize: 22, lineHeight: 1.55, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
        {currentQ.question}
      </h2>
      <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
        {currentQ.options.map((opt, i) => (
          <button
            key={`${currentQ.id}-${i}`}
            onClick={() => handleAnswer(i)}
            className="card card-compact"
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.55,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s-3)',
            }}
          >
            <span style={{
              width: 26, height: 26,
              borderRadius: '999px',
              border: '1.5px solid currentColor',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0,
              color: 'var(--text-secondary)',
            }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 結果ビュー ────────────────────────────────────────────
function ResultView({
  result,
  onComplete,
  onBack,
}: {
  result: PlacementResult
  onComplete: () => void
  onBack?: () => void
}) {
  const rank = rankLabel(result.deviation)
  const axisScores = result.axisScores.length
    ? result.axisScores
    : computeAxisScores(result.answers)
  const dev = result.deviation || calcDeviation(result.answers)

  const radarAxes = useMemo(
    () => axisScores.map(a => ({
      key: a.axis,
      label: axisLabel(a.axis).short,
      level: a.level,
      levelLabel: levelLabel(a.level),
    })),
    [axisScores],
  )

  const diagnosisLines = useMemo(
    () => detailedDiagnosis(axisScores, dev),
    [axisScores, dev],
  )

  // 「終了する」押下 → パーソナルコースを生成・保存し、画面遷移
  const handleFinish = () => {
    const personal = buildPersonalCourse(axisScores, dev)
    savePersonalCourse(personal)
    onComplete()
  }

  return (
    <div className="stack">
      <div className="screen-header">
        {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>}
        <div className="progress-text">診断結果</div>
      </div>

      <div className="eyebrow accent">SKILL ASSESSMENT</div>
      <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>あなたの実力診断結果</h1>

      {/* ── 偏差値・ランク ───────────────────── */}
      <section className="profile-hero" style={{ textAlign: 'center', padding: 'var(--s-5) var(--s-4)' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-2)' }}>推定偏差値</div>
        <div className="display" style={{
          fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff',
        }}>{dev}</div>
        <div style={{
          marginTop: 'var(--s-3)',
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(255,255,255,.14)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
        }}>
          {rank.label}
        </div>
        <div style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>
          {result.correctCount} / {result.totalCount} 問正解
        </div>
      </section>

      {/* ── レーダーチャート（言葉ラベル） ─────── */}
      <section className="card" style={{ padding: 'var(--s-4) var(--s-3)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>5軸スキルマップ</div>
        <RadarChart axes={radarAxes} size={300} maxLevel={5} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 'var(--s-3)' }}>
          {axisScores.map(a => (
            <div
              key={a.axis}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(108,142,245,.08)',
                border: '1px solid rgba(108,142,245,.18)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{axisLabel(a.axis).label}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#6C8EF5' }}>{levelLabel(a.level)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 詳細診断コメント ───────────────────── */}
      <section className="card">
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>診断コメント</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {diagnosisLines.map((line, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>{line}</p>
          ))}
        </div>
      </section>

      <Button variant="primary" size="lg" block onClick={handleFinish} style={{ marginTop: 'var(--s-3)' }}>
        終了する
        <ArrowRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}
