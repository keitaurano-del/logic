import { Capacitor } from '@capacitor/core'

export type PlatformId = 'ios' | 'android' | 'web'

export function getPlatform(): PlatformId {
  return Capacitor.getPlatform() as PlatformId
}

export const isIOS     = (): boolean => getPlatform() === 'ios'
export const isAndroid = (): boolean => getPlatform() === 'android'
export const isWeb     = (): boolean => getPlatform() === 'web'
export const isNative  = (): boolean => isIOS() || isAndroid()

/** Set <html data-platform="..."> at boot so CSS can branch on platform. */
export function setHtmlPlatformAttr(): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-platform', getPlatform())
}

export function pickByPlatform<T>(opts: { ios: T; android: T; web?: T }): T {
  if (isIOS()) return opts.ios
  if (isAndroid()) return opts.android
  return opts.web ?? opts.android
}
