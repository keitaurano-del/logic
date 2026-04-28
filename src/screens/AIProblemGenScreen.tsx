import { useState, useEffect } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { getCompletedLessons } from '../stats'
import { loadPlacementResult, rankLabel } from '../placementData'
import { allLessons } from '../lessonData'
import { ArrowLeftIcon } from '../icons'
import { getAIGenerationLimit, isStandardPlan } from '../subscription'
import { v3 } from '../styles/tokensV3'

interface AIProblemGenScreenProps {
  onBack: () => void
  onPlay: (problem: AIProblemSet) => void
  onUpgrade?: () => void
}

// SCRUM-133: カテゴリ別テーマパレット
const THEME_PRESETS = [
  { id: 'fermi',    label: 'フェルミ推定',     icon: '🔢', prompt: 'フェルミ推定の練習問題を3問（日常・ビジネス）' },
  { id: 'logic',    label: 'ロジカル思考',     icon: '🌐', prompt: 'MECEやロジックツリーを使う練習問題を3問' },
  { id: 'case',     label: 'ケース面接',       icon: '💼', prompt: 'ケース面接の練習問題を3問（市場規模・戦略）' },
  { id: 'critical', label: 'クリティカル思考', icon: '🔍', prompt: '前提を疑いクリティカルに考える問題を3問' },
  { id: 'hypo',     label: '仮説思考',        icon: '💡', prompt: '仮説を立て検証する問題を3問（ビジネス）' },
  { id: 'mece',     label: 'MECE・整理',      icon: '📊', prompt: 'MECEを使った分類・整理の問題を3問' },
]

type WeaknessItem = {
  category: string
  label: string
  completedCount: number
  totalCount: number
  score: number
}

function analyzeWeakness(): WeaknessItem[] {
  const completed = new Set(getCompletedLessons())
  const placement = loadPlacementResult()
  const categoryMap = new Map<string, { total: number; done: number; label: string }>()
  for (const lesson of Object.values(allLessons)) {
    const cat = lesson.category ?? 'その他'
    if (!categoryMap.has(cat)) categoryMap.set(cat, { total: 0, done: 0, label: cat })
    const entry = categoryMap.get(cat)!
    entry.total++
    if (completed.has(`lesson-${lesson.id}`)) entry.done++
  }
  const items: WeaknessItem[] = []
  for (const [cat, { total, done, label }] of categoryMap.entries()) {
    if (total === 0) continue
    const progressRate = done / total
    const deviationFactor = placement ? Math.min(1, placement.deviation / 70) : 0.5
    const score = Math.round((progressRate * 60 + deviationFactor * 40) * 100) / 100
    items.push({ category: cat, label, completedCount: done, totalCount: total, score })
  }
  return items.sort((a, b) => a.score - b.score)
}

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

type Tab = 'recommend' | 'theme' | 'history'

