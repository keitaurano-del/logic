import { getGuestId } from './guestId'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

export async function resetAllData(): Promise<void> {
  const guestId = getGuestId()
  // Best-effort: delete server-side ranking entry
  try {
    await fetch(`${API_BASE}/api/placement/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId }),
    })
  } catch {
    /* ignore network errors; we still wipe local data */
  }
  // Wipe ALL localStorage entries used by Logic
  try {
    localStorage.clear()
  } catch {
    /* */
  }
}
