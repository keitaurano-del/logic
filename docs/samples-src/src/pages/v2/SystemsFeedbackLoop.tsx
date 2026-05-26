import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

type LoopKind = 'balancing' | 'reinforcing'

type LoopDef = {
  id: LoopKind
  title: string
  subtitle: string
  description: string
  nodes: { id: string; label: string; pos: { x: number; y: number } }[]
  edges: { from: string; to: string; sign: '+' | '-' }[]
  // ノード値の振動シナリオ（周期ごとの値）
  trace: Record<string, number[]>
  domain: string
}

const loops: Record<LoopKind, LoopDef> = {
  balancing: {
    id: 'balancing',
    title: '均衡ループ — 在庫と価格',
    subtitle: 'Balancing Loop（B）',
    description: '在庫が積み上がる → 値下げ → 需要↑ → 在庫が減る → 値上げ → 需要↓ … と振動して平衡に向かう。負のフィードバックが奇数個あると均衡ループ。',
    nodes: [
      { id: '価格',  label: '価格',  pos: { x: 160, y: 30 } },
      { id: '需要',  label: '需要',  pos: { x: 270, y: 130 } },
      { id: '在庫',  label: '在庫',  pos: { x: 160, y: 230 } },
      { id: '出荷',  label: '出荷',  pos: { x: 50, y: 130 } },
    ],
    edges: [
      { from: '在庫', to: '価格', sign: '-' },
      { from: '価格', to: '需要', sign: '-' },
      { from: '需要', to: '出荷', sign: '+' },
      { from: '出荷', to: '在庫', sign: '-' },
    ],
    trace: {
      '価格': [50, 70, 55, 45, 60, 52, 50, 51],
      '需要': [50, 30, 45, 60, 40, 48, 50, 49],
      '在庫': [80, 50, 30, 45, 65, 55, 50, 50],
      '出荷': [50, 30, 45, 60, 40, 48, 50, 49],
    },
    domain: '在庫管理 / 価格弾力性',
  },
  reinforcing: {
    id: 'reinforcing',
    title: '増強ループ — 口コミと売上',
    subtitle: 'Reinforcing Loop（R）',
    description: '売上↑ → 利用者↑ → 口コミ↑ → 認知↑ → 売上↑ … と雪だるま式に増幅する。すべて正のフィードバックで構成されると暴走する。歯止めは別の B ループが要る。',
    nodes: [
      { id: '売上',    label: '売上',     pos: { x: 160, y: 30 } },
      { id: '利用者',  label: '利用者',   pos: { x: 270, y: 130 } },
      { id: '口コミ',  label: '口コミ',   pos: { x: 160, y: 230 } },
      { id: '認知',    label: '認知',     pos: { x: 50, y: 130 } },
    ],
    edges: [
      { from: '売上',   to: '利用者', sign: '+' },
      { from: '利用者', to: '口コミ', sign: '+' },
      { from: '口コミ', to: '認知',   sign: '+' },
      { from: '認知',   to: '売上',   sign: '+' },
    ],
    trace: {
      '売上':   [10, 14, 22, 36, 58, 90, 100, 100],
      '利用者': [10, 16, 26, 42, 65, 95, 100, 100],
      '口コミ': [8, 14, 24, 40, 64, 92, 100, 100],
      '認知':   [12, 18, 30, 50, 75, 98, 100, 100],
    },
    domain: 'グロース / バイラル',
  },
}

export function SystemsFeedbackLoop() {
  const [kind, setKind] = useState<LoopKind>('balancing')
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(false)

  const loop = loops[kind]
  const maxTick = loop.trace[loop.nodes[0].id].length - 1

  useEffect(() => {
    if (!playing || tick >= maxTick) return
    const t = setTimeout(() => {
      // 終端到達時の停止は timeout コールバック内で行う（effect 本体での同期 setState を避ける）
      if (tick + 1 >= maxTick) setPlaying(false)
      setTick((s) => s + 1)
    }, 700)
    return () => clearTimeout(t)
  }, [playing, tick, maxTick])

  const reset = () => {
    setTick(0)
    setPlaying(false)
  }

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-6 システム思考フィードバックループ</div>
      <div className="v2-subtitle">円環の矢印と数値の振動で、増強ループ／均衡ループの違いを体感</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">SYSTEMS · L</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: `${(tick / maxTick) * 100}%` }} />
          </div>
        </div>

        {/* ループ切替 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {(['balancing', 'reinforcing'] as LoopKind[]).map((k) => (
            <button
              key={k}
              onClick={() => { setKind(k); reset() }}
              className={kind === k ? 'v2-btn-primary' : 'v2-btn-ghost'}
              style={{ flex: 1, padding: '10px 8px', fontSize: 12 }}
            >
              {k === 'balancing' ? 'B ループ（均衡）' : 'R ループ（増強）'}
            </button>
          ))}
        </div>

        <h1 className="v2-step-title" style={{ fontSize: 17 }}>{loop.title}</h1>
        <p className="v2-step-body" style={{ fontSize: 12.5 }}>{loop.description}</p>

        {/* SVG ループ */}
        <div className="v2-svg-bg" style={{ padding: 0, overflow: 'hidden' }}>
          <LoopDiagram loop={loop} tick={tick} />
        </div>

        {/* 時系列ミニグラフ */}
        <div className="v2-card" style={{ marginTop: 12, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 8 }}>
            ノード値の推移（周期 {tick + 1} / {maxTick + 1}）
          </div>
          <TraceMiniGraph loop={loop} tick={tick} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-ghost" style={{ flex: 1 }} onClick={reset}>リセット</button>
          <button
            className="v2-btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              if (tick >= maxTick) reset()
              setPlaying((p) => !p)
            }}
          >
            {playing ? '⏸ 一時停止' : tick >= maxTick ? '↺ 最初から' : '▶ 再生'}
          </button>
        </div>
      </PhoneFrameV2>
    </div>
  )
}

