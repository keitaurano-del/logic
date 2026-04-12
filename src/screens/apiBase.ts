// Shared API base URL for dev/prod/native
import { Capacitor } from '@capacitor/core'

const PROD_API = import.meta.env.VITE_API_URL ?? 'https://logic-u5wn.onrender.com'

export const API_BASE = import.meta.env.DEV
  ? `http://${window.location.hostname}:3001`
  : Capacitor.isNativePlatform()
    ? PROD_API  // Android/iOS native: use absolute Render URL
    : ''        // Web fallback (relative URL)
