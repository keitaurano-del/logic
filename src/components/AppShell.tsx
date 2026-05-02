import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { t } from '../i18n'

export type Tab = 'home' | 'lessons' | 'ranking' | 'profile'

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
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#6C8EF5' : '#3B5BDB') : (dark ? '#6B82A8' : '#B8BFD0')}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'lessons',
    label: 'トレーニング',
    icon: (active, dark) => {
      const c = active ? (dark ? '#6C8EF5' : '#3B5BDB') : (dark ? '#6B82A8' : '#B8BFD0')
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5h1v11h-1z" fill={c} stroke="none"/>
          <rect x="2" y="5" width="3" height="14" rx="1" fill={c} stroke="none"/>
          <rect x="5" y="8" width="2" height="8" rx="0.5" fill={c} stroke="none"/>
          <rect x="17" y="8" width="2" height="8" rx="0.5" fill={c} stroke="none"/>
          <rect x="19" y="5" width="3" height="14" rx="1" fill={c} stroke="none"/>
          <rect x="7" y="11" width="10" height="2" rx="1" fill={c} stroke="none"/>
        </svg>
      )
    },
  },
  {
    id: 'ranking',
    label: 'ランキング',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#6C8EF5' : '#3B5BDB') : (dark ? '#6B82A8' : '#B8BFD0')}>
        <path d="M7 17H3v-5h4v5zm7-9h-4v9h4V8zm7-4h-4v13h4V4z"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'プロフィール',
    icon: (active, dark) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? (dark ? '#6C8EF5' : '#3B5BDB') : (dark ? '#6B82A8' : '#B8BFD0')}>
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
  const isV3 = true

  void t // keep import

  // スクロール位置リセット（タブ切り替え時）
  useEffect(() => {
    const container = document.getElementById('app-scroll-container')
    if (container) {
      container.scrollTop = 0
    }
  }, [activeTab])

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
    <div style={{ position: 'relative', minHeight: '100dvh', background: isV3 ? '#1A1F2E' : '#F0F4FF', display: 'flex', flexDirection: 'column' }}>
      {/* コンテンツエリア */}
      <div id="app-scroll-container" style={{ flex: 1, paddingBottom: hideTabBar ? 0 : 82, overflowY: 'auto' }}>
        {children}
      </div>

      {/* タブバー */}
      {!hideTabBar && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 82,
          background: isV3 ? 'rgba(26,31,46,.97)' : 'rgba(240,244,255,.97)',
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
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? (isV3 ? '#6C8EF5' : '#3B5BDB') : (isV3 ? '#6B82A8' : '#7A849E') }}>{tab.label}</div>
                {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isV3 ? '#6C8EF5' : '#3B5BDB', marginTop: -2 }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
