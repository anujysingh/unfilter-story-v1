import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect } from 'react'
import { Loader, Search, Mail, MailOpen, Trash2, RefreshCw } from 'lucide-react'

export default function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessagesBackground, 3000) // auto refresh every 3s
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await apiFetch(`/cms/v1/contact`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessagesBackground = async () => {
    try {
      const res = await apiFetch(`/cms/v1/contact`)
      if (res.ok) {
        setMessages(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchMessagesBackground()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await apiFetch(`/cms/v1/contact/${id}`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'unread' ? 'read' : 'unread'
    try {
      await apiFetch(`/cms/v1/contact/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setMessages(prev => prev.map(m => m.id === item.id ? { ...m, status: newStatus } : m))
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = messages.filter(m => 
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <div className="p-8"><Loader className="animate-spin text-gray-500" /></div>

  return (
    <div className="space-y-6 flex flex-col h-full max-w-7xl">
      <div className="flex justify-between items-center border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Inbox</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Review and manage contact submissions</p>
        </div>
        <button 
          onClick={handleManualRefresh}
          className={`flex items-center px-4 py-2.5 bg-gray-50 text-[var(--cms-accent)] text-sm font-extrabold rounded-xl hover:bg-gray-100 transition-all ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Inbox'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name, email, or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Sender</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Message Segment</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${item.status === 'unread' ? 'bg-[#f4fbf8]' : ''}`}>
                  <td className="px-6 py-4 w-12 text-center">
                    <button onClick={() => handleToggleStatus(item)} className="p-2 rounded-lg hover:bg-white transition-colors">
                      {item.status === 'unread' ? <Mail className="w-5 h-5 text-[var(--cms-accent)]" /> : <MailOpen className="w-5 h-5 text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${item.status === 'unread' ? 'font-extrabold text-gray-900' : 'font-medium text-gray-700'}`}>{item.name}</div>
                    <div className="text-xs text-gray-500 font-medium">{item.email}</div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${item.status === 'unread' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    {item.subject || 'No Subject'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 font-medium max-w-sm truncate" title={item.message}>
                      {item.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                 <tr>
                    <td colSpan="6" className="text-center py-20 text-gray-400 font-medium text-sm">
                      No messages found.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
