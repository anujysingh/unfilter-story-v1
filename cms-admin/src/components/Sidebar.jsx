import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  PenTool, 
  Image as ImageIcon, 
  FolderTree, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Map,
  Zap
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Articles', icon: PenTool, path: '/articles' },
  { label: 'Media Library', icon: ImageIcon, path: '/media' },
  { label: 'Categories & Tags', icon: FolderTree, path: '/taxonomy' },
  { label: 'Header Navigation', icon: Menu, path: '/navigation' },
  { label: 'Site Architecture', icon: Map, path: '/architecture' },
  { label: 'Discovery Engine', icon: Zap, path: '/discovery' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[var(--cms-sidebar-bg)] text-[var(--cms-sidebar-text)] flex flex-col h-screen fixed shadow-2xl">
      <div className="h-24 flex items-center px-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--cms-sidebar-active-bg)] rounded-xl flex items-center justify-center text-[var(--cms-accent)] font-black text-xl italic shadow-lg shadow-black/20">
            U
          </div>
          <span className="font-extrabold text-xl text-white tracking-tighter">Unfilter</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3.5 text-[16px] font-extrabold transition-all rounded-2xl group ${
                      isActive 
                        ? 'bg-[var(--cms-sidebar-active-bg)] text-[var(--cms-sidebar-active-text)] shadow-lg shadow-black/20 scale-[1.02]' 
                        : 'hover:bg-white/10 text-[var(--cms-sidebar-text)] hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-8 border-t border-white/10">
        <button className="flex items-center w-full px-4 py-3 text-sm font-extrabold text-[var(--cms-sidebar-text)] hover:text-[var(--cms-sidebar-active-bg)] transition-all group tracking-widest">
          <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
