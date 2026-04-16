import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  type Auth, type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let provider: GoogleAuthProvider | null = null

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    provider = new GoogleAuthProvider()
  }
} catch (e) {
  console.warn('Firebase initialization skipped:', e)
}

// Capacitor WebView では popup が動作しない場合があるため redirect を使う
function isCapacitor(): boolean {
  try { return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() } catch { return false }
}

export async function loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (!auth || !provider) return { user: null, error: 'Firebase が設定されていません' }
  try {
    if (isCapacitor()) {
      await signInWithRedirect(auth, provider)
      return { user: null } // redirect — result handled on return
    }
    const result = await signInWithPopup(auth, provider)
    return { user: result.user }
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'auth/popup-closed-by-user') return { user: null }
    if (code === 'auth/network-request-failed') return { user: null, error: 'ネットワークエラーが発生しました' }
    return { user: null, error: 'ログインに失敗しました' }
  }
}

export async function handleGoogleRedirectResult(): Promise<User | null> {
  if (!auth) return null
  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch { return null }
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  if (!auth) return { user: null, error: 'Firebase が設定されていません' }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user }
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return { user: null, error: 'auth/wrong-password' }
    if (code === 'auth/user-not-found') return { user: null, error: 'auth/user-not-found' }
    if (code === 'auth/invalid-email') return { user: null, error: 'auth/invalid-email' }
    return { user: null, error: 'auth/generic' }
  }
}

export async function signupWithEmail(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  if (!auth) return { user: null, error: 'Firebase が設定されていません' }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user }
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'auth/email-already-in-use') return { user: null, error: 'auth/email-already-in-use' }
    if (code === 'auth/weak-password') return { user: null, error: 'auth/weak-password' }
    if (code === 'auth/invalid-email') return { user: null, error: 'auth/invalid-email' }
    return { user: null, error: 'auth/generic' }
  }
}

export function isFirebaseConfigured(): boolean { return !!auth }

export async function logout() {
  if (auth) await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

export type { User }
