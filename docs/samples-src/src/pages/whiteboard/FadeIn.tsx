import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

const points = [
  { title: '1. 仮説思考', body: '最初に「おそらく原因はXだ」と当たりをつけて検証する' },
  { title: '2. MECE 分解', body: '漏れなくダブりなく、問題を全体で捉える' },
  { title: '3. 優先度づけ', body: 'インパクトが大きい部分に集中して時間を使う' },
]

export function FadeIn() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <SamplePage title="2-B Fade In" subtitle="箇条書きが上から滑り込み、後からハイライト枠が付く">
      <div
        key={tick}
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 18,
          minHeight: 480,
          border: '1.5px dashed var(--rule)',
        }}
      >
        <motion.h2
          className="step-title"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 16 }}
        >
          ケース面接 3つの柱
        </motion.h2>

        {points.map((p, i) => (
          <motion.div
            key={`${tick}-${i}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.6, duration: 0.5, type: 'spring', stiffness: 180 }}
            style={{
              position: 'relative',
              marginBottom: 14,
              padding: '12px 14px',
              background: 'var(--paper)',
              borderRadius: 10,
            }}
          >
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.9 + i * 0.6, duration: 0.4 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                background: 'var(--brand)',
                borderRadius: 4,
                transformOrigin: 'top',
              }}
            />
            <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 15, color: 'var(--brand)', marginBottom: 4 }}>
              {p.title}
            </div>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
              {p.body}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 + i * 0.6 }}
              style={{
                position: 'absolute',
                top: -8,
                right: 8,
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 999,
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-en)',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {i + 1}
            </motion.div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.5 }}
          style={{
            marginTop: 18,
            padding: 12,
            background: 'var(--sticky)',
            borderRadius: 10,
            boxShadow: '2px 3px 0 var(--sticky-shadow)',
            fontFamily: 'var(--font-jp)',
            fontSize: 13,
            color: 'var(--ink)',
          }}
        >
          ✏️ この3つを組み合わせて、限られた時間で結論を出します
        </motion.div>
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: 14, width: '100%' }}
        onClick={() => setTick((t) => t + 1)}
      >
        もう一度再生
      </button>
    </SamplePage>
  )
}
