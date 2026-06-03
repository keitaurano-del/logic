import { useState } from 'react'
import { Header } from '../components/platform/Header'
import { CheckIcon } from '../icons'
import { MODES, getMode, setMode, type ModeId, type Mode } from '../theme'
import {
  FONT_SCALES, loadFontScale, setFontScale,
  type FontScaleId, type FontScaleOption,
} from '../fontScale'
import { getLocale, setLocale, type Locale } from '../i18n'
import { t } from '../i18n'

/**
 * PreferencesScreen — FB-32「言語・テーマ・文字サイズを環境設定として 1 つにまとめる」。
 *
 * 旧来は言語(LanguageScreen)・テーマ(AppearanceSettingsScreen)・文字サイズ
 * (FontSizeSettingsScreen)が別画面に散らばっていた。これを 1 画面・3 セクション
 * （言語 / テーマ / 文字サイズ）に集約する。各画面の挙動・保存ロジックはそのまま流用:
 *   - 言語: setLocale（localStorage + ページ即時リロード）
 *   - テーマ: setMode（localStorage + applyTheme 即時反映）
 *   - 文字サイズ: setFontScale（localStorage + applyFontScale 即時反映）
 *
 * 文言は中立的な丁寧体（feedback-app-copy-neutral 準拠）。
 */

interface Props {
  onBack: () => void
}

const LANGUAGES: { locale: Locale; nativeName: string }[] = [
  { locale: 'ja', nativeName: '日本語' },
  { locale: 'en', nativeName: 'English' },
]

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.8rem', fontWeight: 700, letterSpacing: '.08em',
  color: 'var(--md-sys-color-on-surface-variant)',
  padding: '4px 4px 12px', textTransform: 'uppercase',
}

const hintStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)',
  marginTop: 14, lineHeight: 1.6, padding: '0 4px',
}

function LanguageRow({
  nativeName, selected, onSelect,
}: {
  nativeName: string
  selected: boolean
  onSelect: () => void
}) {
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
      <span style={{
        flex: 1, fontSize: '1.0667rem', fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)',
      }}>
        {nativeName}
      </span>
      {selected && (
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
      )}
    </button>
  )
}

function ThemeCard({
  mode, selected, onSelect,
}: {
  mode: Mode
  selected: boolean
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
          <span style={{ fontSize: '1.0667rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
            {mode.name}
          </span>
        </div>
        <div style={{ fontSize: '0.8667rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          {mode.description}
        </div>
      </div>

      {selected ? (
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

export function PreferencesScreen({ onBack }: Props) {
  const [locale, setLocalLocale] = useState<Locale>(getLocale())
  const [mode, setLocalMode] = useState<ModeId>(getMode())
  const [fontScale, setLocalFontScale] = useState<FontScaleId>(loadFontScale())

  function handleSelectLanguage(next: Locale) {
    if (next === locale) return
    setLocalLocale(next)
    setLocale(next) // localStorage 保存 + ページ即時リロード
  }

  function handleSelectMode(m: Mode) {
    setLocalMode(m.id)
    setMode(m.id)
  }

  function handleSelectFontScale(f: FontScaleOption) {
    setLocalFontScale(f.id)
    setFontScale(f.id)
  }

  return (
    <div style={{ background: 'var(--md-sys-color-surface)', minHeight: '100vh', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--md-sys-color-on-surface)' }}>
      <Header title={t('preferences.title')} onBack={onBack} />

      <div style={{ padding: '12px 16px 80px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* 言語 */}
        <section>
          <div style={sectionLabelStyle}>{t('preferences.languageHeading')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {LANGUAGES.map((lang) => (
              <LanguageRow
                key={lang.locale}
                nativeName={lang.nativeName}
                selected={locale === lang.locale}
                onSelect={() => handleSelectLanguage(lang.locale)}
              />
            ))}
          </div>
          <p style={hintStyle}>{t('preferences.languageHint')}</p>
        </section>

        {/* テーマ */}
        <section>
          <div style={sectionLabelStyle}>{t('preferences.themeHeading')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MODES.map((m) => (
              <ThemeCard
                key={m.id}
                mode={m}
                selected={mode === m.id}
                onSelect={() => handleSelectMode(m)}
              />
            ))}
          </div>
          <p style={hintStyle}>{t('appearanceSettings.modeHint')}</p>
        </section>

        {/* 文字サイズ */}
        <section>
          <div style={sectionLabelStyle}>{t('preferences.fontSizeHeading')}</div>
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
          <p style={hintStyle}>{t('appearanceSettings.fontSizeHint')}</p>
        </section>
      </div>
    </div>
  )
}
