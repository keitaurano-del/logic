import { useState } from 'react'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

export function CafeRevenue() {
  const [seats, setSeats] = useState(20)
  const [turn, setTurn] = useState(3)
  const [price, setPrice] = useState(600)

  const revenue = seats * turn * price
  const monthly = revenue * 26

  return (
    <SamplePage title="5-B Cafe Revenue" subtitle="席数×回転率×単価をスライダーで連動">
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 14,
          border: '1.5px dashed var(--rule)',
          minHeight: 500,
        }}
      >
        <h2 className="step-title">カフェ1日の売上は？</h2>

        {/* visualisation: seats */}
        <div style={{ marginBottom: 14, padding: 10, background: 'var(--brand-soft)', borderRadius: 12 }}>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 6 }}>席数</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Array.from({ length: Math.min(seats, 30) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  width: 14,
                  height: 14,
                  background: 'var(--brand)',
                  borderRadius: 3,
                }}
              />
            ))}
            {seats > 30 && <span style={{ fontFamily: 'var(--font-en)', fontSize: 12, color: 'var(--brand)' }}>+{seats - 30}</span>}
          </div>
        </div>

        <Slider label="席数" value={seats} min={5} max={60} step={1} onChange={setSeats} unit="席" />
        <Slider label="回転率（1日）" value={turn} min={1} max={8} step={0.5} onChange={setTurn} unit="回" />
        <Slider label="客単価" value={price} min={300} max={2000} step={50} onChange={setPrice} unit="円" />

        {/* formula */}
        <div
          style={{
            margin: '14px 0',
            padding: 10,
            background: 'white',
            border: '1.5px solid var(--ink)',
            borderRadius: 10,
            fontFamily: 'var(--font-en)',
            fontSize: 13,
            textAlign: 'center',
            color: 'var(--ink)',
          }}
        >
          {seats} × {turn} × ¥{price} = <strong style={{ color: 'var(--brand)' }}>¥{revenue.toLocaleString()}</strong>
        </div>

        <motion.div
          key={revenue}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          style={{
            background: 'var(--sticky)',
            border: '2px solid var(--accent)',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            boxShadow: '3px 4px 0 var(--sticky-shadow)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)' }}>日次売上</div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: 36, color: 'var(--accent)', fontWeight: 700, lineHeight: 1.1 }}>
            ¥{revenue.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
            月商 (26営業日): ¥{monthly.toLocaleString()}
          </div>
        </motion.div>
      </div>
    </SamplePage>
  )
}

function Slider({ label, value, min, max, step, onChange, unit }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--font-en)', color: 'var(--brand)' }}>{value} {unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--brand)' }}
      />
    </div>
  )
}
