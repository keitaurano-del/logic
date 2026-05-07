// Admin mode: enabled via ?admin=1 (persisted in localStorage)
// Disable with ?admin=0

const KEY = 'logic-admin'
const params = new URLSearchParams(window.location.search)
if (params.get('admin') === '1') localStorage.setItem(KEY, '1')
else if (params.get('admin') === '0') localStorage.removeItem(KEY)

export const isAdmin = (): boolean => localStorage.getItem(KEY) === '1'
