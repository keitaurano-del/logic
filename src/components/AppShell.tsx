import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { t } from '../i18n'
import { isAndroid, isIOS } from '../platform'
import { haptic } from '../platform/haptics'
import './AppShell.css'

export type Tab = 'home' | 'lessons' | 'ranking' | 'profile'

export interface TabDef {
  id: Tab
  label: string
  icon: (active: boolean) => ReactNode
}

const ACTIVE = 'var(--md-sys-color-primary)'
const INACTIVE = 'var(--md-sys-color-on-surface-variant)'

const TABS: TabDef[] = [
  {
    id: 'home',
    label: 'ホーム',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? ACTIVE : INACTIVE}
        aria-hidden="true">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'トレーニング',
    icon: (active) => {
      const c = active ? ACTIVE : INACTIVE
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="5" width="3" height="14" rx="1" fill={c} />
          <rect x="5" y="8" width="2" height="8" rx="0.5" fill={c} />
          <rect x="17" y="8" width="2" height="8" rx="0.5" fill={c} />
          <rect x="19" y="5" width="3" height="14" rx="1" fill={c} />
          <rect x="7" y="11" width="10" height="2" rx="1" fill={c} />
        </svg>
      )
    },
  },
  {
    id: 'ranking',
    label: 'ランキング',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? ACTIVE : INACTIVE}
        aria-hidden="true">
        <path d="M7 17H3v-5h4v5zm7-9h-4v9h4V8zm7-4h-4v13h4V4z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'プロフィール',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? ACTIVE : INACTIVE}
        aria-hidden="true">
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
      </svg>
    ),
  },
]

interface AppShellProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  userName?: string
  userLevel?: string
  children: ReactNode
  hideTabBar?: boolean
}

export function AppShell({
  activeTab,
  onTabChange,
  children,
  hideTabBar = false,
}: AppShellProps) {
  void t // keep import for translations side-effects elsewhere

  // タブ切り替え時のスクロール位置リセット
  useEffect(() => {
    const container = document.getElementById('app-scroll-container')
    if (container) container.scrollTop = 0
  }, [activeTab])

  // Android のみ「スクロールで隠す」を維持。iOS では HIG に反するので無効。
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  useEffect(() => {
    if (hideTabBar || isIOS()) return
    const threshold = 10
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current + threshold) setNavHidden(true)
      else if (y < lastScrollY.current - threshold) setNavHidden(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideTabBar])

  const tabbarClass = ['app-tabbar', isAndroid() ? 'app-tabbar--android' : 'app-tabbar--ios', navHidden && 'app-tabbar--hidden']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="app-shell">
      <div id="app-scroll-container" className={`app-scroll ${hideTabBar ? 'app-scroll--full' : ''}`}>
        <main className="main-inner">{children}</main>
      </div>
      {!hideTabBar && (
        <nav className={`${tabbarClass} tabbar`} role="tablist" aria-label="メインナビゲーション">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={tab.label}
                className={`app-tab tab ${active ? 'app-tab--active' : ''}`}
                onClick={() => {
                  if (!active) haptic.light()
                  onTabChange(tab.id)
                }}
              >
                <span className="app-tab__icon">{tab.icon(active)}</span>
                <span className="app-tab__label">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
