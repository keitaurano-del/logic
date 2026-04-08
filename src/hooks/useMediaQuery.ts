import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query and re-render on match changes.
 * SSR-safe: returns false on the server, then picks up the real value
 * on the first client-side effect.
 */
export function useMediaQuery(query: string): boolean {
  const get = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false

  const [matches, setMatches] = useState<boolean>(get)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** Shortcut for the 900px desktop breakpoint used throughout v3 mocks. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 900px)')
}
