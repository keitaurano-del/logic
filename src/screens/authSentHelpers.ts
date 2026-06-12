// LR-18: shared helpers for the "magic link sent" screen used by both
// LoginScreen and OnboardingScreen's RegisterScreen.
//
// 1. useResendCooldown — disables the resend button for N seconds after a
//    successful resend to prevent rapid re-sends, exposing the remaining
//    seconds for the countdown label.
// 2. openMailApp — best-effort "open the mail app / inbox" action.
//
// Design note: the project does not ship @capacitor/app-launcher or
// @capacitor/browser, so we intentionally do NOT hard-code fragile native
// mail-app URL schemes. On the web we open a new tab to the generic mail
// handler only when the browser can; otherwise we report failure so the UI
// can fall back to a "check your mail app" hint. The spam-folder guidance is
// always shown regardless, so the inbox is reachable even if this no-ops.

import { useCallback, useEffect, useRef, useState } from 'react'

export const RESEND_COOLDOWN_SECONDS = 45

/**
 * Countdown cooldown for the resend button.
 *
 * Returns the remaining seconds (0 when ready) and a `start()` to (re)arm the
 * cooldown. Cleans up its interval on unmount.
 */
export function useResendCooldown(seconds: number = RESEND_COOLDOWN_SECONDS) {
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clear()
    setRemaining(seconds)
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clear()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [seconds, clear])

  useEffect(() => clear, [clear])

  return { remaining, start, active: remaining > 0 }
}

/**
 * Best-effort: open the user's mail app / web inbox.
 *
 * @returns true if we were able to trigger an open, false if the caller should
 *   fall back to showing a "check your mail app" hint. Never throws.
 */
export function openMailApp(): boolean {
  try {
    if (typeof window === 'undefined') return false
    // On the web, open a new tab to a generic inbox. We avoid guessing the
    // user's specific provider; window.open returning null (popup blocked)
    // signals failure so the UI can show guidance instead.
    const win = window.open('https://mail.google.com/mail/u/0/#inbox', '_blank', 'noopener,noreferrer')
    return win !== null
  } catch {
    return false
  }
}
