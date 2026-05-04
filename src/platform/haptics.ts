import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isNative } from './platform'

/**
 * Wrapped haptics API. All methods are safe to call on web (no-op).
 *
 * Usage guideline:
 *   - Button tap         -> haptic.light()
 *   - Lesson correct     -> haptic.success()
 *   - Lesson incorrect   -> haptic.warning()
 *   - Destructive action -> haptic.medium()
 *   - Toggle / selection -> haptic.selection()
 *   - Network error      -> haptic.error()
 */
export const haptic = {
  light: () =>
    isNative() && Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}),
  medium: () =>
    isNative() && Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}),
  heavy: () =>
    isNative() && Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {}),
  selection: () =>
    isNative() &&
    Haptics.selectionStart()
      .then(() => Haptics.selectionEnd())
      .catch(() => {}),
  success: () =>
    isNative() &&
    Haptics.notification({ type: NotificationType.Success }).catch(() => {}),
  warning: () =>
    isNative() &&
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {}),
  error: () =>
    isNative() &&
    Haptics.notification({ type: NotificationType.Error }).catch(() => {}),
}
