import { LockIcon, CheckCircleIcon } from '../icons'
import { t } from '../i18n'

export type FeaturePreviewKey =
  | 'flashcards'
  | 'reviewHub'
  | 'fermiHistory'
  | 'wrongAnswers'
  | 'savedItems'

interface FeaturePreviewBannerProps {
  feature: FeaturePreviewKey
  onUpgrade: () => void
}

export function FeaturePreviewBanner({ feature, onUpgrade }: FeaturePreviewBannerProps) {
  const titleKey = `featurePreview.${feature}.title` as const
  const descKey  = `featurePreview.${feature}.desc` as const

  return (
    <div style={{
      margin: '0 0 16px',
      background: 'var(--bg-card)',
      borderRadius: 16,
      border: '1px solid color-mix(in srgb, var(--brand) 25%, transparent)',
      overflow: 'hidden',
    }}>
      {/* Top accent stripe */}
      <div style={{
        height: 4,
        background: 'linear-gradient(90deg, var(--brand), var(--brand-light, #8B5CF6))',
      }} />

      <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Lock badge + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--brand) 12%, transparent)',
            color: 'var(--brand)',
            flexShrink: 0,
          }}>
            <LockIcon width={16} height={16} />
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--brand)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {t('featurePreview.cta')}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}>
          {t(titleKey)}
        </div>

        {/* Description */}
        <div style={{
          fontSize: '0.8667rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}>
          {t(descKey)}
        </div>

        {/* CTA button */}
        <button
          type="button"
          onClick={onUpgrade}
          style={{
            marginTop: 4,
            padding: '13px 20px',
            background: 'var(--brand)',
            color: 'var(--accent-fg, #fff)',
            border: 'none',
            borderRadius: 10,
            font: 'inherit',
            fontSize: '0.9333rem',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <CheckCircleIcon width={16} height={16} />
          {t('featurePreview.upgradeBtn')}
        </button>
      </div>
    </div>
  )
}
