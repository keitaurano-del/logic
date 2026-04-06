import { SITUATIONS, type Situation } from './situations'
import { isPremium } from './subscription'
import { getRoleplayRemaining, ROLEPLAY_FREE_LIMIT } from './roleplayUsage'
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
        <span>AIロールプレイ</span>
        <span className="rp-header-spacer" />
      </header>

      <div className="rp-content">
        <div className="rp-intro">
          <h2>論理思考を実務で使う練習</h2>
          <p>ビジネスシーンでMECE・Why So/So What・ピラミッド原則・ロジックツリーを使い、AI相手に練習しよう。</p>
          {!premium && (
            <div className="rp-quota">
              無料: 今月の残り <strong>{remaining}/{ROLEPLAY_FREE_LIMIT}</strong> 回
            </div>
          )}
        </div>

        <div className="rp-list">
          {SITUATIONS.map((s) => {
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
                  <p className="rp-card-partner">相手: {s.partnerName}（{s.partnerRole}）</p>
                  <p className="rp-card-goal">🎯 {s.goal}</p>
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
