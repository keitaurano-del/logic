import { useState, type CSSProperties } from 'react'
import { Header } from '../components/platform/Header'
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  ChevronRightIcon,
  SearchIcon,
  FolderIcon,
  FolderPlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from '../icons'
import { FeaturePreviewBanner } from '../components/FeaturePreviewBanner'
import {
  loadSavedItems,
  loadSavedSort,
  saveSavedSort,
  unsaveItem,
  loadFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  assignItemToFolder,
  type SavedItem,
  type SavedItemType,
  type SavedSort,
  type SavedFolder,
} from '../savedItemsStore'
import { haptic } from '../platform/haptics'
import { resolveAssetUrl } from '../lessonAssets'
import { t } from '../i18n'

/** フォルダによる絞り込み: 'all' / 'unfiled' / フォルダ ID */
type FolderFilter = 'all' | 'unfiled' | string

interface Props {
  onBack: () => void
  onOpenLesson: (lessonId: number) => void
  onOpenCourse: (categoryRouteKey: string) => void
  onOpenLessonStep: (lessonId: number, stepIndex: number) => void
  onOpenAiProblem: (problemId: string) => void
  onOpenFermi: (fermiIndex: string) => void
  onUpgrade?: () => void
}

type Filter = 'all' | SavedItemType

const FILTERS: Filter[] = ['all', 'lesson', 'lesson-step', 'course', 'ai-problem', 'fermi']

const SORTS: SavedSort[] = ['newest', 'oldest', 'title']

