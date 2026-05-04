import { StatusBar, Style } from '@capacitor/status-bar'
import { isNative, isAndroid } from './platform'

const SURFACE = '#1A1F2E'

/**
 * Configure the status bar to match the Slate Blue dark theme.
 * Light icons on a dark surface for both platforms; Android additionally
 * gets edge-to-edge so content can extend underneath the system bars.
 */
export async function configureStatusBar(): Promise<void> {
  if (!isNative()) return
  try {
    await StatusBar.setStyle({ style: Style.Light })
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: SURFACE })
      await StatusBar.setOverlaysWebView({ overlay: true })
    }
  } catch (err) {
    console.warn('[statusBar] configure failed:', err)
  }
}
