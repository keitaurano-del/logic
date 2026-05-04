import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Snackbar.css'

interface SnackbarItem {
  id: number
  message: string
  action?: { label: string; onClick: () => void }
  duration: number
}

interface SnackbarApi {
  show: (msg: string, opts?: { action?: SnackbarItem['action']; duration?: number }) => void
  dismiss: (id?: number) => void
}

const SnackbarContext = createContext<SnackbarApi | null>(null)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SnackbarItem[]>([])
  const idRef = useRef(0)

  const dismiss = useCallback((id?: number) => {
    setItems(prev => (id == null ? [] : prev.filter(it => it.id !== id)))
  }, [])

  const show = useCallback<SnackbarApi['show']>((message, opts) => {
    const id = ++idRef.current
    setItems(prev => [...prev, { id, message, action: opts?.action, duration: opts?.duration ?? 4000 }])
  }, [])

  const api: SnackbarApi = { show, dismiss }

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined'
        && createPortal(<SnackbarStack items={items} onDismiss={dismiss} />, document.body)}
    </SnackbarContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSnackbar(): SnackbarApi {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be used within <SnackbarProvider>')
  return ctx
}

function SnackbarStack({ items, onDismiss }: { items: SnackbarItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="m3-snackbar-stack">
      {items.map(it => (
        <SnackbarToast key={it.id} item={it} onDismiss={() => onDismiss(it.id)} />
      ))}
    </div>
  )
}

function SnackbarToast({ item, onDismiss }: { item: SnackbarItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, item.duration)
    return () => clearTimeout(t)
  }, [item.duration, onDismiss])

  return (
    <div className="m3-snackbar" role="status" aria-live="polite">
      <div className="m3-snackbar__msg">{item.message}</div>
      {item.action && (
        <button
          type="button"
          className="m3-snackbar__action"
          onClick={() => { item.action?.onClick(); onDismiss() }}
        >
          {item.action.label}
        </button>
      )}
    </div>
  )
}