export function AIProblemGenScreen({ onBack, onPlay, onUpgrade }: AIProblemGenScreenProps) {
  const [tab, setTab] = useState<Tab>('recommend')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>([])
  const [weakness, setWeakness] = useState<WeaknessItem[]>([])
  const [recommendPrompt, setRecommendPrompt] = useState('')

  const limit = getAIGenerationLimit()
  const isAtLimit = !isStandardPlan() && problems.length >= limit
  const placement = loadPlacementResult()

  useEffect(() => {
    const w = analyzeWeakness()
    setWeakness(w)
    setRecommendPrompt(buildRecommendPrompt(w))
    setProblems(loadAIProblems())
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

  const TABS: { id: Tab; label: string }[] = [
    { id: 'recommend', label: 'おすすめ' },
    { id: 'theme',     label: 'テーマ' },
    { id: 'history',   label: '履歴' },
  ]

  return (
    <div style={{
      minHeight: '100dvh', background: v3.color.bg, color: v3.color.text,
      fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column',
    }}>
      {/* ヘッダー */}
      <div style={{ padding: 'calc(env(safe-area-inset-top,44px) + 4px) 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeftIcon width={16} height={16} style={{ color: v3.color.accent }} />
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: v3.color.text, letterSpacing: '-.02em' }}>AI問題生成</div>
          <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 1 }}>BETA · 弱点に合った問題を自動生成</div>
        </div>
        {/* 生成残り回数 */}
        {!isStandardPlan() && (
          <div style={{ marginLeft: 'auto', background: v3.color.card, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: isAtLimit ? '#F87171' : v3.color.accent }}>
            {problems.length}/{limit}
          </div>
        )}
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', padding: '16px 20px 0', gap: 6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all .15s',
            background: tab === t.id ? v3.color.accent : v3.color.card,
            color: tab === t.id ? v3.color.bg : v3.color.text2,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* ===== おすすめタブ ===== */}
        {tab === 'recommend' && (
          <>
            {/* 偏差値カード */}
            <div style={{ background: `linear-gradient(135deg, ${v3.color.accent}22 0%, ${v3.color.card} 100%)`, borderRadius: v3.radius.card, padding: '16px 18px', border: `1px solid ${v3.color.accent}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 4 }}>現在の偏差値</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: v3.color.accent, letterSpacing: '-.03em', lineHeight: 1 }}>
                    {placement ? placement.deviation.toFixed(1) : '—'}
                  </div>
                  {placement && (
                    <div style={{ fontSize: 13, color: rankLabel(placement.deviation).color, fontWeight: 700, marginTop: 4 }}>
                      {rankLabel(placement.deviation).label}
                    </div>
                  )}
                </div>
                {!placement && (
                  <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.6 }}>
                    プレースメントテストを受けると<br />より正確なおすすめが届くよ
                  </div>
                )}
              </div>
            </div>

            {/* 弱点分析 */}
            {weakness.length > 0 && (
              <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '16px 18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 14 }}>弱点分析</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {weakness.slice(0, 4).map((w) => {
                    const pct = Math.round(w.score * 100)
                    const barColor = pct < 35 ? '#F87171' : pct < 55 ? '#FBBF24' : v3.color.accent
                    const tagBg = pct < 35 ? 'rgba(248,113,113,.15)' : pct < 55 ? 'rgba(251,191,36,.15)' : `${v3.color.accent}20`
                    const tagColor = pct < 35 ? '#F87171' : pct < 55 ? '#FBBF24' : v3.color.accent
                    const tagLabel = pct < 35 ? '苦手' : pct < 55 ? '要強化' : '練習中'
                    return (
                      <div key={w.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: v3.color.text }}>{w.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: v3.color.text2 }}>{w.completedCount}/{w.totalCount}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tagBg, color: tagColor }}>{tagLabel}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: `${v3.color.accent}20`, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width .6s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* おすすめ生成ボタン */}
            <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 10 }}>今日のおすすめ</div>
              <div style={{ fontSize: 14, color: v3.color.text, lineHeight: 1.6, marginBottom: 14, padding: '10px 12px', background: `${v3.color.accent}12`, borderRadius: 10, borderLeft: `3px solid ${v3.color.accent}` }}>
                {recommendPrompt}
              </div>
              <button
                onClick={() => handleGenerate(recommendPrompt)}
                disabled={generating || isAtLimit}
                style={{ width: '100%', background: generating || isAtLimit ? v3.color.card : v3.color.accent, color: generating || isAtLimit ? v3.color.text3 : v3.color.bg, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: generating || isAtLimit ? 'not-allowed' : 'pointer' }}
              >
                {generating ? '生成中…' : isAtLimit ? '生成上限に達しました' : '✦ この問題を生成する'}
              </button>
              {isAtLimit && onUpgrade && (
                <button onClick={onUpgrade} style={{ width: '100%', marginTop: 8, background: 'transparent', border: `1px solid ${v3.color.accent}`, color: v3.color.accent, borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  プランをアップグレード
                </button>
              )}
            </div>
            {error && <div style={{ fontSize: 13, color: '#F87171', textAlign: 'center' }}>{error}</div>}
          </>
        )}

        {/* ===== テーマタブ ===== */}
        {tab === 'theme' && (
          <>
            {/* クイックテーマ */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 10 }}>カテゴリから選ぶ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {THEME_PRESETS.map(p => (
                  <button key={p.id} onClick={() => handleGenerate(p.prompt)} disabled={generating || isAtLimit}
                    style={{ background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 14, padding: '14px 12px', cursor: generating || isAtLimit ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: generating ? 0.6 : 1 }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, lineHeight: 1.3 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自由入力 */}
            <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 10 }}>自由入力</div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例：MECEを使った問題を3問（コンビニのターゲット分析）"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: `${v3.color.accent}08`, border: `1px solid ${v3.color.line}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: v3.color.text, resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || generating || isAtLimit}
                style={{ marginTop: 10, width: '100%', background: prompt.trim() && !generating && !isAtLimit ? v3.color.accent : v3.color.card, color: prompt.trim() && !generating && !isAtLimit ? v3.color.bg : v3.color.text3, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: prompt.trim() && !generating && !isAtLimit ? 'pointer' : 'not-allowed' }}>
                {generating ? '生成中…' : '✦ 生成する'}
              </button>
            </div>
            {error && <div style={{ fontSize: 13, color: '#F87171', textAlign: 'center' }}>{error}</div>}
          </>
        )}

        {/* ===== 履歴タブ ===== */}
        {tab === 'history' && (
          <>
            {problems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: v3.color.text2, fontSize: 14 }}>
                まだ生成した問題がないよ<br />おすすめ or テーマから作ってみよう
              </div>
            ) : (
              problems.map(p => (
                <div key={p.id} style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: v3.color.text2 }}>{p.steps?.length ?? 0}問 · {new Date(p.createdAt).toLocaleDateString('ja-JP')}</div>
                  </div>
                  <button onClick={() => onPlay(p)} style={{ background: v3.color.accent, color: v3.color.bg, border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>もう一度</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  )
}
