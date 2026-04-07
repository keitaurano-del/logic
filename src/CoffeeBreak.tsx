import { useState } from 'react'
import { getCoffeeBreakScenarios, getCoffeeBreakScenario } from './coffeeBreakScenarios'
import { logSceneStarted, logScenarioCompleted } from './coffeeBreakAnalytics'
import Lesson from './Lesson'
import { t } from './i18n'
import './CoffeeBreak.css'

type Props = { onBack: () => void }

export default function CoffeeBreak({ onBack }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  if (activeId) {
    const scenario = getCoffeeBreakScenario(activeId)
    if (scenario) {
      return (
        <Lesson
          lesson={scenario.lesson}
          onBack={() => setActiveId(null)}
          onComplete={() => {
            logScenarioCompleted(activeId)
            setActiveId(null)
          }}
        />
      )
    }
  }

  const start = (id: string) => {
    logSceneStarted(id)
    setActiveId(id)
  }

  return (
    <div className="cb-screen">
      <header className="cb-header">
        <button className="cb-back" onClick={onBack}>‹</button>
        <span>{t('coffeebreak.title')}</span>
        <span className="cb-header-spacer" />
      </header>
      <div className="cb-content">
        <div className="cb-intro">
          <div className="cb-intro-emoji">☕</div>
          <h2>{t('coffeebreak.heading')}</h2>
          <p>{t('coffeebreak.lead')}</p>
        </div>
        <div className="cb-list">
          {getCoffeeBreakScenarios().map((s) => (
            <button key={s.id} className="cb-card" onClick={() => start(s.id)}>
              <span className="cb-card-emoji">{s.emoji}</span>
              <div className="cb-card-body">
                <span className="cb-card-label">{s.selectorLabel}</span>
                <span className="cb-card-desc">{s.description}</span>
              </div>
              <span className="cb-card-arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
