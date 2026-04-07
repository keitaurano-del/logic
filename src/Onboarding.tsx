import { useState } from 'react'
import { t } from './i18n'
import './Onboarding.css'

const KEY = 'logic-onboarding-done'

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch { /* */ }
}

const SLIDES = [
  { emoji: '🧠', titleKey: 'onboarding.slide1.title', bodyKey: 'onboarding.slide1.body' },
  { emoji: '🎯', titleKey: 'onboarding.slide2.title', bodyKey: 'onboarding.slide2.body' },
  { emoji: '📊', titleKey: 'onboarding.slide3.title', bodyKey: 'onboarding.slide3.body' },
]

type Props = { onComplete: () => void }

export default function Onboarding({ onComplete }: Props) {
  const [idx, setIdx] = useState(0)
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const finish = () => {
    markOnboardingDone()
    onComplete()
  }

  return (
    <div className="ob-screen">
      <div className="ob-content">
        <div className="ob-emoji">{slide.emoji}</div>
        <h1 className="ob-title">{t(slide.titleKey)}</h1>
        <p className="ob-body">{t(slide.bodyKey)}</p>

        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`ob-dot ${i === idx ? 'on' : ''}`} />
          ))}
        </div>

        <div className="ob-actions">
          <button className="ob-primary" onClick={() => isLast ? finish() : setIdx(idx + 1)}>
            {isLast ? t('onboarding.toPlacement') : t('common.next')}
          </button>
          {!isLast && (
            <button className="ob-skip" onClick={finish}>{t('common.skip')}</button>
          )}
        </div>
      </div>
    </div>
  )
}
