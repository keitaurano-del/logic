import { useState } from 'react'
import { ACCENTS, MODES, loadTheme, saveTheme, applyTheme, type ModeId, type AccentId, type ThemeState } from './theme'
import { isPremium, BETA_MODE } from './subscription'
import { contrastRatio, describeContrast } from './colorContrast'
import { t } from './i18n'
import './ThemeSettings.css'

type Props = { onBack: () => void; onUpgrade: () => void }

export default function ThemeSettings({ onBack, onUpgrade }: Props) {
  const [state, setState] = useState<ThemeState>(loadTheme())
  const premium = isPremium()

  const update = (next: ThemeState) => {
    setState(next)
    saveTheme(next)
    applyTheme(next)
  }

  const pickMode = (id: ModeId) => {
    const mode = MODES.find((m) => m.id === id)!
    if (mode.tier === 'premium' && !premium) {
      onUpgrade()
      return
    }
    update({ ...state, mode: id })
  }

  const pickAccent = (id: AccentId) => {
    update({ ...state, accent: id })
  }

  const updateCustomHex = (hex: string) => {
    update({ ...state, customHex: hex })
  }

  return (
    <div className="ts-screen">
      <header className="ts-header">
        <button className="ts-back" onClick={onBack}>‹</button>
        <span>{t('theme.title')}</span>
        <span className="ts-header-spacer" />
      </header>

      <div className="ts-content">
        <section className="ts-section">
          <h3 className="ts-section-title">{t('theme.modeSection')}</h3>
          <div className="ts-mode-grid">
            {MODES.map((m) => {
              const locked = m.tier === 'premium' && !premium
              const active = state.mode === m.id
              return (
                <button
                  key={m.id}
                  className={`ts-mode-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => pickMode(m.id)}
                >
                  <div
                    className="ts-mode-preview"
                    style={{ background: m.preview.bg, borderColor: m.preview.card }}
                  >
                    <div className="ts-mode-preview-card" style={{ background: m.preview.card }}>
                      <div className="ts-mode-preview-text" style={{ background: m.preview.text }} />
                      <div className="ts-mode-preview-text short" style={{ background: m.preview.text, opacity: 0.5 }} />
                      <div className="ts-mode-preview-accent" style={{ background: m.preview.accent }} />
                    </div>
                  </div>
                  <div className="ts-mode-info">
                    <div className="ts-mode-name">
                      {m.name}
                      {m.tier === 'premium' && !BETA_MODE && <span className="ts-badge">PREMIUM</span>}
                    </div>
                    <div className="ts-mode-desc">{m.description}</div>
                  </div>
                  {active && <div className="ts-check"></div>}
                </button>
              )
            })}
          </div>
        </section>

        {state.mode === 'custom' && premium && (() => {
          // Compute contrast of selected accent on white card and on bg-primary (light defaults)
          const ratioOnCard = contrastRatio('#FFFFFF', state.customHex)
          const cardCheck = describeContrast(ratioOnCard)
          return (
            <section className="ts-section">
              <h3 className="ts-section-title">{t('theme.customSection')}</h3>
              <div className="ts-custom-row">
                <input
                  type="color"
                  value={state.customHex}
                  onChange={(e) => updateCustomHex(e.target.value)}
                  className="ts-color-input"
                />
                <input
                  type="text"
                  value={state.customHex}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateCustomHex(v)
                  }}
                  placeholder="#D4915A"
                  className="ts-hex-input"
                  maxLength={7}
                />
              </div>
              <p className="ts-hint">{t('theme.customHint')}</p>
              <div className={`ts-contrast ${cardCheck.ok ? 'ok' : 'warn'}`}>
                <strong>{t('theme.contrastH')}</strong>
                <span>{t('theme.contrastDetail', { ratio: ratioOnCard.toFixed(2), label: cardCheck.label })}</span>
                {!cardCheck.ok && (
                  <p className="ts-contrast-note">{t('theme.contrastWarn')}</p>
                )}
              </div>
            </section>
          )
        })()}

        {(() => {
          const acc = ACCENTS.find(a => a.id === state.accent) || ACCENTS[0]
          const ratio = contrastRatio('#FFFFFF', acc.accent)
          const check = describeContrast(ratio)
          if (check.ok) return null
          return (
            <div className="ts-contrast warn">
              <strong>{t('theme.accentContrastH')}</strong>
              <span>{t('theme.accentContrastDetail', { name: acc.name, ratio: ratio.toFixed(2), label: check.label })}</span>
              <p className="ts-contrast-note">{t('theme.accentContrastNote')}</p>
            </div>
          )
        })()}

        <section className="ts-section">
          <h3 className="ts-section-title">{t('theme.accentSection')}</h3>
          <div className="ts-accent-grid">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                className={`ts-accent-swatch ${state.accent === a.id ? 'active' : ''}`}
                onClick={() => pickAccent(a.id)}
                style={{ background: a.accent }}
                aria-label={a.name}
                title={a.name}
              >
                {state.accent === a.id && state.mode !== 'custom' && <span></span>}
              </button>
            ))}
          </div>
          <p className="ts-hint">
            {state.mode === 'custom'
              ? t('theme.customDisabled')
              : t('theme.currentAccent', { name: ACCENTS.find((a) => a.id === state.accent)?.name || '' })}
          </p>
        </section>

        {!premium && (
          <button className="ts-upgrade-cta" onClick={onUpgrade}>
            {t('theme.upgrade')}
          </button>
        )}
      </div>
    </div>
  )
}
