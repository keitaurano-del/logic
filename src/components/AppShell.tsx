import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { t } from '../i18n'

export type Tab = 'home' | 'lessons' | 'stats' | 'profile'

export interface TabDef {
  id: Tab
  label: string
  icon: (active: boolean, dark?: boolean) => ReactNode
}

const TABS: TabDef[] = [
  {
    id: 'home',
    label: 'ホーム',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#70D8BD' : '#3B5BDB') : (dark ? '#7A8E8D' : '#B8BFD0')}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'レッスン',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#70D8BD' : '#3B5BDB') : (dark ? '#7A8E8D' : '#B8BFD0')}>
        <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20V2H6.5zm0 18A.5.5 0 0 1 6 19.5V17h14v3H6.5zM6 15V4h12v11H6z"/>
      </svg>
    ),
  },
  {
    id: 'stats',
    label: '記録',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#70D8BD' : '#3B5BDB') : (dark ? '#7A8E8D' : '#B8BFD0')}>
        <path d="M4 20h2V10H4v10zm5 0h2V4H9v16zm5 0h2V8h-2v12zm5 0h2v-6h-2v6z"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'プロフィール',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#70D8BD' : '#3B5BDB') : (dark ? '#7A8E8D' : '#B8BFD0')}>
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
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
  const isV3 = typeof window !== 'undefined' && localStorage.getItem('logic_v3') === '1'

  void t // keep import

  // Hide tab bar on scroll down, show on scroll up
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  useEffect(() => {
    if (hideTabBar) return
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

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: isV3 ? '#082121' : '#F0F4FF', display: 'flex', flexDirection: 'column' }}>
      {/* コンテンツエリア */}
      <div id="app-scroll-container" style={{ flex: 1, paddingBottom: hideTabBar ? 0 : 82, overflowY: 'auto' }}>
        {children}
      </div>

      {/* タブバー */}
      {!hideTabBar && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 82,
          background: isV3 ? 'rgba(8,33,33,.97)' : 'rgba(240,244,255,.97)',
          backdropFilter: 'blur(20px)',
          borderTop: isV3 ? '1px solid rgba(255,255,255,.05)' : '1px solid #E2E8FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px 16px',
          zIndex: 100,
          transform: navHidden ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', minWidth: 60 }}
              >
                {tab.icon(active, isV3)}
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? (isV3 ? '#70D8BD' : '#3B5BDB') : (isV3 ? '#7A8E8D' : '#7A849E') }}>{tab.label}</div>
                {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isV3 ? '#70D8BD' : '#3B5BDB', marginTop: -2 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
