import { Dialog } from '@capacitor/dialog'
import { isNative } from './platform'

/** OS-native alert (UIAlertController on iOS, AlertDialog on Android). */
export async function alert(title: string, message?: string): Promise<void> {
  if (isNative()) {
    await Dialog.alert({ title, message: message ?? '' })
    return
  }
  window.alert(`${title}\n\n${message ?? ''}`)
}

/** OS-native confirm. Returns true if the user pressed the OK button. */
export async function confirm(opts: {
  title: string
  message?: string
  okText?: string
  cancelText?: string
}): Promise<boolean> {
  if (isNative()) {
    const res = await Dialog.confirm({
      title: opts.title,
      message: opts.message ?? '',
      okButtonTitle: opts.okText ?? 'OK',
      cancelButtonTitle: opts.cancelText ?? 'キャンセル',
    })
    return res.value
  }
  return window.confirm(`${opts.title}\n\n${opts.message ?? ''}`)
}

/** OS-native prompt. Returns null if the user cancelled. */
export async function prompt(opts: {
  title: string
  message?: string
  placeholder?: string
  okText?: string
  cancelText?: string
}): Promise<string | null> {
  if (isNative()) {
    const res = await Dialog.prompt({
      title: opts.title,
      message: opts.message ?? '',
      okButtonTitle: opts.okText ?? 'OK',
      cancelButtonTitle: opts.cancelText ?? 'キャンセル',
      inputPlaceholder: opts.placeholder ?? '',
    })
    return res.cancelled ? null : res.value
  }
  return window.prompt(opts.title, opts.placeholder ?? '')
}
