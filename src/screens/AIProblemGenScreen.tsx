import { useState, useEffect } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { getCompletedLessons } from '../stats'
import { loadPlacementResult, rankLabel } from '../placementData'
import { allLessons } from '../lessonData'
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

// カテゴリごとの弱点スコアを計算（低いほど弱い）
type WeaknessItem = {
  category: string
  label: string
  completedCount: number
  totalCount: number
  score: number // 0〜100
}

function analyzeWeakness(): WeaknessItem[] {
  const completed = new Set(getCompletedLessons())
  const placement = loadPlacementResult()

  // lessonDataからカテゴリ別に集計
  const categoryMap = new Map<string, { total: number; done: number; label: string }>()
  for (const lesson of Object.values(allLessons)) {
    const cat = lesson.category ?? 'その他'
    if (!categoryMap.has(cat)) categoryMap.set(cat, { total: 0, done: 0, label: cat })
    const entry = categoryMap.get(cat)!
    entry.total++
    // completedLessons は "lesson-{id}" 形式
    if (completed.has(`lesson-${lesson.id}`)) entry.done++
  }

  const items: WeaknessItem[] = []
  for (const [cat, { total, done, label }] of categoryMap.entries()) {
    if (total === 0) continue
    const progressRate = done / total // 0〜1: 進捗率
    // 偏差値がある場合は偏差値も加味（低い偏差値 = 弱点）
    const deviationFactor = placement ? Math.min(1, placement.deviation / 70) : 0.5
    // スコア: 進捗率60% + 偏差値40% → 低いほど弱点
    const score = Math.round((progressRate * 60 + deviationFactor * 40) * 100) / 100
    items.push({ category: cat, label, completedCount: done, totalCount: total, score })
  }

  // スコアが低い順（弱点順）にソート
  return items.sort((a, b) => a.score - b.score)
}

// 弱点からおすすめプロンプトを生成
function buildRecommendPrompt(weakness: WeaknessItem[]): string {
  const top = weakness.slice(0, 2)
  if (top.length === 0) return 'ロジカルシンキングの総合練習問題を3問（初級〜中級）'
  const cats = top.map(w => w.label).join('と')
  const placement = loadPlacementResult()
  const level = placement
    ? (placement.deviation < 40 ? '初級' : placement.deviation < 55 ? '中級' : '上級')
    : '初級〜中級'
  return `${cats}の練習問題を3問（${level}、実際のビジネス場面を想定）`
}

type Tab = 'recommend' | 'theme'

// 弱点バー色
function scoreColor(score: number): string {
  if (score < 0.35) return '#DC2626'
  if (score < 0.55) return '#D97706'
  return '#3B5BDB'
}
function scoreTagStyle(score: number): { bg: string; color: string; label: string } {
  if (score < 0.35) return { bg: '#FEF2F2', color: '#DC2626', label: '苦手' }
  if (score < 0.55) return { bg: '#FFFBEB', color: '#D97706', label: '要強化' }
  return { bg: '#EEF2FF', color: '#3B5BDB', label: '練習中' }
}

