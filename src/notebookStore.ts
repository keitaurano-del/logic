const STORAGE_KEY = 'logic-notebook'
const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001'

export type NotebookEntry = {
  id: string
  date: string
  aiSummary: string
  userMemo: string
  createdAt: string
}

function load(): NotebookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return []
}

function save(entries: NotebookEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function loadEntries(): NotebookEntry[] {
  return load().sort((a, b) => b.date.localeCompare(a.date))
}

export function getEntryByDate(date: string): NotebookEntry | undefined {
  return load().find(e => e.date === date)
}

export function upsertEntry(entry: Partial<NotebookEntry> & { date: string }): NotebookEntry {
  const entries = load()
  const idx = entries.findIndex(e => e.date === entry.date)
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...entry }
    save(entries)
    return entries[idx]
  }
  const newEntry: NotebookEntry = {
    id: 'n_' + Date.now(),
    date: entry.date,
    aiSummary: entry.aiSummary || '',
    userMemo: entry.userMemo || '',
    createdAt: new Date().toISOString(),
  }
  entries.push(newEntry)
  save(entries)
  return newEntry
}

export function updateUserMemo(date: string, memo: string): void {
  upsertEntry({ date, userMemo: memo })
}

export function deleteEntry(id: string): void {
  save(load().filter(e => e.id !== id))
}

export async function generateAISummary(date: string, context: {
  completedLessons: string[]
  flashcardStats: { correct: number; total: number }
  studyMinutes: number
}): Promise<string> {
  const today = getEntryByDate(date)
  if (today && today.aiSummary) return today.aiSummary  // cached

  try {
    const res = await fetch(`${API_BASE}/api/journal/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, ...context }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    const summary = data.summary || ''
    upsertEntry({ date, aiSummary: summary })
    return summary
  } catch {
    return ''
  }
}
