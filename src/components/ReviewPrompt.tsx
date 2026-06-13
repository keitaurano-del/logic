// LR-40: In-App Review 事前プロンプト（二段）。
//
// 「Logic は楽しいですか？」を Yes/No で尋ねる軽量ダイアログ。
//   Yes → ネイティブ In-App Review を要求（requestNativeReview）
//   No  → 既存のフィードバック導線へ誘導（onFeedback）
// 表示した時点で markReviewPrompted() により再表示しない（呼び出し側で制御済み想定だが二重防止）。

import { useState } from 'react'
import { t } from '../i18n'
import { requestNativeReview, markReviewPrompted } from '../platform/appReview'

interface ReviewPromptProps {
  /** No（イマイチ）選択時に既存フィードバック導線へ誘導する。 */
  onFeedback: () => void
  /** ダイアログを閉じる（Yes 処理後 / 明示クローズ）。 */
  onClose: () => void
}

export function ReviewPrompt({ onFeedback, onClose }: ReviewPromptProps) {
  const [busy, setBusy] = useState(false)

  const handleYes = async () => {
    if (busy) return
    setBusy(true)
    markReviewPrompted()
    await requestNativeReview()
    onClose()
  }

  const handleNo = () => {
    if (busy) return
    markReviewPrompted()
    onClose()
    onFeedback()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('review.promptTitle')}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 20px',
          width: '100%', maxWidth: 360,
          boxShadow: '0 20px 60px rgba(0,0,0,.45)',
          border: '1px solid rgba(255,255,255,.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          {t('review.promptTitle')}
        </div>
        <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          {t('review.promptBody')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={handleYes}
            disabled={busy}
            style={{
              width: '100%',
              background: 'var(--accent, var(--brand))',
              color: 'var(--accent-fg, #fff)',
              padding: '14px 0', borderRadius: 99,
              fontSize: '1rem', fontWeight: 700,
              border: 'none', cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.7 : 1,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t('review.promptYes')}
          </button>
          <button
            type="button"
            onClick={handleNo}
            disabled={busy}
            style={{
              width: '100%',
              background: 'transparent',
              color: 'var(--text-secondary)',
              padding: '12px 0', borderRadius: 99,
              fontSize: '0.9333rem', fontWeight: 600,
              border: '1px solid var(--border)', cursor: busy ? 'default' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t('review.promptNo')}
          </button>
        </div>
      </div>
    </div>
  )
}
