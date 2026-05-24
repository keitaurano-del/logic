import { useState } from 'react'
import { loadAIProblems, generateAIProblems, deleteAIProblem, type AIProblemSet } from '../aiProblemStore'
import { getCompletedLessons } from '../stats'
import { loadPlacementResult } from '../placementData'
import { allLessons } from '../lessonData'
import { Header } from '../components/platform/Header'
import { isPaid } from '../subscription'
import { addXP } from '../stats'
import { t, getLocale } from '../i18n'
import { isSaved, toggleSaved } from '../savedItemsStore'
import { BookmarkIcon, BookmarkFilledIcon } from '../icons'
import { haptic } from '../platform/haptics'
import { SAMPLE_PROBLEMS, type SampleDifficulty } from '../aiProblemSamples'
import { useStudyTimer } from '../hooks/useStudyTimer'
import { ProblemGenLoader } from '../components/ProblemGenLoader'

interface AIProblemGenScreenProps {
  onBack: () => void
  onPlay: (problem: AIProblemSet) => void
  onUpgrade?: () => void
}

// データ値であるカテゴリ名 (lessonData.category) → 表示用の翻訳キー解決
const CATEGORY_LABEL_KEY: Record<string, string> = {
  'ロジカルシンキング': 'category.logical',
  'ケース面接': 'category.case',
  'クリティカルシンキング': 'category.critical',
  '仮説思考': 'category.hypothesis',
  '課題設定': 'category.problemSetting',
  '論点設定': 'category.issueSetting',
  'デザインシンキング': 'category.designThinking',
  'ラテラルシンキング': 'category.lateral',
  'アナロジー思考': 'category.analogy',
  'システムシンキング': 'category.systems',
  '構造化リスニング': 'category.listening',
  'ADHDレバレッジ': 'category.adhdLeverage',
  '集中の技術': 'category.focus',
  '提案・伝える技術': 'category.proposal',
  '提案書作成': 'category.proposalWriting',
  '哲学・思考の原理': 'category.philosophy',
  '東洋思想': 'category.eastern',
  'クライアントワーク': 'category.clientWork',
  'フェルミ推定': 'category.fermi',
  '経営戦略': 'category.strategy',
  '認知科学': 'category.cognitive',
  'ドキュメンテーション': 'category.documentation',
}
function categoryLabel(cat: string): string {
  const key = CATEGORY_LABEL_KEY[cat]
  return key ? t(key) : cat
}

// テーマプリセット（SVGアイコン）
type ThemePreset = { id: string; label: string; prompt: string; icon: React.ReactNode }

const ICON_COLOR = 'var(--brand)'
const mkIcon = (path: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{path}</svg>
)

