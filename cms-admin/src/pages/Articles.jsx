import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, Calendar, ArrowRight, History, X, Tag as TagIcon, LayoutGrid, AlertTriangle, Send, Edit3, XCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const getStatusBadge = (status) => {
  const styles = {
    published: "bg-[var(--cms-accent-light)] text-[var(--cms-accent)]",
    scheduled: "bg-blue-50 text-blue-600",
    draft: "bg-gray-100 text-gray-600",
    unpublished: "bg-gray-200 text-gray-700",
    under_review: "bg-blue-50 text-blue-700"
  }
  
  const defaultStyle = "bg-gray-100 text-gray-800"
  return styles[status] || defaultStyle
}

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quickRange, setQuickRange] = useState('custom')
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [datePickerId, setDatePickerId] = useState(null)
  const [newPublishDate, setNewPublishDate] = useState('')
  const [allCategories, setAllCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null, type: 'warning', confirmText: 'Yes, Unpublish' })
  const [republishModal, setRepublishModal] = useState({ open: false, articleId: null, mode: 'now', scheduleDate: '', scheduleTime: '', label: 'Republish' })

  const fetchArticles = () => {
    apiFetch(`/cms/v1/articles`)
      .then(res => res.json())
      .then(data => {
        setArticles(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const fetchCategoriesAndTags = () => {
    apiFetch(`/cms/v1/categories`)
      .then(res => res.json())
      .then(data => setAllCategories(data || []))
      .catch(err => console.error('Failed to fetch categories', err))

    apiFetch(`/cms/v1/tags`)
      .then(res => res.json())
      .then(data => setAllTags(data || []))
      .catch(err => console.error('Failed to fetch tags', err))
  }

  useEffect(() => {
    fetchArticles();
    fetchCategoriesAndTags();
    const interval = setInterval(() => {
      fetchArticles();
      fetchCategoriesAndTags();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickRangeChange = (range) => {
    setQuickRange(range)
    if (range === 'custom') return

    const end = new Date()
    const start = new Date()
    
    if (range === '7d') start.setDate(end.getDate() - 7)
    else if (range === '15d') start.setDate(end.getDate() - 15)
    else if (range === '30d') start.setDate(end.getDate() - 30)
    else if (range === '90d') start.setDate(end.getDate() - 90)

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const handleUnpublish = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Unpublish Article',
      message: 'This article will be removed from the public site. You can republish it later.',
      type: 'warning',
      confirmText: 'Yes, Unpublish',
      onConfirm: async () => {
        try {
          await apiFetch(`/cms/v1/articles/${id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'unpublished' })
          })
          setOpenDropdownId(null)
          fetchArticles()
        } catch(err) {
          console.error("Failed to unpublish article", err)
        }
        setConfirmModal(prev => ({ ...prev, open: false }))
      }
    })
  }

  const handlePublishNow = async (id, label = 'Republish') => {
    setRepublishModal({
      open: true,
      articleId: id,
      mode: 'now',
      scheduleDate: '',
      scheduleTime: '',
      label: label
    })
  }

  const executeRepublish = async () => {
    const { articleId, mode, scheduleDate, scheduleTime } = republishModal
    try {
      if (mode === 'now') {
        await apiFetch(`/cms/v1/articles/${articleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'published',
            publishedAt: new Date().toISOString()
          })
        })
      } else {
        if (!scheduleDate || !scheduleTime) return
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
        await apiFetch(`/cms/v1/articles/${articleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'scheduled',
            publishedAt: scheduledDateTime.toISOString()
          })
        })
      }
      setOpenDropdownId(null)
      setRepublishModal(prev => ({ ...prev, open: false }))
      fetchArticles()
    } catch (err) {
      console.error('Failed to update article', err)
    }
  }
  const handleCancelSchedule = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Cancel Scheduling',
      message: 'Are you sure you want to cancel the scheduled publishing? This article will be moved back to drafts.',
      type: 'warning',
      confirmText: 'Cancel Scheduling',
      onConfirm: async () => {
        try {
          await apiFetch(`/cms/v1/articles/${id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'draft' })
          })
          setOpenDropdownId(null)
          fetchArticles()
        } catch(err) {
          console.error("Failed to cancel schedule", err)
        }
        setConfirmModal(prev => ({ ...prev, open: false }))
      }
    })
  }

  const handleReschedule = async () => {
    if(!newPublishDate) return;
    try {
      const today = new Date().toISOString().split('T')[0]
      const targetStatus = newPublishDate > today ? 'scheduled' : 'published'
      
      await apiFetch(`/cms/v1/articles/${datePickerId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: targetStatus,
          publishedAt: new Date(newPublishDate).toISOString()
        })
      })
      setDatePickerId(null)
      setOpenDropdownId(null)
      fetchArticles()
    } catch(err) {
      alert("Failed to reschedule article")
    }
  }

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.headline.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || a.status === filter
    
    const articleDate = new Date(a.publishedAt || a.createdAt).toISOString().split('T')[0]
    
    let matchesDate = true
    if (startDate && endDate) {
      matchesDate = articleDate >= startDate && articleDate <= endDate
    } else if (startDate) {
      matchesDate = articleDate >= startDate
    } else if (endDate) {
      matchesDate = articleDate <= endDate
    }

    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter
    const matchesTag = tagFilter === 'all' || (a.tags && a.tags.includes(tagFilter))
    
    return matchesSearch && matchesFilter && matchesDate && matchesCategory && matchesTag
  })

  // Close dropdown if clicked outside
  useEffect(() => {
    const closeMenu = () => setOpenDropdownId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [])

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-8">
        <div className="pb-4">
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Articles</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5]">Manage news stories and editorial calendar</p>
        </div>
        <Link to="/articles/new" className="flex items-center px-6 py-3 bg-[var(--cms-accent)] text-white text-sm font-extrabold rounded-xl shadow-[0_8px_20px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all tracking-widest">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full xl:w-96 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search headlines..." 
            className="w-full pl-11 pr-4 py-3 text-sm font-bold bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          {/* Quick Range Presets */}
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <History className="w-4 h-4 mr-2 text-gray-400" />
            <select 
              value={quickRange}
              onChange={(e) => handleQuickRangeChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="custom">Quick Presets</option>
              <option value="7d">Last 7 Days</option>
              <option value="15d">Last 15 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer w-[110px]"
                placeholder="From"
              />
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer w-[110px]"
                placeholder="To"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={(e) => { e.preventDefault(); setStartDate(''); setEndDate(''); }}
                className="ml-1 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200"
                title="Clear Range"
              >
                <Plus className="w-3 h-3 rotate-45" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value)} 
               className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer min-w-[100px]"
            >
               <option value="all">All Status</option>
               <option value="published">Published</option>
               <option value="scheduled">Scheduled</option>
               <option value="draft">Draft</option>
               <option value="unpublished">Unpublished</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <LayoutGrid className="w-4 h-4 mr-2 text-gray-400" />
            <select 
               value={categoryFilter} 
               onChange={(e) => setCategoryFilter(e.target.value)} 
               className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer min-w-[100px] capitalize"
            >
               <option value="all">All Category</option>
               {allCategories.map(cat => (
                 <option key={cat.id} value={cat.name}>{cat.name}</option>
               ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
            <select 
               value={tagFilter} 
               onChange={(e) => setTagFilter(e.target.value)} 
               className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer min-w-[100px] capitalize"
            >
               <option value="all">All Tags</option>
               {allTags.map(tag => (
                 <option key={tag.id} value={tag.name}>{tag.name}</option>
               ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Headline</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredArticles.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No articles found matching your criteria.</td>
                 </tr>
              ) : filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group relative">
                  <td className="px-6 py-4">
                     <div className="text-sm font-medium text-[#111827] line-clamp-2 pr-4">{article.headline}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(article.status)}`}>
                      {article.status === 'published' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {article.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                      <span className="capitalize">{article.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {article.author || 'Editorial'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {article.category || 'Startups'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {article.tags && article.tags.length > 0 ? article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                          {tag}
                        </span>
                      )) : <span className="text-gray-400 text-xs">No tags</span>}
                      {article.tags && article.tags.length > 4 && (
                        <span className="text-xs text-gray-400">+{article.tags.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-400">
                    <button 
                       onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === article.id ? null : article.id) }} 
                       className="p-1 rounded hover:bg-gray-200 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer relative"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                     {/* Action Dropdown */}
                     {openDropdownId === article.id && (
                        <div 
                          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] text-left py-1" 
                          onClick={(e) => e.stopPropagation()}
                        >
                           {/* Common: Edit */}
                           {article.status !== 'published' && (
                             <Link 
                                to={`/articles/${article.id}`}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                             >
                                <Edit3 className="w-4 h-4" />
                                Edit Article
                             </Link>
                           )}

                           {/* Status Specific: Published */}
                           {article.status === 'published' && (
                             <button 
                                onClick={() => handleUnpublish(article.id)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors"
                             >
                                <AlertTriangle className="w-4 h-4" />
                                Unpublish
                             </button>
                           )}

                           {/* Status Specific: Scheduled */}
                           {article.status === 'scheduled' && (
                             <div className="border-t border-gray-100 mt-1 pt-1">
                                <button 
                                   onClick={() => handlePublishNow(article.id, 'Publish')}
                                   className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--cms-accent)] hover:bg-[var(--cms-accent-light)] cursor-pointer font-semibold transition-colors"
                                >
                                   <Send className="w-4 h-4" />
                                   Publish Now
                                </button>
                                <button 
                                   onClick={() => {
                                     setDatePickerId(article.id)
                                     setNewPublishDate(article.publishedAt ? article.publishedAt.split('T')[0] : '')
                                   }}
                                   className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                   <Calendar className="w-4 h-4" />
                                   Change Date
                                </button>
                                <button 
                                   onClick={() => handleCancelSchedule(article.id)}
                                   className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer font-medium border-t border-gray-100 mt-1 pt-1 transition-colors"
                                >
                                   <XCircle className="w-4 h-4" />
                                   Cancel Scheduling
                                </button>
                             </div>
                           )}

                           {/* Status Specific: Unpublished / Draft */}
                           {(article.status === 'unpublished' || article.status === 'draft') && (
                             <div className="border-t border-gray-100 mt-1 pt-1">
                               <button 
                                  onClick={() => handlePublishNow(article.id, 'Republish')}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--cms-accent)] hover:bg-[var(--cms-accent-light)] cursor-pointer font-semibold transition-colors"
                               >
                                  <Send className="w-4 h-4" />
                                  {article.status === 'draft' ? 'Publish Now' : 'Republish Now'}
                               </button>
                             </div>
                           )}

                        </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Stub */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filteredArticles.length} entries</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 cursor-not-allowed bg-white" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-400 cursor-not-allowed bg-white" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Date Change Modal */}
      {datePickerId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDatePickerId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                 <h3 className="text-lg font-black text-gray-900 tracking-tight">Reschedule Article</h3>
                 <p className="text-xs text-gray-500 font-medium">Select a new publication date</p>
               </div>
               <button onClick={() => setDatePickerId(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100">
                 <X className="w-5 h-5 text-gray-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Publishing Date</label>
                 <div className="relative group">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--cms-accent)] transition-colors" />
                   <input 
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     value={newPublishDate}
                     onChange={(e) => setNewPublishDate(e.target.value)}
                     className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--cms-accent)] focus:outline-none transition-all text-gray-700 font-bold shadow-inner"
                   />
                 </div>
               </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
               <button 
                 onClick={() => setDatePickerId(null)}
                 className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleReschedule}
                 className="px-8 py-3 bg-[var(--cms-accent)] text-white font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-[var(--cms-accent)]/20 active:scale-95"
               >
                 Update Date
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (for Unpublish) */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.2s ease-out' }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{confirmModal.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg active:scale-95 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Republish / Publish Modal */}
      {republishModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setRepublishModal(prev => ({ ...prev, open: false }))}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.2s ease-out' }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-green-50 text-green-500">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{republishModal.label} Article</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Choose how you'd like to make this article live again.</p>
                </div>
              </div>

              {/* Option Toggle */}
              <div className="space-y-3">
                <label 
                  onClick={() => setRepublishModal(prev => ({ ...prev, mode: 'now' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    republishModal.mode === 'now' 
                      ? 'border-[var(--cms-accent)] bg-[var(--cms-accent-light)]' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    republishModal.mode === 'now' ? 'border-[var(--cms-accent)]' : 'border-gray-300'
                  }`}>
                    {republishModal.mode === 'now' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--cms-accent)]" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{republishModal.label} Now</p>
                    <p className="text-xs text-gray-500 mt-0.5">Publish immediately and make it visible on the public site.</p>
                  </div>
                </label>

                <label 
                  onClick={() => setRepublishModal(prev => ({ ...prev, mode: 'schedule' }))}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    republishModal.mode === 'schedule' 
                      ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    republishModal.mode === 'schedule' ? 'border-[#7C3AED]' : 'border-gray-300'
                  }`}>
                    {republishModal.mode === 'schedule' && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Schedule for {republishModal.label === 'Republish' ? 'Republishing' : 'Publishing'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Set a future date & time for automatic publishing.</p>
                  </div>
                </label>
              </div>

              {/* Schedule Date & Time Picker */}
              {republishModal.mode === 'schedule' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3" style={{ animation: 'fadeInUp 0.15s ease-out' }}>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={republishModal.scheduleDate}
                        onChange={(e) => setRepublishModal(prev => ({ ...prev, scheduleDate: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="time"
                        value={republishModal.scheduleTime}
                        onChange={(e) => setRepublishModal(prev => ({ ...prev, scheduleTime: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setRepublishModal(prev => ({ ...prev, open: false }))}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={executeRepublish}
                disabled={republishModal.mode === 'schedule' && (!republishModal.scheduleDate || !republishModal.scheduleTime)}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-widest italic text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  republishModal.mode === 'now'
                    ? 'bg-[var(--cms-accent)] shadow-[var(--cms-accent)]/20'
                    : 'bg-blue-600 shadow-blue-500/20'
                }`}
              >
                {republishModal.mode === 'now' ? `${republishModal.label} Now` : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
