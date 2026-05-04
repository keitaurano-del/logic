import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet'
import { isNative } from './platform'

export interface SheetOption {
  title: string
  destructive?: boolean
  cancel?: boolean
}

/**
 * Show the OS-native action sheet. Returns the selected option index, or -1
 * when the user cancelled (or when not running natively — caller should fall
 * back to the custom <ActionSheet/> bottom sheet for web).
 */
export async function presentActionSheet(opts: {
  title?: string
  message?: string
  options: SheetOption[]
}): Promise<number> {
  if (!isNative()) return -1
  const res = await ActionSheet.showActions({
    title: opts.title,
    message: opts.message,
    options: opts.options.map(o => ({
      title: o.title,
      style: o.destructive
        ? ActionSheetButtonStyle.Destructive
        : o.cancel
        ? ActionSheetButtonStyle.Cancel
        : ActionSheetButtonStyle.Default,
    })),
  })
  return res.index
}
