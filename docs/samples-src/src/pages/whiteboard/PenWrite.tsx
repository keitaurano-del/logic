import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SamplePage } from '../../components/SamplePage'

export function PenWrite() {
  const [play, setPlay] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setPlay(1), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <SamplePage title="2-A Pen Write" subtitle="タイトルと本文をペンで書いていく演出">
      <div
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          padding: 18,
          minHeight: 480,
          border: '1.5px dashed var(--rule)',
          position: 'relative',
        }}
      >
        {/* SVG hand-drawn title */}
        <svg viewBox="0 0 320 60" style={{ width: '100%', height: 60 }} key={play}>
          <motion.text
            x="10"
            y="42"
            fontFamily="var(--font-en)"
            fontSize="40"
            fontWeight={700}
            fill="none"
            stroke="var(--brand)"
            strokeWidth={1.4}
            strokeDasharray="500"
            initial={{ strokeDashoffset: 500 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          >
            What is MECE ?
          </motion.text>
        </svg>

        {/* underline accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          style={{
            height: 4,
            background: 'var(--accent)',
            borderRadius: 4,
            transformOrigin: 'left',
            width: '60%',
            marginBottom: 18,
          }}
        />

        {/* body text written line by line */}
        {[
          'Mutually  ／  互いに',
          'Exclusive  ／  重ならず',
          'Collectively  ／  全体で',
          'Exhaustive  ／  漏れなく',
        ].map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.4 + i * 0.35, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-jp)',
              fontSize: 16,
              color: 'var(--ink)',
              padding: '8px 0',
              borderBottom: '1px dashed var(--rule)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-en)', color: 'var(--brand)', fontWeight: 700, marginRight: 6 }}>
              {String.fromCharCode(77 + (i === 0 ? 0 : i === 1 ? -8 : i === 2 ? -10 : -8))}
            </span>
            {line}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 4.3, type: 'spring', stiffness: 200 }}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 14,
            background: 'var(--sticky)',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '3px 4px 0 var(--sticky-shadow)',
            fontFamily: 'var(--font-en)',
            fontSize: 18,
            color: 'var(--ink)',
          }}
        >
          Got it!
        </motion.div>
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: 14, width: '100%' }}
        onClick={() => setPlay((p) => p + 1)}
      >
        もう一度書く
      </button>
    </SamplePage>
  )
}
