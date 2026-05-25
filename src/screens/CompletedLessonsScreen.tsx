import { useMemo } from 'react'
import { getCompletedLessons } from '../stats'
import { getAllCompletionCounts } from '../db/completionCountDb'
import { CompletionBadge } from '../components/CompletionBadge'
import { Header } from '../components/platform/Header'
import { allLessons } from '../lessonData'
import { t } from '../i18n'

// データキー (LESSON_MAP の category) → 表示ラベル翻訳キー解決
// カテゴリの「内部キー」は日本語で固定。表示時に t() で翻訳する。
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
  'フェルミ推定': 'category.fermi',
  '履歴書・職務経歴書': 'category.careerResume',
  'SPI対策': 'category.careerSpi',
  '玉手箱対策': 'category.careerTamatebako',
  '面接対策': 'category.careerInterview',
  '給与交渉・退職実務': 'category.careerSalary',
  '認知科学': 'category.cognitive',
  'ドキュメンテーション': 'category.documentation',
  'AI練習': 'completed.cat.aiPractice',
  'デイリー': 'completed.cat.daily',
  '復習': 'completed.cat.review',
  'テスト': 'completed.cat.test',
}
function categoryLabel(cat: string): string {
  const key = CATEGORY_LABEL_KEY[cat]
  return key ? t(key) : cat
}

// 特殊キー（レッスン以外）の表示名翻訳マップ
const SPECIAL_NAME_KEY: Record<string, string> = {
  'fermi': 'completed.specialName.fermi',
  'daily-problem': 'completed.specialName.daily',
  'flashcards': 'completed.specialName.flashcards',
  'placement-test': 'completed.specialName.placementTest',
}

/**
 * "lesson-20" のような key からレッスン表示名を取得。
 * lessonData.allLessons は ja/en で自動切り替えされるので、ID 経由で引けば翻訳済みのタイトルが返る。
 * 特殊キー（fermi 等）は SPECIAL_NAME_KEY 経由で翻訳。
 */
function resolveLessonName(key: string, fallback: string): string {
  const m = /^lesson-(\d+)$/.exec(key)
  if (m) {
    const id = Number(m[1])
    return allLessons[id]?.title ?? fallback
  }
  const sp = SPECIAL_NAME_KEY[key]
  if (sp) return t(sp)
  return fallback
}

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
  'lesson-68': { name: '具体と抽象',                category: 'ロジカルシンキング' },
  'lesson-28': { name: 'ケース面接入門',            category: 'ケース面接' },
  'lesson-29': { name: 'プロフィタビリティケース',  category: 'ケース面接' },
  'lesson-35': { name: '市場参入ケース',            category: 'ケース面接' },
  'lesson-36': { name: 'M&Aケース',                category: 'ケース面接' },
  'lesson-40': { name: 'クリティカルシンキング入門',  category: 'クリティカルシンキング' },
  'lesson-41': { name: '論理的誤謬を見破る',        category: 'クリティカルシンキング' },
  'lesson-42': { name: 'データを正しく読む',        category: 'クリティカルシンキング' },
  'lesson-43': { name: '問いを立てる力',           category: 'クリティカルシンキング' },
  'lesson-50': { name: '仮説思考入門',             category: '仮説思考' },
  'lesson-51': { name: '仮説の立て方と検証',       category: '仮説思考' },
  'lesson-52': { name: '仮説ドリブンの課題解決',   category: '仮説思考' },
  'lesson-53': { name: '課題設定入門',             category: '課題設定' },
  'lesson-54': { name: 'イシュー分析',             category: '課題設定' },
  'lesson-55': { name: '課題設定実践',             category: '課題設定' },
  'lesson-500': { name: '論点とは何か',           category: '論点設定' },
  'lesson-501': { name: '網羅的に論点を洗い出す', category: '論点設定' },
  'lesson-502': { name: '論点を構造化する',       category: '論点設定' },
  'lesson-503': { name: '論点に仮説と論拠を当てる', category: '論点設定' },
  'lesson-504': { name: 'フェルミ感覚で論点の重みを測る', category: '論点設定' },
  'lesson-505': { name: '未経験テーマに挑む',     category: '論点設定' },
  'lesson-506': { name: '議論をまとめて場を導く', category: '論点設定' },
  'lesson-56': { name: 'デザインシンキング入門',   category: 'デザインシンキング' },
  'lesson-57': { name: '共感マップとペルソナ',     category: 'デザインシンキング' },
  'lesson-58': { name: 'デザインシンキング実践',   category: 'デザインシンキング' },
  'lesson-59': { name: 'ラテラルシンキング入門',   category: 'ラテラルシンキング' },
  'lesson-60': { name: 'ラテラルの技法',           category: 'ラテラルシンキング' },
  'lesson-61': { name: 'ラテラル実践',             category: 'ラテラルシンキング' },
  'lesson-62': { name: 'アナロジー思考入門',       category: 'アナロジー思考' },
  'lesson-63': { name: 'アナロジーの技法',         category: 'アナロジー思考' },
  'lesson-64': { name: 'アナロジー実践',           category: 'アナロジー思考' },
  'lesson-65': { name: 'システムシンキング入門',   category: 'システムシンキング' },
  'lesson-66': { name: 'システム原型',             category: 'システムシンキング' },
  'lesson-67': { name: 'システムシンキング実践',   category: 'システムシンキング' },
  'fermi':          { name: 'フェルミ推定',      category: 'AI練習' },
  'daily-problem':  { name: '今日の問題',        category: 'デイリー' },
  'flashcards':     { name: 'フラッシュカード',  category: '復習' },
  'placement-test': { name: '実力診断テスト', category: 'テスト' },
}