export function AIProblemGenScreen({ onBack, onPlay, onUpgrade }: AIProblemGenScreenProps) {
  const [tab, setTab] = useState<Tab>('recommend')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>([])
  const [weakness, setWeakness] = useState<WeaknessItem[]>([])
  const [recommendPrompt, setRecommendPrompt] = useState('')

  const limit = getAIGenerationLimit()
  const isLimited = isStandardPlan()
  const usedThisMonth = problems.filter((p) => {
    if (!p.createdAt) return true
    const d = new Date(p.createdAt)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
  const isAtLimit = isLimited && usedThisMonth >= limit

  const placement = loadPlacementResult()

  useEffect(() => {
    setProblems(loadAIProblems())
    const w = analyzeWeakness()
    setWeakness(w)
    setRecommendPrompt(buildRecommendPrompt(w))
  }, [])

  const handleGenerate = async (targetPrompt?: string) => {
    const p = targetPrompt ?? prompt
    if (!p.trim() || generating) return
    if (isAtLimit) return
    setGenerating(true)
    setError('')
    try {
      const newSet = await generateAIProblems(p)
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

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', textAlign: 'center',
    fontSize: 14, fontWeight: 700,
    color: active ? '#3B5BDB' : '#7A849E',
    background: active ? '#fff' : 'transparent',
    borderRadius: 10, border: 'none', cursor: 'pointer',
    transition: 'all .15s',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
  })

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text">AI 問題</div>
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', background: '#E8EEFF', borderRadius: 12, padding: 3, gap: 0 }}>
        <button style={tabStyle(tab === 'recommend')} onClick={() => setTab('recommend')}>
          おすすめ
        </button>
        <button style={tabStyle(tab === 'theme')} onClick={() => setTab('theme')}>
          テーマ指定
        </button>
      </div>

      {/* ===== おすすめタブ ===== */}
      {tab === 'recommend' && (
        <>
          {/* 偏差値カード */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', marginBottom: 4 }}>現在の偏差値</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#0F1523' }}>
                {placement ? placement.deviation.toFixed(1) : '—'}
              </div>
              {placement && (
                <div style={{ fontSize: 13, color: rankLabel(placement.deviation).color, fontWeight: 700, marginTop: 2 }}>
                  {rankLabel(placement.deviation).label}
                </div>
              )}
            </div>
            {!placement && (
              <div style={{ fontSize: 14, color: '#7A849E', lineHeight: 1.5 }}>
                プレースメントテストを受けると<br />より正確なおすすめが届くよ
              </div>
            )}
          </div>

          {/* 弱点分析 */}
          {weakness.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A849E', letterSpacing: '.06em', marginBottom: 12 }}>
                弱点分析
              </div>
              {weakness.slice(0, 4).map((w) => {
                const tag = scoreTagStyle(w.score)
                return (
                  <div key={w.category} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #F0F4FF' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1523', marginBottom: 4 }}>{w.label}</div>
                      <div style={{ height: 6, background: '#E8EEFF', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round(w.score * 100)}%`, background: scoreColor(w.score), borderRadius: 99 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#7A849E', minWidth: 44, textAlign: 'right' }}>
                      {w.completedCount}/{w.totalCount}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: tag.bg, color: tag.color }}>
                      {tag.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* 自動生成プロンプトプレビュー */}
          <div className="card" style={{ background: '#EEF2FF', border: '1.5px solid #C5D0FB' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB', marginBottom: 8 }}>生成する問題</div>
            <div style={{ fontSize: 15, color: '#0F1523', lineHeight: 1.6 }}>{recommendPrompt}</div>
          </div>

          {error && (
            <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16 }}>
              {error}
            </div>
          )}

          {isAtLimit ? (
            <div className="card" style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.4)' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t('report.aiLimitTitle')}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{usedThisMonth} / {limit} 問生成済み（今月）</div>
              {onUpgrade && (
                <button onClick={onUpgrade} style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, textDecoration: 'underline' }}>
                  {t('report.aiLimitUpgrade')}
                </button>
              )}
            </div>
          ) : (
            <Button
              variant="primary" size="lg" block
              onClick={() => handleGenerate(recommendPrompt)}
              disabled={generating || isAtLimit}
            >
              {generating ? '生成中…' : 'おすすめ問題を生成'}
              {!generating && <ArrowRightIcon width={16} height={16} />}
            </Button>
          )}
        </>
      )}

      {/* ===== テーマ指定タブ ===== */}
      {tab === 'theme' && (
        <>
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>生成</div>
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
                    fontSize: 14, padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {isAtLimit && (
              <div className="card" style={{ background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.4)', marginTop: 'var(--s-3)' }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t('report.aiLimitTitle')}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('report.aiLimitBody')}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{usedThisMonth} / {limit} 問生成済み（今月）</div>
                {onUpgrade && (
                  <button onClick={onUpgrade} style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'var(--brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700, textDecoration: 'underline' }}>
                    {t('report.aiLimitUpgrade')}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="card" style={{ background: 'rgba(220,38,38,0.06)', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: 16, marginTop: 'var(--s-3)' }}>
                {error}
              </div>
            )}

            <Button
              variant="primary" size="lg" block
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || generating || isAtLimit}
              style={{ marginTop: 'var(--s-4)' }}
            >
              {generating ? '生成中…' : '問題を生成する'}
              {!generating && <ArrowRightIcon width={16} height={16} />}
            </Button>
          </div>
        </>
      )}

      {/* 作成済み問題セット（両タブ共通） */}
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
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
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
                  fontSize: 16,
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
