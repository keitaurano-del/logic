/**
 * useWindowSize - Responsive Design用 Hook
 * ウィンドウサイズ監視、メディアクエリ判定
 */
import { useState, useEffect } from 'react'

export const BREAKPOINTS = {
  sm: 360,   // スマートフォン
  md: 768,   // 7インチタブレット
  lg: 1024,  // 10インチタブレット
  xl: 1280,  // デスクトップ
} as const

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }))

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }
    
    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)
    
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// Convenience hooks
export function useIsMobile() {
  const { width } = useWindowSize()
  return width < BREAKPOINTS.md
}

export function useIsTablet() {
  const { width } = useWindowSize()
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

export function useIsLargeTablet() {
  const { width } = useWindowSize()
  return width >= BREAKPOINTS.lg
}

export function useIsDesktop() {
  const { width } = useWindowSize()
  return width >= BREAKPOINTS.xl
}

/**
 * レスポンシブグリッド列数判定
 * @param width ウィンドウ幅
 * @returns グリッド列数
 */
export function getGridColumns(width: number): number {
  if (width < BREAKPOINTS.md) return 1  // スマートフォン: 1列
  if (width < BREAKPOINTS.lg) return 2  // タブレット: 2列
  return 3  // 大画面: 3列
}
