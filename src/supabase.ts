import { createClient } from '@supabase/supabase-js'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.warn('Supabase initialization skipped:', e)
}

export function isSupabaseConfigured(): boolean { return !!supabase }

// 型は緩めに（untyped client）。各テーブルの insert/upsert で厳密ジェネリクスを通すと
// 既存のスキーマ型未定義の状態と相性が悪いため、呼び出し側で any 相当として扱える形で返す。
export function getSupabaseClient(): SupabaseClient | null {
  return supabase as unknown as SupabaseClient | null
}

export async function loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'Supabase が設定されていません' }
  try {
    if (Capacitor.isNativePlatform()) {
      // Google Auth は一時無効化中（google-services.json未設定）
      return { user: null, error: 'Googleログインは現在ご利用いただけません' }
    } else {
      // Web: 既存のOAuthフロー
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) return { user: null, error: error.message }
      return { user: null }
    }
  } catch (_error) {
    return { user: null, error: 'ログインに失敗しました' }
  }
}

export async function sendEmailOtp(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'auth/not-configured' }
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid email')) return { error: 'auth/invalid-email' }
      if (msg.includes('rate') || msg.includes('too many')) return { error: 'auth/rate-limited' }
      return { error: 'auth/generic' }
    }
    return {}
  } catch {
    return { error: 'auth/generic' }
  }
}

export async function verifyEmailOtp(email: string, token: string): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'auth/not-configured' }
  try {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('expired')) return { user: null, error: 'auth/code-expired' }
      if (msg.includes('invalid') || msg.includes('incorrect')) return { user: null, error: 'auth/invalid-code' }
      return { user: null, error: 'auth/generic' }
    }
    return { user: data.user }
  } catch {
    return { user: null, error: 'auth/generic' }
  }
}

export async function logout() {
  if (supabase) await supabase.auth.signOut()
}

export async function getInitialUser(): Promise<User | null> {
  if (!supabase) return null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user ?? null
  } catch {
    return null
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!supabase) { callback(null); return () => {} }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

export type { User }

export async function updateDisplayName(name: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase が設定されていません' }
  try {
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: '名前の更新に失敗しました' }
  }
}
