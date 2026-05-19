import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

const chain = [
  { q: '売上が落ちた', a: 'なぜ？' },
  { q: '常連客の来店頻度が下がった', a: 'なぜ？' },
  { q: '新メニューが響かなかった', a: 'なぜ？' },
  { q: '顧客の食習慣がヘルシー志向に変わった', a: 'なぜ？' },
  { q: 'リサーチ無しで新メニューを決めた', a: '🎯 これが真因' },
]

export function WhyWhyTree() {
  const [depth, setDepth] = useState(1)

  return (
    <SamplePage title="1-C Why-Why" subtitle="なぜを5回繰り返して真因を掘り下げる">
      <h2 className="step-title">真因にたどり着くまで「なぜ」を繰り返す</h2>
      <p className="step-body" style={{ marginBottom: 14 }}>
        トヨタ式の「なぜなぜ分析」。表面の症状ではなく、構造的な原因に到達します。
      </p>

      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 14,
          border: '1.5px dashed var(--rule)',
          minHeight: 380,
        }}
      >
        <AnimatePresence initial={false}>
          {chain.slice(0, depth).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              transition={{ duration: 0.3 }}
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  background: i === chain.length - 1 ? 'var(--sticky)' : 'var(--brand-soft)',
                  border: `1.5px solid ${i === chain.length - 1 ? 'var(--accent)' : 'var(--brand)'}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                  margin: '0 0 6px',
                  fontFamily: 'var(--font-jp)',
                  fontSize: 13,
                  color: 'var(--ink)',
                  boxShadow: '2px 2px 0 rgba(31,42,68,0.18)',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-en)',
                    background: i === chain.length - 1 ? 'var(--accent)' : 'var(--brand)',
                    color: 'white',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: 11,
                    marginRight: 8,
                  }}
                >
                  Lv {i + 1}
                </span>
                {item.q}
              </div>
              {i < depth - 1 && (
                <div style={{ textAlign: 'center', margin: '4px 0', color: 'var(--accent)', fontFamily: 'var(--font-en)', fontSize: 14 }}>
                  ↓ {item.a}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button
          className="btn-secondary"
          style={{ flex: 1 }}
          onClick={() => setDepth(1)}
        >
          リセット
        </button>
        <button
          className="btn-primary"
          style={{ flex: 2 }}
          onClick={() => setDepth((d) => Math.min(d + 1, chain.length))}
          disabled={depth >= chain.length}
        >
          {depth >= chain.length ? '完了' : `なぜ？ を続ける (${depth}/5)`}
        </button>
      </div>
    </SamplePage>
  )
}
