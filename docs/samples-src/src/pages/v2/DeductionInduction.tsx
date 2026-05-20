import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

const deductionSteps = [
  { text: 'すべての人間は死ぬ', kind: 'premise', label: '大前提' },
  { text: 'ソクラテスは人間である', kind: 'premise', label: '小前提' },
  { text: 'ゆえに、ソクラテスは死ぬ', kind: 'conclusion', label: '結論' },
]

const inductionSamples = [
  { text: 'カラス A は黒い' },
  { text: 'カラス B は黒い' },
  { text: 'カラス C は黒い' },
  { text: 'カラス D は黒い' },
]

type Mode = 'deduction' | 'induction'

export function DeductionInduction() {
  const [mode, setMode] = useState<Mode>('deduction')
  const [step, setStep] = useState(0)

  // 自動進行（1.6秒ごと）
  useEffect(() => {
    if (mode === 'deduction' && step >= deductionSteps.length) return
    if (mode === 'induction' && step >= inductionSamples.length + 1) return
    const t = setTimeout(() => setStep((s) => s + 1), 1400)
    return () => clearTimeout(t)
  }, [mode, step])

  const switchMode = (m: Mode) => {
    setMode(m)
    setStep(0)
  }

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-1 演繹法 vs 帰納法</div>
      <div className="v2-subtitle">論理の向きを矢印で対比して、二つの推論を体で覚える</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">LOGIC · L25/26</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: mode === 'deduction' ? '50%' : '100%' }} />
          </div>
        </div>

        <h1 className="v2-step-title">論理の方向を切り替えてみる</h1>
        <p className="v2-step-body">
          <strong>演繹</strong>は一般から個別へ降りる推論。<strong>帰納</strong>は個別から一般へ昇る推論。
          矢印の向きが反対なのを意識して。
        </p>

        {/* モード切替 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={mode === 'deduction' ? 'v2-btn-primary' : 'v2-btn-ghost'}
            style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
            onClick={() => switchMode('deduction')}
          >
            演繹 (top → down)
          </button>
          <button
            className={mode === 'induction' ? 'v2-btn-primary' : 'v2-btn-ghost'}
            style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
            onClick={() => switchMode('induction')}
          >
            帰納 (bottom → up)
          </button>
        </div>

        {/* 図解エリア */}
        <div
          className="v2-svg-bg"
          style={{
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '20px 12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {mode === 'deduction' && <DeductionDiagram step={step} />}
          {mode === 'induction' && <InductionDiagram step={step} />}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>もう一度再生</button>
          <button
            className="v2-btn-primary"
            style={{ flex: 1 }}
            onClick={() => switchMode(mode === 'deduction' ? 'induction' : 'deduction')}
          >
            {mode === 'deduction' ? '帰納も見る →' : '演繹に戻る →'}
          </button>
        </div>
      </PhoneFrameV2>
    </div>
  )
}

function DeductionDiagram({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 4 }}>
        一般 → 個別
      </div>
      <AnimatePresence>
        {deductionSteps.map((s, i) =>
          step > i ? (
            <motion.div
              key={s.text}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%' }}
            >
              <PremiseCard label={s.label} text={s.text} kind={s.kind as 'premise' | 'conclusion'} />
              {i < deductionSteps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <Arrow direction="down" />
                </div>
              )}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
      {step > deductionSteps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#2E45A8',
            fontWeight: 700,
            background: '#EEF2FE',
            padding: '6px 12px',
            borderRadius: 999,
          }}
        >
          ✓ 前提が真なら結論も真
        </motion.div>
      )}
    </div>
  )
}

function InductionDiagram({ step }: { step: number }) {
  const samplesShown = Math.min(step, inductionSamples.length)
  const conclusionShown = step > inductionSamples.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}>
      {/* 結論（上） */}
      <div style={{ width: '100%', minHeight: 60, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence>
          {conclusionShown && (
            <motion.div
              key="conclusion"
              initial={{ y: 30, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 6px 24px rgba(108,142,245,.36)',
                textAlign: 'center',
              }}
            >
              ∴ カラスはみんな黒い<br />
              <span style={{ fontWeight: 400, fontSize: 11, opacity: 0.85 }}>（だろう）</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 上向き矢印 */}
      {samplesShown >= inductionSamples.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 8 }}>
          <Arrow direction="up" />
        </motion.div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', marginBottom: 8 }}>
        個別サンプル ↑ 法則化
      </div>

      {/* サンプル群（下） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, width: '100%' }}>
        <AnimatePresence>
          {inductionSamples.slice(0, samplesShown).map((s, i) => (
            <motion.div
              key={s.text}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              style={{
                background: '#fff',
                border: '1px solid #E2E5F0',
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#0D1220',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 999, background: '#0D1220' }} />
              {s.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {conclusionShown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 12,
            fontSize: 11,
            color: '#D97706',
            fontWeight: 700,
            background: 'rgba(217, 119, 6, 0.10)',
            padding: '6px 12px',
            borderRadius: 999,
          }}
        >
          ⚠ 反例1つで覆る（白いカラスがいたら？）
        </motion.div>
      )}
    </div>
  )
}

function PremiseCard({ label, text, kind }: { label: string; text: string; kind: 'premise' | 'conclusion' }) {
  const isConclusion = kind === 'conclusion'
  return (
    <div
      style={{
        background: isConclusion ? 'linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)' : '#fff',
        color: isConclusion ? '#fff' : '#0D1220',
        border: isConclusion ? 'none' : '1px solid #E2E5F0',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: isConclusion ? '0 6px 24px rgba(108,142,245,.36)' : '0 1px 2px rgba(13,18,32,.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: isConclusion ? 'rgba(255,255,255,0.8)' : '#6B7280',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{text}</span>
    </div>
  )
}

function Arrow({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
      <path
        d={direction === 'down' ? 'M10 2 L10 22 M3 16 L10 23 L17 16' : 'M10 26 L10 6 M3 12 L10 5 L17 12'}
        stroke="#5478E8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
