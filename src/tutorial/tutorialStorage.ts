const KEYS = {
  home: 'logic-tutorial-home-done',
  daily: 'logic-tutorial-daily-done',
  lesson: 'logic-tutorial-lesson-done',
  placementDismissed: 'logic-tutorial-placement-dismissed',
  fabDismissed: 'logic-tutorial-fab-dismissed',
} as const

export const tutorial = {
  hasSeenHome: () => { try { return localStorage.getItem(KEYS.home) === '1' } catch { return false } },
  hasSeenDaily: () => { try { return localStorage.getItem(KEYS.daily) === '1' } catch { return false } },
  hasSeenLesson: () => { try { return localStorage.getItem(KEYS.lesson) === '1' } catch { return false } },
  hasPlacementDismissed: () => { try { return localStorage.getItem(KEYS.placementDismissed) === '1' } catch { return false } },
  hasFABDismissed: () => { try { return localStorage.getItem(KEYS.fabDismissed) === '1' } catch { return false } },
  markHome: () => { try { localStorage.setItem(KEYS.home, '1') } catch { /* */ } },
  markDaily: () => { try { localStorage.setItem(KEYS.daily, '1') } catch { /* */ } },
  markLesson: () => { try { localStorage.setItem(KEYS.lesson, '1') } catch { /* */ } },
  markPlacementDismissed: () => { try { localStorage.setItem(KEYS.placementDismissed, '1') } catch { /* */ } },
  markFABDismissed: () => { try { localStorage.setItem(KEYS.fabDismissed, '1') } catch { /* */ } },
}
