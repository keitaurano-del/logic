import { getSituations, type Situation } from './situations'
import { isPremium } from './subscription'
import { getRoleplayRemaining, ROLEPLAY_FREE_LIMIT } from './roleplayUsage'
import { t } from './i18n'
import './Roleplay.css'

type Props = {
  onBack: () => void
  onStart: (situationId: string) => void
  onUpgrade: () => void
}

export default function Roleplay({ onBack, onStart, onUpgrade }: Props) {
  const premium = isPremium()
  const remaining = getRoleplayRemaining()

  const handleClick = (s: Situation) => {
    if (s.premium && !premium) {
      onUpgrade()
      return
    }
    if (!premium && remaining <= 0) {
      onUpgrade()
      return
    }
    onStart(s.id)
  }

  return (
    <div className="rp-screen">
      <header className="rp-header">
        <button className="rp-back" onClick={onBack}>‹</button>
        <span>{t('roleplay.title')}</span>
        <span className="rp-header-spacer" />
      </header>

      <div className="rp-content">
        <div className="rp-intro">
          <h2>{t('roleplay.heading')}</h2>
          <p>{t('roleplay.lead')}</p>
          {!premium && (
            <div className="rp-quota">
              {t('roleplay.quotaPrefix')} <strong>{remaining}/{ROLEPLAY_FREE_LIMIT}</strong>
            </div>
          )}
        </div>

        <div className="rp-list">
          {getSituations().map((s) => {
            const locked = s.premium && !premium
            return (
              <button
                key={s.id}
                className={`rp-card ${locked ? 'locked' : ''}`}
                onClick={() => handleClick(s)}
              >
                <div className="rp-card-emoji">{s.emoji}</div>
                <div className="rp-card-body">
                  <span className="rp-card-framework">{s.frameworkLabel}</span>
                  <h3 className="rp-card-title">{s.title}</h3>
                  <p className="rp-card-partner">{t('roleplay.partnerLabel')} {s.partnerName}（{s.partnerRole}）</p>
                  <p className="rp-card-goal">{s.goal}</p>
                </div>
                {locked ? <span className="rp-badge premium">PREMIUM</span> : <span className="rp-card-arrow">›</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
