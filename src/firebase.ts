import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type Auth, type User } from 'firebase/auth'

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

export async function loginWithGoogle(): Promise<{ user: User | null; error?: string }> {
  if (!auth || !provider) return { user: null, error: 'Firebase が設定されていません' }
  try {
    const result = await signInWithPopup(auth, provider)
    return { user: result.user }
  } catch (error) {
    console.error('Google login error:', error)
    const code = (error as { code?: string })?.code
    if (code === 'auth/popup-closed-by-user') return { user: null }
    if (code === 'auth/network-request-failed') return { user: null, error: 'ネットワークエラーが発生しました' }
    return { user: null, error: 'ログインに失敗しました' }
  }
}

export async function logout() {
  if (auth) await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

export type { User }
