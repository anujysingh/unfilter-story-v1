import React, { useState, useEffect } from 'react'
import { Zap, RefreshCw, ExternalLink, Send, Plus, Trash2, Globe, AlertCircle, Loader2, ListFilter, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, LayoutGrid, List, Sparkles, Clock, ChevronDown } from 'lucide-react'

export default function Discovery() {
  const [news, setNews] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', url: '' })
  const [dateFilter, setDateFilter] = useState('all')
  const [customDate, setCustomDate] = useState('')
  const [selectedSources, setSelectedSources] = useState([]) 
  const [selectedCategories, setSelectedCategories] = useState([]) 
  const [viewMode, setViewMode] = useState('grid') 
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 })
  const [loadingMore, setLoadingMore] = useState(false)
  const [limit, setLimit] = useState(10)
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  const fetchNews = async (isRefresh = false, pageNum = 1, isSync = false) => {
    if (isRefresh) setRefreshing(true)
    else if (pageNum > 1) setLoadingMore(true)
    else setLoading(true)
    
    try {
      const sourcesParam = selectedSources.length > 0 ? `&sources=${encodeURIComponent(selectedSources.join(','))}` : ''
      const categoriesParam = selectedCategories.length > 0 ? `&categories=${encodeURIComponent(selectedCategories.join(','))}` : ''
      const dateParam = dateFilter !== 'all' ? `&dateFilter=${dateFilter}` : ''
      
      const res = await fetch(`http://localhost:3000/cms/v1/rss/fetch?page=${pageNum}&limit=${limit}${isSync ? '&sync=true' : ''}${bookmarkedOnly ? '&bookmarkedOnly=true' : ''}${sourcesParam}${categoriesParam}${dateParam}`)
      const data = await res.json()
      
      const items = data.items || (Array.isArray(data) ? data : [])
      const paginationData = data.pagination || { totalPages: 1, total: items.length, limit }

      if (pageNum === 1) {
        setNews(items)
      } else {
        setNews(items) // In standard pagination, we replace instead of append
      }
      
      setPagination(paginationData)
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch news', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  const fetchSources = async () => {
    try {
      const res = await fetch('http://localhost:3000/cms/v1/rss/sources')
      const data = await res.json()
      setSources(data || [])
    } catch (err) {
      console.error('Failed to fetch sources', err)
    }
  }

  useEffect(() => {
    fetchNews(false, 1)
  }, [limit, bookmarkedOnly, selectedSources, selectedCategories, dateFilter])

  useEffect(() => {
    fetchSources()
  }, [])

  const handleAddSource = async (e) => {
    e.preventDefault()
    try {
      await fetch('http://localhost:3000/cms/v1/rss/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      })
      setNewSource({ name: '', url: '' })
      fetchSources()
      fetchNews(true, 1, true)
    } catch (err) {
      console.error('Failed to add source', err)
    }
  }

  const handleDeleteSource = async (id) => {
    if (!window.confirm('Remove this source?')) return
    try {
      await fetch(`http://localhost:3000/cms/v1/rss/sources/${id}`, { method: 'DELETE' })
      fetchSources()
      fetchNews(true, 1, true)
    } catch (err) {
      console.error('Failed to delete source', err)
    }
  }

  const toggleBookmark = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/cms/v1/rss/bookmark/${id}`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setNews(prev => prev.map(item => item.id === id ? { ...item, isBookmarked: updated.isBookmarked } : item))
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err)
    }
  }

  const handleImport = async (item) => {
    alert(`Ready to import: ${item.title}\n\nThis would pre-fill the Article Editor with the RSS content and headline.`)
  }

  const filteredNews = news.filter(item => {
    // 1. Source Filter (Multi-select)
    if (selectedSources.length > 0 && !selectedSources.includes(item.source)) return false

    // 1.1 Category Filter (Multi-select)
    if (selectedCategories.length > 0) {
      const itemCats = (item.categories || []).map(c => (c?.name || c).toLowerCase())
      const hasMatch = selectedCategories.some(cat => itemCats.includes(cat.toLowerCase()))
      if (!hasMatch) return false
    }

    // 2. Date Filter
    const pubDate = new Date(item.pubDate)
    const now = new Date()
    
    if (dateFilter === 'custom' && customDate) {
      const selectedDate = new Date(customDate)
      return pubDate.toDateString() === selectedDate.toDateString()
    }
    
    if (dateFilter === '7d') {
      const threshold = new Date()
      threshold.setDate(threshold.getDate() - 7)
      return pubDate >= threshold
    }
    
    if (dateFilter === '15d') {
      const threshold = new Date()
      threshold.setDate(threshold.getDate() - 15)
      return pubDate >= threshold
    }

    if (dateFilter === '30d') {
      const threshold = new Date()
      threshold.setDate(threshold.getDate() - 30)
      return pubDate >= threshold
    }

    return true
  })

  // Dynamic Category Extraction: Only show categories eligible for the active source perimeter
  const categoriesSourcePool = selectedSources.length > 0 
    ? news.filter(item => selectedSources.includes(item.source))
    : news

  const allCategories = [...new Set(categoriesSourcePool.flatMap(item => 
    (item.categories || []).map(c => c?.name || c)
  ))].sort()

  // Auto-prune categories that are no longer eligible for the new source selection
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const validCategories = selectedCategories.filter(cat => allCategories.includes(cat))
      if (validCategories.length !== selectedCategories.length) {
        setSelectedCategories(validCategories)
      }
    }
  }, [selectedSources, allCategories])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[var(--cms-accent)] rounded-2xl flex items-center justify-center text-[var(--cms-accent-light)] shadow-xl shadow-[var(--cms-accent)]/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <span className="text-xs font-black text-[var(--cms-accent)] uppercase tracking-[0.3em]">Operational Intelligence</span>
              <h1 className="text-[56px] font-black text-[var(--cms-accent)] tracking-tighter leading-none mt-1 font-serif italic">Discovery Engine</h1>
            </div>
          </div>
          <p className="text-lg font-medium text-[var(--cms-text-secondary)] tracking-tight max-w-2xl">
            Real-time startup news aggregation from across the web. Monitor trends and import stories directly into your editorial pipeline.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-4 bg-white border-2 border-[var(--cms-accent-light)] text-[var(--cms-accent)] font-extrabold text-sm rounded-2xl hover:bg-[var(--cms-accent-light)] transition-all flex items-center gap-3 tracking-widest shadow-sm"
          >
            <ListFilter size={18} />
            Manage Sources
          </button>
          <button 
            onClick={() => fetchNews(true, 1, true)}
            disabled={refreshing}
            className="px-8 py-4 bg-[var(--cms-accent)] text-white font-extrabold text-sm rounded-2xl shadow-[0_15px_40px_rgba(0,93,59,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 tracking-widest disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Synchronizing Intelligence...' : 'Live Sync'}
          </button>
        </div>
      </div>

      {/* Discovery Command Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Source Selection */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100/80">
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="p-1 rounded-md border border-gray-300"><div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div></div> News Perimeter Selection
            </h4>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setSelectedSources([])}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedSources.length === 0 
                    ? 'bg-[var(--cms-accent)] text-white border-[var(--cms-accent)] shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                All Sources
              </button>
              {sources.map(src => (
                <label 
                  key={src.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                    selectedSources.includes(src.name)
                      ? 'bg-[var(--cms-accent-light)] text-[var(--cms-accent)] border-[var(--cms-accent)]/20 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={selectedSources.includes(src.name)}
                    onChange={() => {
                      if (selectedSources.includes(src.name)) {
                        setSelectedSources(selectedSources.filter(s => s !== src.name))
                      } else {
                        setSelectedSources([...selectedSources, src.name])
                      }
                    }}
                  />
                  <span>{src.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100/80">
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--cms-accent)]" /> Industry Signal Matrix
            </h4>
            <div className="flex flex-wrap gap-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              <button 
                onClick={() => setSelectedCategories([])}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedCategories.length === 0 
                    ? 'bg-[var(--cms-accent)] text-white border-[var(--cms-accent)] shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                All Categories
              </button>
              {allCategories.map(cat => (
                <label 
                  key={cat}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                    selectedCategories.includes(cat)
                      ? 'bg-[var(--cms-accent-light)] text-[var(--cms-accent)] border-[var(--cms-accent)]/20 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => {
                      if (selectedCategories.includes(cat)) {
                        setSelectedCategories(selectedCategories.filter(c => c !== cat))
                      } else {
                        setSelectedCategories([...selectedCategories, cat])
                      }
                    }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Global Controls */}
        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-8">
            <div className="bg-white p-1.5 rounded-3xl border border-gray-200 flex items-center gap-1 min-w-[200px]">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
                   viewMode === 'grid' ? 'bg-gray-50 text-[var(--cms-accent)] shadow-sm' : 'text-gray-400 hover:text-black'
                 }`}
               >
                 <LayoutGrid size={14} /> GRID
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${
                   viewMode === 'list' ? 'bg-gray-50 text-[var(--cms-accent)] shadow-sm' : 'text-gray-400 hover:text-black'
                 }`}
               >
                 <List size={14} /> LIST
               </button>
            </div>

            <button 
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
              className={`px-6 py-4 rounded-3xl text-[10px] font-black tracking-widest flex items-center gap-3 transition-all border ${
                bookmarkedOnly 
                  ? 'bg-[var(--cms-accent)] text-white border-[var(--cms-accent)] shadow-lg shadow-[var(--cms-accent)]/20' 
                  : 'bg-white text-black border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Bookmark size={14} className={bookmarkedOnly ? 'fill-current' : ''} />
              BOOKMARKS
            </button>

            <div className="relative group w-52">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                <Clock size={14} />
              </div>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-3xl text-[11px] font-black appearance-none cursor-pointer focus:ring-2 focus:ring-[var(--cms-accent)] transition-all uppercase tracking-[0.15em] shadow-sm text-black"
              >
                <option value="all">Anytime Signals</option>
                <option value="7d">Last 7 Days</option>
                <option value="15d">Last 15 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>

            <div className="relative group w-40">
              <select 
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full pl-6 pr-10 py-4 bg-white border border-gray-200 rounded-3xl text-[11px] font-black appearance-none cursor-pointer focus:ring-2 focus:ring-[var(--cms-accent)] transition-all uppercase tracking-[0.15em] shadow-sm text-black"
              >
                <option value="10">10 / Page</option>
                <option value="20">20 / Page</option>
                <option value="50">50 / Page</option>
              </select>
              <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
        </div>
      </div>

      {/* Standalone Navigation & Intelligence Bar (Start of Content) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-10 py-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
         <div className="flex items-center gap-1 bg-white p-1.5 rounded-3xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => fetchNews(false, page - 1)}
              disabled={page === 1 || loading}
              className="p-3.5 bg-white text-gray-400 rounded-2xl hover:text-black disabled:opacity-20 transition-all border border-gray-100/50"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-8 text-[11px] font-black text-black uppercase tracking-[0.35em] whitespace-nowrap min-w-[170px] text-center">
              PAGE {page} OF {pagination.totalPages}
            </div>
            <button 
              onClick={() => fetchNews(false, page + 1)}
              disabled={page === pagination.totalPages || loading}
              className="p-3.5 bg-white text-gray-400 rounded-2xl hover:text-black disabled:opacity-20 transition-all border border-gray-100/50"
            >
              <ChevronRight size={18} />
            </button>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="px-10 py-4.5 bg-[#C9F775] rounded-[2rem] text-black font-black text-[11px] uppercase tracking-[0.2em] border-2 border-[#C9F775]/20 shadow-lg shadow-[#C9F775]/10 whitespace-nowrap flex items-center justify-center">
              {pagination.total} TOTAL SIGNALS
            </div>
            <div className="hidden lg:flex px-8 py-4.5 bg-white rounded-[2rem] text-black font-black text-[10px] uppercase tracking-[0.15em] border border-gray-200 shadow-sm items-center justify-center">
              {limit} SIGNALS PER DENSITY PLANE
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[4rem] border border-gray-100 shadow-sm">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--cms-accent-light)] rounded-full animate-ping absolute opacity-20"></div>
            <Loader2 className="w-16 h-16 text-[var(--cms-accent)] animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Accessing Satellite Feeds</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Normalizing RSS streams for preview...</p>
          </div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white rounded-[4rem] border-2 border-dashed border-gray-100 p-32 text-center">
          <Globe className="w-20 h-20 text-gray-100 mx-auto mb-8" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">No Signals in Selected Perimeter</h2>
          <p className="text-gray-400 font-bold text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
            Adjust your source or category filters to broaden the signal search.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
          {filteredNews.map((item, idx) => (
            <div 
              key={idx} 
              className={`group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex ${
                viewMode === 'grid' ? 'flex-col hover:-translate-y-2' : 'flex-col sm:flex-row hover:bg-gray-50/10'
              }`}
            >
              <div className={`${viewMode === 'grid' ? 'p-7' : 'p-6 sm:py-6 sm:px-8'} flex-1 ${viewMode === 'list' ? 'flex flex-col justify-center' : ''}`}>
                <div className={`flex ${viewMode === 'grid' ? 'flex-col gap-4' : 'justify-between items-center'} mb-6`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-[var(--cms-accent-light)] text-[var(--cms-accent)] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[var(--cms-accent)]/10 shadow-sm">
                      {item.source}
                    </span>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      By {item.author || 'Editorial'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 font-bold text-gray-900 ${viewMode === 'grid' ? 'text-xs border-t border-gray-50 pt-2' : 'text-sm'}`}>
                    <RefreshCw size={12} className="text-[var(--cms-accent)]" />
                    <span className="tracking-tight">
                      {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="tracking-tight">
                      {new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        toggleBookmark(item.id)
                      }}
                      className={`ml-auto p-2 rounded-xl transition-all ${
                        item.isBookmarked 
                          ? 'bg-[var(--cms-accent)] text-white shadow-lg' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      {item.isBookmarked ? <BookmarkCheck size={14} fill="currentColor" /> : <Bookmark size={14} />}
                    </button>
                  </div>
                </div>
                
                <h3 className={`${viewMode === 'grid' ? 'text-xl' : 'text-lg'} font-black text-gray-900 tracking-tight leading-tight mb-4 group-hover:text-[var(--cms-accent)] transition-colors duration-300 font-serif`}>
                  {item.title}
                </h3>
                
                <p className={`text-[13px] font-medium text-gray-500 ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'} leading-relaxed mb-6`}>
                  {item.content?.replace(/<[^>]*>?/gm, '')}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(item.categories || []).slice(0, 3).map((cat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-50 text-[8px] font-black text-gray-400 uppercase tracking-widest rounded border border-gray-100">
                      #{cat?.name || cat}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={`p-4 bg-gray-50/10 border-t sm:border-t-0 sm:border-l border-gray-50 flex ${
                viewMode === 'grid' ? 'gap-2 justify-between' : 'flex-col gap-2 w-full sm:w-48 justify-center'
              }`}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 bg-[var(--cms-accent)] text-white font-black text-[9px] rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 tracking-[0.15em] shadow-lg shadow-[var(--cms-accent)]/20 uppercase active:scale-95"
                >
                  <ExternalLink size={12} />
                  VISIT SOURCE
                </a>
                <button 
                  onClick={() => handleImport(item)}
                  className="flex-1 py-3.5 bg-[var(--cms-accent-light)] text-[var(--cms-accent)] font-black text-[9px] rounded-xl hover:scale-[1.02] shadow-lg shadow-[var(--cms-accent-light)]/30 transition-all flex items-center justify-center gap-2 tracking-[0.15em] uppercase active:scale-95 border border-[var(--cms-accent)]/10"
                >
                  <Send size={12} />
                  IMPORT DRAFT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Padding */}
      <div className="h-20" />

      {/* Manage Sources Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">RSS Sources</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Configure your discovery perimeter</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white text-gray-400 rounded-2xl hover:bg-gray-50 shadow-sm border border-gray-100 transition-all"><RefreshCw size={24} className="rotate-45" /></button>
            </div>
            
            <div className="p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Add New Source */}
              <form onSubmit={handleAddSource} className="bg-[var(--cms-accent-light)]/30 p-8 rounded-[3rem] border border-[var(--cms-accent)]/5 space-y-6 shadow-inner">
                <h4 className="text-xs font-black text-[var(--cms-accent)] uppercase tracking-[0.3em] ml-1">Connect New Remote Signal</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source Identifier</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. TechCrunch"
                      className="w-full px-7 py-5 bg-white border-2 border-transparent rounded-[2rem] text-sm font-bold shadow-sm focus:border-[var(--cms-accent)] transition-all outline-none"
                      value={newSource.name}
                      onChange={e => setNewSource({...newSource, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">XML Endpoint URL</label>
                    <input 
                      required
                      type="url" 
                      placeholder="https://example.com/feed/"
                      className="w-full px-7 py-5 bg-white border-2 border-transparent rounded-[2rem] text-sm font-bold shadow-sm focus:border-[var(--cms-accent)] transition-all outline-none"
                      value={newSource.url}
                      onChange={e => setNewSource({...newSource, url: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-[var(--cms-accent)] text-white font-extrabold text-xs rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-[0.3em] uppercase"
                >
                  <Plus size={20} />
                  ACTIVATE REMOTE FEED
                </button>
              </form>

              {/* Current Sources */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Active Intelligence Grid</h4>
                <div className="grid grid-cols-1 gap-4">
                  {sources.map(src => (
                    <div key={src.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2.5rem] hover:border-[var(--cms-accent)]/20 shadow-sm group transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--cms-accent)] text-lg font-black italic shadow-inner border border-gray-100">
                          {src.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 tracking-tight text-lg">{src.name}</p>
                          <p className="text-[10px] font-mono text-gray-300 truncate max-w-[280px] uppercase tracking-tighter">{src.url}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSource(src.id)}
                        className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-12 bg-gray-50/50 border-t border-gray-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-6 bg-white border border-gray-200 text-gray-400 font-black text-xs rounded-[2rem] shadow-sm hover:bg-gray-100 transition-all uppercase tracking-[0.4em] active:scale-95"
              >
                DISCONNECT CONSOLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
