/**
 * DrillScreen - フェルミ推定ドリル詳細画面
 *
 * 単一の問いを受け取り、ユーザーが自力で考えた後に
 * アプローチ → 前提 → 計算 → 答え → 妥当性チェック → 学び
 * の順で段階的に開示する。
 */
import { useState } from 'react'
import { v3 } from '../styles/tokensV3'
import { getDrillById } from '../drillData'

interface DrillScreenProps {
  drillId: string
  onBack: () => void
}

export function DrillScreen({ drillId, onBack }: DrillScreenProps) {
  const drill = getDrillById(drillId)
  const [answer, setAnswer] = useState('')
  const [revealStep, setRevealStep] = useState(0)
  // 0: 未開示, 1: アプローチ, 2: 前提, 3: 計算+答え, 4: 全て

  if (!drill) {
    return (
      <div style={{ background: v3.color.bg, minHeight: '100vh', color: v3.color.text, fontFamily: "'Noto Sans JP', sans-serif", padding: 24 }}>
        <div style={{ marginBottom: 16 }}>ドリルが見つかりません</div>
        <button onClick={onBack} style={btnStyle}>戻る</button>
      </div>
    )
  }

  const showApproach = revealStep >= 1
  const showAssumptions = revealStep >= 2
  const showCalculation = revealStep >= 3
  const showTakeaways = revealStep >= 4

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: v3.color.accent, fontWeight: 700, letterSpacing: '.06em' }}>フェルミドリル · {drill.level}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 2 }}>目安 約{drill.estimatedMinutes}分</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 問い */}
        <SectionCard>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: v3.color.accent, marginBottom: 6 }}>QUESTION</div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5, color: v3.color.text }}>{drill.title}</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: v3.color.text, marginTop: 8 }}>{drill.prompt}</div>
          {drill.setup && (
            <div style={{ fontSize: 13, lineHeight: 1.6, color: v3.color.text2, marginTop: 8, padding: '8px 10px', background: v3.color.cardSoft, borderRadius: 8 }}>
              <span style={{ color: v3.color.text3, fontWeight: 700, fontSize: 11, marginRight: 6 }}>前提</span>
              {drill.setup}
            </div>
          )}
        </SectionCard>

        {/* ヒント */}
        <SectionCard>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: v3.color.warm, marginBottom: 6 }}>HINT</div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: v3.color.text2 }}>{drill.hint}</div>
        </SectionCard>

        {/* 自由記述スペース */}
        <SectionCard>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: v3.color.text3, marginBottom: 6 }}>YOUR ESTIMATE</div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="自分の分解と仮置き、計算過程をメモしよう"
            rows={6}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: v3.color.cardSoft,
              color: v3.color.text,
              border: `1px solid ${v3.color.line}`,
              borderRadius: 10,
              padding: 10,
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </SectionCard>

        {/* 段階的開示 */}
        {showApproach && (
          <SectionCard>
            <SectionTitle label="APPROACH" color={v3.color.accent} />
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {drill.approach.map((step, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: v3.color.text }}>{step}</li>
              ))}
            </ol>
          </SectionCard>
        )}

        {showAssumptions && (
          <SectionCard>
            <SectionTitle label="ASSUMPTIONS" color={v3.color.accent} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {drill.assumptions.map((a, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0', borderTop: i > 0 ? `1px solid ${v3.color.line}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 13, color: v3.color.text2, flex: 1 }}>{a.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, textAlign: 'right' }}>{a.value}</div>
                  </div>
                  {a.note && <div style={{ fontSize: 11, color: v3.color.text3, lineHeight: 1.5 }}>{a.note}</div>}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {showCalculation && (
          <>
            <SectionCard>
              <SectionTitle label="FORMULA" color={v3.color.accent} />
              <div style={{ fontSize: 14, fontFamily: "'Inter Tight', monospace", lineHeight: 1.6, color: v3.color.text, padding: '8px 10px', background: v3.color.cardSoft, borderRadius: 8 }}>
                {drill.formula}
              </div>
              <SectionTitle label="CALCULATION" color={v3.color.accent} style={{ marginTop: 14 }} />
              <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {drill.calculation.map((step, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: v3.color.text }}>{step}</li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard accent>
              <SectionTitle label="ANSWER" color={v3.color.warm} />
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.45, color: v3.color.text }}>{drill.answer}</div>
            </SectionCard>
          </>
        )}

        {showTakeaways && (
          <>
            {drill.sanityCheck && (
              <SectionCard>
                <SectionTitle label="SANITY CHECK" color={v3.color.accent} />
                <div style={{ fontSize: 14, lineHeight: 1.65, color: v3.color.text }}>{drill.sanityCheck}</div>
              </SectionCard>
            )}
            <SectionCard>
              <SectionTitle label="TAKEAWAYS" color={v3.color.accent} />
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {drill.takeaways.map((p, i) => (
                  <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: v3.color.text }}>{p}</li>
                ))}
              </ul>
            </SectionCard>
          </>
        )}

        {/* 開示ボタン */}
        {revealStep < 4 && (
          <button
            onClick={() => setRevealStep(revealStep + 1)}
            style={{
              marginTop: 4,
              padding: '14px 16px',
              borderRadius: 14,
              background: revealStep === 0 ? v3.color.accent : v3.color.card,
              color: revealStep === 0 ? '#fff' : v3.color.accent,
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: revealStep === 0 ? v3.shadow.cta : 'none',
              border: revealStep === 0 ? 'none' : `1px solid ${v3.color.accent}40`,
            }}
          >
            {nextLabel(revealStep)}
          </button>
        )}

        {revealStep >= 4 && (
          <button
            onClick={onBack}
            style={{
              marginTop: 4,
              padding: '14px 16px',
              borderRadius: 14,
              border: 'none',
              background: v3.color.accent,
              color: '#fff',
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: v3.shadow.cta,
            }}
          >
            ドリル一覧に戻る
          </button>
        )}
      </div>
    </div>
  )
}

function nextLabel(step: number): string {
  if (step === 0) return 'アプローチを見る'
  if (step === 1) return '前提条件を見る'
  if (step === 2) return '計算と答えを見る'
  return '妥当性チェック・学びを見る'
}

function SectionCard({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${v3.color.warm}28, ${v3.color.warm}10)` : v3.color.card,
      borderRadius: 16,
      padding: '14px 16px',
      boxShadow: v3.shadow.card,
      border: accent ? `1px solid ${v3.color.warm}50` : `1px solid ${v3.color.line}`,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ label, color, style }: { label: string; color: string; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color, marginBottom: 8, ...style }}>{label}</div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 10,
  border: `1px solid ${v3.color.accent}`,
  background: v3.color.card,
  color: v3.color.accent,
  fontSize: 14, fontWeight: 700,
  cursor: 'pointer',
}