export function SavedItemsScreen({
  onBack,
  onOpenLesson,
  onOpenCourse,
  onOpenLessonStep,
  onOpenAiProblem,
  onOpenFermi,
  onUpgrade,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SavedSort>(() => loadSavedSort())
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all')
  // 新規フォルダ作成のインライン入力 (表示中かどうか)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  // 改名中のフォルダ ID と入力値
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  // 削除確認中のフォルダ ID（二段階確認）
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [, force] = useState(0)
  const bump = () => force((v) => v + 1)

  const changeSort = (s: SavedSort) => {
    haptic.selection()
    setSort(s)
    saveSavedSort(s)
  }

  const folders = loadFolders()

  const handleCreateFolder = () => {
    const created = createFolder(newFolderName)
    if (created) {
      haptic.light()
      setFolderFilter(created.id)
    }
    setNewFolderName('')
    setCreatingFolder(false)
    bump()
  }

  const handleRenameFolder = (id: string) => {
    renameFolder(id, editFolderName)
    haptic.light()
    setEditingFolderId(null)
    setEditFolderName('')
    bump()
  }

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id)
    haptic.light()
    if (folderFilter === id) setFolderFilter('all')
    setConfirmDeleteId(null)
    setEditingFolderId(null)
    bump()
  }

  const handleAssignFolder = (itemId: string, folderId: string | null) => {
    assignItemToFolder(itemId, folderId)
    haptic.selection()
    bump()
  }

  const all = loadSavedItems()
  const byFolder =
    folderFilter === 'all'
      ? all
      : folderFilter === 'unfiled'
        ? all.filter((i) => !i.folderId)
        : all.filter((i) => i.folderId === folderFilter)
  const byType = filter === 'all' ? byFolder : byFolder.filter((i) => i.type === filter)

  const trimmed = query.trim().toLowerCase()
  const searched = trimmed
    ? byType.filter((i) =>
        i.title.toLowerCase().includes(trimmed) ||
        (i.subtitle ?? '').toLowerCase().includes(trimmed),
      )
    : byType

  const list = [...searched].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    if (sort === 'oldest') return a.savedAt < b.savedAt ? -1 : a.savedAt > b.savedAt ? 1 : 0
    return a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0
  })

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

  const sortLabel = (s: SavedSort): string => {
    switch (s) {
      case 'newest': return t('savedItems.sortNewest')
      case 'oldest': return t('savedItems.sortOldest')
      case 'title': return t('savedItems.sortTitle')
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

  if (onUpgrade) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <Header title={t('savedItems.title')} onBack={onBack} />
        <div style={{ padding: '24px 20px 120px' }}>
          <FeaturePreviewBanner feature="savedItems" onUpgrade={onUpgrade} />
        </div>
      </div>
    )
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
                  color: active ? 'var(--brand-fg)' : 'var(--text-secondary)',
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

        {/* フォルダ chip 行（FB-11, ローカル専用） */}
        <div
          role="tablist"
          aria-label={t('savedItems.moveToFolderTitle')}
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            alignItems: 'center',
          }}
        >
          {(['all', 'unfiled'] as FolderFilter[]).map((ff) => {
            const active = folderFilter === ff
            return (
              <button
                key={ff}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => { haptic.selection(); setFolderFilter(ff) }}
                style={folderChipStyle(active)}
              >
                {ff === 'all' ? t('savedItems.folderAll') : t('savedItems.folderUnfiled')}
              </button>
            )
          })}

          {folders.map((folder) => {
            const active = folderFilter === folder.id
            const isEditing = editingFolderId === folder.id
            if (isEditing) {
              return (
                <div
                  key={folder.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '2px 4px 2px 10px',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="text"
                    value={editFolderName}
                    onChange={(e) => setEditFolderName(e.target.value)}
                    aria-label={t('savedItems.folderNameAria')}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameFolder(folder.id)
                      if (e.key === 'Escape') { setEditingFolderId(null); setConfirmDeleteId(null) }
                    }}
                    style={{
                      width: 110,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRenameFolder(folder.id)}
                    aria-label={t('savedItems.folderSave')}
                    style={folderIconBtnStyle('var(--brand)')}
                  >
                    <CheckIcon width={16} height={16} />
                  </button>
                  {confirmDeleteId === folder.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(folder.id)}
                      aria-label={t('savedItems.folderDeleteConfirmYes')}
                      title={t('savedItems.folderDeleteConfirm')}
                      style={folderIconBtnStyle('var(--accent-fg)', 'var(--danger)')}
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(folder.id)}
                      aria-label={t('savedItems.folderDelete')}
                      style={folderIconBtnStyle('var(--danger)')}
                    >
                      <TrashIcon width={15} height={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setEditingFolderId(null); setConfirmDeleteId(null) }}
                    aria-label={t('savedItems.folderCancel')}
                    style={folderIconBtnStyle('var(--text-secondary)')}
                  >
                    <XIcon width={16} height={16} />
                  </button>
                </div>
              )
            }
            return (
              <div
                key={folder.id}
                style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { haptic.selection(); setFolderFilter(folder.id) }}
                  style={{ ...folderChipStyle(active), display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FolderIcon width={14} height={14} aria-hidden="true" />
                  {folder.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFolderId(folder.id)
                    setEditFolderName(folder.name)
                    setConfirmDeleteId(null)
                  }}
                  aria-label={t('savedItems.folderEditAria')}
                  style={{ ...folderIconBtnStyle('var(--text-secondary)'), marginLeft: 2 }}
                >
                  <PencilIcon width={14} height={14} />
                </button>
              </div>
            )
          })}

          {creatingFolder ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                padding: '2px 4px 2px 10px',
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('savedItems.folderNamePlaceholder')}
                aria-label={t('savedItems.folderNameAria')}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder()
                  if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName('') }
                }}
                style={{
                  width: 110,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                aria-label={t('savedItems.folderCreate')}
                style={folderIconBtnStyle('var(--brand)')}
              >
                <CheckIcon width={16} height={16} />
              </button>
              <button
                type="button"
                onClick={() => { setCreatingFolder(false); setNewFolderName('') }}
                aria-label={t('savedItems.folderCancel')}
                style={folderIconBtnStyle('var(--text-secondary)')}
              >
                <XIcon width={16} height={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { haptic.light(); setCreatingFolder(true) }}
              aria-label={t('savedItems.folderNewAria')}
              style={{
                ...folderChipStyle(false),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--brand)',
              }}
            >
              <FolderPlusIcon width={15} height={15} aria-hidden="true" />
              {t('savedItems.folderNew')}
            </button>
          )}
        </div>

        {/* 検索ボックス */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            padding: '0 14px',
            minHeight: 44,
          }}
        >
          <SearchIcon width={18} height={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('savedItems.searchPlaceholder')}
            aria-label={t('savedItems.searchAria')}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9333rem',
              fontFamily: "'Noto Sans JP', sans-serif",
              padding: '10px 0',
            }}
          />
        </div>

        {/* 並び替え */}
        <div
          role="tablist"
          aria-label={t('savedItems.sortLabel')}
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
        >
          {SORTS.map((s) => {
            const active = sort === s
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeSort(s)}
                style={{
                  padding: '6px 12px',
                  background: active ? 'var(--brand)' : 'var(--bg-card)',
                  color: active ? 'var(--brand-fg)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.7333rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  whiteSpace: 'nowrap',
                  minHeight: 32,
                }}
              >
                {sortLabel(s)}
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
              {byType.length > 0
                ? t('savedItems.emptySearch')
                : folderFilter !== 'all' && filter === 'all'
                  ? t('savedItems.emptyFolder')
                  : emptyMessage(filter)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map((item) => (
              <SavedRow
                key={item.id}
                item={item}
                folders={folders}
                onOpen={() => handleOpen(item)}
                onUnsave={() => handleUnsave(item)}
                onAssignFolder={(folderId) => handleAssignFolder(item.id, folderId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** フォルダ chip の共通スタイル（active で brand 背景） */
function folderChipStyle(active: boolean): CSSProperties {
  return {
    padding: '8px 12px',
    background: active ? 'var(--brand)' : 'var(--bg-card)',
    color: active ? 'var(--brand-fg)' : 'var(--text-secondary)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.7867rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Noto Sans JP', sans-serif",
    whiteSpace: 'nowrap',
    flexShrink: 0,
    minHeight: 36,
  }
}

/** フォルダ操作の小さなアイコンボタンのスタイル */
function folderIconBtnStyle(color: string, bg?: string): CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: bg ?? 'transparent',
    border: 'none',
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  }
}

function SavedRow({
  item,
  folders,
  onOpen,
  onUnsave,
  onAssignFolder,
}: {
  item: SavedItem
  folders: SavedFolder[]
  onOpen: () => void
  onUnsave: () => void
  onAssignFolder: (folderId: string | null) => void
}) {
  const [folderMenuOpen, setFolderMenuOpen] = useState(false)
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
  const currentFolder = item.folderId ? folders.find((f) => f.id === item.folderId) : undefined
  return (
    <div
      style={{
        position: 'relative',
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
            src={resolveAssetUrl(item.image)}
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
        onClick={() => { haptic.selection(); setFolderMenuOpen((v) => !v) }}
        aria-label={t('savedItems.moveToFolderAria')}
        aria-expanded={folderMenuOpen}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: currentFolder ? 'var(--accent-soft)' : 'transparent',
          border: `1px solid var(--border)`,
          color: currentFolder ? 'var(--brand)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <FolderIcon width={16} height={16} />
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

      {folderMenuOpen && (
        <div
          role="menu"
          aria-label={t('savedItems.moveToFolderTitle')}
          style={{
            position: 'absolute',
            top: '100%',
            right: 14,
            marginTop: 6,
            zIndex: 20,
            minWidth: 180,
            maxHeight: 260,
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-v3-card-inset)',
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { onAssignFolder(null); setFolderMenuOpen(false) }}
            style={folderMenuItemStyle(!currentFolder)}
          >
            {t('savedItems.moveToUnfiled')}
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              role="menuitem"
              onClick={() => { onAssignFolder(f.id); setFolderMenuOpen(false) }}
              style={folderMenuItemStyle(item.folderId === f.id)}
            >
              <FolderIcon width={14} height={14} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** フォルダ移動メニューの項目スタイル（選択中は brand 強調） */
function folderMenuItemStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '9px 10px',
    background: active ? 'var(--accent-soft)' : 'transparent',
    border: 'none',
    borderRadius: 8,
    color: active ? 'var(--brand)' : 'var(--text-primary)',
    fontSize: '0.8533rem',
    fontWeight: active ? 700 : 600,
    cursor: 'pointer',
    fontFamily: "'Noto Sans JP', sans-serif",
    textAlign: 'left',
  }
}
