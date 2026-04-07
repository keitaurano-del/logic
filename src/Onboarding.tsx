import { useState } from 'react'
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
  {
    emoji: '🧠',
    title: 'ロジカルシンキングを毎日 3 分で',
    body: 'MECE・ロジックツリー・演繹/帰納・形式論理。ビジネスで使える論理思考のフレームワークを、短いレッスンで体系的に学べます。',
  },
  {
    emoji: '🎯',
    title: 'AI が「あなた専用」で練習相手に',
    body: 'ロールプレイ、フェルミ推定、AI 問題生成、コーヒーブレイクの日常シーン。座学だけでなく、実践しながら身につけられます。',
  },
  {
    emoji: '📊',
    title: 'まずは偏差値テストで現在地を知る',
    body: '8 問のプレイスメントテストであなたの論理思考レベルを判定し、あなたに合った学習ルートをおすすめします。3 分で終わります。',
  },
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
        <h1 className="ob-title">{slide.title}</h1>
        <p className="ob-body">{slide.body}</p>

        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`ob-dot ${i === idx ? 'on' : ''}`} />
          ))}
        </div>

        <div className="ob-actions">
          <button className="ob-primary" onClick={() => isLast ? finish() : setIdx(idx + 1)}>
            {isLast ? 'プレイスメントテストへ' : '次へ'}
          </button>
          {!isLast && (
            <button className="ob-skip" onClick={finish}>スキップ</button>
          )}
        </div>
      </div>
    </div>
  )
}
