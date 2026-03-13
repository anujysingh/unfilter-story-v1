import React from 'react'
import { UserPlus, Search, Settings as SettingsIcon } from 'lucide-react'

export default function Users() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Users & Roles</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Manage your editorial team and access permissions</p>
        </div>
        <button className="flex items-center px-6 py-3 bg-[var(--cms-accent)] text-white text-sm font-extrabold rounded-xl shadow-[0_8px_20px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all tracking-widest">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search team members..." 
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-[#E5E7EB]">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            <tr className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[var(--cms-accent)] flex items-center justify-center text-white font-black text-sm italic shadow-lg shadow-[var(--cms-accent)]/20">
                    KS
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Kritika S</div>
                    <div className="text-sm text-gray-500">kritika@unfilterstory.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[var(--cms-accent-light)] text-[var(--cms-accent)]">
                  Admin
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <SettingsIcon className="w-5 h-5 inline-block" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
