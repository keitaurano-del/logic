import { useState, useEffect } from 'react'
import { isPremium } from './subscription'
import './FermiLesson.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

const FREE_QUESTIONS = [
  '日本のコンビニは何店舗あるか?',
  '東京都内に信号機は何基あるか?',
  '日本で 1 日に消費されるペットボトルの本数は?',
  '日本の美容院・理髪店の数は?',
  '東京-大阪間を歩いて移動すると何歩になるか?',
  '日本に自動販売機は何台あるか?',
  '日本人が 1 年間に飲むコーヒーの杯数は?',
]

type FermiStep = 'problem' | 'input' | 'feedback'

type Props = {
  onBack: () => void
  onUpgrade: () => void
}

function pickRandom(): string {
  return FREE_QUESTIONS[Math.floor(Math.random() * FREE_QUESTIONS.length)]
}

export default function FermiLesson({ onBack, onUpgrade }: Props) {
  const [step, setStep] = useState<FermiStep>('problem')
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const premium = isPremium()

  useEffect(() => {
    setCurrentQuestion(pickRandom())
  }, [])

  const reset = (newQuestion?: string) => {
    setStep('problem')
    setUserInput('')
    setFeedback('')
    setError(null)
    if (newQuestion) setCurrentQuestion(newQuestion)
    else setCurrentQuestion(pickRandom())
  }

  const submit = async () => {
    if (!userInput.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, userInput }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setFeedback(data.feedback || '')
      setStep('feedback')
    } catch {
      setError('フィードバックの取得に失敗しました。もう一度試してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAiQuestion = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/fermi/question`, { method: 'POST' })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      reset(data.question || pickRandom())
    } catch {
      setError('AI 問題の生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Render feedback as simple markdown-ish (handle ## headings and lists)
  const renderFeedback = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h4 key={i} className="fl-fb-heading">{line.slice(3)}</h4>
      if (/^[-・]\s/.test(line)) return <li key={i} className="fl-fb-li">{line.replace(/^[-・]\s/, '')}</li>
      if (/^\d+\.\s/.test(line)) return <li key={i} className="fl-fb-li ordered">{line.replace(/^\d+\.\s/, '')}</li>
      if (!line.trim()) return <div key={i} className="fl-fb-spacer" />
      return <p key={i} className="fl-fb-p">{line}</p>
    })
  }

  return (
    <div className="fl-screen">
      <header className="fl-header">
        <button className="fl-back" onClick={onBack}>‹</button>
        <span>フェルミ推定</span>
        <span className="fl-header-spacer" />
      </header>

      <div className="fl-content">
        {step === 'problem' && (
          <>
            <div className="fl-context">
              フェルミ推定は、MECE やロジックツリーで学んだ分解思考を実際に使う練習です。正確な答えより、<strong>どう考えたかのプロセス</strong>が大切です。
            </div>
            <div className="fl-question-card">
              <div className="fl-question-tag">QUESTION</div>
              <h2 className="fl-question-text">{currentQuestion}</h2>
            </div>
            <div className="fl-hint">
              💡 答えの数字が合っていなくて大丈夫です。どう分解したかを書いてみましょう。
            </div>
            <button className="fl-primary-btn" onClick={() => setStep('input')}>考えてみる</button>
          </>
        )}

        {step === 'input' && (
          <>
            <div className="fl-question-mini">{currentQuestion}</div>
            <textarea
              className="fl-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={'例:\n人口 × 1 世帯あたり人数 × コンビニ利用世帯率 × 1 日の来客数...\n\n思ったように分解してみてください。式でも箇条書きでも OK。'}
              rows={10}
            />
            {error && <div className="fl-error">{error}</div>}
            <button className="fl-primary-btn" onClick={submit} disabled={isLoading || !userInput.trim()}>
              {isLoading ? 'フィードバックを生成中...' : 'AI にフィードバックをもらう'}
            </button>
            <button className="fl-secondary-btn" onClick={() => setStep('problem')}>戻る</button>
          </>
        )}

        {step === 'feedback' && (
          <>
            <div className="fl-question-mini">{currentQuestion}</div>
            <div className="fl-user-input-recap">
              <div className="fl-recap-label">あなたの分解</div>
              <div className="fl-recap-text">{userInput}</div>
            </div>
            <div className="fl-feedback-card">
              {renderFeedback(feedback)}
            </div>

            {!premium && (
              <div className="fl-upsell">
                <div className="fl-upsell-emoji">⭐</div>
                <div className="fl-upsell-body">
                  <strong>もっと練習したい?</strong>
                  <p>プレミアムなら毎日新しい AI 生成問題でこの体験を続けられます (¥500/月)。</p>
                  <button className="fl-upsell-btn" onClick={onUpgrade}>プレミアムを試す (7 日間無料)</button>
                </div>
              </div>
            )}

            {premium && (
              <button className="fl-primary-btn" onClick={fetchAiQuestion} disabled={isLoading}>
                {isLoading ? '生成中...' : '次の AI 生成問題へ'}
              </button>
            )}

            <button className="fl-secondary-btn" onClick={() => reset()}>別の問題を試す</button>

            <div className="fl-related">
              <div className="fl-related-label">関連レッスン</div>
              <p className="fl-related-link">分解をもっと磨きたい → ロジックツリー(レッスン一覧から)</p>
              <p className="fl-related-link">網羅性を確認したい → MECE(レッスン一覧から)</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
