import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
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

export async function loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'Supabase が設定されていません' }
  try {
    if (Capacitor.isNativePlatform()) {
      // ネイティブ: Capacitor Google Auth → Supabase signInWithIdToken
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
      const result = await GoogleAuth.signIn()
      const idToken = result.authentication?.idToken
      if (!idToken) return { user: null, error: 'Google認証トークンが取得できませんでした' }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })
      if (error) return { user: null, error: error.message }
      return { user: data?.user ?? null }
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
  } catch (error) {
    return { user: null, error: 'ログインに失敗しました' }
  }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'Supabase が設定されていません' }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login credentials') || msg.includes('invalid credential') || msg.includes('wrong password')) {
        return { user: null, error: 'auth/wrong-password' }
      }
      if (msg.includes('user not found') || msg.includes('no user found')) {
        return { user: null, error: 'auth/user-not-found' }
      }
      if (msg.includes('invalid email')) {
        return { user: null, error: 'auth/invalid-email' }
      }
      return { user: null, error: 'auth/generic' }
    }
    return { user: data.user }
  } catch {
    return { user: null, error: 'auth/generic' }
  }
}

export async function signupWithEmail(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  if (!supabase) return { user: null, error: 'Supabase が設定されていません' }
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already in use') || msg.includes('user already exists')) {
        return { user: null, error: 'auth/email-already-in-use' }
      }
      if (msg.includes('weak password') || msg.includes('password should be')) {
        return { user: null, error: 'auth/weak-password' }
      }
      if (msg.includes('invalid email')) {
        return { user: null, error: 'auth/invalid-email' }
      }
      return { user: null, error: 'auth/generic' }
    }
    return { user: data.user ?? null }
  } catch {
    return { user: null, error: 'auth/generic' }
  }
}

export async function resetPasswordForEmail(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase が設定されていません' }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: error.message }
    return {}
  } catch {
    return { error: 'auth/generic' }
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
