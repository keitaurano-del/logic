import { SplashScreen } from '@capacitor/splash-screen'
import { isNative } from './platform'

let hidden = false

/** Hide the splash screen exactly once, with a short fade-out. */
export async function hideSplash(): Promise<void> {
  if (!isNative() || hidden) return
  hidden = true
  try {
    await SplashScreen.hide({ fadeOutDuration: 200 })
  } catch (err) {
    console.warn('[splash] hide failed:', err)
  }
}
