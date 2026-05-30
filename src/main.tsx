/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens-m3.css'
import './index.css'
import { initSentry } from './sentry'
import { setHtmlPlatformAttr, configureStatusBar, configureKeyboard } from './platform'
import { initAuthDeepLink } from './platform/deepLink'
import { loadTheme, applyTheme } from './theme'
import { loadFontScale, applyFontScale } from './fontScale'

initSentry()

// Resolve v3 / v1 routing first so theme bootstrap below knows whether
// to apply v3-specific body class.
const params = new URLSearchParams(window.location.search)
if (params.get('v') === '3') {
  localStorage.setItem('logic-v3-preview', '1')
} else if (params.get('v') === '1') {
  localStorage.setItem('logic-v3-preview', '0')
}
const useV3 = localStorage.getItem('logic-v3-preview') !== '0'

// Apply the user's saved theme (light/dark) before React mounts to avoid FOUC.
// applyTheme sets html.mode-{light|dark} AND body.mode-{light|dark};
// tokens.css resolves --bg-primary etc. via body.theme-v3.mode-{x}.
// We add `theme-v3` synchronously here (rather than waiting for AppV3's
// useEffect to mount) so the first paint already has the correct selector
// chain — otherwise dark users see a brief light flash on cold start.
// `body.theme-v3` is also re-added inside AppV3 as a safety net for HMR
// and is idempotent (classList.add deduplicates).
if (useV3) document.body.classList.add('theme-v3')
applyTheme(loadTheme())

// DF-F2: 保存済みの文字サイズ (--font-scale) を React マウント前に適用し、
// リロード後も選択が維持されるようにする。
applyFontScale(loadFontScale())

// Tag <html data-platform="ios|android|web"> so CSS can branch on platform
// without a runtime JS check.
setHtmlPlatformAttr()

// Slate Blue dark status bar + Android edge-to-edge. Native-only no-op on web.
void configureStatusBar()
void configureKeyboard()

// Native アプリ起動時に Supabase 認証 deep link を購読
// 認証成功時は onAuthChange が発火するため、ここでは追加処理は不要
initAuthDeepLink()

const App = lazy(() => import('./App'))
const AppV3 = lazy(() => import('./AppV3'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {useV3 ? <AppV3 /> : <App />}
    </Suspense>
  </StrictMode>,
)
