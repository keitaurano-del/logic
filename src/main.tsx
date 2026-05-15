/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens-m3.css'
import './index.css'
import { initSentry } from './sentry'
import { setHtmlPlatformAttr, configureStatusBar, configureKeyboard } from './platform'
import { loadTheme, applyTheme } from './theme'

initSentry()

// Apply the user's saved theme (light/dark) before React mounts to avoid FOUC.
// applyTheme sets html.mode-{light|dark}; tokens.css resolves --bg-primary etc.
// New users default to 'dark' (see DEFAULT in theme.ts) for continuity with prior
// builds; existing users keep whatever they previously chose.
applyTheme(loadTheme())

// Tag <html data-platform="ios|android|web"> so CSS can branch on platform
// without a runtime JS check.
setHtmlPlatformAttr()

// Slate Blue dark status bar + Android edge-to-edge. Native-only no-op on web.
void configureStatusBar()
void configureKeyboard()

// Opt-in v3 preview via ?v=3 query param or localStorage flag.
// Default route remains the existing App; no regression for existing users.
const params = new URLSearchParams(window.location.search)
if (params.get('v') === '3') {
  localStorage.setItem('logic-v3-preview', '1')
} else if (params.get('v') === '1') {
  localStorage.setItem('logic-v3-preview', '0')
}
const useV3 = localStorage.getItem('logic-v3-preview') !== '0'

const App = lazy(() => import('./App'))
const AppV3 = lazy(() => import('./AppV3'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {useV3 ? <AppV3 /> : <App />}
    </Suspense>
  </StrictMode>,
)
