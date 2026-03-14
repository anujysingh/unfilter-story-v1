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
  Zap,
  ChevronLeft,
  ChevronRight
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

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[var(--cms-sidebar-bg)] text-[var(--cms-sidebar-text)] flex flex-col h-screen fixed shadow-2xl transition-all duration-300 ease-in-out z-[60]`}>
      <div className="h-24 flex items-center justify-between px-6 mb-4 relative">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-[var(--cms-sidebar-active-bg)] rounded-xl flex items-center justify-center text-[var(--cms-accent)] font-black text-xl shadow-lg shadow-black/20 shrink-0">
            U
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-xl text-white tracking-tighter transition-opacity duration-300">Unfilter</span>
          )}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--cms-accent)] text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-black/40 z-50`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-none">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                   title={isCollapsed ? item.label : ''}
                  className={({ isActive }) => 
                    `flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3.5 text-[16px] font-extrabold transition-all rounded-2xl group relative ${
                      isActive 
                        ? 'bg-[var(--cms-sidebar-active-bg)] text-[var(--cms-sidebar-active-text)] shadow-lg shadow-black/20 scale-[1.02]' 
                        : 'hover:bg-white/10 text-[var(--cms-sidebar-text)] hover:text-white'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-all ${isCollapsed ? 'm-0' : 'mr-3'}`} />
                  {!isCollapsed && <span className="truncate transition-opacity duration-300">{item.label}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1 bg-black text-white text-[10px] font-black rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-xl z-[100]">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={`p-6 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'w-full px-4'} py-3 text-sm font-extrabold text-[var(--cms-sidebar-text)] hover:text-red-400 transition-all group relative`}>
          <LogOut className={`w-5 h-5 group-hover:rotate-12 transition-transform ${isCollapsed ? 'm-0' : 'mr-3'}`} />
          {!isCollapsed && <span>Log Out</span>}
          
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-xl">
              Log Out
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
