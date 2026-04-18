import { useMemo } from 'react'
import { CheckIcon, ArrowRightIcon } from '../icons'
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
  lessons: RoadmapLesson[]
}

const PATHS: RoadmapPath[] = [
  {
    id: 'fermi',
    label: t('home.category.fermi'),
    lessons: [
      { id: 25, title: '演繹法',              sub: '一般原則から個別の結論を導く思考法' },
      { id: 26, title: '帰納法',              sub: '個別事例から法則・パターンを見つける' },
      { id: 27, title: '形式論理',            sub: '「AならばB」の論理構造を理解する' },
      { id: 24, title: 'ケーススタディ総合演習', sub: 'フレームワークを使った実践的問題解決' },
    ],
  },
  {
    id: 'logic',
    label: t('home.category.logic'),
    lessons: [
      { id: 20, title: 'MECE — 漏れなくダブりなく', sub: '情報を正確に整理する基本フレームワーク' },
      { id: 21, title: 'ロジックツリー',             sub: '問題をツリー状に分解して原因・対策を探る' },
      { id: 22, title: 'So What / Why So',          sub: '「だから何？」「なぜ？」で論理を検証する' },
      { id: 23, title: 'ピラミッド原則',            sub: '結論から先に伝える論理的な話し方' },
    ],
  },
  {
    id: 'case',
    label: t('home.category.case'),
    lessons: [
      { id: 28, title: 'ケース面接入門',          sub: 'フレームワーク・仮説思考の実践' },
      { id: 29, title: 'プロフィタビリティケース', sub: '収益性問題の構造化と分析' },
    ],
  },
  {
    id: 'critical',
    label: 'クリティカルシンキング',
    lessons: [
      { id: 40, title: 'クリティカルシンキング入門', sub: '根拠をもとに自分の頭で判断する思考法' },
      { id: 41, title: '論理的誤謬を見破る',        sub: '一見正しそうな「嘘の論理」に気づく' },
      { id: 42, title: 'データを正しく読む',        sub: 'グラフ・統計の罠と正しい解釈' },
      { id: 43, title: '問いを立てる力',           sub: '良い問いが良い答えを生む' },
    ],
  },
]

const ACCENT = '#3B5BDB'
const ACCENT_BG = '#EEF2FF'
const ACCENT_LIGHT = '#DBE4FF'

interface RoadmapScreenProps {
  onOpenLesson: (lessonId: number) => void
}

export function RoadmapScreen({ onOpenLesson }: RoadmapScreenProps) {
  const completedSet = useMemo(() => {
    const raw = getCompletedLessons()
    const set = new Set<string>()
    raw.forEach(key => {
      set.add(key)
      set.add(key.replace(/^lesson-/, ''))
    })
    return set
  }, [])

  return (
    <div style={{ padding: '0 0 80px' }}>
      {/* ページヘッダー */}
      <div style={{ padding: '20px 16px 4px' }}>
        <h1 style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 900, color: ACCENT, letterSpacing: '-.03em', margin: 0 }}>学習パス</h1>
        <p style={{ fontSize: 13, color: '#7A849E', marginTop: 4 }}>順番に進めると体系的に身につきます</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 16px 0' }}>
        {PATHS.map((path) => {
          const completedCount = path.lessons.filter(l => completedSet.has(String(l.id))).length
          const pct = Math.round((completedCount / path.lessons.length) * 100)
          const allDone = completedCount === path.lessons.length

          return (
            <div
              key={path.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: `1px solid ${allDone ? ACCENT_LIGHT : '#E2E8FF'}`,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15,21,35,.06)',
              }}
            >
              {/* セクションヘッダー */}
              <div style={{ padding: '14px 18px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0F1523', letterSpacing: '-.01em' }}>
                    {path.label}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: allDone ? '#fff' : ACCENT,
                    background: allDone ? ACCENT : ACCENT_BG,
                    borderRadius: 99, padding: '2px 9px',
                  }}>
                    {completedCount} / {path.lessons.length}
                  </span>
                </div>
                {/* プログレスバー */}
                <div style={{ height: 4, borderRadius: 99, background: '#E8EEFF', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: ACCENT, borderRadius: 99,
                    transition: 'width 400ms ease',
                  }} />
                </div>
              </div>

              {/* レッスン一覧 */}
              <div style={{ borderTop: '1px solid #F0F4FF' }}>
                {path.lessons.map((lesson, idx) => {
                  const done = completedSet.has(String(lesson.id))

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onOpenLesson(lesson.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        width: '100%', padding: '13px 18px',
                        background: 'transparent', border: 'none',
                        borderTop: idx === 0 ? 'none' : '1px solid #F0F4FF',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 120ms',
                      }}
                    >
                      {/* ステップインジケーター */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? ACCENT : ACCENT_BG,
                        border: `2px solid ${done ? ACCENT : ACCENT_LIGHT}`,
                      }}>
                        {done
                          ? <CheckIcon width={14} height={14} color="#fff" />
                          : <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT }}>{idx + 1}</span>
                        }
                      </div>

                      {/* テキスト */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: done ? 500 : 700,
                          color: done ? '#7A849E' : '#0F1523',
                          textDecoration: done ? 'line-through' : 'none',
                          letterSpacing: '-.01em',
                        }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#7A849E', marginTop: 2, lineHeight: 1.4 }}>
                          {lesson.sub}
                        </div>
                      </div>

                      <ArrowRightIcon width={15} height={15} color="#B0B8CC" />
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
