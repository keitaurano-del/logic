import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PhoneFrameV2 } from '../../components/PhoneFrameV2'

type Rung = {
  label: string
  example: string  // 該当する具体例（イメージ）
  note: string     // この階層の特徴
}

const ladders: Record<string, Rung[]> = {
  '生き物': [
    { label: '存在するもの',  example: '何もかも',           note: '何でも当てはまる。区別の役に立たない。' },
    { label: '生物',          example: '動植物すべて',       note: '生きてるもの全般。植物も微生物も含む。' },
    { label: '動物',          example: '犬・鳥・魚',         note: '動くいきもの。植物は除外。' },
    { label: '哺乳類',        example: '犬・猫・象',         note: '毛がある・乳で育つ。鳥や魚は除外。' },
    { label: '犬',            example: '柴・プードル・秋田', note: '犬全般。猫や象は除外。' },
    { label: '柴犬',          example: '黒柴・赤柴',         note: '日本犬の一種。プードルは除外。' },
    { label: 'うちのポチ',    example: '世界に1匹だけ',      note: '個体名。完全に具体。' },
  ],
}

export function AbstractionLadder() {
  const themes = Object.keys(ladders)
  const [theme] = useState(themes[0])
  const rungs = ladders[theme]
  const [idx, setIdx] = useState(3) // start at 哺乳類

  const goUp = () => setIdx((i) => Math.max(i - 1, 0))
  const goDown = () => setIdx((i) => Math.min(i + 1, rungs.length - 1))

  const abstractness = ((rungs.length - 1 - idx) / (rungs.length - 1)) * 100

  return (
    <div className="v2 v2-page">
      <Link to="/" className="v2-back-link">← サンプル一覧へ</Link>
      <div className="v2-title">v2-3 抽象ラダー</div>
      <div className="v2-subtitle">具体と抽象を「はしご」として可視化。上下に動かして共通点 ↔ 具体度を体で覚える</div>

      <PhoneFrameV2>
        <div className="v2-lesson-header">
          <span className="v2-lesson-tag">LOGIC · L68</span>
          <div className="v2-progress">
            <div className="v2-progress-fill" style={{ width: `${abstractness}%` }} />
          </div>
        </div>

        <h1 className="v2-step-title">はしごを上下に動かしてみる</h1>
        <p className="v2-step-body">
          上に行くほど<strong>抽象度↑（カバー範囲は広い）</strong>、下ほど<strong>具体度↑（限定的）</strong>。
          同じものでも、どの階で語るかで会話の精度が全然変わる。
        </p>

        {/* ラダー本体 */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          {/* メーター */}
          <div
            style={{
              width: 28,
              borderRadius: 999,
              background: 'linear-gradient(180deg, #6C8EF5 0%, #DDE2EE 100%)',
              position: 'relative',
              overflow: 'visible',
              minHeight: 360,
            }}
          >
            <motion.div
              animate={{ top: `${(idx / (rungs.length - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 250, damping: 24 }}
              style={{
                position: 'absolute',
                left: -8,
                width: 44,
                height: 30,
                marginTop: -15,
                background: '#fff',
                border: '2px solid #2E45A8',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: '#2E45A8',
                boxShadow: '0 4px 12px rgba(13,18,32,.15)',
              }}
            >
              {Math.round(abstractness)}%
            </motion.div>
          </div>

          {/* ラダー段 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginBottom: 4 }}>
              ↑ 抽象
            </div>
            {rungs.map((r, i) => {
              const active = i === idx
              return (
                <button
                  key={r.label}
                  onClick={() => setIdx(i)}
                  style={{
                    background: active ? 'linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)' : '#fff',
                    color: active ? '#fff' : '#0D1220',
                    border: active ? 'none' : '1px solid #E2E5F0',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    boxShadow: active ? '0 6px 16px rgba(108,142,245,.32)' : 'none',
                    transition: 'background 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{r.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{r.example}</span>
                </button>
              )
            })}
            <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', letterSpacing: '0.06em', marginTop: 4 }}>
              ↓ 具体
            </div>
          </div>
        </div>

        {/* 現在地の解説 */}
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 14,
            background: '#EEF2FE',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2E45A8', letterSpacing: '0.06em', marginBottom: 4 }}>
            この階の特徴
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1220', lineHeight: 1.5 }}>
            {rungs[idx].note}
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="v2-btn-ghost" style={{ flex: 1 }} onClick={goUp} disabled={idx === 0}>
            ↑ 抽象化する
          </button>
          <button className="v2-btn-primary" style={{ flex: 1 }} onClick={goDown} disabled={idx === rungs.length - 1}>
            ↓ 具体化する
          </button>
        </div>
      </PhoneFrameV2>
    </div>
  )
}
