import { useEffect, useMemo, useState } from 'react'
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
  getQuestionById,
  type PlacementSession,
  type PlacementResult,
  type PlacementAnswer,
} from '../placementData'
import { getGuestId, getNickname, defaultNickname } from '../guestId'
import { ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { RadarChart } from '../components/RadarChart'
import { LoadingIndicator } from '../components/LoadingIndicator'
import { haptic } from '../platform/haptics'
import { API_BASE } from './apiBase'
import { getXp } from '../stats'

interface PlacementTestScreenProps {
  /** 「終了する」を押下し、パーソナルコース生成完了時に呼び出される */
  onComplete: () => void
  onBack?: () => void
}

const TOTAL_QUESTIONS = 10
const DIFF_LABEL: Record<'easy' | 'medium' | 'hard', string> = {
  easy: '基礎',
  medium: '応用',
  hard: '発展',
}

async function submitPlacement(deviation: number, correctCount: number, totalCount: number, nickname: string) {
  try {
    await fetch(`${API_BASE}/api/placement/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: getGuestId(), nickname, deviation, correctCount, totalCount, xp: getXp() }),
    })
  } catch { /* silent */ }
}

type Step = 'quiz' | 'result' | 'review' | 'creating' | 'created'

export function PlacementTestScreen({ onComplete, onBack }: PlacementTestScreenProps) {
  // 「診断を受ける」をクリック → 即1問目スタートにするためイントロは廃止
  const [step, setStep] = useState<Step>('quiz')
  const [session, setSession] = useState<PlacementSession>(() => startSession())
  const [result, setResult] = useState<PlacementResult | null>(null)

  const currentQ = step === 'quiz' ? getCurrentQuestion(session) : null
  const progress = step === 'quiz' ? (session.cursor / TOTAL_QUESTIONS) * 100 : 0

  // 選択肢タップ → 即次の問題へ進む（解説・正解表示なし）
  const handleAnswer = (i: number) => {
    if (!currentQ) return
    haptic.selection()
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

  // ── Loading: パーソナルコース作成中 ──────────────────
  if (step === 'creating' && result) {
    return (
      <CreatingView
        result={result}
        onSaved={() => setStep('created')}
      />
    )
  }

  // ── Created: 作成完了！ ─────────────────────────────
  if (step === 'created') {
    return <CreatedView onContinue={onComplete} />
  }

  // ── Review: 全問題と解説の一覧 ──────────────────────
  if (step === 'review' && result) {
    return <ReviewView result={result} onBack={() => setStep('result')} />
  }

  // ── Result ──────────────────────────────────────────
  if (step === 'result' && result) {
    return (
      <ResultView
        result={result}
        onShowReview={() => setStep('review')}
        onFinish={() => setStep('creating')}
        onBack={onBack}
      />
    )
  }

  // ── Quiz ────────────────────────────────────────────
  if (!currentQ) {
    return (
      <div className="stack" style={{ padding: 'var(--s-6)', textAlign: 'center' }}>
        <LoadingIndicator label="問題の読み込み中" />
      </div>
    )
  }

  return (
    <div className="stack">
      <Header title={`${session.cursor + 1} / ${TOTAL_QUESTIONS}`} onBack={onBack} />
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
  onShowReview,
  onFinish,
  onBack,
}: {
  result: PlacementResult
  onShowReview: () => void
  onFinish: () => void
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

  return (
    <div className="stack">
      <Header title="診断結果" onBack={onBack} />

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
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>{levelLabel(a.level)}</span>
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

      {/* ── 問題の解説を見る ───────────────────── */}
      <Button variant="default" size="lg" block onClick={onShowReview} style={{ marginTop: 'var(--s-2)' }}>
        問題の解説を見る
        <ArrowRightIcon width={16} height={16} />
      </Button>

      <Button variant="primary" size="lg" block onClick={onFinish} style={{ marginTop: 'var(--s-2)' }}>
        終了する
        <ArrowRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}

// ── 全問題の解説一覧 ─────────────────────────────────────
function ReviewView({ result, onBack }: { result: PlacementResult; onBack: () => void }) {
  const answers = result.answers
  return (
    <div className="stack">
      <Header title="問題の解説" onBack={onBack} />

      <div className="eyebrow accent">REVIEW</div>
      <h1 style={{ fontSize: 24, letterSpacing: '-0.025em' }}>全{answers.length}問の回答と解説</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'var(--s-1)' }}>
        各問題の正答・あなたの回答・解説を確認できます。
      </p>

      <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
        {answers.map((ans, idx) => (
          <ReviewItem key={`${ans.questionId}-${idx}`} index={idx} ans={ans} />
        ))}
      </div>

      <Button variant="default" size="lg" block onClick={onBack} style={{ marginTop: 'var(--s-4)' }}>
        診断結果に戻る
      </Button>
    </div>
  )
}

function ReviewItem({ index, ans }: { index: number; ans: PlacementAnswer }) {
  const q = getQuestionById(ans.questionId)
  if (!q) return null
  const correctIdx = q.options.findIndex(o => o.correct)
  const userIdx = typeof ans.selectedIndex === 'number' ? ans.selectedIndex : -1

  return (
    <section className="card" style={{ padding: 'var(--s-3) var(--s-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 11, fontWeight: 800,
          color: ans.correct ? '#10B981' : 'var(--md-sys-color-error)',
          background: ans.correct ? 'rgba(16,185,129,.12)' : 'rgba(220,38,38,.12)',
          padding: '3px 8px', borderRadius: 6,
        }}>
          Q{index + 1} · {ans.correct ? '正解' : '不正解'}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', background: 'rgba(108,142,245,.12)', padding: '3px 8px', borderRadius: 6 }}>
          {axisLabel(q.axis).label}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-card-soft, rgba(0,0,0,0.04))', padding: '3px 8px', borderRadius: 6 }}>
          {DIFF_LABEL[q.difficulty]} · {q.topic}
        </div>
      </div>

      <h3 style={{ fontSize: 15, lineHeight: 1.55, margin: '0 0 10px', whiteSpace: 'pre-wrap', fontWeight: 700 }}>
        {q.question}
      </h3>

      <div className="stack-sm" style={{ marginBottom: 10 }}>
        {q.options.map((opt, i) => {
          const isUser = i === userIdx
          const isCorrect = i === correctIdx
          const bg = isCorrect
            ? 'rgba(16,185,129,0.08)'
            : isUser
              ? 'rgba(220,38,38,0.06)'
              : undefined
          const borderColor = isCorrect
            ? 'var(--success, #10B981)'
            : isUser
              ? 'var(--danger, #DC2626)'
              : 'var(--border, rgba(0,0,0,0.08))'
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                background: bg,
                border: `1px solid ${borderColor}`,
                fontSize: 13, lineHeight: 1.55,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: isCorrect ? '#10B981' : isUser ? 'var(--md-sys-color-error)' : 'transparent',
                color: isCorrect || isUser ? '#fff' : 'var(--text-secondary)',
                border: isCorrect || isUser ? 'none' : '1.2px solid var(--text-muted, rgba(0,0,0,0.2))',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1 }}>{opt.label}</span>
              <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, alignSelf: 'center' }}>
                {isCorrect && <span style={{ color: '#10B981' }}>正答</span>}
                {!isCorrect && isUser && <span style={{ color: 'var(--md-sys-color-error)' }}>あなた</span>}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{
        background: 'rgba(108,142,245,.06)',
        borderLeft: '3px solid var(--brand, #6C8EF5)',
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <div className="eyebrow" style={{ marginBottom: 4, color: 'var(--brand, #6C8EF5)' }}>解説</div>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{q.explanation}</p>
      </div>
    </section>
  )
}

// ── パーソナルコース生成中ローディング ───────────────────
function CreatingView({ result, onSaved }: { result: PlacementResult; onSaved: () => void }) {
  useEffect(() => {
    // 体感のため最低でも 1.6 秒は表示
    const start = Date.now()
    const axisScores = result.axisScores.length ? result.axisScores : computeAxisScores(result.answers)
    const dev = result.deviation || calcDeviation(result.answers)
    const personal = buildPersonalCourse(axisScores, dev)
    savePersonalCourse(personal)
    const elapsed = Date.now() - start
    const remaining = Math.max(0, 2500 - elapsed)
    const t = setTimeout(onSaved, remaining)
    return () => clearTimeout(t)
  }, [result, onSaved])

  return (
    <div className="stack" style={{ minHeight: 'calc(100dvh - 80px)', justifyContent: 'center', alignItems: 'center', padding: 'var(--s-6) var(--s-4)' }}>
      <div className="placement-spinner" style={{ marginBottom: 24 }} />
      <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.01em', margin: 0 }}>
        あなた専用のコースを作成しています
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
        診断結果から最適なレッスンを選定中…<br />
        弱点を優先したカリキュラムを構成しています。
      </p>
      <style>{`
        .placement-spinner {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 4px solid rgba(108,142,245,0.18);
          border-top-color: #6C8EF5;
          animation: placement-spin 0.85s linear infinite;
        }
        @keyframes placement-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ── 「作成しました！」サクセス画面 ──────────────────────
function CreatedView({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1100)
    return () => clearTimeout(t)
  }, [onContinue])

  return (
    <div className="stack" style={{ minHeight: 'calc(100dvh - 80px)', justifyContent: 'center', alignItems: 'center', padding: 'var(--s-6) var(--s-4)' }}>
      <div className="placement-success-check" style={{ marginBottom: 22 }}>
        <CheckIcon width={36} height={36} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.01em', margin: 0 }}>
        作成しました！
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 10, lineHeight: 1.7 }}>
        あなた専用のパーソナルコースが完成しました。<br />
        早速はじめましょう。
      </p>
      <style>{`
        .placement-success-check {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 30px rgba(16,185,129,0.32);
          animation: placement-pop 0.45s cubic-bezier(.18,.89,.32,1.28) both;
        }
        @keyframes placement-pop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
