import { useState, useEffect } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementData'
import { allLessons } from '../lessonData'
import { ArrowLeftIcon } from '../icons'
import { getAIGenDailyLimit, getAIGenDailyCount, incrementAIGenDailyCount, isPremiumPlan, isStandardPlan } from '../subscription'
import { v3 } from '../styles/tokensV3'
import { addXP } from '../stats'

interface AIProblemGenScreenProps {
  onBack: () => void
  onPlay: (problem: AIProblemSet) => void
  onUpgrade?: () => void
}

// テーマプリセット（SVGアイコン）
type ThemePreset = { id: string; label: string; prompt: string; icon: React.ReactNode }

const ICON_COLOR = v3.color.accent
const mkIcon = (path: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
)

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'fermi', label: 'フェルミ推定',
    icon: mkIcon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
    prompt: 'フェルミ推定の練習問題を3問（日常・ビジネス）',
  },
  {
    id: 'logic', label: 'ロジカル思考',
    icon: mkIcon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>),
    prompt: 'MECEやロジックツリーを使う練習問題を3問',
  },
  {
    id: 'case', label: 'ケース面接',
    icon: mkIcon(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>),
    prompt: 'ケース面接の練習問題を3問（市場規模・戦略）',
  },
  {
    id: 'critical', label: 'クリティカル思考',
    icon: mkIcon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
    prompt: '前提を疑いクリティカルに考える問題を3問',
  },
  {
    id: 'hypo', label: '仮説思考',
    icon: mkIcon(<><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>),
    prompt: '仮説を立て検証する問題を3問（ビジネス）',
  },
  {
    id: 'mece', label: 'MECE・整理',
    icon: mkIcon(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>),
    prompt: 'MECEを使った分類・整理の問題を3問',
  },
]

// 履歴の保持日数
function getHistoryDays(): number {
  if (isPremiumPlan()) return 100
  if (isStandardPlan()) return 10
  return 3
}

// 履歴フィルタリング（プランに応じた日数内のもののみ）
function filterByHistoryDays(problems: AIProblemSet[]): AIProblemSet[] {
  const days = getHistoryDays()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return problems.filter(p => new Date(p.createdAt) >= cutoff)
}

type WeaknessItem = {
  category: string
  label: string
  completedCount: number
  totalCount: number
  score: number
}

function analyzeWeakness(): WeaknessItem[] {
  const completed = new Set(getCompletedLessons())
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
    const pl = loadPlacementResult()
    const deviationFactor = pl ? Math.min(1, pl.deviation / 70) : 0.5
    const score = Math.round((progressRate * 60 + deviationFactor * 40) * 100) / 100
    items.push({ category: cat, label, completedCount: done, totalCount: total, score })
  }
  return items.sort((a, b) => a.score - b.score)
}

function buildRecommendPrompt(weakness: WeaknessItem[]): string {
  const top = weakness.slice(0, 2)
  if (top.length === 0) return 'ロジカルシンキングの総合練習問題を3問（初級〜中級）'
  const cats = top.map(w => w.label).join('と')
  const pl2 = loadPlacementResult()
  const level = pl2
    ? (pl2.deviation < 40 ? '初級' : pl2.deviation < 55 ? '中級' : '上級')
    : '初級〜中級'
  return `${cats}の練習問題を3問（${level}、実際のビジネス場面を想定）`
}

