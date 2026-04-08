import { useState } from 'react'
import { ACCENTS, MODES, loadTheme, saveTheme, applyTheme, type ModeId, type AccentId, type ThemeState } from '../theme'
import { isPremium } from '../subscription'
import { ArrowLeftIcon } from '../icons'
import { IconButton } from '../components/IconButton'

interface ThemeSettingsScreenProps {
  onBack: () => void
  onUpgrade: () => void
}

export function ThemeSettingsScreen({ onBack, onUpgrade }: ThemeSettingsScreenProps) {
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

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">テーマ設定</div>
      </div>

      <div className="eyebrow accent">SETTINGS</div>
      <h1 style={{ fontSize: 26, letterSpacing: '-0.025em' }}>テーマ設定</h1>

      <section style={{ marginTop: 'var(--s-4)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>外観モード</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--s-2)' }}>
          {MODES.map((m) => {
            const locked = m.tier === 'premium' && !premium
            const active = state.mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => pickMode(m.id)}
                style={{
                  padding: 'var(--s-3)',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand-soft)' : m.preview.bg || 'var(--bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: locked ? 0.5 : 1,
                }}
              >
                <div style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 4,
                  background: m.preview.card || 'var(--surface)',
                  border: '1px solid var(--border)',
                  marginBottom: 'var(--s-2)',
                }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--brand)' : 'var(--text)' }}>
                  {m.name}
                </div>
                {locked && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Premium</div>}
              </button>
            )
          })}
        </div>
      </section>

      <section style={{ marginTop: 'var(--s-5)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>アクセントカラー</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
          {ACCENTS.map((a) => {
            const active = state.accent === a.id
            return (
              <button
                key={a.id}
                onClick={() => pickAccent(a.id as AccentId)}
                title={a.name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '999px',
                  background: a.accent,
                  border: `2.5px solid ${active ? 'var(--text)' : 'transparent'}`,
                  outline: active ? '2px solid var(--bg)' : 'none',
                  outlineOffset: 2,
                  cursor: 'pointer',
                }}
              />
            )
          })}
        </div>
      </section>

      {(state.accent as string) === 'custom' && (
        <section style={{ marginTop: 'var(--s-4)' }}>
          <label className="label">カスタムカラー（HEX）</label>
          <input
            className="input"
            type="color"
            value={state.customHex || '#3D5FC4'}
            onChange={(e) => update({ ...state, customHex: e.target.value })}
            style={{ height: 44 }}
          />
        </section>
      )}
    </div>
  )
}
