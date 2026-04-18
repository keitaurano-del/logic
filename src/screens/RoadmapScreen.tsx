import { useMemo } from 'react'
import { CheckIcon, ArrowRightIcon, LockIcon } from '../icons'
import { getCompletedLessons } from '../stats'
import { t } from '../i18n'

interface RoadmapLesson {
  id: number
  title: string
  sub: string
}

interface RoadmapPath {
  id: string
  label: string
  color: string
  accentColor: string
  bgColor: string
  lessons: RoadmapLesson[]
}

const PATHS: RoadmapPath[] = [
  {
    // ロジカルシンキング基礎 (id: 20-23)
    id: 'fermi',
    label: t('home.category.fermi'),
    color: 'var(--warning)',
    accentColor: '#F59E0B',
    bgColor: '#FFF7ED',
    lessons: [
      { id: 25, title: '演繹法',         sub: '一般原則から個別の結論を導く思考法' },
      { id: 26, title: '帰納法',         sub: '個別事例から法則・パターンを見つける' },
      { id: 27, title: '形式論理',       sub: '「AならばB」の論理構造を理解する' },
      { id: 24, title: 'ケーススタディ総合演習', sub: 'フレームワークを使った実践的問題解決' },
    ],
  },
  {
    // ロジカルシンキング (id: 20-23)
    id: 'logic',
    label: t('home.category.logic'),
    color: 'var(--primary)',
    accentColor: '#3D5FC4',
    bgColor: '#EEF2FE',
    lessons: [
      { id: 20, title: 'MECE — 漏れなくダブりなく',    sub: '情報を正確に整理する基本フレームワーク' },
      { id: 21, title: 'ロジックツリー',                sub: '問題をツリー状に分解して原因・対策を探る' },
      { id: 22, title: 'So What / Why So',             sub: '「だから何？」「なぜ？」で論理を検証する' },
      { id: 23, title: 'ピラミッド原則',               sub: '結論から先に伝える論理的な話し方' },
    ],
  },
  {
    id: 'case',
    label: t('home.category.case'),
    color: '#10B981',
    accentColor: '#10B981',
    bgColor: '#F0FDF4',
    lessons: [
      { id: 28, title: 'ケース面接入門',     sub: 'フレームワーク・仮説思考の実践' },
      { id: 29, title: 'プロフィタビリティケース', sub: '収益性問題の構造化と分析' },
    ],
  },
  {
    id: 'critical',
    label: 'クリティカルシンキング',
    color: '#7C3AED',
    accentColor: '#7C3AED',
    bgColor: '#F5F3FF',
    lessons: [
      { id: 40, title: 'クリティカルシンキング入門', sub: '根拠をもとに自分の頭で判断する思考法' },
      { id: 41, title: '論理的誤謬を見破る',         sub: '一見正しそうな「嘘の論理」に気づく' },
      { id: 42, title: 'データを正しく読む',         sub: 'グラフ・統計の罠と正しい解釈' },
      { id: 43, title: '問いを立てる力',             sub: '良い問いが良い答えを生む' },
    ],
  },
]

interface RoadmapScreenProps {
  onOpenLesson: (lessonId: number) => void
}

export function RoadmapScreen({ onOpenLesson }: RoadmapScreenProps) {
  const completedSet = useMemo(() => {
    const raw = getCompletedLessons() // ["lesson-22", "lesson-20", ...]
    const set = new Set<string>()
    raw.forEach(key => {
      set.add(key)            // "lesson-22"
      set.add(key.replace(/^lesson-/, '')) // "22"
    })
    return set
  }, [])

  return (
    <div className="stack">
      <header>
        <div className="eyebrow">LEARN</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>学習パス</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          順番に進めると体系的に身につきます
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {PATHS.map((path) => {
          const completedCount = path.lessons.filter((l) =>
            completedSet.has(String(l.id))
          ).length
          const pct = Math.round((completedCount / path.lessons.length) * 100)

          return (
            <div
              key={path.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {/* Path header */}
              <div
                style={{
                  padding: '16px 20px 14px',
                  background: path.bgColor,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: path.accentColor }}>
                    {path.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: path.accentColor }}>
                    {completedCount} / {path.lessons.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{
                  height: 6, borderRadius: 99,
                  background: 'rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: path.accentColor,
                    borderRadius: 99,
                    transition: 'width 400ms ease',
                  }} />
                </div>
              </div>

              {/* Lesson steps */}
              <div>
                {path.lessons.map((lesson, idx) => {
                  const done = completedSet.has(String(lesson.id))
                  const locked = false // すべて開放

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !locked && onOpenLesson(lesson.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                        padding: '14px 20px',
                        background: 'transparent',
                        border: 'none',
                        borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                        cursor: locked ? 'default' : 'pointer',
                        textAlign: 'left',
                        opacity: locked ? 0.45 : 1,
                        transition: 'background 120ms',
                      }}
                    >
                      {/* Step indicator */}
                      <div style={{
                        width: 32, height: 32,
                        borderRadius: '50%',
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done
                          ? path.accentColor
                          : locked
                          ? 'var(--bg-secondary)'
                          : path.bgColor,
                        border: done
                          ? `2px solid ${path.accentColor}`
                          : `2px solid ${locked ? 'var(--border)' : path.accentColor}`,
                      }}>
                        {done ? (
                          <CheckIcon width={16} height={16} color="white" />
                        ) : locked ? (
                          <LockIcon width={14} height={14} color="var(--text-muted)" />
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 800, color: path.accentColor }}>
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 700,
                          color: done ? 'var(--text-secondary)' : 'var(--text)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                          {lesson.sub}
                        </div>
                      </div>

                      {/* Arrow */}
                      {!locked && (
                        <ArrowRightIcon width={16} height={16} color="var(--text-muted)" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
