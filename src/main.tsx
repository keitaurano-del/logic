import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppV3 from './AppV3.tsx'
import { initSentry } from './sentry'

initSentry()

// Opt-in v3 preview via ?v=3 query param or localStorage flag.
// Default route remains the existing App; no regression for existing users.
const params = new URLSearchParams(window.location.search)
if (params.get('v') === '3') {
  localStorage.setItem('logic-v3-preview', '1')
} else if (params.get('v') === '1') {
  localStorage.setItem('logic-v3-preview', '0')
}
const useV3 = localStorage.getItem('logic-v3-preview') !== '0'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {useV3 ? <AppV3 /> : <App />}
  </StrictMode>,
)