function getThemePresets(): ThemePreset[] {
  return [
    {
      id: 'fermi', label: t('aiGen.theme.fermi'),
      icon: mkIcon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
      prompt: t('aiGen.theme.fermiPrompt'),
    },
    {
      id: 'logic', label: t('aiGen.theme.logic'),
      icon: mkIcon(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>),
      prompt: t('aiGen.theme.logicPrompt'),
    },
    {
      id: 'case', label: t('aiGen.theme.case'),
      icon: mkIcon(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>),
      prompt: t('aiGen.theme.casePrompt'),
    },
    {
      id: 'critical', label: t('aiGen.theme.critical'),
      icon: mkIcon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>),
      prompt: t('aiGen.theme.criticalPrompt'),
    },
    {
      id: 'hypo', label: t('aiGen.theme.hypo'),
      icon: mkIcon(<><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>),
      prompt: t('aiGen.theme.hypoPrompt'),
    },
    {
      id: 'mece', label: t('aiGen.theme.mece'),
      icon: mkIcon(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>),
      prompt: t('aiGen.theme.mecePrompt'),
    },
    {
      id: 'issue', label: t('aiGen.theme.issue'),
      icon: mkIcon(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>),
      prompt: t('aiGen.theme.issuePrompt'),
    },
    {
      id: 'point', label: t('aiGen.theme.point'),
      icon: mkIcon(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
      prompt: t('aiGen.theme.pointPrompt'),
    },
    {
      id: 'lateral', label: t('aiGen.theme.lateral'),
      icon: mkIcon(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>),
      prompt: t('aiGen.theme.lateralPrompt'),
    },
    {
      id: 'analogy', label: t('aiGen.theme.analogy'),
      icon: mkIcon(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>),
      prompt: t('aiGen.theme.analogyPrompt'),
    },
    {
      id: 'systems', label: t('aiGen.theme.systems'),
      icon: mkIcon(<><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></>),
      prompt: t('aiGen.theme.systemsPrompt'),
    },
    {
      id: 'design', label: t('aiGen.theme.design'),
      icon: mkIcon(<><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></>),
      prompt: t('aiGen.theme.designPrompt'),
    },
    {
      id: 'strategy', label: t('aiGen.theme.strategy'),
      icon: mkIcon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>),
      prompt: t('aiGen.theme.strategyPrompt'),
    },
    {
      id: 'proposal', label: t('aiGen.theme.proposal'),
      icon: mkIcon(<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>),
      prompt: t('aiGen.theme.proposalPrompt'),
    },
    {
      id: 'framework', label: t('aiGen.theme.framework'),
      icon: mkIcon(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></>),
      prompt: t('aiGen.theme.frameworkPrompt'),
    },
    {
      id: 'data', label: t('aiGen.theme.data'),
      icon: mkIcon(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),
      prompt: t('aiGen.theme.dataPrompt'),
    },
  ]
}

// 履歴の保持日数（2026-05-15 単一有料プラン化）
// 有料: 長期保持（実質無制限。100日でフィルタ）/ 無料: そもそも生成できないので不要
function getHistoryDays(): number {
  return isPaid() ? 100 : 0
}

