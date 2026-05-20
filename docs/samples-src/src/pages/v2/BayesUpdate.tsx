import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

type Evidence = {
  id: string
  label: string
  detail: string
  // 簡易モデル: 確率の絶対変化量（pt）。正なら H を支持、負なら反証
  impact: number
  icon: string
}

const PRIOR = 30  // 事前確率 30%

const evidences: Evidence[] = [
  { id: 'e1', label: '近所のSNSに目撃投稿',     detail: '昨夜の写真付き',    impact: +28, icon: '📸' },
  { id: 'e2', label: '鳴き声を聞いた人がいる',   detail: '24時間以内',         impact: +18, icon: '🔊' },
  { id: 'e3', label: '夜から急に冷え込んだ',     detail: '体調リスク↑',        impact: -12, icon: '🌡️' },
  { id: 'e4', label: '地域猫ネットに登録済み',   detail: '通報経路あり',       impact: +10, icon: '🏷️' },
  { id: 'e5', label: '迷子から既に4日',         detail: '時間経過の不利',     impact: -15, icon: '⏱️' },
]

export function BayesUpdate() {
  const [applied, setApplied] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setApplied((a) => ({ ...a, [id]: !a[id] }))
  const reset = () => setApplied({})

  const posterior = useMemo(() => {
    let p = PRIOR
    for (const e of evidences) {
      if (applied[e.id]) p += e.impact
    }
    return Math.max(0, Math.min(100, p))
  }, [applied])

  const delta = posterior - PRIOR

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-5 ベイズ更新</div>
      <div className="v2-subtitle">証拠を一枚ずつ採用して、事前確率が事後確率に書き換わっていく感覚を作る</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">CRITICAL · BAYES</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: `${posterior}%` }} />
          </div>
        </div>

        <h1 className="v2-step-title">迷子の猫、72時間以内に見つかる？</h1>
        <p className="v2-step-body">
          事前確率は <strong>{PRIOR}%</strong>。証拠カードを「採用」していくと、信念（確率）がどう動くか観察してみる。
        </p>

        {/* 確率バー */}
        <div className="v2-card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em' }}>P(見つかる | 証拠)</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#0D1220' }}>
                {Math.round(posterior)}%
              </span>
              {delta !== 0 && (
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                  color: delta > 0 ? '#059669' : '#DC2626',
                }}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              )}
            </span>
          </div>
          <div style={{
            height: 14, background: '#E5E9F4', borderRadius: 999, overflow: 'hidden', position: 'relative',
          }}>
            {/* 事前確率マーカー */}
            <div style={{
              position: 'absolute', top: -3, bottom: -3, left: `${PRIOR}%`,
              width: 2, background: '#6B7280', opacity: 0.6,
            }} />
            <motion.div
              animate={{ width: `${posterior}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              style={{
                height: '100%',
                background: posterior >= PRIOR
                  ? 'linear-gradient(90deg, #6C8EF5 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #DC2626 0%, #F59E0B 100%)',
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: '#9CA3AF' }}>
            <span>0%</span>
            <span style={{ marginLeft: `${PRIOR - 4}%`, fontWeight: 700, color: '#6B7280' }}>↑ 事前 {PRIOR}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 証拠カードリスト */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 8 }}>
          証拠カードを採用 / 取り消し
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {evidences.map((e) => {
            const isOn = !!applied[e.id]
            const sign = e.impact > 0 ? '+' : ''
            return (
              <button
                key={e.id}
                onClick={() => toggle(e.id)}
                style={{
                  background: isOn ? '#fff' : '#F8F9FC',
                  border: isOn ? `2px solid ${e.impact > 0 ? '#059669' : '#DC2626'}` : '1px solid #E2E5F0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  opacity: isOn ? 1 : 0.85,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isOn ? (e.impact > 0 ? 'rgba(5,150,105,0.10)' : 'rgba(220,38,38,0.10)') : '#EEF2FE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {e.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1220' }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{e.detail}</div>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  color: e.impact > 0 ? '#059669' : '#DC2626',
                  minWidth: 40,
                  textAlign: 'right',
                }}>
                  {sign}{e.impact}pt
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-ghost" style={{ flex: 1 }} onClick={reset}>リセット</button>
          <button
            className="v2-btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              const all: Record<string, boolean> = {}
              evidences.forEach((e) => (all[e.id] = true))
              setApplied(all)
            }}
          >
            全部採用 →
          </button>
        </div>

        <div style={{
          marginTop: 12, padding: '10px 12px', background: '#FEF3C7', borderRadius: 8,
          fontSize: 11, fontWeight: 600, color: '#92400E', lineHeight: 1.5,
        }}>
          💡 ベイズ更新は「<strong>新しい証拠が来るたびに信念を書き換える</strong>」だけ。確率を1つの数字に固定しない態度がコア。
        </div>
      </PhoneFrameV2>
    </div>
  )
}
