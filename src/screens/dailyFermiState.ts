// デイリーフェルミ完了状態管理（react-refresh 違反を避けるため DailyFermiScreen.tsx から分離）
import { FERMI_POOL, getDailyFermiIndex, type FermiDifficulty, type FermiDomain } from '../fermiData'

// ============================================================
// フィルタ型・localStorage ヘルパー
// ============================================================

export type FermiFilter = {
  difficulty?: FermiDifficulty | null
  domain?: FermiDomain | null
}

// フィルタ選好の localStorage キー（日跨ぎで保持）
export const FERMI_FILTER_DIFFICULTY_KEY = 'logic-fermi-filter-difficulty'
export const FERMI_FILTER_DOMAIN_KEY = 'logic-fermi-filter-domain'

export function readFermiFilterDifficulty(): FermiDifficulty | null {
  try {
    const v = localStorage.getItem(FERMI_FILTER_DIFFICULTY_KEY)
    if (v === 'basic' || v === 'standard' || v === 'advanced') return v
  } catch { /* */ }
  return null
}

export function writeFermiFilterDifficulty(v: FermiDifficulty | null): void {
  try {
    if (v == null) localStorage.removeItem(FERMI_FILTER_DIFFICULTY_KEY)
    else localStorage.setItem(FERMI_FILTER_DIFFICULTY_KEY, v)
  } catch { /* */ }
}

export function readFermiFilterDomain(): FermiDomain | null {
  try {
    const v = localStorage.getItem(FERMI_FILTER_DOMAIN_KEY)
    if (v === 'market' || v === 'unit' || v === 'volume' || v === 'flow' || v === 'cost') return v
  } catch { /* */ }
  return null
}

export function writeFermiFilterDomain(v: FermiDomain | null): void {
  try {
    if (v == null) localStorage.removeItem(FERMI_FILTER_DOMAIN_KEY)
    else localStorage.setItem(FERMI_FILTER_DOMAIN_KEY, v)
  } catch { /* */ }
}

const DAILY_FERMI_KEY = 'logic-daily-fermi-done'

// 今日その日に解いたフェルミ問題の index 集合。ホーム画面で「未完了の問題」を
// 補充表示するために使う。日付が変わったら自動でリセットされる。
const DAILY_FERMI_DONE_INDEXES_KEY = 'logic-daily-fermi-done-indexes'

// ホームの「今日の1問」カードと Daily 画面が共有する表示対象 index のキー。
// 「別の問題」(reroll) 指定と、ホーム初期表示で決定した index の両方をここに永続化し、
// ホーム / Daily 双方が同じ値を参照することで両画面の表示問題を一致させる。
const HOME_FERMI_INDEX_KEY = 'home-fermi-index'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isDailyFermiDone(): boolean {
  const saved = localStorage.getItem(DAILY_FERMI_KEY)
  if (!saved) return false
  return saved === today()
}

export function markDailyFermiDone(): void {
  localStorage.setItem(DAILY_FERMI_KEY, today())
}

type DoneIndexState = { date: string; indexes: number[] }

function readDoneIndexState(): DoneIndexState {
  try {
    const raw = localStorage.getItem(DAILY_FERMI_DONE_INDEXES_KEY)
    if (!raw) return { date: today(), indexes: [] }
    const parsed = JSON.parse(raw) as Partial<DoneIndexState>
    if (parsed && parsed.date === today() && Array.isArray(parsed.indexes)) {
      const indexes = parsed.indexes.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0)
      return { date: today(), indexes }
    }
  } catch { /* */ }
  return { date: today(), indexes: [] }
}

/** その日に完了済みのフェルミ問題 index 一覧（重複なし） */
export function getDailyFermiDoneIndexes(): number[] {
  return readDoneIndexState().indexes
}

/** index を今日の完了済みリストに追加する。重複は除去する。 */
export function addDailyFermiDoneIndex(index: number): void {
  if (!Number.isFinite(index) || index < 0) return
  const state = readDoneIndexState()
  if (state.indexes.includes(index)) return
  const next: DoneIndexState = { date: today(), indexes: [...state.indexes, index] }
  try {
    localStorage.setItem(DAILY_FERMI_DONE_INDEXES_KEY, JSON.stringify(next))
  } catch { /* */ }
}

// ============================================================
// ホーム / Daily 共有の「今日の1問」index 決定ロジック（単一の真実源）
// ============================================================

/**
 * 純関数版: 副作用なしで「今日の1問」index を決定する。テスト用に切り出し。
 *
 * 優先順位:
 *   1. session で「別の問題」(reroll) 指定があり、それがまだ未完了かつフィルタ条件に合うならそれを使う
 *   2. フィルタ条件に合う未完了プールから、日付シードで決定的に1問選ぶ
 *      → フィルタ結果が空の場合は全母集合にフォールバック（全問から選ぶ）
 *      → done セットの非空・日付跨ぎでもホーム / Daily 双方が同じ式で計算するので一致する
 *   3. 全部完了していたら null（カード側で完了メッセージ表示）
 *
 * @param poolLength       問題プールの件数（FERMI_POOL.length）
 * @param dailySeed        日付ベースのシード（getDailyFermiIndex() の値）
 * @param doneIndexes      今日完了済みの index 配列
 * @param sessionIndex     session に保存された手動指定 index（無ければ null）
 * @param filterDifficulty 難易度フィルタ（null = すべて）
 * @param filterDomain     分野フィルタ（null = すべて）
 */
