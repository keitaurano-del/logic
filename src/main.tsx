import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initSentry } from './sentry'

initSentry()

// Apply v3 dark theme to both html and body so CSS variables resolve consistently.
// Without the html class, computed `--bg-primary` on <html> falls back to the
// :root light value (#FAFAFB) and bleeds through behind the app shell.
document.documentElement.classList.add('mode-dark')
document.documentElement.classList.remove('mode-light')
document.body.classList.add('mode-dark')

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
