import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isNative } from '../platform'
import { presentActionSheet } from '../platform/actionSheet'
import { haptic } from '../platform/haptics'
import './ActionSheet.css'

export interface ActionSheetItem {
  id: string
  label: string
  icon?: ReactNode
  destructive?: boolean
}

interface ActionSheetProps {
  open: boolean
  title?: string
  message?: string
  items: ActionSheetItem[]
  onSelect: (id: string) => void
  onCancel: () => void
}

/**
 * Bottom sheet of options. On native iOS the OS action sheet is preferred —
 * use `presentActionSheet()` from `src/platform/actionSheet` directly when you
 * don't need a custom item layout. This component is the cross-platform
 * fallback (web + Android with custom items / icons).
 */
export function ActionSheet({ open, title, message, items, onSelect, onCancel }: ActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- scrim タップでの dismiss は意図通り (キーボードは Escape で代替済)
    <div className="m3-sheet__scrim" role="dialog" aria-modal="true" aria-label={title ?? 'Options'} onClick={onCancel}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- sheet 本体内クリックは event 伝播停止のみ */}
      <div
        className="m3-sheet"
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="m3-sheet__handle" />
        {title && <div className="m3-sheet__title">{title}</div>}
        {message && <div className="m3-sheet__msg">{message}</div>}
        <ul className="m3-sheet__list">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                className={`m3-sheet__item ${it.destructive ? 'm3-sheet__item--destructive' : ''}`}
                onClick={() => { haptic.light(); onSelect(it.id) }}
              >
                {it.icon && <span className="m3-sheet__icon" aria-hidden="true">{it.icon}</span>}
                <span className="m3-sheet__label">{it.label}</span>
              </button>
            </li>
          ))}
          <li className="m3-sheet__cancel-row">
            <button type="button" className="m3-sheet__item m3-sheet__item--cancel" onClick={onCancel}>
              キャンセル
            </button>
          </li>
        </ul>
      </div>
    </div>,
    document.body
  )
}

/**
 * Convenience: on native iOS use the OS action sheet; otherwise fall back to
 * the custom React component. Returns the selected item id, or null.
 */
// eslint-disable-next-line react-refresh/only-export-components
export async function selectFromActionSheet(opts: {
  title?: string
  message?: string
  items: ActionSheetItem[]
}): Promise<string | null> {
  if (isNative()) {
    const idx = await presentActionSheet({
      title: opts.title,
      message: opts.message,
      options: [
        ...opts.items.map((it) => ({ title: it.label, destructive: it.destructive })),
        { title: 'キャンセル', cancel: true },
      ],
    })
    if (idx < 0 || idx >= opts.items.length) return null
    return opts.items[idx].id
  }
  return null
}
