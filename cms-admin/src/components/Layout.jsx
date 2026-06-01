import { PUBLIC_SITE_URL } from '../lib/config.js';
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[var(--cms-bg)] text-[var(--cms-text-primary)]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} flex flex-col transition-all duration-300 ease-in-out`}>
        <header className="h-20 border-b border-gray-100 bg-white flex items-center justify-between px-10 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[var(--cms-accent)] bg-[var(--cms-accent-light)] px-3 py-1.5 rounded-lg">Operational Control</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={PUBLIC_SITE_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 text-[11px] font-black text-[var(--cms-accent)] border-2 border-[var(--cms-accent-light)] rounded-xl hover:bg-[var(--cms-accent-light)] transition-all"
            >
              Public Portal
            </a>
            {user && (
              <span className="text-[11px] font-bold text-[var(--cms-text-secondary)] hidden md:inline">
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-[11px] font-black text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-50 transition-all"
            >
              Log out
            </button>
          </div>
        </header>
        <div className="p-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
