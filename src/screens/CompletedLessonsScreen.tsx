import { useMemo } from 'react'
import { getCompletedLessons } from '../stats'
import { ArrowLeftIcon, CheckCircleIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

interface CompletedLessonsScreenProps {
  onBack: () => void
}

interface LessonMeta { name: string; category: string }

const LESSON_MAP: Record<string, LessonMeta> = {
  'lesson-20': { name: 'MECE — 漏れなくダブりなく', category: 'ロジカルシンキング' },
  'lesson-21': { name: 'ロジックツリー',              category: 'ロジカルシンキング' },
  'lesson-22': { name: 'So What / Why So',              category: 'ロジカルシンキング' },
  'lesson-23': { name: 'ピラミッド原則',              category: 'ロジカルシンキング' },
  'lesson-24': { name: 'ケーススタディ総合演習',      category: 'ロジカルシンキング' },
  'lesson-25': { name: '演繹法',                    category: 'ロジカルシンキング' },
  'lesson-26': { name: '帰納法',                    category: 'ロジカルシンキング' },
  'lesson-27': { name: '形式論理',                  category: 'ロジカルシンキング' },
  'lesson-28': { name: 'ケース面接入門',            category: 'ケース面接' },
  'lesson-29': { name: 'プロフィタビリティケース',  category: 'ケース面接' },
  'lesson-35': { name: '市場参入ケース',            category: 'ケース面接' },
  'lesson-36': { name: 'M&Aケース',                category: 'ケース面接' },
  'lesson-40': { name: 'クリティカルシンキング入門',  category: 'クリティカルシンキング' },
  'lesson-41': { name: '論理的誤謬を見破る',        category: 'クリティカルシンキング' },
  'lesson-42': { name: 'データを正しく読む',        category: 'クリティカルシンキング' },
  'lesson-43': { name: '問いを立てる力',           category: 'クリティカルシンキング' },
  'fermi':          { name: 'フェルミ推定',      category: 'AI練習' },
  'daily-problem':  { name: '今日の問題',        category: 'デイリー' },
  'flashcards':     { name: 'フラッシュカード',  category: '復習' },
  'placement-test': { name: 'プレイスメントテスト', category: 'テスト' },
}

const CAT_ORDER = ['ロジカルシンキング', 'ケース面接', 'クリティカルシンキング', 'AI練習', 'デイリー', '復習', 'テスト']

function catColor(cat: string): string {
  const map: Record<string, string> = {
    'ロジカルシンキング': 'var(--brand)',
    'フェルミ推定':       '#7C3AED',
    'ケース面接':         '#0891B2',
    'クリティカルシンキング': '#059669',
    'AI練習':             '#D97706',
    'デイリー':           '#DC2626',
    '復習':               '#6366F1',
    'テスト':             '#374151',
  }
  return map[cat] ?? 'var(--brand)'
}

export function CompletedLessonsScreen({ onBack }: CompletedLessonsScreenProps) {
  const keys = useMemo(() => getCompletedLessons(), [])

  // Group by category, preserve CAT_ORDER
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of keys) {
      const meta = LESSON_MAP[key]
      const cat = meta?.category ?? 'その他'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(key)
    }
    // Sort by CAT_ORDER then append any remaining categories
    const ordered: [string, string[]][] = []
    for (const cat of CAT_ORDER) {
      if (map.has(cat)) ordered.push([cat, map.get(cat)!])
    }
    for (const [cat, list] of map) {
      if (!CAT_ORDER.includes(cat)) ordered.push([cat, list])
    }
    return ordered
  }, [keys])

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('completed.title')}</div>
      </div>

      {/* Count hero */}
      <div style={{ textAlign: 'center', padding: 'var(--s-5) 0 var(--s-3)' }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--brand)' }}>
          {keys.length}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 'var(--s-2)', fontWeight: 600 }}>
          {t('completed.lessonsDone')}
        </div>
      </div>

      {keys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--s-7) var(--s-5)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14 }}>{t('completed.empty')}</div>
        </div>
      ) : (
        grouped.map(([cat, catKeys]) => (
          <div key={cat}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: catColor(cat),
              padding: 'var(--s-2) 0 var(--s-2)',
            }}>
              {cat}
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {catKeys.map((key, i) => {
                const meta = LESSON_MAP[key]
                const name = meta?.name ?? key
                return (
                  <div key={key}>
                    {i > 0 && <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--s-3) var(--s-4)', gap: 'var(--s-3)' }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>
                        <CheckCircleIcon width={18} height={18} />
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
