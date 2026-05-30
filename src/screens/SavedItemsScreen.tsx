import { useState } from 'react'
import { Header } from '../components/platform/Header'
import { BookmarkIcon, BookmarkFilledIcon, ChevronRightIcon } from '../icons'
import {
  loadSavedItems,
  unsaveItem,
  type SavedItem,
  type SavedItemType,
} from '../savedItemsStore'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'

interface Props {
  onBack: () => void
  onOpenLesson: (lessonId: number) => void
  onOpenCourse: (categoryRouteKey: string) => void
  onOpenLessonStep: (lessonId: number, stepIndex: number) => void
  onOpenAiProblem: (problemId: string) => void
  onOpenFermi: (fermiIndex: string) => void
}

type Filter = 'all' | SavedItemType

const FILTERS: Filter[] = ['all', 'lesson', 'lesson-step', 'course', 'ai-problem', 'fermi']

export function SavedItemsScreen({
  onBack,
  onOpenLesson,
  onOpenCourse,
  onOpenLessonStep,
  onOpenAiProblem,
  onOpenFermi,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [, force] = useState(0)
  const bump = () => force((v) => v + 1)

  const all = loadSavedItems()
  const list = filter === 'all' ? all : all.filter((i) => i.type === filter)

  const handleOpen = (item: SavedItem) => {
    if (item.type === 'lesson') {
      const lessonId = Number(item.refId)
      if (Number.isFinite(lessonId)) onOpenLesson(lessonId)
    } else if (item.type === 'lesson-step') {
      const lessonId = item.parentLessonId ?? Number(item.refId.split(':')[0])
      const stepIndex = item.stepIndex ?? Number(item.refId.split(':')[1] ?? 0)
      if (Number.isFinite(lessonId)) onOpenLessonStep(lessonId, stepIndex)
    } else if (item.type === 'course') {
      onOpenCourse(item.refId)
    } else if (item.type === 'ai-problem') {
      onOpenAiProblem(item.refId)
    } else if (item.type === 'fermi') {
      onOpenFermi(item.refId)
    }
  }

  const handleUnsave = (item: SavedItem) => {
    haptic.light()
    unsaveItem(item.type, item.refId)
    bump()
  }

  const counts: Record<Filter, number> = {
    all: all.length,
    lesson: all.filter((i) => i.type === 'lesson').length,
    'lesson-step': all.filter((i) => i.type === 'lesson-step').length,
    course: all.filter((i) => i.type === 'course').length,
    'ai-problem': all.filter((i) => i.type === 'ai-problem').length,
    fermi: all.filter((i) => i.type === 'fermi').length,
  }

  const filterLabel = (f: Filter): string => {
    const n = String(counts[f])
    switch (f) {
      case 'all': return t('savedItems.filterAll', { n })
      case 'lesson': return t('savedItems.filterLessons', { n })
      case 'lesson-step': return t('savedItems.filterLessonStep', { n })
      case 'course': return t('savedItems.filterCourses', { n })
      case 'ai-problem': return t('savedItems.filterAiProblem', { n })
      case 'fermi': return t('savedItems.filterFermi', { n })
    }
  }

  const emptyMessage = (f: Filter): string => {
    switch (f) {
      case 'all': return t('savedItems.emptyAll')
      case 'lesson': return t('savedItems.emptyLessons')
      case 'lesson-step': return t('savedItems.emptyLessonStep')
      case 'course': return t('savedItems.emptyCourses')
      case 'ai-problem': return t('savedItems.emptyAiProblem')
      case 'fermi': return t('savedItems.emptyFermi')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('savedItems.title')} onBack={onBack} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* タブ（横スクロール） */}
        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => { haptic.selection(); setFilter(f) }}
                style={{
                  padding: '8px 14px',
                  background: active ? 'var(--brand)' : 'var(--bg-card)',
                  color: active ? 'var(--accent-fg)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minHeight: 36,
                }}
              >
                {filterLabel(f)}
              </button>
            )
          })}
        </div>

        {list.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-7)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--brand)', marginBottom: 12 }}>
              <BookmarkIcon width={28} height={28} />
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {emptyMessage(filter)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((item) => (
              <SavedRow
                key={item.id}
                item={item}
                onOpen={() => handleOpen(item)}
                onUnsave={() => handleUnsave(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SavedRow({ item, onOpen, onUnsave }: { item: SavedItem; onOpen: () => void; onUnsave: () => void }) {
  const typeLabel = (() => {
    switch (item.type) {
      case 'lesson': return t('savedItems.typeLesson')
      case 'course': return t('savedItems.typeCourse')
      case 'lesson-step': return t('savedItems.typeLessonStep')
      case 'ai-problem': return t('savedItems.typeAiProblem')
      case 'fermi': return t('savedItems.typeFermi')
    }
  })()
  const stepBadge = item.type === 'lesson-step' && typeof item.stepIndex === 'number'
    ? t('savedItems.stepLabel', { n: String(item.stepIndex + 1) })
    : null
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: 'var(--shadow-v3-card-inset)',
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          flex: 1, minWidth: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit', color: 'inherit',
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookmarkFilledIcon width={20} height={20} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{typeLabel}</span>
            {stepBadge && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· {stepBadge}</span>}
          </div>
          <div style={{ fontSize: '0.9333rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
          {item.subtitle && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subtitle}</div>
          )}
        </div>
        <ChevronRightIcon width={18} height={18} />
      </button>
      <button
        type="button"
        onClick={onUnsave}
        aria-label={t('savedItems.unsaveAria')}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent',
          border: `1px solid var(--border)`,
          color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <BookmarkFilledIcon width={16} height={16} />
      </button>
    </div>
  )
}
