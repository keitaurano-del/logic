import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

type DataPoint = {
  month: string
  icecream: number  // 0-100
  drowning: number  // 0-100
  temp: number      // 0-100
}

const dataset: DataPoint[] = [
  { month: '1月', icecream: 10, drowning: 5, temp: 8 },
  { month: '2月', icecream: 12, drowning: 8, temp: 12 },
  { month: '3月', icecream: 22, drowning: 18, temp: 25 },
  { month: '4月', icecream: 35, drowning: 28, temp: 38 },
  { month: '5月', icecream: 50, drowning: 45, temp: 55 },
  { month: '6月', icecream: 60, drowning: 52, temp: 62 },
  { month: '7月', icecream: 85, drowning: 80, temp: 85 },
  { month: '8月', icecream: 90, drowning: 88, temp: 92 },
  { month: '9月', icecream: 65, drowning: 58, temp: 70 },
  { month: '10月', icecream: 38, drowning: 30, temp: 40 },
  { month: '11月', icecream: 22, drowning: 15, temp: 22 },
  { month: '12月', icecream: 14, drowning: 6, temp: 10 },
]

// ステップ：
// 0: 散布図のみ
// 1: 「強い正の相関」ハイライト
// 2: 「アイス売上が水難事故を起こした？」の問い
// 3: 第三変数 Z (気温) がフェードイン、X と Y の両方に線が引かれる
// 4: 結論

const steps = [
  {
    title: 'アイス売上と水難事故',
    body: 'ある国の月別データを散布図にしたら、強い正の相関が出た。アイスがよく売れた月ほど水難事故が多い。',
  },
  {
    title: '相関係数 r = 0.97',
    body: 'ほぼ完璧な正の相関。アイスを食べると人は溺れやすくなるの？',
  },
  {
    title: '本当に「アイス → 水難」？',
    body: '直接の因果がないか、共通の原因がないか、3つ目の可能性を疑ってみる。',
  },
  {
    title: '第三変数 = 気温',
    body: '夏になれば「アイスもよく売れる」し「海/川で遊ぶ人が増えて水難も増える」。両方とも気温に引っ張られている。',
  },
  {
    title: '相関 ≠ 因果',
    body: 'X と Y に強い相関があっても、Z（共通の原因）を見逃すと、間違った因果結論に飛びついてしまう。',
  },
]

export function CorrelationCausation() {
  const [step, setStep] = useState(0)
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-2 相関 ≠ 因果</div>
      <div className="v2-subtitle">隠れた第三変数（lurking variable）の存在を、散布図に重ねて見せる</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">CRITICAL · L71</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="v2-step-title">{steps[step].title}</h1>
            <p className="v2-step-body">{steps[step].body}</p>
          </motion.div>
        </AnimatePresence>

        {/* 散布図 */}
        <div className="v2-svg-bg" style={{ padding: 14 }}>
          <ScatterPlot step={step} />
        </div>

        {/* 結論バー */}
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
              color: '#fff',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(219, 39, 119, 0.30)',
            }}
          >
            X と Y の直接因果は <strong>ない</strong>。Z が共通原因。
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-ghost" style={{ flex: 1 }} onClick={prev} disabled={step === 0}>
            ← 戻る
          </button>
          <button className="v2-btn-primary" style={{ flex: 1 }} onClick={next} disabled={step === steps.length - 1}>
            次へ →
          </button>
        </div>
      </PhoneFrameV2>
    </div>
  )
}

// ===== 散布図コンポーネント =====
function ScatterPlot({ step }: { step: number }) {
  const W = 320
  const H = 240
  const padding = { l: 36, r: 16, t: 16, b: 28 }
  const innerW = W - padding.l - padding.r
  const innerH = H - padding.t - padding.b

  const showCorrelation = step >= 1
  const showZ = step >= 3
  const showLines = step >= 3

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* 軸 */}
      <line x1={padding.l} y1={padding.t} x2={padding.l} y2={H - padding.b} stroke="#9CA3AF" strokeWidth="1" />
      <line x1={padding.l} y1={H - padding.b} x2={W - padding.r} y2={H - padding.b} stroke="#9CA3AF" strokeWidth="1" />

      {/* 軸ラベル */}
      <text x={padding.l - 6} y={padding.t + 8} fontSize="9" fill="#6B7280" textAnchor="end">高</text>
      <text x={padding.l - 6} y={H - padding.b} fontSize="9" fill="#6B7280" textAnchor="end">低</text>
      <text x={padding.l - 24} y={padding.t + innerH / 2} fontSize="10" fill="#0D1220" fontWeight="700" textAnchor="middle" transform={`rotate(-90 ${padding.l - 24} ${padding.t + innerH / 2})`}>
        Y: 水難事故
      </text>
      <text x={padding.l + innerW / 2} y={H - 6} fontSize="10" fill="#0D1220" fontWeight="700" textAnchor="middle">
        X: アイス売上
      </text>

      {/* 相関ライン（step >= 1） */}
      {showCorrelation && (
        <motion.line
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 0.8 }}
          x1={padding.l + 8}
          y1={H - padding.b - 12}
          x2={W - padding.r - 12}
          y2={padding.t + 16}
          stroke="#DB2777"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      )}

      {/* 散布点 */}
      {dataset.map((d, i) => {
        const cx = padding.l + (d.icecream / 100) * innerW
        const cy = padding.t + (1 - d.drowning / 100) * innerH
        const color = showZ ? `hsl(${30 + (1 - d.temp / 100) * 200}, 75%, 55%)` : '#5478E8'
        return (
          <motion.circle
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            cx={cx}
            cy={cy}
            r={showZ ? 5 + (d.temp / 100) * 4 : 5}
            fill={color}
            stroke="#fff"
            strokeWidth="1.5"
          />
        )
      })}

      {/* 第三変数 Z（気温）アイコン */}
      {showZ && (
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <circle cx={W / 2} cy={padding.t + 12} r={20} fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <text x={W / 2} y={padding.t + 17} fontSize="16" textAnchor="middle">☀</text>
          <text x={W / 2} y={padding.t + 38} fontSize="9" fontWeight="700" fill="#92400E" textAnchor="middle">
            Z = 気温
          </text>
        </motion.g>
      )}

      {/* Z から X / Y への因果線 */}
      {showLines && (
        <>
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            x1={W / 2 - 14}
            y1={padding.t + 24}
            x2={padding.l + 14}
            y2={H - padding.b - 6}
            stroke="#F59E0B"
            strokeWidth="2"
            markerEnd="url(#arrow-orange)"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            x1={W / 2 + 14}
            y1={padding.t + 24}
            x2={W - padding.r - 10}
            y2={padding.t + 24}
            stroke="#F59E0B"
            strokeWidth="2"
            markerEnd="url(#arrow-orange)"
          />
          <text x={padding.l + 14} y={H - padding.b - 14} fontSize="10" fontWeight="700" fill="#92400E">→ X</text>
          <text x={W - padding.r - 22} y={padding.t + 20} fontSize="10" fontWeight="700" fill="#92400E">→ Y</text>
        </>
      )}

      <defs>
        <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
        </marker>
      </defs>

      {/* 相関係数ラベル */}
      {showCorrelation && (
        <motion.text
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          x={W - padding.r - 4}
          y={padding.t + 14}
          fontSize="11"
          fontWeight="700"
          fill="#DB2777"
          textAnchor="end"
        >
          r = 0.97
        </motion.text>
      )}
    </svg>
  )
}