// 履歴フィルタリング（プランに応じた日数内のもののみ）
function filterByHistoryDays(problems: AIProblemSet[]): AIProblemSet[] {
  const days = getHistoryDays()
  if (days <= 0) return problems // 無料プラン: 過去ローカル保存分の表示は許容（生成は不可）
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
  // categoryMap のキーは lessonData の category (JP データ値)
  const categoryMap = new Map<string, { total: number; done: number; label: string }>()
  for (const lesson of Object.values(allLessons)) {
    const cat = lesson.category ?? t('aiGen.fallbackCategory')
    if (!categoryMap.has(cat)) categoryMap.set(cat, { total: 0, done: 0, label: categoryLabel(cat) })
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
  if (top.length === 0) return t('aiGen.recommend.fallbackPrompt')
  const cats = top.map(w => w.label).join(t('aiGen.recommend.connector'))
  const pl2 = loadPlacementResult()
  const level = pl2
    ? (pl2.deviation < 40
        ? t('aiGen.recommend.levelBeginner')
        : pl2.deviation < 55
          ? t('aiGen.recommend.levelIntermediate')
          : t('aiGen.recommend.levelAdvanced'))
    : t('aiGen.recommend.levelDefault')
  return t('aiGen.recommend.dynamicPrompt', { cats, level })
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
      <div style={{ background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', padding: '28px 24px 32px', width: '100%', maxWidth: 480 }}>
        {/* XP通知 */}
        <div style={{ background: `color-mix(in srgb, var(--brand) 9%, transparent)`, border: `1px solid color-mix(in srgb, var(--brand) 25%, transparent)`, borderRadius: 12, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={'var(--brand)'} stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>{t('aiGen.rating.xpEarned')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('aiGen.rating.xpDesc')}</div>
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{t('aiGen.rating.heading')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>{t('aiGen.rating.desc')}</div>
        {/* 星5つ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill={(hovered || rating) >= n ? 'var(--warm)' : 'none'} stroke={'var(--warm)'} strokeWidth="1.5" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          ))}
        </div>
        {/* コメント */}
        <textarea
          aria-label={t('aiGen.rating.commentAria')}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={t('aiGen.rating.commentPlaceholder')}
          rows={3}
          style={{ width: '100%', boxSizing: 'border-box', background: `color-mix(in srgb, var(--brand) 3%, transparent)`, border: `1px solid ${'var(--border)'}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 14 }}
        />
        <button
          onClick={() => rating > 0 ? onSubmit(rating, comment) : onSkip()}
          style={{ width: '100%', background: 'var(--brand)', color: 'var(--accent-fg)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
          {rating > 0 ? t('aiGen.rating.submit') : t('aiGen.rating.skip')}
        </button>
        <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
          {t('aiGen.rating.skip')}
        </button>
      </div>
    </div>
  )
}

type Tab = 'create' | 'history'

// プレイ画面遷移を跨いで pending 評価を保持するための sessionStorage キー
const PENDING_RATING_KEY = 'logic-ai-pending-rating'

export function AIProblemGenScreen({ onBack, onPlay, onUpgrade }: AIProblemGenScreenProps) {
  // 学習時間計測 — AI 問題生成画面の滞在時間を study_sessions に記録
  useStudyTimer({ type: 'ai_problem', id: 'generator' })
  const [tab, setTab] = useState<Tab>('create')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<AIProblemSet[]>(() => filterByHistoryDays(loadAIProblems()))
  // テーマプリセット押下時のワンクッション（サンプル問題リスト）用 state
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null)
  const weakness = analyzeWeakness()
  const recommendPrompt = buildRecommendPrompt(weakness)
  // 問題プレイ画面から戻ってきた時に評価ポップアップを表示する
  // AIProblemGenScreen は遷移で unmount されるため、handleGenerate で sessionStorage に
  // pending を保存し、再 mount 時に lazy initializer で読み戻して RatingPopup を起動する
  const initialPending = (() => {
    try {
      const raw = sessionStorage.getItem(PENDING_RATING_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as AIProblemSet
      if (parsed && typeof parsed.id === 'number') return parsed
      return null
    } catch {
      try { sessionStorage.removeItem(PENDING_RATING_KEY) } catch { /* noop */ }
      return null
    }
  })()
  const [showRating, setShowRating] = useState<boolean>(() => initialPending !== null)
  const [pendingProblem, setPendingProblem] = useState<AIProblemSet | null>(() => initialPending)

  // 2026-05-15 単一有料プラン化: 日次キャップは廃止（内部は無制限）
  const canUse = isPaid()
  const isAtLimit = false

  const planHeader = canUse
    ? t('aiGen.history.headerPaid')
    : t('aiGen.history.headerFree')
  const THEME_PRESETS = getThemePresets()

  const handleGenerate = async (targetPrompt?: string) => {
    const p = targetPrompt ?? prompt
    if (!p.trim() || generating) return
    if (!canUse || isAtLimit) return
    setGenerating(true)
    setError('')
    try {
      const newSet = await generateAIProblems(p)
      setProblems(filterByHistoryDays(loadAIProblems()))
      setPrompt('')
      // +10 XP（問題作成）
      addXP(10)
      // 問題解き終わり後に評価ポップアップを出すため pending を保存
      // プレイ画面遷移で本画面は unmount されるので、sessionStorage に永続化して
      // 戻ってきた時に lazy initializer 経由で復元する
      setPendingProblem(newSet)
      try {
        sessionStorage.setItem(PENDING_RATING_KEY, JSON.stringify(newSet))
      } catch {
        // sessionStorage が使えない環境では評価収集をスキップ
      }
      onPlay(newSet)
    } catch (e: unknown) {
      setError((e as Error).message || t('aiGen.errGenerationFailed'))
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
    try { sessionStorage.removeItem(PENDING_RATING_KEY) } catch { /* noop */ }
  }

  const handleDelete = (id: number) => {
    if (!confirm(t('aiGen.history.deleteConfirm'))) return
    deleteAIProblem(id)
    setProblems(filterByHistoryDays(loadAIProblems()))
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'create', label: t('aiGen.tab.create') },
    { id: 'history', label: t('aiGen.tab.history') },
  ]

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)',
      fontFamily: "'Noto Sans JP', sans-serif", display: 'flex', flexDirection: 'column',
    }}>
      <Header
        title={t('aiGen.title')}
        onBack={selectedTheme ? () => setSelectedTheme(null) : onBack}
        trailing={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'color-mix(in srgb, var(--brand) 15%, transparent)',
              color: 'var(--brand)',
              borderRadius: 99, padding: '2px 8px',
              fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
            }}>{t('aiGen.beta')}</span>
            {canUse ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>
                {t('aiGen.unlimited')}
              </div>
            ) : (
              <div style={{ background: 'rgba(248,113,113,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'var(--md-sys-color-error)' }}>
                {t('aiGen.upgradeRequired')}
              </div>
            )}
          </div>
        }
      />
      <div style={{ padding: '0 20px 4px', fontSize: 12, color: 'var(--text-secondary)' }}>{t('aiGen.subtitle')}</div>

      {/* タブ */}
      <div style={{ display: 'flex', padding: '16px 20px 0', gap: 6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all .15s',
            background: tab === t.id ? 'var(--brand)' : 'var(--bg-card)',
            color: tab === t.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* ===== 問題を作るタブ：サンプル問題リスト（テーマプリセット押下後） ===== */}
        {tab === 'create' && selectedTheme && (
          <SampleProblemList
            theme={selectedTheme}
            onPickSample={(seedPrompt) => handleGenerate(seedPrompt)}
            onAiGenerate={() => handleGenerate(selectedTheme.prompt)}
            disabled={generating || isAtLimit || !canUse}
            generating={generating}
            error={error}
          />
        )}

        {/* ===== 問題を作るタブ：通常表示 ===== */}
        {tab === 'create' && !selectedTheme && (
          <>
            {/* あなたにあった問題を自動生成（弱点ベース・ワンタップ） */}
            <button
              onClick={() => handleGenerate(recommendPrompt)}
              disabled={generating || isAtLimit || !canUse || !recommendPrompt}
              style={{ width: '100%', background: generating || isAtLimit || !canUse ? 'var(--bg-card)' : `linear-gradient(135deg, ${'var(--brand)'} 0%, var(--brand-light) 100%)`, color: generating || isAtLimit || !canUse ? 'var(--text-muted)' : 'var(--accent-fg)', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: generating || isAtLimit || !canUse ? 'none' : 'var(--shadow-v3-hero)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{t('aiGen.recommendBtn')}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{t('aiGen.recommendDesc')}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            {/* 自由テキスト入力（最上部） */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{t('aiGen.inputLabel')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{t('aiGen.inputDesc')}</div>
              <textarea
                aria-label={t('aiGen.inputAria')}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={t('aiGen.inputPlaceholder')}
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: `color-mix(in srgb, var(--brand) 3%, transparent)`, border: `1px solid ${'var(--border)'}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif" }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || generating || isAtLimit || !canUse}
                style={{ marginTop: 10, width: '100%', background: prompt.trim() && !generating && !isAtLimit && canUse ? 'var(--brand)' : 'var(--bg-card)', color: prompt.trim() && !generating && !isAtLimit && canUse ? 'var(--bg-primary)' : 'var(--text-muted)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: prompt.trim() && !generating && !isAtLimit && canUse ? 'pointer' : 'not-allowed' }}>
                {generating ? t('aiGen.generating') : !canUse ? t('aiGen.standardOnly') : t('aiGen.generateXp')}
              </button>
              {(!canUse || isAtLimit) && onUpgrade && (
                <button onClick={onUpgrade} style={{ width: '100%', marginTop: 8, background: 'transparent', border: `1px solid ${'var(--brand)'}`, color: 'var(--brand)', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {t('aiGen.upgradePlan')}
                </button>
              )}
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--md-sys-color-error)', textAlign: 'center' }}>{error}</div>}

            {/* テーマから選ぶ（下部） */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', marginBottom: 10 }}>{t('aiGen.categoryHeading')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {THEME_PRESETS.map(p => (
                  <button key={p.id} onClick={() => setSelectedTheme(p)} disabled={generating || isAtLimit || !canUse}
                    style={{ background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, borderRadius: 14, padding: '14px 12px', cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: generating || !canUse ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, var(--brand) 8%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* おすすめ（弱点ベース） */}
            {weakness.length > 0 && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', marginBottom: 14 }}>{t('aiGen.weaknessHeading')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {weakness.slice(0, 3).map((w) => {
                    const pct = Math.round(w.score * 100)
                    const barColor = pct < 35 ? 'var(--md-sys-color-error)' : pct < 55 ? 'var(--warning-mid)' : 'var(--brand)'
                    const tagBg = pct < 35 ? 'rgba(248,113,113,.15)' : pct < 55 ? 'rgba(251,191,36,.15)' : `color-mix(in srgb, var(--brand) 13%, transparent)`
                    const tagColor = pct < 35 ? 'var(--md-sys-color-error)' : pct < 55 ? 'var(--warning-mid)' : 'var(--brand)'
                    const tagLabel = pct < 35 ? t('aiGen.tagWeak') : pct < 55 ? t('aiGen.tagFocus') : t('aiGen.tagPracticing')
                    return (
                      <div key={w.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{w.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{w.completedCount}/{w.totalCount}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tagBg, color: tagColor }}>{tagLabel}</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: `color-mix(in srgb, var(--brand) 13%, transparent)`, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width .6s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 10px', background: `color-mix(in srgb, var(--brand) 6%, transparent)`, borderRadius: 8, borderLeft: `2px solid ${'var(--brand)'}`, marginBottom: 12, lineHeight: 1.6 }}>{recommendPrompt}</div>
                <button
                  onClick={() => handleGenerate(recommendPrompt)}
                  disabled={generating || isAtLimit || !canUse}
                  style={{ width: '100%', background: generating || isAtLimit || !canUse ? 'var(--bg-card)' : 'var(--brand)', color: generating || isAtLimit || !canUse ? 'var(--text-muted)' : 'var(--bg-primary)', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: generating || isAtLimit || !canUse ? 'not-allowed' : 'pointer' }}>
                  {generating ? t('aiGen.generating') : t('aiGen.generateForWeakness')}
                </button>
              </div>
            )}
          </>
        )}

        {/* ===== 履歴タブ ===== */}
        {tab === 'history' && (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              {planHeader}
            </div>
            {problems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'pre-line' }}>
                {t('aiGen.history.empty')}
              </div>
            ) : (
              problems.map(p => (
                <AiProblemRow
                  key={p.id}
                  problem={p}
                  onPlay={() => onPlay(p)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* 生成中の演出オーバーレイ（ステップ表示 + 思考アニメ） */}
      {generating && <ProblemGenLoader />}

      {/* 解き終わり後の評価ポップアップ（プレイ画面から戻ってきた時に表示） */}
      {showRating && (
        <RatingPopup
          onSubmit={handleRatingSubmit}
          onSkip={() => {
            setShowRating(false)
            setPendingProblem(null)
            try { sessionStorage.removeItem(PENDING_RATING_KEY) } catch { /* noop */ }
          }}
        />
      )}
    </div>
  )
}

// 難易度ラベル / バッジ色を解決
function diffLabel(d: SampleDifficulty): string {
  if (d === 'beginner') return t('aiGen.sample.diff.beginner')
  if (d === 'intermediate') return t('aiGen.sample.diff.intermediate')
  return t('aiGen.sample.diff.advanced')
}
const SAMPLE_DIFF_COLOR: Record<SampleDifficulty, string> = {
  beginner: '#34D399',
  intermediate: '#D97706',
  advanced: 'var(--md-sys-color-error)',
}

// テーマ別サンプル問題リスト（ワンクッション画面）
function SampleProblemList({
  theme,
  onPickSample,
  onAiGenerate,
  disabled,
  generating,
  error,
}: {
  theme: ThemePreset
  onPickSample: (seedPrompt: string) => void
  onAiGenerate: () => void
  disabled: boolean
  generating: boolean
  error: string
}) {
  const samples = SAMPLE_PROBLEMS[theme.id] ?? []
  const locale = getLocale()
  return (
    <>
      {/* テーマ見出し */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `color-mix(in srgb, var(--brand) 8%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {theme.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{theme.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t('aiGen.sample.subtitle')}</div>
        </div>
      </div>

      {/* AI におまかせ生成（従来の即生成挙動） */}
      <button
        onClick={onAiGenerate}
        disabled={disabled}
        style={{
          width: '100%',
          background: disabled ? 'var(--bg-card)' : `linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%)`,
          color: disabled ? 'var(--text-muted)' : 'var(--accent-fg)',
          border: 'none', borderRadius: 14, padding: '14px 18px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: disabled ? 'none' : 'var(--shadow-v3-hero)',
        }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{generating ? t('aiGen.generating') : t('aiGen.sample.aiGenerate')}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{t('aiGen.sample.aiGenerateDesc')}</div>
        </div>
      </button>

      {error && <div style={{ fontSize: 13, color: 'var(--md-sys-color-error)', textAlign: 'center' }}>{error}</div>}

      {/* サンプル問題一覧 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.06em', marginBottom: 10 }}>
          {t('aiGen.sample.heading')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onPickSample(sample.seedPrompt)}
              disabled={disabled}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: `1px solid var(--border)`,
                borderRadius: 12, padding: '12px 14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                opacity: disabled ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
              <span style={{
                flexShrink: 0,
                fontSize: 10, fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 99,
                background: `color-mix(in srgb, ${SAMPLE_DIFF_COLOR[sample.difficulty]} 14%, transparent)`,
                color: SAMPLE_DIFF_COLOR[sample.difficulty],
                letterSpacing: '.04em',
              }}>{diffLabel(sample.difficulty)}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {locale === 'ja' ? sample.title.ja : sample.title.en}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function AiProblemRow({ problem, onPlay, onDelete }: { problem: AIProblemSet; onPlay: () => void; onDelete: () => void }) {
  const [saved, setSaved] = useState<boolean>(() => isSaved('ai-problem', String(problem.id)))
  const handleToggleSave = () => {
    haptic.light()
    const next = toggleSaved({
      type: 'ai-problem',
      refId: String(problem.id),
      title: problem.title,
      subtitle: t('savedItems.typeAiProblem'),
    })
    setSaved(next)
  }
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{problem.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('aiGen.history.questionCount', { count: problem.steps?.length ?? 0, date: new Date(problem.createdAt).toLocaleDateString(getLocale() === 'ja' ? 'ja-JP' : 'en-US') })}</div>
      </div>
      <button
        type="button"
        onClick={handleToggleSave}
        aria-label={saved ? t('savedItems.unsaveProblemAria') : t('savedItems.saveProblemAria')}
        aria-pressed={saved}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: saved ? `color-mix(in srgb, var(--brand) 18%, transparent)` : 'transparent',
          border: 'none', padding: 0, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          color: saved ? 'var(--brand)' : 'var(--text-muted)',
        }}
      >
        {saved ? <BookmarkFilledIcon width={16} height={16} /> : <BookmarkIcon width={16} height={16} />}
      </button>
      <button onClick={onPlay} style={{ background: 'var(--brand)', color: 'var(--accent-fg)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>{t('aiGen.history.replay')}</button>
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }} aria-label={t('aiGen.history.deleteConfirm')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
      </button>
    </div>
  )
}

// 外部から解き終わりを通知するためのユーティリティ
export { type AIProblemSet }
