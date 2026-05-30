/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { tutorial } from './tutorialStorage'
import { t } from '../i18n'

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
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 18px 14px',
      boxShadow: 'var(--shadow-v3-card-inset)',
      border: `1.5px solid color-mix(in srgb, var(--brand) 19%, transparent)`,
    }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('placementCard.title')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 1 }}>{t('placementCard.subtitle')}</div>
        </div>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {t('placementCard.desc')}
      </p>

      {/* ボタン */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onTakeTest}
          style={{
            flex: 1, background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, padding: '11px 0',
            fontSize: '0.9333rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {t('placementCard.takeTest')}
        </button>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            border: 'none', borderRadius: 10, padding: '11px 0',
            fontSize: '0.9333rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t('placementCard.later')}
        </button>
      </div>
    </div>
  )
}

/** 表示条件チェック */
export function shouldShowPlacementCard(placementDone: boolean) {
  return tutorial.hasSeenDaily() && !placementDone && !tutorial.hasPlacementDismissed()
}
