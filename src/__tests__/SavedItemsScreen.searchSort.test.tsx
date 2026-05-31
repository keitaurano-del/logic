import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { SavedItemsScreen } from '../screens/SavedItemsScreen'
import {
  loadSavedSort,
  type SavedItem,
} from '../savedItemsStore'
import { t } from '../i18n'

/**
 * FB-09 回帰ロック。
 *
 * SavedItemsScreen に検索ボックス + 並び替えピル（新しい順 / 古い順 / タイトル順）が
 * 追加された。以下がリグレッションしないことを保証する:
 *   - 検索: タイトル（小文字 includes）でフィルタされる / 非ヒット時は emptySearch 文言
 *   - 並び替え: newest=savedAt 降順, oldest=savedAt 昇順, title=localeCompare
 *   - 永続化: ピル選択で localStorage 'logic-saved-sort' に保存され loadSavedSort が読み戻す
 *
 * デフォルトロケールは ja（setup.ts が localStorage を毎回クリア → i18n は ja に解決）。
 * savedAt を完全制御するため、ストアの公開 API ではなく localStorage に
 * 直接 SavedItem[] を seed する（saveItem は savedAt を内部生成するため順序固定できない）。
 */

const SAVED_KEY = 'logic-saved-items'

// savedAt が制御された 3 件。type は 'lesson' に統一（フィルタは 'all' のまま使う）。
// 時系列:  Banana(古) < Apple(中) < Cherry(新)
// タイトル昇順: Apple < Banana < Cherry
const ITEMS: SavedItem[] = [
  {
    id: 'lesson:1',
    type: 'lesson',
    refId: '1',
    title: 'Apple',
    savedAt: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'lesson:2',
    type: 'lesson',
    refId: '2',
    title: 'Banana',
    savedAt: '2026-05-10T00:00:00.000Z',
  },
  {
    id: 'lesson:3',
    type: 'lesson',
    refId: '3',
    title: 'Cherry',
    savedAt: '2026-05-20T00:00:00.000Z',
  },
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

/** 画面に出ている保存アイテムのタイトルを描画順に返す。 */
function renderedTitles(): string[] {
  return ITEMS
    .map((i) => i.title)
    .filter((title) => screen.queryByText(title) !== null)
    .sort((a, b) => domOrder(a) - domOrder(b))
}

/** title 文字列の DOM 上の出現順インデックス（document 全体の走査順）。 */
function domOrder(title: string): number {
  const nodes = Array.from(document.querySelectorAll('div'))
  return nodes.findIndex((n) => n.childNodes.length === 1 && n.textContent === title)
}

function sortPill(sort: 'newest' | 'oldest' | 'title'): HTMLElement {
  const label =
    sort === 'newest'
      ? t('savedItems.sortNewest')
      : sort === 'oldest'
        ? t('savedItems.sortOldest')
        : t('savedItems.sortTitle')
  return screen.getByRole('tab', { name: label })
}

describe('SavedItemsScreen search + sort (FB-09)', () => {
  beforeEach(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ITEMS))
  })

  it('renders all seeded items by default (newest first)', () => {
    renderScreen()
    expect(renderedTitles()).toEqual(['Cherry', 'Apple', 'Banana'])
  })

  it('filters by title via the search box (case-insensitive)', () => {
    renderScreen()
    const input = screen.getByLabelText(t('savedItems.searchAria'))
    fireEvent.change(input, { target: { value: 'app' } })

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
  })

  it('shows the empty-search state for a non-matching query', () => {
    renderScreen()
    const input = screen.getByLabelText(t('savedItems.searchAria'))
    fireEvent.change(input, { target: { value: 'zzz-no-match' } })

    expect(screen.getByText(t('savedItems.emptySearch'))).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
  })

  it("sorts by 'newest' (savedAt descending)", () => {
    renderScreen()
    fireEvent.click(sortPill('newest'))
    expect(renderedTitles()).toEqual(['Cherry', 'Apple', 'Banana'])
  })

  it("sorts by 'oldest' (savedAt ascending)", () => {
    renderScreen()
    fireEvent.click(sortPill('oldest'))
    expect(renderedTitles()).toEqual(['Banana', 'Apple', 'Cherry'])
  })

  it("sorts by 'title' (localeCompare ascending)", () => {
    renderScreen()
    fireEvent.click(sortPill('title'))
    expect(renderedTitles()).toEqual(['Apple', 'Banana', 'Cherry'])
  })

  it("persists the selected sort to localStorage 'logic-saved-sort' and loadSavedSort reads it back", () => {
    renderScreen()

    fireEvent.click(sortPill('title'))
    expect(localStorage.getItem('logic-saved-sort')).toBe('title')
    expect(loadSavedSort()).toBe('title')

    fireEvent.click(sortPill('oldest'))
    expect(localStorage.getItem('logic-saved-sort')).toBe('oldest')
    expect(loadSavedSort()).toBe('oldest')
  })

  it('marks the active sort pill via aria-selected', () => {
    renderScreen()
    fireEvent.click(sortPill('title'))

    const tablist = screen.getByRole('tablist', { name: t('savedItems.sortLabel') })
    const titlePill = within(tablist).getByRole('tab', { name: t('savedItems.sortTitle') })
    expect(titlePill).toHaveAttribute('aria-selected', 'true')
  })
})
