import { useState } from 'react'
import { Header } from '../components/platform/Header'
import { Switch } from '../components/Switch'
import { getMode, setMode } from '../theme'
import { t } from '../i18n'

interface Props {
  onBack: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 4px 8px' }}>
      {children}
    </div>
  )
}

function ThemeRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Switch checked={value} onChange={onChange} aria-label={label} />
    </div>
  )
}

export function AppearanceSettingsScreen({ onBack }: Props) {
  const [darkMode, setDarkMode] = useState<boolean>(() => getMode() !== 'light')

  function handleToggle(enabled: boolean) {
    setDarkMode(enabled)
    setMode(enabled ? 'dark' : 'light')
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      <Header title={t('appearanceSettings.title')} onBack={onBack} />

      <div style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <SectionLabel>{t('appearanceSettings.modeHeading')}</SectionLabel>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
            <ThemeRow
              label={t('settings.darkMode')}
              sub={t('settings.darkModeHint')}
              value={darkMode}
              onChange={handleToggle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
