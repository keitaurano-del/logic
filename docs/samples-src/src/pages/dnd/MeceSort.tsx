import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

type Item = { id: string; label: string; bucket: 'sales' | 'cost'; assigned: 'pool' | 'sales' | 'cost' | 'wrong' }

const initial: Item[] = [
  { id: '1', label: '製品単価', bucket: 'sales', assigned: 'pool' },
  { id: '2', label: '材料費', bucket: 'cost', assigned: 'pool' },
  { id: '3', label: '顧客数', bucket: 'sales', assigned: 'pool' },
  { id: '4', label: '工場家賃', bucket: 'cost', assigned: 'pool' },
  { id: '5', label: 'リピート率', bucket: 'sales', assigned: 'pool' },
  { id: '6', label: '広告宣伝費', bucket: 'cost', assigned: 'pool' },
]

export function MeceSort() {
  const [items, setItems] = useState<Item[]>(initial)
  const [bounceId, setBounceId] = useState<string | null>(null)

  const handleEnd = (e: DragEndEvent) => {
    const id = String(e.active.id)
    const over = e.over?.id ? String(e.over.id) : null
    if (!over) return
    const item = items.find((x) => x.id === id)
    if (!item) return
    if (over === 'sales' || over === 'cost') {
      if (item.bucket === over) {
        setItems((arr) => arr.map((x) => (x.id === id ? { ...x, assigned: over as 'sales' | 'cost' } : x)))
      } else {
        // wrong: bounce
        setBounceId(id)
        setTimeout(() => setBounceId(null), 500)
      }
    }
  }

  const reset = () => setItems(initial)
  const done = items.every((i) => i.assigned !== 'pool')

  return (
    <SamplePage title="4-A MECE Sort" subtitle="カードを売上/コストに振り分け、誤分類はバウンスで戻る">
      <DndContext onDragEnd={handleEnd}>
        <div
          style={{
            background: 'var(--paper)',
            borderRadius: 16,
            padding: 12,
            minHeight: 500,
            border: '1.5px dashed var(--rule)',
          }}
        >
          <h2 className="step-title" style={{ marginBottom: 4 }}>利益の構成要素はどっち？</h2>
          <p className="step-body" style={{ marginBottom: 12, fontSize: 12 }}>
            下のカードを 売上 / コスト にドラッグして分類しましょう。
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <Bucket id="sales" label="売上↑" color="var(--brand)" items={items.filter((i) => i.assigned === 'sales')} />
            <Bucket id="cost" label="コスト↓" color="var(--accent)" items={items.filter((i) => i.assigned === 'cost')} />
          </div>

          <div
            style={{
              minHeight: 120,
              background: '#FFFCF1',
              border: '1.5px dashed var(--rule)',
              borderRadius: 12,
              padding: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {items.filter((i) => i.assigned === 'pool').map((it) => (
              <DragCard key={it.id} item={it} bouncing={bounceId === it.id} />
            ))}
            {items.filter((i) => i.assigned === 'pool').length === 0 && (
              <div style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)', padding: 12 }}>
                すべて振り分け済み！
              </div>
            )}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: 'var(--sticky)',
                  borderRadius: 12,
                  fontFamily: 'var(--font-jp)',
                  fontSize: 13,
                  textAlign: 'center',
                  boxShadow: '2px 3px 0 var(--sticky-shadow)',
                }}
              >
                🎉 MECEに分解できました
              </motion.div>
            )}
          </AnimatePresence>

          <button className="btn-secondary" onClick={reset} style={{ marginTop: 12, width: '100%' }}>
            リセット
          </button>
        </div>
      </DndContext>
    </SamplePage>
  )
}

function Bucket({ id, label, color, items }: { id: string; label: string; color: string; items: Item[] }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minHeight: 140,
        background: isOver ? `${color}22` : 'white',
        border: `2px ${isOver ? 'solid' : 'dashed'} ${color}`,
        borderRadius: 14,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 14, color, textAlign: 'center', marginBottom: 4 }}>
        {label}
      </div>
      {items.map((it) => (
        <div
          key={it.id}
          style={{
            background: `${color}11`,
            border: `1px solid ${color}`,
            borderRadius: 8,
            padding: '4px 8px',
            fontFamily: 'var(--font-jp)',
            fontSize: 11,
            color: 'var(--ink)',
          }}
        >
          {it.label}
        </div>
      ))}
    </div>
  )
}

function DragCard({ item, bouncing }: { item: Item; bouncing: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.id })
  const t = transform ? `translate(${transform.x}px, ${transform.y}px)` : ''
  return (
    <motion.div
      ref={setNodeRef}
      animate={bouncing ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{
        background: 'white',
        border: '1.5px solid var(--ink)',
        borderRadius: 12,
        padding: '8px 12px',
        fontFamily: 'var(--font-jp)',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--ink)',
        boxShadow: '2px 2px 0 rgba(31,42,68,0.2)',
        cursor: 'grab',
        transform: t,
        touchAction: 'none',
      }}
      {...listeners}
      {...attributes}
    >
      {item.label}
    </motion.div>
  )
}
