import { createClient } from '@supabase/supabase-js'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { LOGOUT_KEEP_KEYS } from './logoutKeepKeys'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const NATIVE_REDIRECT_URL = 'logic://auth'

let supabase: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    // implicit フロー（デフォルト）を維持。PKCE にすると `signInWithOtp` が
    // PKCE verifier 紐付きのトークンを発行し、6桁 OTP 検証が即 otp_expired で
    // 弾かれるため使えない。マジックリンクは implicit の hash フラグメント
    // (#access_token=...) で返るので、deep link 側の handleAuthRedirect で
    // setSession にフォールバックすれば成立する。
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Native では deep link 経由でセッションを手動交換するため自動検出を無効化
        detectSessionInUrl: !Capacitor.isNativePlatform(),
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

export async function sendMagicLink(email: string): Promise<{ error?: string }> {
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

export async function logout() {
  // 2026-05-16: ログアウト直後に UI 側で残データが見える問題があったため、
  // ローカルストレージを supabase.signOut() の前に同期クリアして再描画時には
  // 必ず空の状態になるようにする。`syncOnLogout` (onAuthChange 経由) は
  // 二度走っても idempotent なのでそのまま残す。
  clearLocalUserData()
  if (supabase) await supabase.auth.signOut()
}

// ローカルストレージから個人データを削除する。UI 永続キー（locale, theme,
// install-id, onboarded など）と再構築コストの高いユーザーコンテンツは残す。
// 保持キーは syncService.syncOnLogout と共通の単一定義 (./logoutKeepKeys) を
// 使う。過去にこの2経路の保持リストがズレてフラッシュカード・保存コンテンツ・
// 誤答リスト・XP・ストリークフリーズ・文字サイズ等が消える事故があったため、
// コメントでの一致確認ではなく構造（単一 import）で担保する (FB-16)。
//
// テスト可能にするため export している（実ログアウト経路の回帰テスト用）。
export function clearLocalUserData() {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('logic-') && !LOGOUT_KEEP_KEYS.has(k)) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  } catch (e) {
    console.warn('clearLocalUserData failed:', e)
  }
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

/**
 * 登録メールアドレスを変更する。Supabase は新しいアドレスに確認リンクを送信し、
 * ユーザーがそのリンクをタップして初めて変更が確定する。
 * - 成功: { ok: true } を返す（リンクが送信された）
 * - 失敗: { error: '<code>' } を返す
 */
export async function updateUserEmail(newEmail: string): Promise<{ ok?: true; error?: string }> {
  if (!supabase) return { error: 'auth/not-configured' }
  const trimmed = newEmail.trim()
  if (!trimmed) return { error: 'auth/invalid-email' }
  try {
    const emailRedirectTo = Capacitor.isNativePlatform()
      ? NATIVE_REDIRECT_URL
      : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.updateUser(
      { email: trimmed },
      { emailRedirectTo },
    )
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid email')) return { error: 'auth/invalid-email' }
      if (msg.includes('rate') || msg.includes('too many')) return { error: 'auth/rate-limited' }
      if (msg.includes('already') && msg.includes('registered')) return { error: 'auth/email-in-use' }
      return { error: 'auth/generic' }
    }
    return { ok: true }
  } catch {
    return { error: 'auth/generic' }
  }
}