export function pickHomeFermiIndexPure(
  poolLength: number,
  dailySeed: number,
  doneIndexes: number[],
  sessionIndex: number | null,
  filterDifficulty: FermiDifficulty | null = null,
  filterDomain: FermiDomain | null = null,
): number | null {
  if (poolLength <= 0) return null
  const done = new Set(doneIndexes)
  if (done.size >= poolLength) return null

  // フィルタ条件を満たすかチェック
  const matchesFilter = (i: number): boolean => {
    const q = FERMI_POOL[i]
    if (!q) return false
    if (filterDifficulty != null && q.difficulty !== filterDifficulty) return false
    if (filterDomain != null && q.domain !== filterDomain) return false
    return true
  }

  // フィルタ適用後の未完了候補を計算
  const filteredAvailable: number[] = []
  for (let i = 0; i < poolLength; i++) {
    if (!done.has(i) && matchesFilter(i)) filteredAvailable.push(i)
  }
  // 在庫薄フォールバック: フィルタ結果が空なら全未完了から選ぶ
  const available: number[] = filteredAvailable.length > 0 ? filteredAvailable : (() => {
    const all: number[] = []
    for (let i = 0; i < poolLength; i++) {
      if (!done.has(i)) all.push(i)
    }
    return all
  })()

  // 1. session の手動指定（reroll）がまだ未完了かつ候補に含まれるならそれを優先
  if (
    sessionIndex != null &&
    Number.isFinite(sessionIndex) &&
    sessionIndex >= 0 &&
    sessionIndex < poolLength &&
    !done.has(sessionIndex) &&
    available.includes(sessionIndex)
  ) {
    return sessionIndex
  }

  // 2. 候補の中から日付シードで決定的に選ぶ
  if (available.length === 0) return null
  // dailySeed が負にならない前提だが、念のため正規化して安全に剰余を取る
  const seed = ((dailySeed % available.length) + available.length) % available.length
  return available[seed]
}

/**
 * フィルタ条件（difficulty/domain）に合う未完了問題の index リストを返す。
 * フィルタ結果が空の場合は全未完了リストを返す（フォールバック）。
 * UI のバッジ表示・残数カウントに使う。
 */
export function getFilteredAvailableIndexes(
  doneIndexes: number[],
  filterDifficulty: FermiDifficulty | null,
  filterDomain: FermiDomain | null,
): number[] {
  const done = new Set(doneIndexes)
  const pool = FERMI_POOL
  const filtered = pool
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => {
      if (done.has(i)) return false
      if (filterDifficulty != null && q.difficulty !== filterDifficulty) return false
      if (filterDomain != null && q.domain !== filterDomain) return false
      return true
    })
    .map(({ i }) => i)
  if (filtered.length > 0) return filtered
  // フォールバック: 全未完了
  return pool.map((_, i) => i).filter(i => !done.has(i))
}

/** session に保存された手動指定 index を読む。無ければ null。 */
function readSessionFermiIndex(): number | null {
  try {
    const raw = sessionStorage.getItem(HOME_FERMI_INDEX_KEY)
    if (raw == null) return null
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

/** 共有 session キーに表示対象 index を書き込む。 */
export function setHomeFermiIndex(index: number): void {
  try {
    sessionStorage.setItem(HOME_FERMI_INDEX_KEY, String(index))
  } catch { /* */ }
}

/** 共有 session キーを破棄する（完了済み指定が残っていた場合など）。 */
export function clearHomeFermiIndex(): void {
  try {
    sessionStorage.removeItem(HOME_FERMI_INDEX_KEY)
  } catch { /* */ }
}

/**
 * ホーム / Daily 共通の「今日の1問」index を返す（単一の真実源）。
 *
 * - localStorage の done セット・session の手動指定・日付シードから決定的に算出する。
 * - 算出結果（reroll 指定でない場合の決定的 index も含む）を共有 session キーへ
 *   永続化し、ホーム / Daily 双方が同じ値を参照できるようにする。
 * - session が揮発しても、同じ done セットと日付シードで再計算すれば同じ結果に収束する。
 * - 完了済みの手動指定が残っていた場合は破棄してから決定的ロジックへ落ちる。
 * - 全問完了時は null（カード側で完了表示）。
 */
export function getHomeFermiIndex(): number | null {
  const poolLength = FERMI_POOL.length
  const doneIndexes = getDailyFermiDoneIndexes()
  let sessionIndex = readSessionFermiIndex()

  // 完了済みの手動指定が残っていたら破棄（次回以降の混乱を避ける）
  if (sessionIndex != null && new Set(doneIndexes).has(sessionIndex)) {
    clearHomeFermiIndex()
    sessionIndex = null
  }

  const picked = pickHomeFermiIndexPure(poolLength, getDailyFermiIndex(), doneIndexes, sessionIndex)
  // 決定した index を共有キーへ永続化（reroll 指定だけでなく初期表示でも必ず書く）
  if (picked != null) setHomeFermiIndex(picked)
  return picked
}
