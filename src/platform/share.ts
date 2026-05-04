import { Share } from '@capacitor/share'
import { isNative } from './platform'

interface ShareOptions {
  title?: string
  text: string
  url?: string
  dialogTitle?: string
}

/** Open the native share sheet. Falls back to Web Share API or clipboard. */
export async function openShareSheet(opts: ShareOptions): Promise<void> {
  if (isNative()) {
    await Share.share({
      title: opts.title,
      text: opts.text,
      url: opts.url,
      dialogTitle: opts.dialogTitle ?? '共有',
    })
    return
  }
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({ title: opts.title, text: opts.text, url: opts.url })
    return
  }
  const fallback = [opts.title, opts.text, opts.url].filter(Boolean).join('\n')
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(fallback)
  }
}
