/* legacy App.tsx 系コンポーネント。AppV3 では AIProblemGenScreen を使用。
   div onClick が残るが a11y 化は次フェーズ (legacy 完全廃止時) で対応。 */
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useState } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, isPremium, type AIProblemSet } from './aiProblemStore'
import './AIProblemGen.css'

type Props = {
  onBack: () => void
  onPlayProblem: (problem: AIProblemSet) => void
}

const SAMPLE_PROMPTS = [
  'ロジカルシンキングのMECEに関する問題を3問',
  '仮説思考の練習問題を4問作って',
  'クリティカルシンキングの論理的誤謬問題を3問',
  'ケース面接の収益性分析問題を5問、初心者向けに',
]

export default function AIProblemGen({ onBack, onPlayProblem }: Props) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>(loadAIProblems())
  const [premium] = useState(isPremium())

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError('')
    try {
      const newSet = await generateAIProblems(prompt)
      setProblems(loadAIProblems())
      setPrompt('')
      setTimeout(() => onPlayProblem(newSet), 300)
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : null) || '生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = (id: number) => {
    if (!confirm('この問題セットを削除しますか？')) return
    deleteAIProblem(id)
    setProblems(loadAIProblems())
  }

  return (
    <div className="aip-screen">
      <header className="aip-header">
        <button className="aip-back" onClick={onBack}>← 戻る</button>
        <h2>AI問題ジェネレーター</h2>
      </header>

      <div className="aip-body">
        <div className="aip-card">
          <div className="aip-premium-badge">
            {premium ? 'プレミアム有効' : 'プレミアム機能'}
          </div>
          <h3>あなただけの問題を作ろう</h3>
          <p className="aip-desc">
            学びたい内容を自由に入力すると、AIがあなた専用の練習問題を生成します。
          </p>

          <textarea
            aria-label="作りたい問題のテーマや条件"
            className="aip-input"
            placeholder="例: MECEの問題を3問作って"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            disabled={generating}
          />

          <div className="aip-samples">
            <div className="aip-samples-label">サンプル:</div>
            {SAMPLE_PROMPTS.map((s, i) => (
              <button
                key={i}
                className="aip-sample-chip"
                onClick={() => setPrompt(s)}
                disabled={generating}
              >
                {s}
              </button>
            ))}
          </div>

          {error && <div className="aip-error">{error}</div>}

          <button
            className="aip-generate-btn"
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
          >
            {generating ? '生成中...' : '問題を生成する'}
          </button>
        </div>

        {problems.length > 0 && (
          <div className="aip-history">
            <h3>作成済みの問題セット</h3>
            <div className="aip-history-list">
              {problems.map(p => (
                <div key={p.id} className="aip-history-card">
                  <div className="aip-history-info" onClick={() => onPlayProblem(p)}>
                    <div className="aip-history-title">{p.title}</div>
                    <div className="aip-history-meta">
                      {p.steps.length}問 · {p.category}
                    </div>
                    <div className="aip-history-prompt">"{p.prompt}"</div>
                  </div>
                  <button className="aip-delete-btn" onClick={() => handleDelete(p.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