// ===== Loop SVG 円環図 =====
function LoopDiagram({ loop, tick }: { loop: LoopDef; tick: number }) {
  const W = 320
  const H = 260
  const nodes = loop.nodes
  const edges = loop.edges

  const nodePos = (id: string) => nodes.find((n) => n.id === id)!.pos
  const colorR = '#6C8EF5'
  const colorB = '#F59E0B'
  const loopColor = loop.id === 'reinforcing' ? colorR : colorB

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <marker id="arrow-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={loopColor} />
        </marker>
      </defs>

      {/* エッジ（曲線） */}
      {edges.map((e, i) => {
        const from = nodePos(e.from)
        const to = nodePos(e.to)
        // 曲線オフセット：時計回りに膨らませる
        const dx = to.x - from.x
        const dy = to.y - from.y
        const len = Math.hypot(dx, dy)
        const ox = -dy / len * 28
        const oy = dx / len * 28
        const cx = (from.x + to.x) / 2 + ox
        const cy = (from.y + to.y) / 2 + oy
        // ラベル位置
        const lx = cx + ox * 0.4
        const ly = cy + oy * 0.4
        const isActive = tick > 0 && (tick - 1) % 4 === i
        return (
          <g key={i}>
            <motion.path
              animate={{
                stroke: isActive ? loopColor : '#C7D5F9',
                strokeWidth: isActive ? 3.5 : 2,
              }}
              d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
              fill="none"
              markerEnd="url(#arrow-loop)"
            />
            <circle cx={lx} cy={ly} r="11" fill={e.sign === '+' ? '#059669' : '#DC2626'} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{e.sign}</text>
          </g>
        )
      })}

      {/* ノード */}
      {nodes.map((n) => {
        const val = loop.trace[n.id][tick]
        const fill = '#fff'
        return (
          <g key={n.id}>
            <motion.circle
              animate={{ r: 32 + (val / 100) * 8 }}
              cx={n.pos.x}
              cy={n.pos.y}
              fill={fill}
              stroke="#2E45A8"
              strokeWidth="2"
            />
            <text x={n.pos.x} y={n.pos.y - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0D1220">
              {n.label}
            </text>
            <motion.text
              key={val}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              x={n.pos.x}
              y={n.pos.y + 12}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#2E45A8"
              fontFamily="JetBrains Mono, monospace"
            >
              {val}
            </motion.text>
          </g>
        )
      })}

      {/* ループラベル（中央） */}
      <g>
        <circle cx={W / 2} cy={H / 2} r={26} fill={loopColor} opacity="0.12" />
        <text x={W / 2} y={H / 2 - 2} textAnchor="middle" fontSize="22" fontWeight="700" fill={loopColor}>
          {loop.id === 'reinforcing' ? 'R' : 'B'}
        </text>
        <text x={W / 2} y={H / 2 + 14} textAnchor="middle" fontSize="9" fontWeight="700" fill={loopColor} letterSpacing="0.05em">
          {loop.id === 'reinforcing' ? 'REINFORCE' : 'BALANCE'}
        </text>
      </g>
    </svg>
  )
}

// ===== 時系列ミニグラフ =====
function TraceMiniGraph({ loop, tick }: { loop: LoopDef; tick: number }) {
  const W = 280
  const H = 90
  const padding = 8
  const innerW = W - padding * 2
  const innerH = H - padding * 2
  const total = loop.trace[loop.nodes[0].id].length

  const colors = ['#2E45A8', '#059669', '#DC2626', '#7C3AED']

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* グリッド */}
        <line x1={padding} y1={padding} x2={padding} y2={H - padding} stroke="#DDE2EE" strokeWidth="1" />
        <line x1={padding} y1={H - padding} x2={W - padding} y2={H - padding} stroke="#DDE2EE" strokeWidth="1" />

        {/* 現在位置のバーティカルライン */}
        <line
          x1={padding + (tick / (total - 1)) * innerW}
          y1={padding}
          x2={padding + (tick / (total - 1)) * innerW}
          y2={H - padding}
          stroke="#6C8EF5"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.5"
        />

        {/* 折れ線 */}
        {loop.nodes.map((n, ni) => {
          const points = loop.trace[n.id].slice(0, tick + 1).map((v, i) => {
            const x = padding + (i / (total - 1)) * innerW
            const y = padding + innerH - (v / 100) * innerH
            return `${x},${y}`
          })
          if (points.length < 2) return null
          return <polyline key={n.id} points={points.join(' ')} fill="none" stroke={colors[ni]} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
        {loop.nodes.map((n, ni) => (
          <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4A5068' }}>
            <span style={{ width: 10, height: 3, background: colors[ni], borderRadius: 2 }} />
            {n.label}
          </div>
        ))}
      </div>
    </div>
  )
}
