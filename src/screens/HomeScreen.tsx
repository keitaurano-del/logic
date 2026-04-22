import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { getStreak, getCompletedCount, getCompletedLessons, getStudyDates } from '../stats'
import { loadPlacementResult, rankLabel as rankLabelFull } from '../placementData'

function rankLabel(dev: number): string {
  return rankLabelFull(dev).label
}
import { ArrowRightIcon, BarChartIcon, BrainIcon, BriefcaseIcon, FlameIcon, StarIcon, TrendingUpIcon, ZapIcon } from '../icons'
import { Button } from '../components/Button'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { isAdmin } from '../admin'
import {
  getPoints,
  getStreakState,
  hoursUntilMidnight,
  timeBasedGreeting,
  getLevelTitle,
  getCurrentTier,
} from './homeHelpers'
import { getLocale, t } from '../i18n'
import { isDailyFermiDone } from './DailyFermiScreen'

interface HomeScreenProps {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory: (category: 'fermi' | 'logic' | 'case' | 'thinking') => void
  onOpenRank: () => void
  onOpenDeviation: () => void
  onOpenRanking: () => void
  onOpenStreak: () => void
  onOpenRoleplay: () => void
  onOpenFlashcards: () => void
  onOpenPricing: () => void
  onOpenAIGen: () => void
  onOpenFeedback: () => void
  onNavigateToDailyFermi?: () => void
  onOpenRoadmap?: () => void
  onOpenStats?: () => void
  onOpenProfile?: () => void
  onOpenAIProblemGen?: () => void
}

type Category = {
  id: 'fermi' | 'logic' | 'case' | 'thinking'
  icon: ReactNode
  name: string
  lessonIds: number[]
}

const ALL_CATEGORIES: (Category & { adminOnly?: boolean })[] = [
  { id: 'logic', icon: <BrainIcon width={22} height={22} />,     name: t('home.category.logic'), lessonIds: [20, 21, 22, 23, 25, 26, 27, 24] },
  { id: 'case',  icon: <BriefcaseIcon width={22} height={22} />, name: t('home.category.case'),  lessonIds: [28, 29, 35, 36] },
  { id: 'thinking', icon: <ZapIcon width={22} height={22} />,    name: '思考法', lessonIds: [40, 41, 42, 43, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67] },
]



const CATEGORIES = ALL_CATEGORIES.filter((c) => isAdmin() || !c.adminOnly)

interface DerivedData {
  streak: number
  streakState: 'none' | 'active' | 'at-risk'
  completed: number
  completedSet: Set<string>
  points: number
  deviation: number | null
  rankFill: number
  eyebrow: string
  greeting: string
  recovery: { hours: number; minutes: number }
  level: number
  levelXp: number
  levelPct: number
  xp: number
  weekProgress: number
  weekPct: number
}

function useHomeData(): DerivedData {
  const streak = getStreak()
  const streakState = getStreakState()
  const completed = getCompletedCount()
  const completedSet = useMemo(() => new Set(getCompletedLessons()), [])
  const placement = loadPlacementResult()
  const points = getPoints()
  const deviation = placement?.deviation ?? null
  const rankFill = deviation != null ? Math.min(100, Math.max(0, ((deviation - 25) / 50) * 100)) : 0
  const { eyebrow, greeting } = timeBasedGreeting(getLocale())
  const recovery = hoursUntilMidnight()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1
  const levelXp = xp % 1000
  const levelPct = (levelXp / 1000) * 100
  const weekProgress = Math.min(7, streak)
  const weekPct = (weekProgress / 7) * 100
  return {
    streak, streakState, completed, completedSet, points, deviation, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekProgress, weekPct,
  }
}

export function HomeScreen(props: HomeScreenProps) {
  const isDesktop = useIsDesktop()
  const data = useHomeData()
  const levelTitle = getLevelTitle(data.xp, getLocale())
  return isDesktop
    ? <HomeDesktop {...props} data={data} levelTitle={levelTitle} />
    : <HomeMobile {...props} data={data} levelTitle={levelTitle} />
}

