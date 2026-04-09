// Admin mode: enabled via ?admin=1 (persisted in localStorage)
// Disable with ?admin=0

const KEY = 'logic-admin'
const params = new URLSearchParams(window.location.search)
if (params.get('admin') === '1') localStorage.setItem(KEY, '1')
else if (params.get('admin') === '0') localStorage.removeItem(KEY)

export const isAdmin = (): boolean => localStorage.getItem(KEY) === '1'

/** Lesson IDs that are admin-only (not shown in production) */
export const ADMIN_LESSON_IDS = new Set([30, 31, 32, 33, 34]) // PM入門

/** Screen types that are admin-only (for reference/documentation) */
export const ADMIN_SCREENS: ReadonlyArray<string> = ['journal-input', 'worksheet'] // 簿記
