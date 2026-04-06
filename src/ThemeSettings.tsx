import { useState } from 'react'
import { ACCENTS, MODES, loadTheme, saveTheme, applyTheme, type ModeId, type AccentId, type ThemeState } from './theme'
import { isPremium } from './subscription'
import { contrastRatio, describeContrast } from './colorContrast'
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
        <span>テーマ設定</span>
        <span className="ts-header-spacer" />
      </header>

      <div className="ts-content">
        <section className="ts-section">
          <h3 className="ts-section-title">背景モード</h3>
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
                      {m.tier === 'premium' && <span className="ts-badge">PREMIUM</span>}
                    </div>
                    <div className="ts-mode-desc">{m.description}</div>
                  </div>
                  {active && <div className="ts-check">✓</div>}
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
              <h3 className="ts-section-title">カスタムカラー</h3>
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
              <p className="ts-hint">入力した色がアクセントカラーとして即座に反映されます</p>
              <div className={`ts-contrast ${cardCheck.ok ? 'ok' : 'warn'}`}>
                <strong>ボタン文字の読みやすさ</strong>
                <span>白文字 × この色 = コントラスト比 {ratioOnCard.toFixed(2)}:1 ({cardCheck.label})</span>
                {!cardCheck.ok && (
                  <p className="ts-contrast-note">
                    ⚠ この色は背景に白文字を重ねると読みにくいため、ボタン上の文字色は自動的に黒に切り替わります(WCAG AA 基準維持)
                  </p>
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
              <strong>ℹ アクセントカラーの読みやすさ</strong>
              <span>白文字 × {acc.name} = {ratio.toFixed(2)}:1 ({check.label})</span>
              <p className="ts-contrast-note">
                ボタン上の文字は自動的に読みやすい色に調整されます(WCAG AA 基準)
              </p>
            </div>
          )
        })()}

        <section className="ts-section">
          <h3 className="ts-section-title">アクセントカラー</h3>
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
                {state.accent === a.id && state.mode !== 'custom' && <span>✓</span>}
              </button>
            ))}
          </div>
          <p className="ts-hint">
            {state.mode === 'custom' ? 'カスタムモード使用中はアクセントカラーは無効です' : '現在: ' + ACCENTS.find((a) => a.id === state.accent)?.name}
          </p>
        </section>

        {!premium && (
          <button className="ts-upgrade-cta" onClick={onUpgrade}>
            プレミアムにアップグレード →
          </button>
        )}
      </div>
    </div>
  )
}
