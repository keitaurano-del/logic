import { useState } from 'react'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoals } from '../components/journal/JournalGoals'
import { JournalSearch } from '../components/journal/JournalSearch'
import { t } from '../i18n'
import '../components/journal/journal.css'

type Sub = 'calendar' | 'goals' | 'search'

interface JournalScreenProps {
  userId: string | null
  assistantName: string
  initialSub?: Sub
  onRequestLogin?: () => void
}

const SUB_LABEL_KEY: Record<Sub, string> = {
  calendar: 'journal.tabCalendar',
  goals:    'journal.tabGoals',
  search:   'journal.tabSearch',
}

export function JournalScreen({ userId, assistantName, initialSub, onRequestLogin }: JournalScreenProps) {
  const [sub, setSub] = useState<Sub>(initialSub ?? 'calendar')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 44px) + 14px) 20px 20px',
        background: 'var(--hero-grad-dark)',
        color: 'var(--text-on-hero, #fff)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{t('journal.subtitle')}</div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 120px', display: 'flex', flexDirection: 'column' }}>
        {!userId ? (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 14,
            padding: 24,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{t('journal.loginRequiredTitle')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t('journal.loginRequiredDesc')}</div>
            {onRequestLogin && (
              <button
                type="button"
                className="journal-summarize-btn"
                onClick={onRequestLogin}
                style={{ maxWidth: 240 }}
              >
                {t('profile.loginCta')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="journal-subtabs" role="tablist" aria-label={t('journal.viewTabs')}>
              {(['calendar', 'goals', 'search'] as Sub[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={sub === s}
                  className={`journal-subtab ${sub === s ? 'journal-subtab--active' : ''}`}
                  onClick={() => setSub(s)}
                >
                  {t(SUB_LABEL_KEY[s])}
                </button>
              ))}
            </div>

            {sub === 'calendar' && <JournalCalendar userId={userId} />}
            {sub === 'goals'    && <JournalGoals    userId={userId} assistantName={assistantName} />}
            {sub === 'search'   && <JournalSearch   userId={userId} />}
          </>
        )}
      </div>
    </div>
  )
}
