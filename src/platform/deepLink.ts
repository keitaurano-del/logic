import { App, type URLOpenListenerEvent } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { handleAuthRedirect } from '../supabase'

type DeepLinkOptions = {
  onAuthSuccess?: () => void
  onAuthError?: (code: string) => void
}

let initialized = false

/**
 * Capacitor native の URL Open イベントを購読し、Supabase 認証 deep link を処理する。
 * 例: logic://auth?code=xxx → exchangeCodeForSession → onAuthSuccess
 */
export function initAuthDeepLink(options: DeepLinkOptions = {}): void {
  if (initialized) return
  if (!Capacitor.isNativePlatform()) return
  initialized = true

  App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    const url = event.url
    if (!url || !url.startsWith('logic://auth')) return
    const result = await handleAuthRedirect(url)
    if (result.user) {
      options.onAuthSuccess?.()
    } else if (result.error) {
      options.onAuthError?.(result.error)
    }
  })
}
