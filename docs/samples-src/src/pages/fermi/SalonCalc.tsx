import { useState } from 'react'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

type Field = { key: string; label: string; placeholder: string; defaultVal: number; unit: string }

const fields: Field[] = [
  { key: 'pop', label: '日本の人口', placeholder: '例：1.2億', defaultVal: 120_000_000, unit: '人' },
  { key: 'cap', label: '美容院1店あたりの利用者', placeholder: '担当できる人数', defaultVal: 600, unit: '人/店' },
  { key: 'usage', label: '人口に対する利用率', placeholder: '0〜1', defaultVal: 0.5, unit: '比率' },
]

export function SalonCalc() {
  const [vals, setVals] = useState<Record<string, number>>({
    pop: 120_000_000,
    cap: 600,
    usage: 0.5,
  })

  const total = Math.round((vals.pop * vals.usage) / vals.cap)
  const actual = 250_000 // 参考値

  return (
    <SamplePage title="5-A Salon Calc" subtitle="日本の美容院数を構造的に推定する電卓">
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 14,
          border: '1.5px dashed var(--rule)',
          minHeight: 500,
        }}
      >
        <h2 className="step-title">日本に美容院は何店ある？</h2>
        <p className="step-body" style={{ fontSize: 12, marginBottom: 14 }}>
          人口・利用率・キャパシティで構造化して見積もります。
        </p>

        {/* tree visualisation */}
        <div
          style={{
            background: 'var(--brand-soft)',
            border: '1.5px solid var(--brand)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
            fontFamily: 'var(--font-en)',
            fontSize: 14,
            color: 'var(--brand)',
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          <span style={{ fontSize: 12 }}>店舗数 ＝</span>
          <br />
          (人口 {fmt(vals.pop)} × 利用率 {vals.usage.toFixed(2)}) ÷ キャパ {fmt(vals.cap)}
        </div>

        {fields.map((f) => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink)', marginBottom: 4 }}>
              <span>{f.label}</span>
              <span style={{ fontFamily: 'var(--font-en)', color: 'var(--brand)' }}>
                {fmt(vals[f.key])} {f.unit}
              </span>
            </label>
            <input
              type="range"
              min={f.key === 'usage' ? 0 : 0}
              max={f.key === 'pop' ? 200_000_000 : f.key === 'cap' ? 2000 : 1}
              step={f.key === 'usage' ? 0.05 : f.key === 'pop' ? 10_000_000 : 50}
              value={vals[f.key]}
              onChange={(e) => setVals((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>
        ))}

        <motion.div
          key={total}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          style={{
            background: 'var(--sticky)',
            border: '2px solid var(--accent)',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            marginTop: 14,
            boxShadow: '3px 4px 0 var(--sticky-shadow)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink-soft)' }}>推定値</div>
          <div style={{ fontFamily: 'var(--font-en)', fontSize: 42, color: 'var(--accent)', lineHeight: 1.1, fontWeight: 700 }}>
            {fmt(total)} 店
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
            参考：実数値は約 {fmt(actual)} 店
          </div>
        </motion.div>
      </div>
    </SamplePage>
  )
}

function fmt(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}億`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  if (n < 10) return n.toFixed(2)
  return n.toLocaleString('ja-JP')
}
