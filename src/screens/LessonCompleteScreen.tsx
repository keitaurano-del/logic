/**
 * LessonCompleteScreen - Logic v3 lesson completion
 * 仕様: docs/DESIGN_V3.md §3.4
 * モックアップ: lv3-complete.html
 */
import { v3 } from '../styles/tokensV3'
import { getStreak, getXp } from '../stats'
import { getCurrentLevel } from './homeHelpers'

interface LessonCompleteScreenProps {
  userName: string
  lessonTitle: string
  durationSec: number
  onNext: () => void
  onHome: () => void
  prevLevel?: number
}

export function LessonCompleteScreen(props: LessonCompleteScreenProps) {
  const { userName, lessonTitle, durationSec, onNext, onHome, prevLevel } = props
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const streak = getStreak()
  const leveledUp = prevLevel != null && lv.level > prevLevel
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(112,216,189,.18), transparent 60%)', pointerEvents: 'none' }}></div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', background: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, boxShadow: `0 0 60px rgba(112,216,189,.4)`, animation: 'logicv3-scaleIn .6s cubic-bezier(.34,1.56,.64,1) both' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: v3.color.accentSoft, borderRadius: 99, padding: '5px 14px', fontSize: 11, fontWeight: 600, color: v3.color.accent, marginBottom: 14 }}>レッスン完了</span>

        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>よく学べました、<br /><strong style={{ color: v3.color.accent }}>{userName || 'ゲスト'}</strong> さん</div>
        <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500, marginBottom: 36, lineHeight: 1.6 }}>「{lessonTitle}」を理解できましたね</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 32, background: v3.color.card, borderRadius: 16, padding: '20px 28px', width: '100%' }}>
          <Stat val="+50" label="獲得XP" />
          <Divider />
          <Stat val={timeStr} label="学習時間" />
          <Divider />
          <Stat val={String(streak)} label="日連続" />
        </div>

        {leveledUp && (
          <div style={{ background: v3.color.card, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, width: '100%' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="2.5" strokeLinecap="round"><polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" /></svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: v3.color.accent, marginBottom: 2 }}>レベルアップ</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Lv.{prevLevel} → Lv.{lv.level} になりました</div>
            </div>
          </div>
        )}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onNext} style={{ width: '100%', background: v3.color.accent, color: v3.color.bg, padding: 16, borderRadius: 99, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: v3.shadow.cta }}>次のレッスンへ進む</button>
          <button onClick={onHome} style={{ width: '100%', background: 'transparent', border: `1px solid ${v3.color.card}`, color: v3.color.text, padding: 14, borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>ホームに戻る</button>
        </div>
      </div>
      <style>{`
        @keyframes logicv3-scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Stat({ val, label }: { val: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 800, color: v3.color.accent, letterSpacing: '-.03em', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: v3.color.text2, marginTop: 6 }}>{label}</div>
    </div>
  )
}
function Divider() {
  return <div style={{ width: 1, height: 36, background: v3.color.line }}></div>
}
