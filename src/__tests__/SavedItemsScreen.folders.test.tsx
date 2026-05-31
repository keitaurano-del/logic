import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { SavedItemsScreen } from '../screens/SavedItemsScreen'
import {
  loadFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  assignItemToFolder,
  loadSavedItems,
  type SavedItem,
} from '../savedItemsStore'
import { t } from '../i18n'

/**
 * FB-11 回帰ロック（保存アイテムのフォルダ分け、ローカル専用）。
 *
 * ストア層:
 *   - createFolder / renameFolder / deleteFolder / assignItemToFolder
 *   - loadFolders の localStorage 永続化
 *   - deleteFolder で属するアイテムが未分類化される（アイテム自体は消えない）
 * UI 層:
 *   - フォルダ chip でアイテムを絞り込める
 *   - 空フォルダで空状態メッセージが出る
 *
 * 重要: folderId はローカル専用。Supabase へは同期しない（別タスク）。
 * setup.ts が beforeEach で localStorage をクリアするため ja に解決される。
 */

const SAVED_KEY = 'logic-saved-items'
const FOLDERS_KEY = 'logic-saved-folders'

const ITEMS: SavedItem[] = [
  { id: 'lesson:1', type: 'lesson', refId: '1', title: 'Apple', savedAt: '2026-05-15T00:00:00.000Z' },
  { id: 'lesson:2', type: 'lesson', refId: '2', title: 'Banana', savedAt: '2026-05-10T00:00:00.000Z' },
  { id: 'lesson:3', type: 'lesson', refId: '3', title: 'Cherry', savedAt: '2026-05-20T00:00:00.000Z' },
]

const noop = () => {}

function renderScreen() {
  return render(
    <SavedItemsScreen
      onBack={noop}
      onOpenLesson={noop}
      onOpenCourse={noop}
      onOpenLessonStep={noop}
      onOpenAiProblem={noop}
      onOpenFermi={noop}
    />,
  )
}

describe('savedItemsStore folders (FB-11)', () => {
  beforeEach(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ITEMS))
  })

  it('createFolder appends a folder and persists it to localStorage', () => {
    const a = createFolder('Work')
    const b = createFolder('Personal')
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()

    const folders = loadFolders()
    expect(folders.map((f) => f.name)).toEqual(['Work', 'Personal'])
    // order は末尾に積まれ昇順
    expect(folders[0].order).toBeLessThan(folders[1].order)
    // 実際に localStorage に書かれている
    expect(localStorage.getItem(FOLDERS_KEY)).toContain('Work')
  })

  it('createFolder trims and rejects blank names', () => {
    expect(createFolder('   ')).toBeNull()
    expect(createFolder('')).toBeNull()
    const ok = createFolder('  Trimmed  ')
    expect(ok).not.toBeNull()
    expect(ok?.name).toBe('Trimmed')
    expect(loadFolders()).toHaveLength(1)
  })

  it('renameFolder updates the name (ignores blank)', () => {
    const f = createFolder('Old')!
    renameFolder(f.id, 'New')
    expect(loadFolders()[0].name).toBe('New')
    renameFolder(f.id, '   ')
    expect(loadFolders()[0].name).toBe('New')
  })

  it('assignItemToFolder sets and clears folderId', () => {
    const f = createFolder('Box')!
    assignItemToFolder('lesson:1', f.id)
    expect(loadSavedItems().find((i) => i.id === 'lesson:1')?.folderId).toBe(f.id)

    assignItemToFolder('lesson:1', null)
    expect(loadSavedItems().find((i) => i.id === 'lesson:1')?.folderId).toBeUndefined()
  })

  it('deleteFolder unfiles its items but does not delete them', () => {
    const f = createFolder('Box')!
    assignItemToFolder('lesson:1', f.id)
    assignItemToFolder('lesson:2', f.id)

    deleteFolder(f.id)

    // フォルダは消える
    expect(loadFolders()).toHaveLength(0)
    // アイテムは残り、未分類化される
    const items = loadSavedItems()
    expect(items).toHaveLength(3)
    expect(items.find((i) => i.id === 'lesson:1')?.folderId).toBeUndefined()
    expect(items.find((i) => i.id === 'lesson:2')?.folderId).toBeUndefined()
  })

  it('loadFolders returns folders sorted by order and survives reload', () => {
    createFolder('A')
    createFolder('B')
    createFolder('C')
    // 再読込（localStorage から）
    const reloaded = loadFolders()
    expect(reloaded.map((f) => f.name)).toEqual(['A', 'B', 'C'])
  })
})

describe('SavedItemsScreen folder filtering (FB-11)', () => {
  beforeEach(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ITEMS))
  })

  it('filters items by folder chip and shows empty state for an empty folder', () => {
    const work = createFolder('Work')!
    createFolder('Empty')
    assignItemToFolder('lesson:1', work.id)

    renderScreen()

    // 「Work」chip を選ぶと Apple だけ
    fireEvent.click(screen.getByRole('tab', { name: 'Work' }))
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument()

    // 空フォルダは空状態メッセージ
    fireEvent.click(screen.getByRole('tab', { name: 'Empty' }))
    expect(screen.getByText(t('savedItems.emptyFolder'))).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
  })

  it('the "Unfiled" chip shows only items without a folder', () => {
    const work = createFolder('Work')!
    assignItemToFolder('lesson:1', work.id)

    renderScreen()
    fireEvent.click(screen.getByRole('tab', { name: t('savedItems.folderUnfiled') }))

    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('can create a folder from the inline input', () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: t('savedItems.folderNewAria') }))
    const input = screen.getByLabelText(t('savedItems.folderNameAria'))
    fireEvent.change(input, { target: { value: 'Reading' } })
    fireEvent.click(screen.getByRole('button', { name: t('savedItems.folderCreate') }))

    expect(loadFolders().map((f) => f.name)).toContain('Reading')
    expect(screen.getByRole('tab', { name: 'Reading' })).toBeInTheDocument()
  })

  it('can move an item to a folder via the per-row folder menu', () => {
    const work = createFolder('Work')!
    renderScreen()

    // 最初の行（newest=Cherry）のフォルダボタンを開く
    const moveButtons = screen.getAllByRole('button', { name: t('savedItems.moveToFolderAria') })
    fireEvent.click(moveButtons[0]) // Cherry の行

    const menu = screen.getByRole('menu', { name: t('savedItems.moveToFolderTitle') })
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Work' }))

    expect(loadSavedItems().find((i) => i.id === 'lesson:3')?.folderId).toBe(work.id)
  })
})
