import { getLocale, setLocale, type Locale } from '../i18n'
import { CheckIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { t } from '../i18n'

interface LanguageScreenProps {
  onBack: () => void
}

const LANGUAGES: { locale: Locale; nativeName: string; englishName: string }[] = [
  { locale: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { locale: 'en', nativeName: 'English', englishName: 'English' },
]

export function LanguageScreen({ onBack }: LanguageScreenProps) {
  const current = getLocale()

  function handleSelect(locale: Locale) {
    if (locale === current) return
    setLocale(locale) // saves to localStorage + page reload
  }

  return (
    <div className="stack">
      <Header title={t('settings.support.appLanguage')} onBack={onBack} />

      <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
        {t('language.description')}
      </p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {LANGUAGES.map((lang, i) => {
          const selected = lang.locale === current
          return (
            <div key={lang.locale}>
              {i > 0 && <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />}
              <button
                onClick={() => handleSelect(lang.locale)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: 'var(--s-4)',
                  background: selected ? 'var(--brand-soft)' : 'none',
                  border: 'none',
                  cursor: selected ? 'default' : 'pointer',
                  textAlign: 'left',
                  gap: 'var(--s-3)',
                }}
              >
                {/* Language circle badge */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: selected ? 'var(--brand)' : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: selected ? '#fff' : 'var(--text-muted)',
                  flexShrink: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {lang.locale === 'ja' ? 'あ' : 'A'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: selected ? 700 : 400, color: selected ? 'var(--brand)' : 'var(--text)' }}>
                    {lang.nativeName}
                  </div>
                  {lang.locale !== 'en' && (
                    <div style={{ fontSize: 14, color: 'var(--text-faint)', marginTop: 2 }}>
                      {lang.englishName}
                    </div>
                  )}
                </div>

                {selected && (
                  <span style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <CheckIcon width={20} height={20} />
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
