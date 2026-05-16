import { API_BASE } from '../../screens/apiBase'
import { getLocale } from '../../i18n'
import type { DailyJournal, PeriodType } from './types'

interface SummarizeRequest {
  mood?: number | null
  weather?: string | null
  scheduleNotes?: string | null
  assistantName: string
}

export async function summarizeJournal(req: SummarizeRequest): Promise<{ summary?: string; followUpQuestion?: string; suggestedTags?: string[]; error?: string }> {
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
      suggestedTags: Array.isArray(data?.suggested_tags) ? data.suggested_tags as string[] : [],
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

interface HolisticFeedbackRequest {
  goals: Array<{ periodType: PeriodType; title: string; description?: string | null }>
  recentJournals: Array<Pick<DailyJournal, 'date' | 'mood' | 'weather' | 'schedule_notes' | 'evening_reflection'>>
  progressSummary: Record<string, { completed: number; total: number }>
  fermiCount: number
  lessonStreak: number
  studyDays: number
  assistantName: string
}

export async function holisticFeedback(req: HolisticFeedbackRequest): Promise<{ feedback?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/holistic-feedback`, {
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

interface SuggestTagsRequest {
  scheduleNotes?: string | null
  eveningReflection?: string | null
  existingTags?: string[]
}

export async function suggestJournalTags(req: SuggestTagsRequest): Promise<{ suggestedTags?: string[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/journal/tags`, {
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
      suggestedTags: Array.isArray(data?.suggested_tags) ? data.suggested_tags as string[] : [],
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

