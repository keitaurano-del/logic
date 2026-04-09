import { ArrowLeftIcon, ChevronRightIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { getLocale, setLocale } from '../i18n'
import { t } from '../i18n'
import { loadGuestUser } from '../guestUser'

interface SettingsScreenProps {
  onBack: () => void
  onOpenPricing?: () => void
}

interface SettingsRowProps {
  label: string
  value?: string
  onPress?: () => void
  showChevron?: boolean
  destructive?: boolean
}

function SettingsRow({ label, value, onPress, showChevron = true, destructive = false }: SettingsRowProps) {
  return (
    <button
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: 'var(--s-4) var(--s-4)',
        background: 'none',
        border: 'none',
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
        gap: 'var(--s-3)',
      }}
    >
      <span style={{ flex: 1, fontSize: 15, fontWeight: 400, color: destructive ? 'var(--danger)' : 'var(--text)' }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: 14, color: 'var(--text-muted)', flexShrink: 0 }}>{value}</span>
      )}
      {showChevron && onPress && (
        <span style={{ color: 'var(--text-faint)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <ChevronRightIcon width={16} height={16} />
        </span>
      )}
    </button>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: 'var(--s-4) var(--s-4) var(--s-2)',
    }}>
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />
}

export function SettingsScreen({ onBack, onOpenPricing }: SettingsScreenProps) {
  const locale = getLocale()
  const user = loadGuestUser()

  function handleClearCache() {
    if (window.confirm(t('settings.clearCacheConfirm'))) {
      localStorage.clear()
      window.location.reload()
    }
  }

  function handleToggleLocale() {
    setLocale(locale === 'ja' ? 'en' : 'ja')
  }

  return (
    <div className="stack">
      {/* Header */}
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('settings.title')}</div>
      </div>

      {/* Section 1: Membership */}
      <div>
        <SectionHeader label={t('settings.section.membership')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.membership.manage')}
            value={t('settings.membership.planValue')}
            onPress={onOpenPricing}
          />
          <Divider />
          <SettingsRow
            label={t('settings.membership.restorePurchases')}
            onPress={() => {/* no-op in beta */}}
          />
          <Divider />
          <SettingsRow
            label={t('settings.membership.account')}
            value={user.id}
            showChevron={false}
          />
        </div>
      </div>

      {/* Section 2: General */}
      <div>
        <SectionHeader label={t('settings.section.general')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.general.notifications')}
            onPress={() => {/* open system notifications */}}
          />
          <Divider />
          <SettingsRow
            label={t('settings.general.preferences')}
            onPress={() => {/* future: theme / display */}}
          />
          <Divider />
          <SettingsRow
            label={t('settings.general.clearCache')}
            onPress={handleClearCache}
            destructive
          />
        </div>
      </div>

      {/* Section 3: Support */}
      <div>
        <SectionHeader label={t('settings.section.support')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            label={t('settings.support.helpCenter')}
            onPress={() => window.open('https://logic-u5wn.onrender.com/', '_blank')}
          />
          <Divider />
          <SettingsRow
            label={t('settings.support.appLanguage')}
            value={locale === 'ja' ? '日本語' : 'English'}
            onPress={handleToggleLocale}
          />
          <Divider />
          <SettingsRow
            label={t('settings.support.terms')}
            onPress={() => {/* link to terms */}}
          />
        </div>
      </div>

      {/* App version */}
      <div style={{ textAlign: 'center', paddingTop: 'var(--s-3)', paddingBottom: 'var(--s-5)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Logic v3 · Beta</span>
      </div>
    </div>
  )
}