const CAT_ORDER = ['ロジカルシンキング', 'ケース面接', 'クリティカルシンキング', '仮説思考', '課題設定', '論点設定', 'デザインシンキング', 'ラテラルシンキング', 'アナロジー思考', 'システムシンキング', '履歴書・職務経歴書', 'SPI対策', '玉手箱対策', '面接対策', '給与交渉・退職実務', 'AI練習', 'デイリー', '復習', 'テスト']

function catColor(cat: string): string {
  const map: Record<string, string> = {
    'ロジカルシンキング':     'var(--brand)',
    'フェルミ推定':           'var(--cat-boki2)',
    'ケース面接':             'var(--cat-practice)',
    'クリティカルシンキング': 'var(--cat-pm)',
    '仮説思考':               'var(--md-sys-color-error)',
    '課題設定':               'var(--cat-boki2)',
    '論点設定':               'var(--cat-boki2)',
    'デザインシンキング':     'var(--cat-practice)',
    'ラテラルシンキング':     'var(--cat-lateral)',
    'アナロジー思考':         'var(--warning)',
    'システムシンキング':     'var(--cat-logic)',
    '履歴書・職務経歴書':     'var(--brand)',
    'SPI対策':                'var(--cat-boki2)',
    '玉手箱対策':             'var(--cat-boki2)',
    '面接対策':               'var(--cat-practice)',
    '給与交渉・退職実務':     'var(--cat-pm)',
    'AI練習':                'var(--warning)',
    'デイリー':              'var(--md-sys-color-error)',
    '復習':                  'var(--cat-review)',
    'テスト':                'var(--cat-test)',
  }
  return map[cat] ?? 'var(--brand)'
}

export function CompletedLessonsScreen({ onBack }: CompletedLessonsScreenProps) {
  const keys = useMemo(() => getCompletedLessons(), [])
  const completionCounts = useMemo(() => getAllCompletionCounts(), [])

  // Group by category, preserve CAT_ORDER
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const key of keys) {
      const meta = LESSON_MAP[key]
      const cat = meta?.category ?? t('completed.fallbackCategory')
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
      <Header title={t('completed.title')} onBack={onBack} />

      {/* Count hero */}
      <div style={{ textAlign: 'center', padding: 'var(--s-5) 0 var(--s-3)' }}>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--brand)' }}>
          {keys.length}
        </div>
        <div style={{ fontSize: 18, color: 'var(--text-muted)', marginTop: 'var(--s-2)', fontWeight: 600 }}>
          {t('completed.lessonsDone')}
        </div>
      </div>

      {keys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--s-7) var(--s-5)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 16 }}>{t('completed.empty')}</div>
        </div>
      ) : (
        grouped.map(([cat, catKeys]) => (
          <div key={cat}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: catColor(cat),
              padding: 'var(--s-2) 0 var(--s-2)',
            }}>
              {categoryLabel(cat)}
            </div>
            <ul className="card" style={{ padding: 0, overflow: 'hidden', listStyle: 'none', margin: 0 }}>
              {catKeys.map((key, i) => {
                const meta = LESSON_MAP[key]
                const name = resolveLessonName(key, meta?.name ?? key)
                const count = completionCounts[key] ?? 1
                return (
                  <li key={key} aria-label={t('completed.itemAria', { name })}>
                    {i > 0 && <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--s-3) var(--s-4)', gap: 'var(--s-3)' }}>
                      <CompletionBadge count={count} size={22} />
                      <span style={{ fontSize: 16, color: 'var(--text)', flex: 1 }}>{name}</span>
                      {count >= 2 && (
                        <span style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700, flexShrink: 0 }}>
                          {t('completed.timesDone', { n: String(Math.min(count, 99)) })}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
