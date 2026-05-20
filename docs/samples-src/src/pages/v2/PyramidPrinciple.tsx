import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

type Fact = { text: string }
type Claim = { text: string; facts: Fact[] }

const conclusion = '今期は新規顧客獲得に集中すべき'

const claims: Claim[] = [
  {
    text: '既存顧客の LTV は飽和した',
    facts: [
      { text: 'ARPU が3年連続 横ばい' },
      { text: '解約率は 5% で安定' },
    ],
  },
  {
    text: '新規獲得コストが下がっている',
    facts: [
      { text: 'CAC が前年比 30% 減' },
      { text: '競合撤退で広告枠が割安' },
    ],
  },
  {
    text: '市場自体が拡大している',
    facts: [
      { text: '業界規模 YoY +15%' },
      { text: '自社シェアは 8% で伸び代' },
    ],
  },
]

// ビルド段階：
// 0: 結論のみ
// 1: 結論 + 3主張
// 2: 結論 + 3主張 + 全根拠
const stages = [
  { title: 'まず結論を一行で', body: 'ピラミッドの頂点は「これだけは伝えたい」結論。Why So? と問われて答える側、So What? と問われて出てくる側、両方とも結論が頂点。' },
  { title: '結論を支える3つの主張', body: '結論をなぜそう言えるのか、MECE な3つ前後の主張で支える。「なぜ？」に対する答えのレイヤー。' },
  { title: '主張を裏付ける事実・データ', body: '各主張の下には、定量データ or 観察事実が並ぶ。「Why So?」と聞かれて答えられる根拠の層。' },
]

export function PyramidPrinciple() {
  const [stage, setStage] = useState(0)
  const next = () => setStage((s) => Math.min(s + 1, stages.length - 1))
  const prev = () => setStage((s) => Math.max(s - 1, 0))

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-4 ピラミッド原則</div>
      <div className="v2-subtitle">結論 → 主張 → 事実が下から積み上がる構造を、ピラミッド型ビルドアップで体感</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">LOGIC · L23</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: `${((stage + 1) / stages.length) * 100}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="v2-step-title">{stages[stage].title}</h1>
            <p className="v2-step-body">{stages[stage].body}</p>
          </motion.div>
        </AnimatePresence>

        {/* ピラミッド本体 */}
        <div className="v2-svg-bg" style={{ padding: '18px 8px', position: 'relative' }}>
          <Pyramid stage={stage} />
        </div>

        {/* 操作ヒント */}
        <div style={{
          marginTop: 12, padding: '8px 12px', background: '#FEF3C7', borderRadius: 8,
          fontSize: 11, fontWeight: 600, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>💡</span>
          <span>下から上が <strong>So What?</strong>、上から下が <strong>Why So?</strong></span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-ghost" style={{ flex: 1 }} onClick={prev} disabled={stage === 0}>← 戻る</button>
          <button className="v2-btn-primary" style={{ flex: 1 }} onClick={next} disabled={stage === stages.length - 1}>
            積み上げる →
          </button>
        </div>
      </PhoneFrameV2>
    </div>
  )
}

function Pyramid({ stage }: { stage: number }) {
  const showClaims = stage >= 1
  const showFacts = stage >= 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
      {/* 結論（頂点） */}
      <motion.div
        layout
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(108,142,245,.36)',
          maxWidth: 280,
          position: 'relative',
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.8, marginBottom: 4 }}>結論</div>
        {conclusion}
      </motion.div>

      {/* 線（結論→主張） */}
      {showClaims && (
        <svg width="100%" height="20" style={{ overflow: 'visible' }}>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            d="M50% 0 L20% 20 M50% 0 L50% 20 M50% 0 L80% 20"
            stroke="#9BB3FA"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      )}

      {/* 主張 (Layer 2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, width: '100%' }}>
        {claims.map((c, i) =>
          showClaims ? (
            <motion.div
              key={c.text}
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              style={{
                background: '#fff',
                border: '1.5px solid #5478E8',
                borderRadius: 10,
                padding: '8px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                color: '#0D1220',
                textAlign: 'center',
                lineHeight: 1.3,
                minHeight: 64,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', color: '#5478E8' }}>主張{i + 1}</span>
              <span>{c.text}</span>
            </motion.div>
          ) : (
            <div key={c.text} style={{ minHeight: 64 }} />
          )
        )}
      </div>

      {/* 線（主張→根拠） */}
      {showFacts && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', height: 12 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} width="60" height="12" style={{ overflow: 'visible' }}>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                d="M30 0 L8 12 M30 0 L52 12"
                stroke="#9BB3FA"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          ))}
        </div>
      )}

      {/* 根拠 (Layer 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, width: '100%' }}>
        {claims.map((c, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {c.facts.map((f, fi) =>
              showFacts ? (
                <motion.div
                  key={f.text}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + ci * 0.05 + fi * 0.04 }}
                  style={{
                    background: '#F8F9FC',
                    border: '1px solid #DDE2EE',
                    borderRadius: 8,
                    padding: '6px 6px',
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: '#4A5068',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {f.text}
                </motion.div>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
