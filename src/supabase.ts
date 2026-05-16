import { createClient } from '@supabase/supabase-js'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const NATIVE_REDIRECT_URL = 'logic://auth'

let supabase: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        // Native では deep link 経由でセッションを手動交換するため自動検出を無効化
        detectSessionInUrl: !Capacitor.isNativePlatform(),
        persistSession: true,
        autoRefreshToken: true,
      },
    })
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
    const emailRedirectTo = Capacitor.isNativePlatform()
      ? NATIVE_REDIRECT_URL
      : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo },
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

/**
 * Deep link / web redirect から受け取った URL を Supabase セッションに交換する。
 * - PKCE: `?code=xxx` を exchangeCodeForSession に渡す
 * - Implicit fallback: `#access_token=...&refresh_token=...` を setSession に渡す
 */
export async function handleAuthRedirect(url: string): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'auth/not-configured' }
  try {
    const parsed = new URL(url)
    const code = parsed.searchParams.get('code')
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) return { user: null, error: error.message }
      return { user: data.user }
    }
    const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) return { user: null, error: error.message }
      return { user: data.user }
    }
    return { user: null, error: 'auth/no-token-in-url' }
  } catch {
    return { user: null, error: 'auth/generic' }
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
