import { useState } from 'react'
import { tutorial } from './tutorialStorage'
import { v3 } from '../styles/tokensV3'

interface PlacementCardProps {
  onTakeTest: () => void
}

/**
 * 実力診断テスト誘導カード
 * 今日の1問完了後のホームに1回だけ表示。
 * 「後で」で永久非表示。
 */
export function PlacementCard({ onTakeTest }: PlacementCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    tutorial.markPlacementDismissed()
    setDismissed(true)
  }

  return (
    <div style={{
      background: v3.color.card,
      borderRadius: v3.radius.card,
      padding: '18px 18px 14px',
      boxShadow: v3.shadow.card,
      border: `1.5px solid ${v3.color.accent}30`,
    }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: v3.color.accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text }}>あなたの実力を診断しましょう</div>
          <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 1 }}>10問・約5分で5軸のスキル分布がわかります</div>
        </div>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, color: v3.color.text2, lineHeight: 1.6 }}>
        推定偏差値・レーダーチャート・最適コースをご案内します。
      </p>

      {/* ボタン */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onTakeTest}
          style={{
            flex: 1, background: v3.color.accent, color: '#fff',
            border: 'none', borderRadius: 10, padding: '11px 0',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          診断を受ける
        </button>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1, background: v3.color.cardSoft, color: v3.color.text2,
            border: 'none', borderRadius: 10, padding: '11px 0',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          後で
        </button>
      </div>
    </div>
  )
}

/** 表示条件チェック */
export function shouldShowPlacementCard(placementDone: boolean) {
  return tutorial.hasSeenDaily() && !placementDone && !tutorial.hasPlacementDismissed()
}
