import { useState } from 'react'
import { Header } from '../components/platform/Header'
import {
  FONT_SCALES, loadFontScale, setFontScale,
  type FontScaleId, type FontScaleOption,
} from '../fontScale'
import { t } from '../i18n'

interface Props {
  onBack: () => void
}

function FontSizeCard({
  option, selected, onSelect,
}: {
  option: FontScaleOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        padding: '16px 8px',
        background: 'var(--md-sys-color-surface-container)',
        border: `2px solid ${selected ? 'var(--md-sys-color-primary)' : 'transparent'}`,
        borderRadius: 18,
        cursor: 'pointer', font: 'inherit', color: 'inherit',
        minHeight: 88,
        boxShadow: selected
          ? '0 4px 16px color-mix(in srgb, var(--md-sys-color-primary) 22%, transparent)'
          : 'var(--elev-1)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: option.previewPx, lineHeight: 1, fontWeight: 700,
          color: selected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)',
        }}
      >
        Aa
      </span>
      <span style={{
        fontSize: '0.8667rem', fontWeight: 600,
        color: 'var(--md-sys-color-on-surface)',
      }}>
        {option.name}
      </span>
    </button>
  )
}

export function FontSizeSettingsScreen({ onBack }: Props) {
  const [fontScale, setLocalFontScale] = useState<FontScaleId>(loadFontScale())

  function handleSelectFontScale(f: FontScaleOption) {
    setLocalFontScale(f.id)
    setFontScale(f.id)
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '0.8rem', fontWeight: 700, letterSpacing: '.08em',
    color: 'var(--md-sys-color-on-surface-variant)',
    padding: '4px 4px 12px', textTransform: 'uppercase',
  }

  return (
    <div style={{ background: 'var(--md-sys-color-surface)', minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--md-sys-color-on-surface)' }}>
      <Header title={t('fontSizeSettings.title')} onBack={onBack} />

      <div style={{ padding: '12px 16px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <section>
          <div style={sectionLabelStyle}>{t('appearanceSettings.fontSizeHeading')}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {FONT_SCALES.map((f) => (
              <FontSizeCard
                key={f.id}
                option={f}
                selected={fontScale === f.id}
                onSelect={() => handleSelectFontScale(f)}
              />
            ))}
          </div>
          <p style={{
            fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)',
            marginTop: 14, lineHeight: 1.6, padding: '0 4px',
          }}>
            {t('appearanceSettings.fontSizeHint')}
          </p>
        </section>
      </div>
    </div>
  )
}
