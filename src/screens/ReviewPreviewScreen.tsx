// DF-F3: Review系5機能のプレビュー画面
// 有料プランユーザー以外に対して、各機能の価値を説明してアップセルする
import { Header } from '../components/platform/Header'
import {
  BookOpenIcon,
  CheckCircleIcon,
  HistoryIcon,
  RefreshIcon,
  BookmarkIcon,
  LockIcon,
} from '../icons'
import { t } from '../i18n'

export type ReviewFeature =
  | 'flashcards'
  | 'review-hub'
  | 'fermi-history'
  | 'wrong-answers'
  | 'saved-items'

interface ReviewPreviewScreenProps {
  feature: ReviewFeature
  onBack: () => void
  onUpgrade: () => void
}

interface FeatureMeta {
  titleKey: string
  descKey: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const FEATURE_META: Record<ReviewFeature, FeatureMeta> = {
  flashcards: {
    titleKey: 'reviewPreview.flashcardsTitle',
    descKey: 'reviewPreview.flashcardsDesc',
    Icon: BookOpenIcon,
  },
  'review-hub': {
    titleKey: 'reviewPreview.reviewHubTitle',
    descKey: 'reviewPreview.reviewHubDesc',
    Icon: CheckCircleIcon,
  },
  'fermi-history': {
    titleKey: 'reviewPreview.fermiHistoryTitle',
    descKey: 'reviewPreview.fermiHistoryDesc',
    Icon: HistoryIcon,
  },
  'wrong-answers': {
    titleKey: 'reviewPreview.wrongAnswersTitle',
    descKey: 'reviewPreview.wrongAnswersDesc',
    Icon: RefreshIcon,
  },
  'saved-items': {
    titleKey: 'reviewPreview.savedItemsTitle',
    descKey: 'reviewPreview.savedItemsDesc',
    Icon: BookmarkIcon,
  },
}

// 他の4機能（現在のfeature以外）をプレビューとして表示する
const ALL_FEATURES: ReviewFeature[] = [
  'flashcards',
  'review-hub',
  'fermi-history',
  'wrong-answers',
  'saved-items',
]

export function ReviewPreviewScreen({ feature, onBack, onUpgrade }: ReviewPreviewScreenProps) {
  const meta = FEATURE_META[feature]
  const { Icon } = meta
  const otherFeatures = ALL_FEATURES.filter((f) => f !== feature)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Header title={t(meta.titleKey)} onBack={onBack} />

      <div
        style={{
          flex: 1,
          padding: '24px 20px 120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          overflowY: 'auto',
        }}
      >
        {/* メインカード */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center',
            boxShadow: 'var(--shadow-v3-card-inset, 0 1px 0 inset rgba(255,255,255,.06))',
            border: '1px solid color-mix(in srgb, var(--brand) 20%, transparent)',
          }}
        >
          {/* アイコン */}
          <div
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--brand) 12%, transparent)',
              color: 'var(--brand)',
              marginBottom: 4,
            }}
          >
            <Icon width={32} height={32} />
          </div>

          {/* 有料バッジ */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 99,
              background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
              color: 'var(--brand)',
            }}
          >
            <LockIcon width={12} height={12} aria-hidden="true" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {t('reviewPreview.upsellCta')}
            </span>
          </div>

          {/* タイトル */}
          <p
            style={{
              margin: 0,
              fontSize: '1.0667rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
            }}
          >
            {t('reviewPreview.title')}
          </p>

          {/* 説明文 */}
          <p
            style={{
              margin: 0,
              fontSize: '0.8667rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {t('reviewPreview.desc')}
          </p>

          {/* CTA ボタン */}
          <button
            type="button"
            onClick={onUpgrade}
            aria-label={t('reviewPreview.upsellCta')}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '14px 20px',
              background: 'var(--accent-btn)',
              color: 'var(--accent-btn-fg)',
              border: 'none',
              borderRadius: 10,
              font: 'inherit',
              fontSize: '0.9333rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('reviewPreview.upsellCta')}
          </button>
        </div>

        {/* 各機能の説明リスト */}
        <div
          style={{
            maxWidth: 400,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* 現在の機能 */}
          <FeatureRow feature={feature} highlighted />

          {/* 他の機能 */}
          {otherFeatures.map((f) => (
            <FeatureRow key={f} feature={f} highlighted={false} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ feature, highlighted }: { feature: ReviewFeature; highlighted: boolean }) {
  const { titleKey, descKey, Icon } = FEATURE_META[feature]
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        border: highlighted
          ? '1px solid color-mix(in srgb, var(--brand) 30%, transparent)'
          : '1px solid transparent',
        opacity: highlighted ? 1 : 0.8,
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
          borderRadius: 8,
          background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
          color: 'var(--brand)',
          flexShrink: 0,
        }}
      >
        <Icon width={18} height={18} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          {t(titleKey)}
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}
        >
          {t(descKey)}
        </span>
      </div>
    </div>
  )
}
