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
  onOpenRoleplay: (situationId: string) => void
}

type Filter = 'all' | SavedItemType

export function SavedItemsScreen({ onBack, onOpenLesson, onOpenCourse, onOpenRoleplay }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [, force] = useState(0)
  const bump = () => force((v) => v + 1)

  const all = loadSavedItems()
  const list = filter === 'all' ? all : all.filter((i) => i.type === filter)

  const handleOpen = (item: SavedItem) => {
    if (item.type === 'lesson') {
      const lessonId = Number(item.refId)
      if (Number.isFinite(lessonId)) onOpenLesson(lessonId)
    } else if (item.type === 'course') {
      onOpenCourse(item.refId)
    } else {
      onOpenRoleplay(item.refId)
    }
  }

  const handleUnsave = (item: SavedItem) => {
    haptic.light()
    unsaveItem(item.type, item.refId)
    bump()
  }

  const counts = {
    all: all.length,
    lesson: all.filter((i) => i.type === 'lesson').length,
    course: all.filter((i) => i.type === 'course').length,
    roleplay: all.filter((i) => i.type === 'roleplay').length,
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('savedItems.title')} onBack={onBack} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* タブ */}
        <div role="tablist" style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-pill)', padding: 4, gap: 2 }}>
          {(['all', 'lesson', 'course', 'roleplay'] as Filter[]).map((f) => {
            const active = filter === f
            const label =
              f === 'all' ? t('savedItems.filterAll', { n: String(counts.all) }) :
              f === 'lesson' ? t('savedItems.filterLessons', { n: String(counts.lesson) }) :
              f === 'course' ? t('savedItems.filterCourses', { n: String(counts.course) }) :
                               t('savedItems.filterRoleplay', { n: String(counts.roleplay) })
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => { haptic.selection(); setFilter(f) }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxShadow: active ? 'var(--shadow-v3-card-inset)' : 'none',
                  minHeight: 36,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {list.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-7)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--brand)', marginBottom: 12 }}>
              <BookmarkIcon width={28} height={28} />
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {filter === 'all' ? t('savedItems.emptyAll') :
               filter === 'lesson' ? t('savedItems.emptyLessons') :
               filter === 'course' ? t('savedItems.emptyCourses') :
                                      t('savedItems.emptyRoleplay')}
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
  const typeLabel =
    item.type === 'lesson' ? t('savedItems.typeLesson') :
    item.type === 'course' ? t('savedItems.typeCourse') :
                             t('savedItems.typeRoleplay')
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
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{typeLabel}</div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
          {item.subtitle && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subtitle}</div>
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
