import { useState, useEffect } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface AIProblemGenScreenProps {
  onBack: () => void
  onPlay: (problem: AIProblemSet) => void
}

const SAMPLE_PROMPTS = [
  'MECEを使ったロジカルシンキング問題を3問',
  'フェルミ推定の練習問題を2問（日常レベル）',
  'ケース面接のフレームワーク問題を2問',
  '演繹法・帰納法の論理問題を3問',
]

export function AIProblemGenScreen({ onBack, onPlay }: AIProblemGenScreenProps) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>([])

  useEffect(() => {
    setProblems(loadAIProblems())
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setError('')
    try {
      const newSet = await generateAIProblems(prompt)
      setProblems(loadAIProblems())
      setPrompt('')
      onPlay(newSet)
    } catch (e: unknown) {
      setError((e as Error).message || '生成に失敗しました')
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
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">AI PROBLEMS</div>
      </div>

      <div className="eyebrow accent">AI 問題ジェネレーター</div>
      <h1 style={{ fontSize: 26, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        あなただけの問題を作ろう
      </h1>

      <div className="card" style={{ marginTop: 'var(--s-4)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>GENERATE</div>
        <label className="label">学習したいトピックを入力</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="例: フェルミ推定の練習問題を2問、初心者向けに"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={generating}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
          {SAMPLE_PROMPTS.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              disabled={generating}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13, marginTop: 'var(--s-3)' }}>
            {error}
          </div>
        )}

        <Button
          variant="primary" size="lg" block
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          style={{ marginTop: 'var(--s-4)' }}
        >
          {generating ? '生成中…' : '問題を生成する'}
          {!generating && <ArrowRightIcon width={16} height={16} />}
        </Button>
      </div>

      {problems.length > 0 && (
        <div className="stack-sm" style={{ marginTop: 'var(--s-4)' }}>
          <div className="eyebrow">作成済み問題セット</div>
          {problems.map((p) => (
            <div
              key={p.id}
              className="card card-compact"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }} onClick={() => onPlay(p)}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {p.steps.length}問 · {p.category}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                style={{
                  width: 28, height: 28,
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
