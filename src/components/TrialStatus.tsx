/**
 * TrialStatus - DF-F11
 * 無料トライアル（ジャーナル 7 日間）の残日数表示部品。
 *
 * - TrialBadge: プロフィールのプラン行などに常設する「無料トライアル 残りN日」バッジ。
 * - TrialEndingBanner: 残り 2 日以下のときに出す終了間際の注意バナー。
 *
 * 残日数の算出は subscription.ts の getJournalTrialDaysLeft() に一本化し、
 * 表示判定（shouldShowTrial 等）は trialStatus.ts 側に置く（二重ロジック回避）。
 */
import { ClockIcon, FlagIcon } from '../icons'
import { getJournalTrialDaysLeft } from '../subscription'
import { t } from '../i18n'

/** プラン行に添えるインラインの残日数バッジ。 */
export function TrialBadge() {
  const days = getJournalTrialDaysLeft()
  if (days <= 0) return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--brand-soft)',
        color: 'var(--brand)',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <ClockIcon width={12} height={12} aria-hidden="true" />
      {t('trial.badge', { days: String(days) })}
    </span>
  )
}

/** 残り 2 日以下のときに出す終了間際の注意バナー。 */
export function TrialEndingBanner({ onUpgrade }: { onUpgrade?: () => void }) {
  const days = getJournalTrialDaysLeft()
  if (days <= 0) return null
  const message = days <= 1
    ? t('trial.endingSoonLastDay')
    : t('trial.endingSoonBanner', { days: String(days) })

  const content = (
    <>
      <FlagIcon width={18} height={18} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--warning)' }} />
      <span style={{ flex: 1, textAlign: 'left' }}>{message}</span>
    </>
  )

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--warning-soft)',
    border: '1px solid color-mix(in srgb, var(--warning) 35%, transparent)',
    color: 'var(--warning-deep)',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.5,
  }

  if (onUpgrade) {
    return (
      <button type="button" onClick={onUpgrade} style={{ ...baseStyle, cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
        {content}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning-deep)" strokeWidth="2.5" aria-hidden="true" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    )
  }

  return <div style={baseStyle}>{content}</div>
}
