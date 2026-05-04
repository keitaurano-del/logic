export {
  getPlatform,
  isIOS,
  isAndroid,
  isWeb,
  isNative,
  setHtmlPlatformAttr,
  pickByPlatform,
} from './platform'
export type { PlatformId } from './platform'

export { configureStatusBar } from './statusBar'
export { hideSplash } from './splash'
export { haptic } from './haptics'
export { alert, confirm, prompt } from './dialog'
export { openShareSheet } from './share'
export { configureKeyboard, useKeyboardHeight } from './keyboard'
export { presentActionSheet } from './actionSheet'
export type { SheetOption } from './actionSheet'
export { usePrefersReducedMotion, prefersReducedMotion } from './motion'
