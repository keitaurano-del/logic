import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

const nodes = [
  { label: '顧客', detail: 'Customer', angle: -90, color: 'var(--brand)' },
  { label: '競合', detail: 'Competitor', angle: 30, color: 'var(--accent)' },
  { label: '自社', detail: 'Company', angle: 150, color: 'var(--sticky-shadow)' },
]

export function ThreeCFrame() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s >= 3 ? s : s + 1)), 700)
    return () => clearInterval(t)
  }, [])

  const center = { x: 150, y: 170 }
  const radius = 100

  return (
    <SamplePage title="1-B 3C Frame" subtitle="中央の問いから3方向に放射状展開">
      <h2 className="step-title">市場参入を3つの視点で見る</h2>
      <p className="step-body" style={{ marginBottom: 14 }}>
        新規事業を考えるときは Customer / Competitor / Company の3軸で整理します。
      </p>

      <div style={{ background: 'var(--paper)', borderRadius: 16, padding: 8, border: '1.5px dashed var(--rule)' }}>
        <svg viewBox="0 0 300 340" style={{ width: '100%', height: 340, display: 'block' }}>
          {/* radial connectors */}
          {nodes.map((n, i) => {
            const rad = (n.angle * Math.PI) / 180
            const x2 = center.x + Math.cos(rad) * radius
            const y2 = center.y + Math.sin(rad) * radius
            return (
              <motion.line
                key={i}
                x1={center.x}
                y1={center.y}
                x2={x2}
                y2={y2}
                stroke={n.color}
                strokeWidth={2}
                strokeDasharray="5 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={stage > i ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              />
            )
          })}

          {/* center circle */}
          <motion.circle
            cx={center.x}
            cy={center.y}
            r={36}
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transformOrigin: `${center.x}px ${center.y}px` }}
          />
          <text
            x={center.x}
            y={center.y - 2}
            textAnchor="middle"
            fontFamily="var(--font-jp)"
            fontSize={11}
            fill="var(--ink)"
            fontWeight={700}
          >
            参入すべき？
          </text>
          <text
            x={center.x}
            y={center.y + 14}
            textAnchor="middle"
            fontFamily="var(--font-en)"
            fontSize={14}
            fill="var(--brand)"
          >
            Q
          </text>

          {/* outer nodes */}
          {nodes.map((n, i) => {
            const rad = (n.angle * Math.PI) / 180
            const x = center.x + Math.cos(rad) * radius
            const y = center.y + Math.sin(rad) * radius
            return (
              <motion.g
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={stage > i ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                <circle cx={x} cy={y} r={34} fill={n.color} stroke="var(--ink)" strokeWidth={1.5} />
                <text x={x} y={y - 2} textAnchor="middle" fontFamily="var(--font-jp)" fontSize={13} fontWeight={700} fill="white">
                  {n.label}
                </text>
                <text x={x} y={y + 12} textAnchor="middle" fontFamily="var(--font-en)" fontSize={11} fill="rgba(255,255,255,0.85)">
                  {n.detail}
                </text>
              </motion.g>
            )
          })}
        </svg>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: 'var(--brand-soft)', borderRadius: 12, fontFamily: 'var(--font-jp)', fontSize: 13, color: 'var(--ink)', borderLeft: '4px solid var(--brand)' }}>
        💡 3つの視点が揃って初めて、参入判断ができます。
      </div>

      <button
        className="btn-secondary"
        style={{ marginTop: 12, width: '100%' }}
        onClick={() => setStage(0)}
      >
        もう一度見る
      </button>
    </SamplePage>
  )
}
