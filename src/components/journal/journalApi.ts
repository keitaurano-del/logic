import { API_BASE } from '../../screens/apiBase'
import { getLocale } from '../../i18n'
import type { DailyJournal, PeriodType } from './types'

interface SummarizeRequest {
  mood?: number | null
  weather?: string | null
  scheduleNotes?: string | null
  assistantName: string
}

export async function summarizeJournal(req: SummarizeRequest): Promise<{ summary?: string; followUpQuestion?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req, locale: getLocale() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data?.error || `HTTP ${res.status}` }
    }
    const data = await res.json()
    return {
      summary: data?.summary ?? '',
      followUpQuestion: data?.follow_up_question ?? '',
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

interface GoalFeedbackRequest {
  goal: { periodType: PeriodType; title: string; description?: string | null }
  journals: Array<Pick<DailyJournal, 'date' | 'mood' | 'weather' | 'schedule_notes' | 'evening_reflection'>>
  assistantName: string
}

export async function cleanupText(text: string): Promise<{ cleaned?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, locale: getLocale() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data?.error || `HTTP ${res.status}` }
    }
    const data = await res.json()
    return { cleaned: data?.cleaned ?? '' }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

export async function goalFeedback(req: GoalFeedbackRequest): Promise<{ feedback?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/goal-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req, locale: getLocale() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { error: data?.error || `HTTP ${res.status}` }
    }
    const data = await res.json()
    return { feedback: data?.feedback ?? '' }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
