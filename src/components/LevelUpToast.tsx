/**
 * LevelUpToast - Phase 4
 *
 * レッスン完了後ホームに戻った時、レベルアップしていれば画面上端から
 * 小型バナーを下ろす。5秒で自動 dismiss、タップで Phase1 モーダル再表示。
 */
import { useEffect, useState } from 'react'
import { ArrowUpIcon } from '../icons'
import { t } from '../i18n'
import './levelup.css'

interface Props {
  prevLevel: number
  newLevel: number
  /** バナータップ時 (= モーダル再表示要求) */
  onTap: () => void
  /** auto/手動ともに閉じた時 */
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 5000

export function LevelUpToast({ prevLevel, newLevel, onTap, onDismiss }: Props) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setClosing(true), AUTO_DISMISS_MS - 350)
    const t2 = setTimeout(() => onDismiss(), AUTO_DISMISS_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={closing ? 'lvup-toast-out' : 'lvup-toast'}
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0) + 12px)',
        left: 12,
        right: 12,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={() => {
          setClosing(true)
          // animation 後にコール
          setTimeout(() => onTap(), 200)
        }}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 480,
          width: '100%',
          padding: '12px 16px',
          background: 'var(--bg-card)',
          border: '1px solid color-mix(in srgb, var(--brand) 45%, transparent)',
          borderRadius: 14,
          boxShadow: '0 12px 28px rgba(0,0,0,.32), 0 0 24px color-mix(in srgb, var(--brand) 18%, transparent)',
          color: 'var(--text-primary)',
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--brand), #8B5CF6)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <ArrowUpIcon width={20} height={20} />
        </span>
        <span style={{ flex: 1, lineHeight: 1.4 }}>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {t('levelup.toastEyebrow')}
          </span>
          <span style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)' }}>
            {t('levelup.toastBody', { prev: String(prevLevel), next: String(newLevel) })}
          </span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
          {t('levelup.toastView')}
        </span>
      </button>
    </div>
  )
}
