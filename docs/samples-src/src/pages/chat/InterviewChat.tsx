import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

type Msg =
  | { from: 'interviewer'; text: string }
  | { from: 'me'; text: string }
  | { from: 'feedback'; text: string; positive: boolean }

const phases: { intro: Msg; choices: { label: string; correct: boolean; fb: string }[]; result: string }[] = [
  {
    intro: { from: 'interviewer', text: 'クライアントは大手電子メーカー。営業利益が前年比 −30% です。原因と打ち手を考えてください。' },
    choices: [
      { label: 'すぐに新製品開発を提案する', correct: false, fb: '具体的施策より、まず構造分解で原因を特定しましょう。' },
      { label: '利益＝売上−コストに分解する', correct: true, fb: 'いい着眼点です。次にどちらが原因か仮説を立てましょう。' },
      { label: '業界全体のトレンドから話す', correct: false, fb: '全体感も大事ですが、まず利益の構造を捉えるのが先です。' },
    ],
    result: '構造分解からスタート',
  },
  {
    intro: { from: 'interviewer', text: '売上が落ちていました。さらに掘り下げるとどう分解しますか？' },
    choices: [
      { label: '製品別 / 地域別 / 顧客セグメント別で見る', correct: true, fb: '正解です。複数の切り口で当たりをつけます。' },
      { label: '営業担当者ごとに見る', correct: false, fb: '粒度が細かすぎ。全体像を掴んでから絞り込みます。' },
    ],
    result: '多角的な切り口で原因特定',
  },
]

export function InterviewChat() {
  const [phase, setPhase] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [history, setHistory] = useState<Msg[]>([phases[0].intro])

  const current = phases[phase]

  const choose = (idx: number) => {
    if (picked !== null) return
    const c = current.choices[idx]
    setPicked(idx)
    setHistory((h) => [
      ...h,
      { from: 'me', text: c.label },
      { from: 'feedback', text: c.fb, positive: c.correct },
    ])
  }

  const next = () => {
    if (phase + 1 < phases.length) {
      setPhase(phase + 1)
      setPicked(null)
      setHistory((h) => [...h, phases[phase + 1].intro])
    }
  }

  return (
    <SamplePage title="3-A Interview Chat" subtitle="ケース面接をLINE風チャットで体験">
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 12,
          minHeight: 460,
          border: '1.5px dashed var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <AnimatePresence initial={false}>
          {history.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start',
                gap: 8,
              }}
            >
              {m.from === 'interviewer' && <Avatar label="面" color="var(--brand)" />}
              <Bubble msg={m} />
              {m.from === 'me' && <Avatar label="私" color="var(--accent)" />}
            </motion.div>
          ))}
        </AnimatePresence>

        {picked === null && (
          <div style={{ marginTop: 'auto', paddingTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>
              ↓ あなたの答えを選ぶ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {current.choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--brand)',
                    color: 'var(--brand)',
                    borderRadius: 14,
                    padding: '10px 14px',
                    fontFamily: 'var(--font-jp)',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {picked !== null && phase + 1 < phases.length && (
          <button className="btn-primary" onClick={next} style={{ marginTop: 8 }}>
            次のフェーズへ →
          </button>
        )}
        {picked !== null && phase + 1 >= phases.length && (
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: 'var(--sticky)',
              borderRadius: 10,
              fontFamily: 'var(--font-jp)',
              fontSize: 13,
              textAlign: 'center',
              boxShadow: '2px 3px 0 var(--sticky-shadow)',
            }}
          >
            🎉 ケース面接終了：構造で考える練習でした
          </div>
        )}
      </div>
    </SamplePage>
  )
}

function Avatar({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-jp)',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  if (msg.from === 'feedback') {
    return (
      <div
        style={{
          background: msg.positive ? '#E7F4EA' : '#FBE9E7',
          border: `1.5px solid ${msg.positive ? '#2E7D32' : 'var(--accent)'}`,
          borderRadius: 12,
          padding: '8px 12px',
          fontFamily: 'var(--font-jp)',
          fontSize: 12,
          color: 'var(--ink)',
          maxWidth: '75%',
        }}
      >
        <span style={{ fontFamily: 'var(--font-en)', fontSize: 12, fontWeight: 700, marginRight: 4, color: msg.positive ? '#2E7D32' : 'var(--accent)' }}>
          {msg.positive ? '✓ Good' : '× Hint'}
        </span>
        {msg.text}
      </div>
    )
  }
  const isMe = msg.from === 'me'
  return (
    <div
      style={{
        background: isMe ? 'var(--brand-soft)' : 'white',
        border: `1.5px solid ${isMe ? 'var(--brand)' : 'var(--ink)'}`,
        borderRadius: 14,
        borderTopLeftRadius: isMe ? 14 : 2,
        borderTopRightRadius: isMe ? 2 : 14,
        padding: '10px 12px',
        fontFamily: 'var(--font-jp)',
        fontSize: 13,
        color: 'var(--ink)',
        maxWidth: '70%',
        lineHeight: 1.5,
      }}
    >
      {msg.text}
    </div>
  )
}
