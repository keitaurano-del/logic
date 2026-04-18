import { useState, useEffect } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { getAIGenerationLimit, isStandardPlan } from '../subscription'
import { t } from '../i18n'

interface AIProblemGenScreenProps {
  onBack: () => void
  onPlay: (problem: AIProblemSet) => void
  onUpgrade?: () => void
}

const SAMPLE_PROMPTS = [
  '日常生活でMECEを使う練習問題を3問（買い物・時間管理など）',
  '「日本のコンビニは何店舗あるか」レベルのフェルミ推定問題を2問',
  'So What? / Why So? を使う論理検証問題を3問',
  'ロジックツリーでWhyとHowを使い分ける問題を2問',
  '仮説思考を鍛える問題を3問（ビジネス場面で）',
]

export function AIProblemGenScreen({ onBack, onPlay, onUpgrade }: AIProblemGenScreenProps) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>([])

  const limit = getAIGenerationLimit()
  const isLimited = isStandardPlan()
  // 今月の生成数 = localStorageに保存されたproblemの件数で近似
  const usedThisMonth = problems.filter((p) => {
    if (!p.createdAt) return true
    const d = new Date(p.createdAt)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const isAtLimit = isLimited && usedThisMonth >= limit

  useEffect(() => {
    setProblems(loadAIProblems())
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    if (isAtLimit) return
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

        {isAtLimit && (
          <div className="card" style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.4)', marginTop: 'var(--s-3)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t('report.aiLimitTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('report.aiLimitBody')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{usedThisMonth} / {limit} 問生成済み（今月）</div>
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                style={{ marginTop: 'var(--s-3)', fontSize: 12, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, textDecoration: 'underline' }}
              >
                {t('report.aiLimitUpgrade')}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 13, marginTop: 'var(--s-3)' }}>
            {error}
          </div>
        )}

        <Button
          variant="primary" size="lg" block
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating || isAtLimit}
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
