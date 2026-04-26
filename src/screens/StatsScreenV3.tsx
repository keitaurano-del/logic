/**
 * StatsScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.5
 */
import { useState, useMemo } from 'react'
import { getStudyDates, getStreak, getCompletedCount } from '../stats'
import { v3 } from '../styles/tokensV3'

type Period = 'day' | 'week' | 'month'

interface StatsScreenV3Props {
  onBack: () => void
}

export function StatsScreenV3(_props: StatsScreenV3Props) {
  const [period, setPeriod] = useState<Period>('month')
  const studyDates = useMemo(() => new Set(getStudyDates()), [])
  const streak = getStreak()
  const completed = getCompletedCount()

  // 月カレンダー生成
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const studiedThisMonth = Array.from(studyDates).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>記録</div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        {/* Period selector */}
        <div style={{ display: 'flex', background: v3.color.card, borderRadius: 14, padding: 4, gap: 2 }}>
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <div
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: 8,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: period === p ? v3.color.bg : v3.color.text2,
                background: period === p ? v3.color.accent : 'transparent',
                borderRadius: 10,
                cursor: 'pointer',
                transition: v3.motion.tap,
              }}
            >
              {p === 'day' ? '日' : p === 'week' ? '週' : '月'}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '18px 16px', boxShadow: v3.shadow.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>{year}年{month + 1}月</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {['月', '火', '水', '木', '金', '土', '日'].map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 700, color: v3.color.text3, textAlign: 'center', padding: '4px 0' }}>{d}</div>
            ))}
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - startOffset + 1
              const inMonth = dayNum >= 1 && dayNum <= daysInMonth
              const dateStr = inMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : ''
              const isToday = inMonth && dayNum === today.getDate()
              const studied = studyDates.has(dateStr)
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: studied || isToday ? 700 : 500,
                    color: !inMonth ? v3.color.text3 : studied ? v3.color.bg : isToday ? v3.color.accent : v3.color.text,
                    borderRadius: '50%',
                    background: studied ? v3.color.accent : isToday ? v3.color.accentSoft : 'transparent',
                    border: isToday && !studied ? `1.5px solid ${v3.color.accent}` : 'none',
                  }}
                >
                  {inMonth ? dayNum : ''}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${v3.color.line}` }}>
            <Stat label="学習日数" val={String(studiedThisMonth)} />
            <Stat label="最長連続" val={String(streak)} />
            <Stat label="完了レッスン" val={String(completed)} />
          </div>
        </div>

        {/* AI Weekly Report */}
        <div style={{ background: 'linear-gradient(140deg, #1A3A39 0%, #2C5856 100%)', borderRadius: v3.radius.card, padding: 18, color: '#fff', boxShadow: v3.shadow.hero }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: v3.color.accent, marginBottom: 6 }}>今週のあなた</div>
          <div style={{ fontFamily: 'Noto Sans JP', fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{streak >= 5 ? `${streak}日連続学習中` : 'コツコツ続けていますね'}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.6, marginBottom: 12 }}>
            {completed >= 3 ? `今週は${completed}レッスン完了。よいペースです。` : '今週もう1レッスン挑戦してみよう。'}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: v3.color.accent, letterSpacing: '-.02em' }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: v3.color.text2, letterSpacing: '.04em', marginTop: 2 }}>{label}</div>
    </div>
  )
}
