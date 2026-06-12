import { describe, it, expect, vi, beforeEach } from 'vitest'

// LR-22: setLocale must keep <html lang> in sync, and importing i18n must set
// lang from the detected locale at module load.

describe('LR-22 html lang follows locale', () => {
  beforeEach(() => {
    vi.resetModules()
    document.documentElement.lang = ''
  })

  it('sets <html lang> on module load from the saved locale', async () => {
    localStorage.setItem('logic-locale', 'en')
    await import('../i18n')
    expect(document.documentElement.lang).toBe('en')
  })

  it('setLocale updates <html lang> to the new locale', async () => {
    localStorage.setItem('logic-locale', 'ja')
    const mod = await import('../i18n')
    // window.location.reload is a no-op/throws in jsdom; stub so the lang
    // assignment (which happens before reload) is exercised cleanly.
    const reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    })
    mod.setLocale('en')
    expect(document.documentElement.lang).toBe('en')
    expect(mod.getLocale()).toBe('en')
  })
})
