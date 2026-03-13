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
  Map
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Articles', icon: PenTool, path: '/articles' },
  { label: 'Media Library', icon: ImageIcon, path: '/media' },
  { label: 'Categories & Tags', icon: FolderTree, path: '/taxonomy' },
  { label: 'Header Navigation', icon: Menu, path: '/navigation' },
  { label: 'Site Architecture', icon: Map, path: '/architecture' },
  { label: 'Users', icon: Users, path: '/users' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#111827] text-[#D1D5DB] flex flex-col h-screen fixed">
      <div className="h-16 flex items-center justify-center font-bold text-xl text-white tracking-tight border-b border-gray-800">
        Unfilter Story
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'border-l-4 border-[#E94560] text-white bg-white/5' 
                        : 'border-l-4 border-transparent hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
