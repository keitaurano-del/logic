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
  skipPlacement,
  type PlacementSession,
  type PlacementResult,
} from '../placementData'
import { getCourseById } from '../courseData'
import { getGuestId, getNickname, setNickname, defaultNickname } from '../guestId'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, SparklesIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { RadarChart } from '../components/RadarChart'
import { API_BASE } from './apiBase'
import { getXp } from '../stats'

interface PlacementTestScreenProps {
  onComplete: () => void
  onBack?: () => void
  onSkip?: () => void
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

const DIFF_LABEL: Record<'easy' | 'medium' | 'hard', string> = {
  easy: '基礎',
  medium: '応用',
  hard: '発展',
}

export function PlacementTestScreen({ onComplete, onBack, onSkip }: PlacementTestScreenProps) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [session, setSession] = useState<PlacementSession>(() => startSession())
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [nicknameInput, setNicknameInput] = useState(getNickname() || defaultNickname(getGuestId()))
  const [result, setResult] = useState<PlacementResult | null>(null)

  const currentQ = step === 'quiz' ? getCurrentQuestion(session) : null
  const progress = step === 'quiz' ? (session.cursor / TOTAL_QUESTIONS) * 100 : 0

  const start = () => {
    setSession(startSession())
    setStep('quiz')
    setSelected(null)
    setAnswered(false)
  }

  const handleAnswer = (i: number) => {
    if (answered || !currentQ) return
    setSelected(i)
    setAnswered(true)
  }

  const handleNext = () => {
    if (!currentQ || selected == null) return
    const nextSession = recordAnswer(session, currentQ, selected)
    setSession(nextSession)
    setSelected(null)
    setAnswered(false)
    if (nextSession.cursor >= TOTAL_QUESTIONS) {
      const r = buildResultFromSession(nextSession)
      savePlacementResult(r)
      submitPlacement(r.deviation, r.correctCount, r.totalCount, nicknameInput)
      setNickname(nicknameInput)
      setResult(r)
      setStep('result')
    }
  }

  const handleSkip = () => {
    skipPlacement()
    onSkip?.()
    onComplete()
  }

  // ── Intro ───────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="stack">
        {onBack && (
          <div className="screen-header">
            <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
            <div className="progress-text">実力診断</div>
          </div>
        )}
        <div className="eyebrow accent" style={{ marginTop: onBack ? undefined : 'var(--s-6)' }}>SKILL ASSESSMENT</div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.025em', lineHeight: 1.2 }}>実力診断テスト</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 'var(--s-2)' }}>
          5つのスキル軸で論理思考力を多角的に診断します。回答に応じて出題内容が変わる適応型テストです。
        </p>

