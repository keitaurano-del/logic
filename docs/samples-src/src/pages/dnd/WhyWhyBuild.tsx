import { useState } from 'react'
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

type Slot = { id: number; label: string; expectId: number }

const slots: Slot[] = [
  { id: 1, label: 'Lv1 症状', expectId: 101 },
  { id: 2, label: 'Lv2', expectId: 102 },
  { id: 3, label: 'Lv3', expectId: 103 },
  { id: 4, label: 'Lv4 真因', expectId: 104 },
]

type Card = { id: number; text: string }

const cards: Card[] = [
  { id: 101, text: '常連客のリピート率が下がった' },
  { id: 102, text: 'メニューに飽きられている' },
  { id: 103, text: '新メニュー投入の頻度が低い' },
  { id: 104, text: '顧客アンケートを取る仕組みがない' },
]

export function WhyWhyBuild() {
  // start with shuffled
  const [pool, setPool] = useState<Card[]>(() => [...cards].reverse())
  const [placed, setPlaced] = useState<Record<number, number | null>>({ 1: null, 2: null, 3: null, 4: null })

  const handleEnd = (e: DragEndEvent) => {
    const cardId = Number(e.active.id)
    const slotId = e.over?.id ? Number(e.over.id) : null
    if (!slotId) return
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    if (slot.expectId === cardId) {
      setPool((p) => p.filter((c) => c.id !== cardId))
      setPlaced((m) => ({ ...m, [slotId]: cardId }))
    }
  }

  const reset = () => {
    setPool([...cards].reverse())
    setPlaced({ 1: null, 2: null, 3: null, 4: null })
  }

  const done = Object.values(placed).every((v) => v !== null)

  return (
    <SamplePage title="4-B Why-Why Build" subtitle="原因カードを階層に配置してツリーを完成">
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
          <h2 className="step-title" style={{ marginBottom: 4 }}>正しい階層に並べよう</h2>
          <p className="step-body" style={{ marginBottom: 12, fontSize: 12 }}>
            「売上↓」の真因まで、なぜ→なぜを正しい順に並べます。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {slots.map((s) => (
              <SlotBox key={s.id} slot={s} card={placed[s.id] ? cards.find((c) => c.id === placed[s.id]) : undefined} />
            ))}
          </div>

          <div
            style={{
              minHeight: 100,
              background: '#FFFCF1',
              border: '1.5px dashed var(--rule)',
              borderRadius: 12,
              padding: 8,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {pool.map((c) => (
              <DragCard key={c.id} card={c} />
            ))}
            {pool.length === 0 && (
              <div style={{ width: '100%', textAlign: 'center', fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)', padding: 12 }}>
                すべて配置済み！
              </div>
            )}
          </div>

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
              🎉 真因「アンケート不足」までたどり着きました
            </motion.div>
          )}

          <button className="btn-secondary" onClick={reset} style={{ marginTop: 12, width: '100%' }}>
            リセット
          </button>
        </div>
      </DndContext>
    </SamplePage>
  )
}

function SlotBox({ slot, card }: { slot: Slot; card?: Card }) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        background: card ? 'var(--brand-soft)' : isOver ? '#FFF7DA' : 'white',
        border: `2px ${card ? 'solid' : 'dashed'} ${card ? 'var(--brand)' : 'var(--ink-soft)'}`,
        borderRadius: 12,
        padding: '8px 10px',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-en)',
          fontSize: 12,
          background: card ? 'var(--brand)' : 'var(--ink-soft)',
          color: 'white',
          borderRadius: 6,
          padding: '2px 6px',
          fontWeight: 700,
        }}
      >
        {slot.label}
      </span>
      <span style={{ fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink)' }}>
        {card ? card.text : '— ここに置く —'}
      </span>
    </div>
  )
}

function DragCard({ card }: { card: Card }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id })
  const t = transform ? `translate(${transform.x}px, ${transform.y}px)` : ''
  return (
    <div
      ref={setNodeRef}
      style={{
        background: 'white',
        border: '1.5px solid var(--ink)',
        borderRadius: 10,
        padding: '6px 10px',
        fontFamily: 'var(--font-jp)',
        fontSize: 11,
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
      {card.text}
    </div>
  )
}