// ============================================================
// Mobile layout (matches mocks/logic-v3/mobile/home.html)
// ============================================================
function HomeMobile({
  onOpenLesson,
  onOpenCategory,
  onOpenRoleplay,
  onOpenAIGen,
  onNavigateToDailyFermi,
  onOpenRoadmap,
  onOpenAIProblemGen,
  onOpenRank,
  onOpenStats,
  data,
}: HomeScreenProps & { data: DerivedData; levelTitle: string }) {
  const {
    streak, completedSet, points, deviation, recovery, xp, level, levelXp, levelPct,
  } = data

  const tier = getCurrentTier(xp)
  const nextXpThreshold = xp < 1000 ? 1000 : xp < 2000 ? 2000 : xp < 3000 ? 3000 : xp < 4000 ? 4000 : xp < 5000 ? 5000 : xp < 6000 ? 6000 : xp < 7000 ? 7000 : 8000
  const xpToNext = Math.max(0, nextXpThreshold - xp)

  const todayDow = (new Date().getDay() + 6) % 7 // 0=月, 1=火, ..., 5=土, 6=日
  const weekDays = ['月', '火', '水', '木', '金', '土']

  // 今週（月曜始まり）の各日付を生成してstudyDatesと照合
  const studyDateSet = useMemo(() => new Set(getStudyDates()), [])
  const thisWeekDates = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - todayDow)
    return weekDays.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [todayDow])

  const PATHS = [
    {
      id: 'logic' as const,
      name: 'ロジカルシンキング',
      lessonIds: [20, 21, 22, 23, 25, 26, 27, 24],
      firstId: 20,
      iconBg: '#EEF2FF',
      iconBorder: '#DBE4FF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B5BDB"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
      ),
    },
    {
      id: 'case' as const,
      name: 'ケース面接',
      lessonIds: [28, 29, 35, 36],
      firstId: 28,
      iconBg: '#FFF7ED',
      iconBorder: '#FED7AA',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#F79009"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke="#F79009" strokeWidth="2"/><line x1="12" y1="12" x2="12" y2="16" stroke="white" strokeWidth="2"/><line x1="10" y1="14" x2="14" y2="14" stroke="white" strokeWidth="2"/></svg>
      ),
    },
    {
      id: 'thinking' as const,
      name: '思考法',
      lessonIds: [40, 41, 42, 43, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
      firstId: 50,
      iconBg: '#F0FDF4',
      iconBorder: '#BBF7D0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#16A34A"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      ),
    },
  ]


  return (
    <div style={{ background: '#F0F4FF' }}>

      {/* ── ナビバー ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 12px', background: 'rgba(240,244,255,.95)', borderBottom: '1px solid #E2E8FF' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: '#3B5BDB', letterSpacing: '-.04em' }}>Logic</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EEF2FF', border: '1px solid #DBE4FF', borderRadius: 99, padding: '5px 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M12 2c0 0-5 4-5 10a5 5 0 0 0 10 0c0-6-5-10-5-10zm0 14a2 2 0 0 1-2-2c0-2 2-4 2-4s2 2 2 4a2 2 0 0 1-2 2z"/></svg>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#3B5BDB' }}>{streak}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#748FFC' }}>日連続</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: 'linear-gradient(135deg, #3B5BDB, #748FFC)' }} />
        </div>
      </div>

      {/* ── スクロールエリア ── */}
      <div style={{ padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>

        {/* 初回ユーザー導線 */}
        {completedSet.size === 0 && (
          <button
            onClick={() => onOpenLesson(20)}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              borderRadius: 20, padding: '20px', border: 'none',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.1)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', marginBottom: 4 }}>
              まずはこの1問を解いてみよう！
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,.8)', marginBottom: 14 }}>
              MECE—論理的思考の基本を、3分で学べます
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: '10px 16px', fontSize: 16, fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              レッスンを始める →
            </div>
          </button>
        )}

        {/* 今日の一問カード */}
        {isDailyFermiDone() ? (
          <div
            onClick={() => onNavigateToDailyFermi ? onNavigateToDailyFermi() : onOpenCategory('fermi')}
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', borderRadius: 28, padding: '22px 20px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', right: -48, top: -48, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>今日の一問</div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.025em' }}>クリア済み ✓</div>
              </div>
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>お見事！明日もチャレンジしよう 💪</div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,.2)', borderRadius: 14, padding: 12, fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              フィードバックを見る
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigateToDailyFermi ? onNavigateToDailyFermi() : onOpenCategory('fermi')}
            style={{ background: '#3B5BDB', borderRadius: 28, padding: '22px 20px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', right: -48, top: -48, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 20, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#93C5FD' }} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>今日の一問</span>
            </div>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.4, letterSpacing: '-.025em', marginBottom: 6 }}>
              {t('home.fermiQuestion')}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>フェルミ推定</span>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.3)' }} />
              <span>レベル 2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,.2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((1 - (recovery.hours * 60 + recovery.minutes) / (24 * 60)) * 100)}%`, background: 'rgba(255,255,255,.6)', borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.45)', whiteSpace: 'nowrap' }}>
                残り {recovery.hours}h {recovery.minutes}m
              </div>
            </div>
            <div style={{ width: '100%', background: '#fff', borderRadius: 14, padding: 14, fontSize: 18, fontWeight: 700, color: '#3B5BDB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              チャレンジする
            </div>
          </div>
        )}

        {/* 哲学者ランクカード */}
        <button
          onClick={onOpenRank}
          style={{
            background: 'linear-gradient(135deg, #1E2D6B 0%, #3B5BDB 60%, #748FFC 100%)',
            borderRadius: 20,
            padding: '18px 20px',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(59,91,219,.35)',
          }}
        >
          {/* 背景装飾 */}
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 1 }}>哲学者ランク</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-.025em', fontFamily: "'Inter Tight', sans-serif" }}>
                  Lv.{level} · {getLocale() === 'ja' ? tier.title : tier.titleEn}
                </div>
              </div>
            </div>
            <div onClick={onOpenRank} style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 99, padding: '5px 12px', fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              詳細 →
            </div>
          </div>

          {/* XPバー */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>経験値</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>{levelXp} / 1,000</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${levelPct}%`, background: '#fff', borderRadius: 99, boxShadow: '0 0 8px rgba(255,255,255,.5)' }} />
            </div>
          </div>

          {xpToNext > 0 && (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
              次のランクまで {xpToNext}
            </div>
          )}
        </button>

        {/* Stats 3グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {([
            { value: `${streak}日`, label: '連続学習', blue: true },
            { value: String(points), label: '偏差値', blue: true },
            { value: deviation != null ? String(Math.round(deviation)) : '—', label: '偏差値', blue: false },
          ] as { value: string; label: string; blue: boolean }[]).map(({ value, label, blue }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1, color: blue ? '#3B5BDB' : '#0F1523' }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#7A849E', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 今週の記録 */}
        <div style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523', letterSpacing: '-.02em' }}>今週の記録</div>
            <div onClick={onOpenStats} style={{ fontSize: 14, fontWeight: 600, color: '#3B5BDB', cursor: 'pointer' }}>詳細</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weekDays.map((day, i) => {
              const isDone = studyDateSet.has(thisWeekDates[i])
              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: isDone ? '#EEF2FF' : '#E8EEFF', border: isDone ? '1.5px solid #DBE4FF' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#7A849E' }}>{day}</div>
                </div>
              )
            })}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3B5BDB', boxShadow: '0 2px 8px rgba(59,91,219,.4)' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3B5BDB' }}>今日</div>
            </div>
          </div>
        </div>

        {/* 学習パス */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 800, color: '#0F1523' }}>学習パス</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#3B5BDB', cursor: 'pointer' }} onClick={() => onOpenRoadmap && onOpenRoadmap()}>すべて</div>
          </div>
          {PATHS.map((path) => {
            const total = path.lessonIds.length
            const done = path.lessonIds.filter(id => completedSet.has(`lesson-${id}`)).length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div
                key={path.id}
                onClick={() => onOpenLesson(path.firstId)}
                style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: path.iconBg, border: `1px solid ${path.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {path.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', letterSpacing: '-.01em', marginBottom: 2 }}>{path.name}</div>
                  <div style={{ fontSize: 14, color: '#7A849E' }}>{total} レッスン</div>
                  <div style={{ marginTop: 7 }}>
                    <div style={{ height: 4, background: '#E8EEFF', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#3B5BDB', borderRadius: 99 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: pct > 0 ? '#3B5BDB' : '#7A849E' }}>{pct > 0 ? `${pct}%` : '未開始'}</div>
                      <div style={{ fontSize: 13, color: '#7A849E' }}>{done} / {total}</div>
                    </div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8BFD0" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            )
          })}
        </div>

        {/* 練習グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div onClick={() => onOpenRoleplay()} style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: 16, cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF2FF', border: '1px solid #DBE4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B5BDB"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', letterSpacing: '-.01em' }}>ロールプレイ</div>
            <div style={{ fontSize: 14, color: '#7A849E', marginTop: 2 }}>AI対話練習</div>
          </div>
          <div onClick={() => onOpenAIProblemGen ? onOpenAIProblemGen() : onOpenAIGen()} style={{ background: '#fff', border: '1px solid #E2E8FF', borderRadius: 14, padding: 16, cursor: 'pointer', boxShadow: '0 1px 2px rgba(15,21,35,.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#7C3AED"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523', letterSpacing: '-.01em' }}>AI 問題生成</div>
            <div style={{ fontSize: 14, color: '#7A849E', marginTop: 2 }}>テーマを指定</div>
            {/* Premiumバッジ: BETA_MODE時は非表示 */}
          </div>
        </div>

      </div>

    </div>
  )
}



// ============================================================
// Desktop layout (matches mocks/logic-v3/desktop/home.html)
// ============================================================
function HomeDesktop({
  userName,
  onOpenLesson,
  onOpenCategory,
  onOpenRank,
  onOpenDeviation,
  onOpenRanking,
  onOpenRoleplay,
  onOpenFlashcards: _onOpenFlashcards,
  onOpenAIGen,
  onOpenFeedback,
  data,
  levelTitle,
}: HomeScreenProps & { data: DerivedData; levelTitle: string }) {
  const {
    streak, streakState, completedSet, points, deviation, rankFill,
    eyebrow, greeting, recovery, level, levelXp, levelPct, xp, weekPct,
  } = data

  return (
    <>
      <header className="hero-greeting">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{greeting}{t('home.greetingSep')}{userName}</h1>
        <p className="hero-greeting-sub">{t('home.subtitleLong')}</p>
      </header>

      <div className="hero-grid">
        <section className="streak-card">
          <div className="streak-top">
            <div className="streak-icon"><FlameIcon width={24} height={24} /></div>
            <div>
              <div className="streak-num">{streak}</div>
              <div className="streak-label">{t('home.dayStreakLabel')}</div>
            </div>
          </div>
          <div className="streak-bar-wrap">
            <div className="streak-bar-fill" style={{ width: `${weekPct}%` }} />
          </div>
          <div className="streak-meta">
            <span>{t('home.thisWeek')}</span>
            <span>{t('home.weekProgress', { n: Math.min(7, streak) })}</span>
          </div>
          {streakState === 'at-risk' && (
            <div className="recovery-banner">
              <div className="recovery-icon"><ZapIcon width={16} height={16} /></div>
              <div className="recovery-text">
                <b>{t('home.streakProtectionLabel')}</b> · {t('home.streakRecovery', { hours: recovery.hours, minutes: recovery.minutes })}
              </div>
            </div>
          )}
        </section>

        <section className="featured-card">
          <div>
            <span className="featured-tag">{t('home.todaysChallenge')}</span>
          </div>
          <div className="featured-q">
            {t('home.fermiQuestion')}
          </div>
          <Button variant="primary" size="lg" block onClick={() => onOpenCategory('fermi')}>
            {t('home.startLesson')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        </section>
      </div>

      <div className="stats-row">
        <button className="stat-pill" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
          <div className="icon-box"><StarIcon width={18} height={18} /></div>
          <div>
            <div className="lbl">{t('profile.points')}</div>
            <div className="val">{points.toLocaleString()}</div>
            <div className="delta">{t('home.pointsToday', { n: Math.max(0, points % 200) })}</div>
          </div>
        </button>
        {deviation != null ? (
          <button className="stat-pill" onClick={onOpenDeviation} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <div className="icon-box"><TrendingUpIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">{t('ranking.deviationLabel')}</div>
              <div className="val">{deviation.toFixed(1)}</div>
              <div className="delta">{t('home.placementDone')}</div>
            </div>
          </button>
        ) : (
          <button className="stat-pill" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
            <div className="icon-box"><BarChartIcon width={18} height={18} /></div>
            <div>
              <div className="lbl">ポイント</div>
              <div className="val">{xp.toLocaleString()}</div>
              <div className="delta">{t('home.totalEarned')}</div>
            </div>
          </button>
        )}
        {deviation != null ? (
          <button className="rank-card" onClick={onOpenRanking} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
            <div className="rank-eyebrow">{t('home.nationalRanking')}</div>
            <div className="rank-row">
              <div className="rank-num">
                {deviation.toFixed(1)}
              </div>
              <div>
                <div className="rank-meta-top">偏差値</div>
                <div className="rank-meta-sub">{rankLabel(deviation)}</div>
              </div>
            </div>
            <div className="rank-bar">
              <div className="rank-bar-fill" style={{ width: `${rankFill}%` }} />
            </div>
          </button>
        ) : (
          <button className="rank-card" onClick={onOpenRanking} style={{ cursor: 'pointer', opacity: 0.6, border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
            <div className="rank-eyebrow">{t('home.nationalRanking')}</div>
            <div className="rank-meta-top">{t('home.placementIncomplete')}</div>
          </button>
        )}
      </div>

      <button className="level-section" onClick={onOpenRank} style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, textAlign: 'left', display: 'flex', alignItems: 'center', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">{t('home.levelProgress')}</div>
          <div className="level-name">Lv.{level} · {levelTitle}</div>
          <div className="progress" style={{ marginTop: 10, maxWidth: 600 }}>
            <div className="progress-fill" style={{ width: `${levelPct}%` }} />
          </div>
        </div>
        <div className="level-xp">{levelXp} / 1,000</div>
      </button>

      <section>
        <div className="section-head">
          <h2>{t('home.categories')}</h2>
          <button className="link-btn" onClick={() => onOpenCategory('logic')}>{t('home.viewAll')}</button>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c) => {
            const done = c.lessonIds.filter((id) => completedSet.has(`lesson-${id}`)).length
            const total = c.lessonIds.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button
                key={c.id}
                className="cat-card"
                onClick={() => {
                  if (c.lessonIds.length > 0) onOpenLesson(c.lessonIds[0])
                  else onOpenCategory(c.id)
                }}
              >
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-meta-row">
                  <span>{done} / {total}</span>
                  <span>{pct}%</span>
                </div>
                <div className="cat-progress">
                  <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── トレーニングメニュー（デスクトップ） ── */}
      <section>
        <div className="section-head">
          <h2>練習メニュー</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'ロールプレイ', sub: 'AI対話練習', emoji: '💬', onClick: onOpenRoleplay, bg: '#EEF2FE', color: '#1E3A8A' },
            { label: 'AI問題生成', sub: 'プレミアム', emoji: '✨', onClick: onOpenAIGen, bg: '#F5F3FF', color: '#5B21B6' },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} style={{
              background: item.bg, border: 'none', borderRadius: 16,
              padding: '20px', cursor: 'pointer', textAlign: 'left',
              transition: 'transform 120ms ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.color, letterSpacing: '-0.01em' }}>{item.label}</div>
              <div style={{ fontSize: 14, color: item.color, opacity: 0.65, marginTop: 4 }}>{item.sub}</div>
            </button>
          ))}
        </div>
      </section>
        {/* SCRUM-86: ベータフィードバックバナー */}
        <div
          onClick={onOpenFeedback}
          style={{
            marginTop: 4,
            padding: '16px 20px',
            background: 'var(--brand-soft)',
            border: '1px solid var(--brand)',
            borderRadius: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--brand)', marginBottom: 2, letterSpacing: '0.08em' }}>ベータ版</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>ご意見・ご要望を教えてください</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 2 }}>アプリ改善のフィードバックをお待ちしています</div>
          </div>
          <div style={{ fontSize: 22, color: 'var(--brand)', fontWeight: 700, marginLeft: 16 }}>→</div>
        </div>
    </>
  )
}
