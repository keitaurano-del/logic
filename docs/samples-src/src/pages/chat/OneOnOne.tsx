import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

type Mood = '😀' | '🤔' | '😟' | '😌'

type Turn = {
  speaker: '上司' | '私'
  mood: Mood
  text: string
}

const script: Turn[] = [
  { speaker: '上司', mood: '😌', text: 'お疲れさま。今日は1on1の時間だね。最近どう？' },
  { speaker: '私', mood: '🤔', text: 'プロジェクトAの進め方で少し悩んでいまして…。' },
  { speaker: '上司', mood: '😀', text: 'そっか、具体的に聞かせて。何が一番引っかかってる？' },
]

const choices = [
  { label: '優先順位を相談したい', mood: '🤔' as Mood, fb: { mood: '😌' as Mood, text: 'いいね、優先順位はオープンに整理しよう。' } },
  { label: '進捗の遅れを謝罪する', mood: '😟' as Mood, fb: { mood: '🤔' as Mood, text: '謝るより、原因と次の一手を一緒に考えよう。' } },
  { label: '自分の成長機会を聞く', mood: '😀' as Mood, fb: { mood: '😀' as Mood, text: '前向きなテーマだね。短期と中期に分けて話そう。' } },
]

export function OneOnOne() {
  const [picked, setPicked] = useState<number | null>(null)

  return (
    <SamplePage title="3-B 1on1 Chat" subtitle="上司との対話を表情アイコン付きチャットで">
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 14,
          minHeight: 460,
          border: '1.5px dashed var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {script.map((t, i) => (
          <ChatRow key={i} turn={t} delay={i * 0.5} />
        ))}

        <AnimatePresence>
          {picked !== null && (
            <>
              <ChatRow
                key="picked"
                turn={{
                  speaker: '私',
                  mood: choices[picked].mood,
                  text: choices[picked].label,
                }}
                delay={0}
              />
              <ChatRow
                key="fb"
                turn={{
                  speaker: '上司',
                  mood: choices[picked].fb.mood,
                  text: choices[picked].fb.text,
                }}
                delay={0.4}
              />
            </>
          )}
        </AnimatePresence>

        {picked === null && (
          <div style={{ marginTop: 'auto', paddingTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>
              ↓ 何を切り出す？
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  style={{
                    background: 'white',
                    border: '1.5px solid var(--brand)',
                    color: 'var(--brand)',
                    borderRadius: 14,
                    padding: '10px 12px',
                    fontFamily: 'var(--font-jp)',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.mood}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {picked !== null && (
          <button className="btn-secondary" onClick={() => setPicked(null)} style={{ marginTop: 8 }}>
            別の切り出しを試す
          </button>
        )}
      </div>
    </SamplePage>
  )
}

function ChatRow({ turn, delay }: { turn: Turn; delay: number }) {
  const isMe = turn.speaker === '私'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
      }}
    >
      {!isMe && <FaceAvatar mood={turn.mood} label={turn.speaker} color="var(--brand)" />}
      <div
        style={{
          background: isMe ? 'var(--brand-soft)' : 'white',
          border: `1.5px solid ${isMe ? 'var(--brand)' : 'var(--ink)'}`,
          borderRadius: 14,
          padding: '8px 12px',
          fontFamily: 'var(--font-jp)',
          fontSize: 13,
          color: 'var(--ink)',
          maxWidth: '72%',
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontSize: 10, color: 'var(--ink-soft)', marginBottom: 2 }}>{turn.speaker}</div>
        {turn.text}
      </div>
      {isMe && <FaceAvatar mood={turn.mood} label="私" color="var(--accent)" />}
    </motion.div>
  )
}

function FaceAvatar({ mood, label, color }: { mood: Mood; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        {mood}
      </div>
      <div style={{ fontSize: 9, color: 'var(--ink-soft)', marginTop: 2, fontFamily: 'var(--font-jp)' }}>{label}</div>
    </div>
  )
}
