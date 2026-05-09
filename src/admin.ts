// Admin mode: enabled via ?admin=1 (persisted in localStorage)
// Disable with ?admin=0
// NOTE: URL parameter activation is restricted to dev builds only.

const KEY = 'logic-admin'
const params = new URLSearchParams(window.location.search)

if (import.meta.env.DEV) {
  // 開発環境のみ: URLパラメータで有効化/無効化できる
  if (params.get('admin') === '1') localStorage.setItem(KEY, '1')
  else if (params.get('admin') === '0') localStorage.removeItem(KEY)
} else {
  // 本番環境: URLパラメータによる有効化は不可（無効化は許可）
  if (params.get('admin') === '0') localStorage.removeItem(KEY)
}

export const isAdmin = (): boolean => localStorage.getItem(KEY) === '1'