        <div className="card" style={{ marginTop: 'var(--s-3)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>診断概要</div>
          <ul style={{ fontSize: 15, lineHeight: 1.9, paddingLeft: 'var(--s-4)' }}>
            <li>問題数: <b>{TOTAL_QUESTIONS} 問</b>（適応出題）</li>
            <li>所要時間: 約 <b>5 分</b></li>
            <li>結果: 推定偏差値・5軸レーダーチャート</li>
            <li>あなたに最適なコースを提案します</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: 'var(--s-3)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>診断する5つの軸</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, fontSize: 14, lineHeight: 1.5 }}>
            <AxisRow num="1" title="構造化" desc="MECE / ロジックツリー / ピラミッド" />
            <AxisRow num="2" title="論証力" desc="演繹 / 帰納 / 対偶 / 形式論理" />
            <AxisRow num="3" title="批判的思考" desc="バイアス / 因果 / 論理的誤謬" />
            <AxisRow num="4" title="仮説・課題設定" desc="仮説思考 / イシュー" />
            <AxisRow num="5" title="ビジネス応用" desc="フェルミ / 数字 / ケース" />
          </div>
        </div>

        <div className="card" style={{ marginTop: 'var(--s-3)' }}>
          <label className="label">ニックネーム（ランキング表示用）</label>
          <input
            className="input"
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            maxLength={20}
            placeholder="ニックネームを入力"
          />
        </div>

        <Button variant="primary" size="lg" block onClick={start} style={{ marginTop: 'var(--s-4)' }}>
          診断を開始する
          <ArrowRightIcon width={16} height={16} />
        </Button>
        {onSkip && (
          <Button variant="default" size="lg" block onClick={handleSkip}>
            スキップ
          </Button>
        )}
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────
  if (step === 'result' && result) {
    return <ResultView result={result} onContinue={onComplete} onBack={onBack} />
  }

  // ── Quiz ────────────────────────────────────────────
  if (!currentQ) {
    return (
      <div className="stack">
        <p style={{ padding: 'var(--s-6)', textAlign: 'center' }}>問題の読み込み中...</p>
      </div>
    )
  }

  const phase = session.plan[session.cursor]?.phase
  return (
    <div className="stack">
      <div className="screen-header">
        {onBack && <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>}
        <div className="progress-text"><b>{session.cursor + 1}</b> / {TOTAL_QUESTIONS}</div>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span>{axisLabel(currentQ.axis).label}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>{currentQ.topic}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>{DIFF_LABEL[currentQ.difficulty]}</span>
        {phase === 'B' && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px',
            borderRadius: 999, background: 'rgba(108,142,245,.18)', color: '#6C8EF5',
          }}>適応出題</span>
        )}
      </div>
      <h2 style={{ fontSize: 22, lineHeight: 1.55, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-display)' }}>
        {currentQ.question}
      </h2>
      <div className="stack-sm" style={{ marginTop: 'var(--s-3)' }}>
        {currentQ.options.map((opt, i) => {
          const isSelected = selected === i
          const showCorrect = answered && opt.correct
          const showWrong = answered && isSelected && !opt.correct
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="card card-compact"
              style={{
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.55,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s-3)',
                borderColor: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : undefined,
                background: showCorrect ? 'rgba(16,185,129,0.06)' : showWrong ? 'rgba(220,38,38,0.06)' : isSelected ? 'var(--brand-soft)' : undefined,
              }}
            >
              <span style={{
                width: 26, height: 26,
                borderRadius: '999px',
                border: '1.5px solid currentColor',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, flexShrink: 0,
                color: showCorrect ? 'var(--success)' : showWrong ? 'var(--danger)' : isSelected ? 'var(--brand)' : 'var(--text-secondary)',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1, color: 'var(--text-primary)' }}>{opt.label}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="card" style={{ marginTop: 'var(--s-3)', borderLeft: '3px solid var(--brand)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>解説</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{currentQ.explanation}</p>
        </div>
      )}
      {answered && (
        <Button variant="primary" size="lg" block onClick={handleNext} style={{ marginTop: 'var(--s-4)' }}>
          {session.cursor + 1 >= TOTAL_QUESTIONS ? '結果を見る' : '次の問題'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}

// ── 結果ビュー ────────────────────────────────────────────
function ResultView({
  result,
  onContinue,
  onBack,
}: {
  result: PlacementResult
  onContinue: () => void
  onBack?: () => void
}) {
  const rank = rankLabel(result.deviation)
  const axisScores = result.axisScores.length
    ? result.axisScores
    : computeAxisScores(result.answers)
  const dev = result.deviation || calcDeviation(result.answers)

  const radarAxes = useMemo(
    () => axisScores.map(a => ({ key: a.axis, label: axisLabel(a.axis).short, level: a.level })),
    [axisScores],
  )

  const recommendedCourses = result.recommendedCourseIds
    .map(id => getCourseById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .slice(0, 3)

  const weakest = [...axisScores].sort((a, b) => a.level - b.level)[0]
  const strongest = [...axisScores].sort((a, b) => b.level - a.level)[0]

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

      {/* ── レーダーチャート ─────────────────── */}
      <section className="card" style={{ padding: 'var(--s-4) var(--s-3)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>5軸スキルマップ（5段階）</div>
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
              <span style={{ fontSize: 14, fontWeight: 800, color: '#6C8EF5' }}>Lv.{a.level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 強み・弱み ───────────────────────── */}
      {weakest && strongest && weakest.axis !== strongest.axis && (
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>診断コメント</div>
          <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>{rank.comment}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <div style={{ fontSize: 14 }}>
              💪 <b>強み:</b> {axisLabel(strongest.axis).label}（Lv.{strongest.level}）
            </div>
            <div style={{ fontSize: 14 }}>
              📈 <b>伸びしろ:</b> {axisLabel(weakest.axis).label}（Lv.{weakest.level}）
            </div>
          </div>
        </section>
      )}

      {/* ── おすすめコース ───────────────────── */}
      {recommendedCourses.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-2)' }}>
            <SparklesIcon width={18} height={18} />
            <h2 style={{ fontSize: 20, margin: 0 }}>あなたへのおすすめコース</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--s-3)' }}>
            診断結果に基づき、今のあなたに最も効果的なコースを選びました。
          </p>
          <div className="stack-sm">
            {recommendedCourses.map((c, idx) => (
              <div
                key={c.id}
                className="card card-compact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: idx === 0 ? '1.5px solid var(--brand, #6C8EF5)' : '1px solid var(--border)',
                  background: idx === 0 ? 'rgba(108,142,245,.06)' : undefined,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(108,142,245,.18)',
                  color: '#6C8EF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16,
                }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    {c.category} · {c.level}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                    {c.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="feedback-card" style={{ marginTop: 'var(--s-3)' }}>
        <div className="feedback-head">
          <div className="feedback-check"><CheckIcon /></div>
          <div className="feedback-title">診断完了！</div>
        </div>
        <div className="feedback-text">
          偏差値 {dev} でランキングに登録されました。プロフィールから全国ランキングを確認できます。
        </div>
      </div>

      <Button variant="primary" size="lg" block onClick={onContinue} style={{ marginTop: 'var(--s-3)' }}>
        詳細結果を見る
        <ArrowRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}

function AxisRow({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: 'rgba(108,142,245,.16)', color: '#6C8EF5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 12, flexShrink: 0,
      }}>{num}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  )
}
