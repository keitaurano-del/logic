import { getGuestId } from './guestId'

import { API_BASE } from './apiBase'

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
