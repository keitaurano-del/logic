import { getSituations, type Situation } from './situations'
import { t } from './i18n'
import './Roleplay.css'

// Legacy v1 component. AppV3 uses src/screens/RoleplaySelectScreen.tsx.
// 2026-05-15: 単一有料プラン化 — ロールプレイは全プラン無制限解放。

type Props = {
  onBack: () => void
  onStart: (situationId: string) => void
  /** 旧シグネチャ互換のため受け取るが、ロックされたシナリオがなくなったので使わない */
  onUpgrade?: () => void
}

export default function Roleplay({ onBack, onStart }: Props) {
  const handleClick = (s: Situation) => {
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
        </div>

        <div className="rp-list">
          {getSituations().map((s) => (
            <button
              key={s.id}
              className="rp-card"
              onClick={() => handleClick(s)}
            >
              <div className="rp-card-emoji">{s.emoji}</div>
              <div className="rp-card-body">
                <span className="rp-card-framework">{s.frameworkLabel}</span>
                <h3 className="rp-card-title">{s.title}</h3>
                <p className="rp-card-partner">{t('roleplay.partnerLabel')} {s.partnerName}（{s.partnerRole}）</p>
                <p className="rp-card-goal">{s.goal}</p>
              </div>
              <span className="rp-card-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
