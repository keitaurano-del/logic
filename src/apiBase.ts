// Shared API base URL for dev/prod/native
// Import this instead of defining API_BASE locally in each file.
import { Capacitor } from '@capacitor/core'

const PROD_API = import.meta.env.VITE_API_URL ?? 'https://logic-u5wn.onrender.com'

export const API_BASE = import.meta.env.DEV
  ? `http://${window.location.hostname}:3001`
  : Capacitor.isNativePlatform()
    ? PROD_API  // Android/iOS native: absolute Render URL
    : ''        // Web (Render serves both frontend + API on same origin)
