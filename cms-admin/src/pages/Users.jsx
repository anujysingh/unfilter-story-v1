import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect } from 'react'
import { UserPlus, Search, Settings as SettingsIcon, X, Mail, Shield, User as UserIcon, Trash2, CheckCircle2, XCircle, MoreVertical } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'Editor',
    designation: '',
    password: ''
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/cms/v1/users`)
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to fetch users:', e)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    try {
      const res = await apiFetch(`/cms/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to invite user')
      }
      setIsModalOpen(false)
      setFormData({ email: '', firstName: '', lastName: '', role: 'Editor', designation: '', password: '' })
      fetchUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const res = await apiFetch(`/cms/v1/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      })
      if (res.ok) fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member? This action cannot be undone.')) return
    try {
      const res = await apiFetch(`/cms/v1/users/${id}`, { method: 'DELETE' })
      if (res.ok) fetchUsers()
      else alert('Failed to delete user')
    } catch (e) {
      console.error(e)
    }
  }

  const filteredUsers = users.filter(u => {
    const fullSearch = `${u.firstName || ''} ${u.lastName || ''} ${u.email} ${u.role} ${u.designation || ''}`.toLowerCase()
    return fullSearch.includes(searchQuery.toLowerCase())
  })

  const getInitials = (user) => {
    const f = user.firstName?.[0] || ''
    const l = user.lastName?.[0] || 'U'
    return `${f}${l}`.toUpperCase()
  }

  return (
    <div className="space-y-6 flex flex-col h-full relative animate-in fade-in duration-700">
      {/* Header section with page title and primary action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-100 pb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Operational Control</span>
          </div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1]">Users & Roles</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight mt-2">Manage your editorial team and access permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center px-8 py-4 bg-[var(--cms-accent)] text-white text-sm font-extrabold rounded-2xl shadow-[0_10px_30px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <UserPlus className="w-5 h-5 mr-3 relative z-10" />
          <span className="relative z-10 tracking-widest">INVITE USER</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-[32rem]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest px-4 border-l border-gray-100">
           Total: <span className="text-[var(--cms-accent)] text-sm font-black ml-1">{users.length}</span>
        </div>
      </div>

      {/* Main Users Table Grid */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Team Member</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Authorization</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Operational Status</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-[var(--cms-accent)] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronizing Team Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-40 text-center">
                    <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                      <UserIcon size={48} />
                      <p className="text-sm font-black uppercase tracking-widest">No active personnel found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[var(--cms-accent)] to-[var(--cms-accent-light)] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-[var(--cms-accent)]/20 transform group-hover:rotate-6 transition-transform">
                        {getInitials(user)}
                      </div>
                      <div className="ml-5">
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-[var(--cms-accent)] transition-colors">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user.designation || 'Staff Member'}</div>
                        <div className="text-xs text-gray-300 font-mono mt-1">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Shield size={12} className="text-[var(--cms-accent)]" />
                       <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[var(--cms-accent-light)] text-[var(--cms-accent)] border border-[var(--cms-accent)]/10 shadow-sm">
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        user.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                      }`}
                    >
                      {user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {user.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-[var(--cms-accent)] hover:border-[var(--cms-accent-light)] rounded-2xl transition-all shadow-sm hover:shadow-md">
                        <SettingsIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
            {/* Modal Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cms-accent-light)] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-30"></div>
            
            <div className="p-10 border-b border-gray-50 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">Access Invitation</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Credentials Provisioning Engine</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
              >
                <X className="w-6 h-6 text-gray-300 group-hover:text-gray-900 transition-colors" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-10 pt-8 space-y-8 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Legal First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      required
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full pl-14 pr-5 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
                      placeholder="e.g. John"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Legal Last Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Corporate Email Identifier</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
                    placeholder="john.doe@unfilterstory.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Temporary Password (min 8 chars)</label>
                <div className="relative">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
                    placeholder="Set an initial password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Security Role</label>
                  <div className="relative">
                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full pl-14 pr-5 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all appearance-none cursor-pointer"
                    >
                      <option value="Admin">ADMINISTRATOR</option>
                      <option value="Editor">EDITOR</option>
                      <option value="Author">AUTHOR</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Professional Title</label>
                  <input 
                    type="text" 
                    value={formData.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--cms-accent-light)] transition-all placeholder:text-gray-300"
                    placeholder="e.g. Senior Tech Editor"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-5 bg-gray-50 text-gray-500 font-extrabold text-xs rounded-[1.5rem] hover:bg-gray-100 transition-all tracking-[0.2em]"
                >
                  DISCARD
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-[var(--cms-accent)] text-white font-extrabold text-xs rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,93,59,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em]"
                >
                  CONFIRM & SEND INVITE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
