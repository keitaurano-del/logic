import type { ReactNode } from 'react'
import { BookIcon, BrandMark, HomeIcon, UserIcon } from '../icons'

export type Tab = 'home' | 'lessons' | 'profile'

export interface TabDef {
  id: Tab
  label: string
  icon: ReactNode
}

const TABS: TabDef[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'lessons', label: 'Learn', icon: <BookIcon /> },
  { id: 'profile', label: 'You', icon: <UserIcon /> },
]

interface AppShellProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  userName?: string
  userLevel?: string
  children: ReactNode
}

export function AppShell({
  activeTab,
  onTabChange,
  userName = 'Guest',
  userLevel = 'Lv.1',
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <BrandMark />
          </div>
          Logic
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-nav-item${activeTab === t.id ? ' active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">👤</div>
          <div>
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-meta">{userLevel}</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">{children}</div>
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
