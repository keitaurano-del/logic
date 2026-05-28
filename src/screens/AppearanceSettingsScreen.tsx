import { useState } from 'react'
import { Header } from '../components/platform/Header'
import { CheckIcon, LockIcon } from '../icons'
import { MODES, getMode, setMode, type ModeId, type Mode } from '../theme'
import { isPremium } from '../subscription'
import { t } from '../i18n'

interface Props {
  onBack: () => void
  onUpgrade: () => void
}

function ThemeCard({
  mode, selected, locked, onSelect,
}: {
  mode: Mode
  selected: boolean
  locked: boolean
  onSelect: () => void
}) {
  const { bg, card, text, accent } = mode.preview
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 14,
        padding: 14,
        background: 'var(--md-sys-color-surface-container)',
        border: `2px solid ${selected ? 'var(--md-sys-color-primary)' : 'transparent'}`,
        borderRadius: 18,
        cursor: 'pointer', font: 'inherit', textAlign: 'left', color: 'inherit',
        minHeight: 44,
        boxShadow: selected
          ? '0 4px 16px color-mix(in srgb, var(--md-sys-color-primary) 22%, transparent)'
          : 'var(--elev-1)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 76, height: 92,
          borderRadius: 12,
          background: bg,
          border: '1px solid rgba(15, 23, 42, 0.10)',
          padding: 8,
          display: 'flex', flexDirection: 'column', gap: 6,
          flexShrink: 0, overflow: 'hidden',
        }}
      >
        <div style={{ height: 6, borderRadius: 3, background: text, opacity: 0.55, width: '60%' }} />
        <div
          style={{
            flex: 1, borderRadius: 8, background: card,
            padding: 7, display: 'flex', flexDirection: 'column', gap: 5,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ height: 4, borderRadius: 2, background: text, opacity: 0.7, width: '85%' }} />
          <div style={{ height: 4, borderRadius: 2, background: text, opacity: 0.35, width: '60%' }} />
          <div style={{ height: 7, borderRadius: 4, background: accent, width: '45%', marginTop: 'auto' }} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
            {mode.name}
          </span>
          {mode.tier === 'premium' && (
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                textTransform: 'uppercase',
                color: 'var(--md-sys-color-on-primary)',
                background: 'var(--md-sys-color-primary)',
                borderRadius: 999, padding: '2px 8px',
              }}
            >
              {t('appearanceSettings.premiumBadge')}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          {mode.description}
        </div>
      </div>

      {locked ? (
        <div
          aria-hidden="true"
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'var(--md-sys-color-surface-variant)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LockIcon width={15} height={15} style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
        </div>
      ) : selected ? (
        <div
          aria-hidden="true"
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: 'var(--md-sys-color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckIcon width={16} height={16} style={{ color: 'var(--md-sys-color-on-primary)' }} />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: 28, height: 28, borderRadius: 999,
            border: '2px solid var(--md-sys-color-outline-variant)',
            flexShrink: 0,
          }}
        />
      )}
    </button>
  )
}

export function AppearanceSettingsScreen({ onBack, onUpgrade }: Props) {
  const [mode, setLocalMode] = useState<ModeId>(getMode())
  const premium = isPremium()
  const freeModes = MODES.filter((m) => m.tier === 'free')
  const premiumModes = MODES.filter((m) => m.tier === 'premium')

  function handleSelect(m: Mode) {
    if (m.tier === 'premium' && !premium) {
      onUpgrade()
      return
    }
    setLocalMode(m.id)
    setMode(m.id)
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
    color: 'var(--md-sys-color-on-surface-variant)',
    padding: '4px 4px 12px', textTransform: 'uppercase',
  }

  return (
    <div style={{ background: 'var(--md-sys-color-surface)', minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--md-sys-color-on-surface)' }}>
      <Header title={t('appearanceSettings.title')} onBack={onBack} />

      <div style={{ padding: '12px 16px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <div style={sectionLabelStyle}>{t('appearanceSettings.freeHeading')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {freeModes.map((m) => (
              <ThemeCard
                key={m.id}
                mode={m}
                selected={mode === m.id}
                locked={false}
                onSelect={() => handleSelect(m)}
              />
            ))}
          </div>
          <p style={{
            fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: 14, lineHeight: 1.6, padding: '0 4px',
          }}>
            {t('appearanceSettings.modeHint')}
          </p>
        </section>

        {premiumModes.length > 0 && (
          <section>
            <div style={sectionLabelStyle}>{t('appearanceSettings.premiumHeading')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {premiumModes.map((m) => (
                <ThemeCard
                  key={m.id}
                  mode={m}
                  selected={mode === m.id}
                  locked={!premium}
                  onSelect={() => handleSelect(m)}
                />
              ))}
            </div>
            {!premium && (
              <p style={{
                fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)',
                marginTop: 14, lineHeight: 1.6, padding: '0 4px',
              }}>
                {t('appearanceSettings.premiumLockedHint')}
              </p>
            )}
            {!premium && (
              <button
                type="button"
                onClick={onUpgrade}
                style={{
                  marginTop: 12, width: '100%', minHeight: 44,
                  border: 0, borderRadius: 14, cursor: 'pointer',
                  background: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                }}
              >
                {t('appearanceSettings.upgrade')}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
