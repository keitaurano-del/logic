// デイリーフェルミ完了状態管理（react-refresh 違反を避けるため DailyFermiScreen.tsx から分離）
const DAILY_FERMI_KEY = 'logic-daily-fermi-done'

// 今日その日に解いたフェルミ問題の index 集合。ホーム画面で「未完了の問題」を
// 補充表示するために使う。日付が変わったら自動でリセットされる。
const DAILY_FERMI_DONE_INDEXES_KEY = 'logic-daily-fermi-done-indexes'

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
