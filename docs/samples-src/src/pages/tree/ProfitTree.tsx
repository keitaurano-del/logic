import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'
import { TreeNode } from '../../components/TreeNode'

const steps = [
  { id: 0, label: 'タップしてツリーを展開' },
  { id: 1, label: '利益＝売上−コスト' },
  { id: 2, label: '売上＝価格×数量' },
  { id: 3, label: '数量＝顧客数×購入頻度' },
  { id: 4, label: 'すべての要素が見えました' },
]

export function ProfitTree() {
  const [stage, setStage] = useState(0)

  // auto-play on mount
  useEffect(() => {
    const t = setInterval(() => {
      setStage((s) => (s >= 4 ? s : s + 1))
    }, 900)
    return () => clearInterval(t)
  }, [])

  return (
    <SamplePage
      title="1-A Profit Tree"
      subtitle="利益分解ツリーを段階的に展開する"
    >
      <h2 className="step-title">利益はどこから生まれる？</h2>
      <p className="step-body" style={{ marginBottom: 14 }}>
        利益を構造で分解すると、改善ポイントが見えます。タップで段階展開。
      </p>

      <div
        onClick={() => setStage((s) => (s >= 4 ? 0 : s + 1))}
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: '20px 8px',
          minHeight: 360,
          position: 'relative',
          cursor: 'pointer',
          border: '1.5px dashed var(--rule)',
        }}
      >
        {/* root */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
          <TreeNode label="利益" value="?" color="accent" delay={0} />
        </div>

        {/* level 1: sales - cost */}
        {stage >= 1 && (
          <>
            <ConnectorLines from="root" />
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 30 }}>
              <TreeNode label="売上" color="brand" delay={0.05} />
              <TreeNode label="コスト" color="brand" delay={0.15} />
            </div>
          </>
        )}

        {/* level 2 */}
        {stage >= 2 && (
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <TreeNode label="価格" color="sticky" delay={0.05} />
              <TreeNode label="数量" color="sticky" delay={0.15} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <TreeNode label="固定費" color="ink" delay={0.25} />
              <TreeNode label="変動費" color="ink" delay={0.35} />
            </div>
          </div>
        )}

        {/* level 3 */}
        {stage >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            <TreeNode label="顧客数" color="brand" delay={0.05} style={{ fontSize: 10 }} />
            <TreeNode label="頻度" color="brand" delay={0.15} style={{ fontSize: 10 }} />
            <TreeNode label="単価" color="brand" delay={0.25} style={{ fontSize: 10 }} />
          </div>
        )}

        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--sticky)',
                padding: '4px 10px',
                borderRadius: 8,
                fontFamily: 'var(--font-en)',
                fontSize: 14,
                color: 'var(--ink)',
                boxShadow: '2px 2px 0 var(--sticky-shadow)',
              }}
            >
              全要素 visible
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)' }}>
        {steps[stage].label}（{stage}/4）
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          className="btn-secondary"
          onClick={() => setStage(0)}
        >
          リセット
        </button>
        <button
          className="btn-primary"
          onClick={() => setStage((s) => (s >= 4 ? 4 : s + 1))}
        >
          次を展開
        </button>
      </div>
    </SamplePage>
  )
}

function ConnectorLines({ from }: { from: string }) {
  // simple dashed line indicator
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 0,
      }}
      data-from={from}
    />
  )
}
