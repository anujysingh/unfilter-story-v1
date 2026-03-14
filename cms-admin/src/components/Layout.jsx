import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

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
              href="http://localhost:4321" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 text-[11px] font-black text-[var(--cms-accent)] border-2 border-[var(--cms-accent-light)] rounded-xl hover:bg-[var(--cms-accent-light)] transition-all"
            >
              Public Portal
            </a>
          </div>
        </header>
        <div className="p-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
