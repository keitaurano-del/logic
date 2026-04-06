// Guest user identity stored in localStorage.
// Auto-generates a random ID on first visit so users can use the app
// without registration. ID is editable from the Profile screen.

const STORAGE_KEY = 'logic-guest-user'

export type GuestUser = {
  id: string
  createdAt: string
}

function generateId(): string {
  // Format: guest-XXXX (4 random alphanumeric chars)
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `guest-${suffix}`
}

export function loadGuestUser(): GuestUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  // Auto-create on first access
  const newUser: GuestUser = {
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
  return newUser
}

export function updateGuestId(newId: string): GuestUser {
  const trimmed = newId.trim().slice(0, 32)
  if (!trimmed) throw new Error('IDを入力してください')
  const user = loadGuestUser()
  user.id = trimmed
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function resetGuestUser(): GuestUser {
  const newUser: GuestUser = {
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
  return newUser
}
