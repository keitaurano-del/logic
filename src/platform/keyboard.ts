import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { useEffect, useState } from 'react'
import { isIOS, isNative } from './platform'

/**
 * Configure the OS keyboard. iOS uses Native resize so the OS handles content
 * insets; Android resizes the WebView body so content reflows above the keyboard.
 */
export async function configureKeyboard(): Promise<void> {
  if (!isNative()) return
  try {
    await Keyboard.setResizeMode({
      mode: isIOS() ? KeyboardResize.Native : KeyboardResize.Body,
    })
    if (isIOS()) {
      await Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {})
    }
  } catch (err) {
    console.warn('[keyboard] configure failed:', err)
  }
}

/** Live keyboard height in CSS pixels (0 when hidden / not native). */
export function useKeyboardHeight(): number {
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!isNative()) return
    const showSub = Keyboard.addListener('keyboardWillShow', e => setH(e.keyboardHeight))
    const hideSub = Keyboard.addListener('keyboardWillHide', () => setH(0))
    return () => {
      showSub.then(s => s.remove())
      hideSub.then(s => s.remove())
    }
  }, [])
  return h
}