// 星評価ポップアップ
interface RatingPopupProps {
  onSubmit: (rating: number, comment: string) => void
  onSkip: () => void
}
function RatingPopup({ onSubmit, onSkip }: RatingPopupProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '0 0 env(safe-area-inset-bottom,0)' }}>
      <div style={{ background: v3.color.card, borderRadius: '20px 20px 0 0', padding: '28px 24px 32px', width: '100%', maxWidth: 480 }}>
        {/* XP通知 */}
        <div style={{ background: `${v3.color.accent}18`, border: `1px solid ${v3.color.accent}40`, borderRadius: 12, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={v3.color.accent} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.accent }}>+30 XP 獲得！</div>
            <div style={{ fontSize: 11, color: v3.color.text2 }}>問題を解き終えました</div>
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: v3.color.text, marginBottom: 6 }}>この問題はどうでしたか？</div>
        <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 20 }}>評価してくれると次の問題生成に活かせるよ</div>
        {/* 星5つ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill={(hovered || rating) >= n ? v3.color.warm : 'none'} stroke={v3.color.warm} strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          ))}
        </div>
        {/* コメント */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="感想・改善点など（任意）"
          rows={3}
          style={{ width: '100%', boxSizing: 'border-box', background: `${v3.color.accent}08`, border: `1px solid ${v3.color.line}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: v3.color.text, resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 14 }}
        />
        <button
          onClick={() => rating > 0 ? onSubmit(rating, comment) : onSkip()}
          style={{ width: '100%', background: v3.color.accent, color: v3.color.bg, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
          {rating > 0 ? '送信する' : 'スキップ'}
        </button>
        <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: v3.color.text3, fontSize: 13, cursor: 'pointer' }}>
          スキップ
        </button>
      </div>
    </div>
  )
}

type Tab = 'create' | 'history'

export function AIProblemGenScreen({ onBack, onPlay, onUpgrade }: AIProblemGenScreenProps) {
  const [tab, setTab] = useState<Tab>('create')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>([])
  const [weakness, setWeakness] = useState<WeaknessItem[]>([])
  const [recommendPrompt, setRecommendPrompt] = useState('')
  const [showRating, setShowRating] = useState(false)
  const [pendingProblem, setPendingProblem] = useState<AIProblemSet | null>(null)

  const dailyLimit = getAIGenDailyLimit()
  const [dailyCount, setDailyCount] = useState(getAIGenDailyCount)
  const isAtLimit = dailyCount >= dailyLimit
  const canUse = dailyLimit > 0

  const historyDays = getHistoryDays()
  const planLabel = isPremiumPlan() ? 'プレミアム' : isStandardPlan() ? 'スタンダード' : 'フリー'

  useEffect(() => {
    const w = analyzeWeakness()
    setWeakness(w)
    setRecommendPrompt(buildRecommendPrompt(w))
    setProblems(filterByHistoryDays(loadAIProblems()))
  }, [])

  const handleGenerate = async (targetPrompt?: string) => {
    const p = targetPrompt ?? prompt
    if (!p.trim() || generating) return
    if (!canUse || isAtLimit) return
    setGenerating(true)
    setError('')
    try {
      const newSet = await generateAIProblems(p)
      incrementAIGenDailyCount()
      setDailyCount(getAIGenDailyCount())
      setProblems(filterByHistoryDays(loadAIProblems()))
      setPrompt('')
      // +10 XP（問題作成）
      addXP(10)
      // 問題解き終わり後に評価ポップアップを出すためにpendingに保存
      setPendingProblem(newSet)
      onPlay(newSet)
    } catch (e: unknown) {
      setError((e as Error).message || '生成に失敗しました')
    } finally {
      setGenerating(false)
    }
  }

    // 解き終わり後：+30 XP + 評価ポップアップ

  const handleRatingSubmit = async (rating: number, comment: string) => {
    // バックエンドに評価を送信
    if (pendingProblem) {
      fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/user-problems/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: pendingProblem.id, rating, comment }),
      }).catch(() => {})
    }
    setShowRating(false)
    setPendingProblem(null)
  }

  const handleDelete = (id: number) => {
    if (!confirm('この問題セットを削除しますか？')) return
    deleteAIProblem(id)
    setProblems(filterByHistoryDays(loadAIProblems()))
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'create', label: '問題を作る' },
    { id: 'history', label: '履歴' },
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
          <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 1 }}>弱点に合った問題を自動生成</div>
        </div>
        {dailyLimit > 0 ? (
          <div style={{ marginLeft: 'auto', background: v3.color.card, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: isAtLimit ? '#F87171' : v3.color.accent }}>
            {dailyCount}/{dailyLimit}問 (今日)
          </div>
        ) : (
          <div style={{ marginLeft: 'auto', background: 'rgba(248,113,113,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#F87171' }}>
            要アップグレード
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

        {/* ===== 問題を作るタブ ===== */}
        {tab === 'create' && (
          <>
            {/* あなたにあった問題を自動生成（弱点ベース・ワンタップ） */}
            <button
              onClick={() => handleGenerate(recommendPrompt)}
              disabled={generating || isAtLimit || !canUse || !recommendPrompt}
              style={{ width: '100%', background: generating || isAtLimit || !canUse ? v3.color.card : `linear-gradient(135deg, ${v3.color.accent} 0%, #8B6EF5 100%)`, color: generating || isAtLimit || !canUse ? v3.color.text3 : '#fff', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: generating || isAtLimit || !canUse ? 'none' : v3.shadow.hero }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>あなたにあった問題を自動生成する</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>弱点分析をもとにAIが最適な問題を作成</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            {/* 自由テキスト入力（最上部） */}
            <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, marginBottom: 6 }}>どんな問題を作る？</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginBottom: 10 }}>テーマや条件を自由に入力してね</div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例：MECEを使った問題を3問（コンビニのターゲット分析）"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: `${v3.color.accent}08`, border: `1px solid ${v3.color.line}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: v3.color.text, resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || generating || isAtLimit || !canUse}
                style={{ marginTop: 10, width: '100%', background: prompt.trim() && !generating && !isAtLimit && canUse ? v3.color.accent : v3.color.card, color: prompt.trim() && !generating && !isAtLimit && canUse ? v3.color.bg : v3.color.text3, border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: prompt.trim() && !generating && !isAtLimit && canUse ? 'pointer' : 'not-allowed' }}>
                {generating ? '生成中…' : !canUse ? 'スタンダード以上で利用可能' : isAtLimit ? '今日の上限に達しました' : '生成する (+10 XP)'}
              </button>
              {(!canUse || isAtLimit) && onUpgrade && (
                <button onClick={onUpgrade} style={{ width: '100%', marginTop: 8, background: 'transparent', border: `1px solid ${v3.color.accent}`, color: v3.color.accent, borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  プランをアップグレード
                </button>
              )}
            </div>

            {error && <div style={{ fontSize: 13, color: '#F87171', textAlign: 'center' }}>{error}</div>}

            {/* テーマから選ぶ（下部） */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 10 }}>カテゴリから選ぶ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {THEME_PRESETS.map(p => (
                  <button key={p.id} onClick={() => handleGenerate(p.prompt)} disabled={generating || isAtLimit || !canUse}
                    style={{ background: v3.color.card, border: `1px solid ${v3.color.line}`, borderRadius: 14, padding: '14px 12px', cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: generating || !canUse ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${v3.color.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: v3.color.text, lineHeight: 1.3 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* おすすめ（弱点ベース） */}
            {weakness.length > 0 && (
              <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: '16px 18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: v3.color.text2, letterSpacing: '.06em', marginBottom: 14 }}>弱点分析</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {weakness.slice(0, 3).map((w) => {
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
                <div style={{ fontSize: 12, color: v3.color.text2, padding: '8px 10px', background: `${v3.color.accent}10`, borderRadius: 8, borderLeft: `2px solid ${v3.color.accent}`, marginBottom: 12, lineHeight: 1.6 }}>{recommendPrompt}</div>
                <button
                  onClick={() => handleGenerate(recommendPrompt)}
                  disabled={generating || isAtLimit || !canUse}
                  style={{ width: '100%', background: generating || isAtLimit || !canUse ? v3.color.card : v3.color.accent, color: generating || isAtLimit || !canUse ? v3.color.text3 : v3.color.bg, border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer' }}>
                  {generating ? '生成中…' : 'この弱点で問題を生成する'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== 履歴タブ ===== */}
        {tab === 'history' && (
          <>
            <div style={{ fontSize: 12, color: v3.color.text3, marginBottom: 4 }}>
              {planLabel}プラン · 過去{historyDays}日分を表示
            </div>
            {problems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: v3.color.text2, fontSize: 14 }}>
                まだ生成した問題がないよ<br />「問題を作る」タブから作ってみよう
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

      {/* 解き終わり後の評価ポップアップ（外部からトリガー可能） */}
      {showRating && (
        <RatingPopup
          onSubmit={handleRatingSubmit}
          onSkip={() => { setShowRating(false); setPendingProblem(null) }}
        />
      )}
    </div>
  )
}

// 外部から解き終わりを通知するためのユーティリティ
export { type AIProblemSet }
