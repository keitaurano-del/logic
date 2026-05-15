import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '../supabase'
import { t } from '../i18n'

const STORAGE_KEY = 'logic-assistant-name'

function getDefaultName(): string {
  return t('journal.assistantNameDefault')
}

function loadLocal(): string {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && v.trim()) return v.trim()
  } catch { /* ignore */ }
  return getDefaultName()
}

function saveLocal(name: string): void {
  try { localStorage.setItem(STORAGE_KEY, name) } catch { /* ignore */ }
}

export function useAssistantName(userId: string | null | undefined): {
  assistantName: string
  updateAssistantName: (name: string) => Promise<void>
} {
  const [assistantName, setAssistantName] = useState<string>(() => loadLocal())

  // ログインユーザーがいる場合はリモート優先で取得
  useEffect(() => {
    if (!userId) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('assistant_name')
          .eq('user_id', userId)
          .maybeSingle()
        if (cancelled) return
        if (error) { console.warn('useAssistantName fetch:', error.message); return }
        const remote = (data as { assistant_name?: string } | null)?.assistant_name
        if (remote && remote.trim()) {
          setAssistantName(remote.trim())
          saveLocal(remote.trim())
        }
      } catch (e) {
        if (!cancelled) console.warn('useAssistantName fetch error:', e)
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  const updateAssistantName = useCallback(async (name: string) => {
    const trimmed = name.trim() || getDefaultName()
    setAssistantName(trimmed)
    saveLocal(trimmed)
    if (!userId) return
    const supabase = getSupabaseClient()
    if (!supabase) return
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, assistant_name: trimmed }, { onConflict: 'user_id' })
      if (error) console.warn('useAssistantName upsert:', error.message)
    } catch (e) {
      console.warn('useAssistantName upsert error:', e)
    }
  }, [userId])

  return { assistantName, updateAssistantName }
}
