import React, { useState, useEffect, useRef } from 'react'
import { Zap, RefreshCw, ExternalLink, Send, Plus, Trash2, Globe, AlertCircle, Loader2, ListFilter, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, LayoutGrid, List, Sparkles, Clock, ChevronDown, Radio, CheckCircle2 } from 'lucide-react'

export default function Discovery() {
  const [news, setNews] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', url: '' })
  const [dateFilter, setDateFilter] = useState('3m')
  const [customDate, setCustomDate] = useState('')
  const [selectedSources, setSelectedSources] = useState([]) 
  const [selectedCategories, setSelectedCategories] = useState([]) 
  const [viewMode, setViewMode] = useState('grid') 
  const [activeTab, setActiveTab] = useState('feed')
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [trendingFilterDate, setTrendingFilterDate] = useState('7') // '1', '7', '30'
  const [trendingFilterStatus, setTrendingFilterStatus] = useState('ALL') // 'ALL', 'TRENDING', 'HIGHLY TRENDING'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 })
  const [loadingMore, setLoadingMore] = useState(false)
  const [limit, setLimit] = useState(10)
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
  const [collapsed, setCollapsed] = useState({ signals: false, industries: false, sources: false, temporal: false })
  const [syncStatus, setSyncStatus] = useState(null)
  const [justCompleted, setJustCompleted] = useState(false)
  const [liveElapsedMs, setLiveElapsedMs] = useState(0)
  const syncPollRef = useRef(null)
  const prevSyncingRef = useRef(false)
  const justCompletedTimerRef = useRef(null)
  const localTimerRef = useRef(null)
  const syncStartMsRef = useRef(null)

  const toggleCollapse = (section) => setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))

  const fetchNews = async (isRefresh = false, pageNum = 1, isSync = false) => {
    if (isRefresh) setRefreshing(true)
    else if (pageNum > 1) setLoadingMore(true)
    else setLoading(true)
    
    try {
      const sourcesParam = selectedSources.length > 0 ? `&sources=${encodeURIComponent(selectedSources.join(','))}` : ''
      const categoriesParam = selectedCategories.length > 0 ? `&categories=${encodeURIComponent(selectedCategories.join(','))}` : ''
      
      let dateParam = dateFilter !== 'all' ? `&dateFilter=${dateFilter}` : ''
      if (dateFilter === 'custom' && startDate) {
        // Enforce 90-day limit
        if (endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24))
          if (diffDays > 90) {
            alert('Temporal Alert: Date range cannot exceed 90 days in a single scan.')
            setLoading(false)
            setRefreshing(false)
            return
          }
           dateParam += `&startDate=${startDate}&endDate=${endDate}`
        } else {
           dateParam += `&startDate=${startDate}`
        }
      }
      
      const res = await fetch(`http://localhost:3000/cms/v1/rss/fetch?page=${pageNum}&limit=${limit}${isSync ? '&sync=true' : ''}${bookmarkedOnly ? '&bookmarkedOnly=true' : ''}${sourcesParam}${categoriesParam}${dateParam}`)
      const data = await res.json()
      
      const items = (data.items || (Array.isArray(data) ? data : [])).map(item => {
        if (typeof item.categories === 'string') {
          try { item.categories = JSON.parse(item.categories); } catch (e) { item.categories = []; }
        }
        return item;
      })
      const paginationData = data.pagination || { totalPages: 1, total: items.length, limit }

      setNews(items)
      setPagination(paginationData)
      setPage(pageNum)
      
      // Preserve for Offline Access
      if (pageNum === 1) {
        localStorage.setItem('unfilter_discovery_cache', JSON.stringify({ items, pagination: paginationData }))
      }
    } catch (err) {
      console.error('Offline Mode: Attempting to recover from local signal buffer...', err)
      const cached = localStorage.getItem('unfilter_discovery_cache')
      if (cached && pageNum === 1) {
        const { items, pagination } = JSON.parse(cached)
        setNews(items)
        setPagination(pagination)
      }
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

  const fetchTrending = async () => {
    setLoadingTrending(true);
    try {
      const res = await fetch(`http://localhost:3000/cms/v1/rss/trending?days=${trendingFilterDate}`);
      const data = await res.json();
      setTrendingTopics(data || []);
    } catch (err) {
      console.error('Failed to fetch trending', err);
    } finally {
      setLoadingTrending(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrending();
    }
  }, [activeTab, trendingFilterDate]);


  useEffect(() => {
    // Sources, categories, and bookmark toggles trigger auto-fetch immediately.
    // Date changes in 'custom' mode still require the 'APPLY' trigger to prevent partial fetches.
    fetchNews(false, 1)
  }, [bookmarkedOnly, selectedSources, selectedCategories])

  // Presets trigger immediate fetch
  useEffect(() => {
    if (dateFilter !== 'custom') {
      fetchNews(false, 1)
    }
  }, [dateFilter])

  // Limit change should always trigger re-fetch to maintain UX consistency
  useEffect(() => {
    // For custom, only re-fetch if we have a startDate (filter is active)
    if (dateFilter === 'custom' && !startDate) return;
    fetchNews(false, 1)
  }, [limit])

  // Local high-frequency timer for smooth elapsed display (10ms tick = 2-digit ms)
  useEffect(() => {
    if (syncStatus?.isSyncing) {
      // On first detect of sync starting, anchor the base time from backend's elapsed
      if (!syncStartMsRef.current) {
        syncStartMsRef.current = Date.now() - (syncStatus.elapsedSeconds || 0) * 1000
      }
      // Clear any previous interval
      clearInterval(localTimerRef.current)
      localTimerRef.current = setInterval(() => {
        setLiveElapsedMs(Date.now() - syncStartMsRef.current)
      }, 10)
    } else {
      // Sync stopped — clear timer and reset anchor
      clearInterval(localTimerRef.current)
      localTimerRef.current = null
      syncStartMsRef.current = null
    }
    return () => clearInterval(localTimerRef.current)
  }, [syncStatus?.isSyncing])

  // Sync Status Poller
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('http://localhost:3000/cms/v1/rss/sync-status')
        const data = await res.json()
        setSyncStatus(data)

        // If sync just completed, auto-refresh signals once
        if (prevSyncingRef.current && !data.isSyncing) {
          fetchNews(false, 1)
          setJustCompleted(true)
          clearTimeout(justCompletedTimerRef.current)
          justCompletedTimerRef.current = setTimeout(() => setJustCompleted(false), 4000)
        }
        prevSyncingRef.current = data.isSyncing
      } catch (e) {
        // Silently ignore if backend is unreachable
      }
    }

    poll() // Immediate first check
    syncPollRef.current = setInterval(poll, 3000)
    return () => {
      clearInterval(syncPollRef.current)
      clearTimeout(justCompletedTimerRef.current)
    }
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

  const triggerManualSync = async (type = 'incremental') => {
    if (syncStatus?.isSyncing) return
    try {
      await fetch('http://localhost:3000/cms/v1/rss/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
    } catch (err) {
      console.error('Failed to trigger sync', err)
    }
  }

  // Signal Matrix Taxonomy (PRD v1.9) — defined first so filteredNews can reference it
  const SIGNAL_TYPES = [
    'Funding', 'Startup Launch', 'Acquisition', 'Shutdown', 'Layoffs', 
    'Product News / Launch', 'Founder Story / Profile', 'Pivot', 'Funding Ask', 'Revenue Milestone',
    'Partnership', 'Expansion', 'Regulatory / Policy', 'Leadership / People', 'Legal / Litigation', 'Ecosystem News',
    'Market Insights / Reports', 'Tech Guides / Tutorials', 'Trends / Future Tech', 'Product Review / Opinion',
    'Innovation / Breakthrough'
  ]

  // Fixed Industry Taxonomy based on Business Intelligence Matrix
  const allCategories = [
    ...SIGNAL_TYPES,
    'Fintech',
    'EdTech',
    'AI / ML',
    'HealthTech',
    'MobilityTech',
    'FoodTech',
    'TravelTech',
    'Cybersecurity',
    'Web3 / Blockchain',
    'ClimateTech / Sustainability',
    'AgriTech',
    'CleanTech / EV',
    'Future of Work / HRTech',
    'Developer Infrastructure / Cloud',
    'Social / Community Platforms',
    'SaaS / B2B',
    'D2C / E-Commerce',
    'LogisTech',
    'SpaceTech / DeepTech',
    'Gaming / Media',
    'Real Estate Tech',
    'Government / Policy',
    'Manufacturing / Industrial',
    'Big Tech / Consumer Software',
    'Telecom / Infrastructure'
  ]

  // Filtering is now done at the backend DB level (excludes 'Other / Unclassified' by default).
  // The frontend simply renders whatever the backend returns.
  const filteredNews = news

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen overflow-hidden">
      {/* 🧭 Strategic Intelligence Sidebar */}
      <div className="w-[340px] border-r border-gray-200 bg-white h-screen sticky top-0 flex flex-col shadow-2xl shadow-gray-200/50 z-20">
        <div className="p-8 border-b border-gray-50 bg-gray-50/10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10">
              <Zap size={24} fill="currentColor" className="text-[var(--cms-accent-light)]" />
            </div>
            <div>
              <h2 className="text-xl font-[900] tracking-tighter text-black leading-none">Discovery Intelligence</h2>
              <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-[0.1em]">Intelligence Core v2.5</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-7 space-y-10 custom-scrollbar pb-10">
          {/* Section: Main Feed */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-gray-600/70 px-2 flex items-center justify-between">
               Discover
               <RefreshCw size={12} className={`cursor-pointer ${refreshing ? 'animate-spin' : ''}`} onClick={() => fetchNews(true, 1, true)} />
             </h4>
             <button
               onClick={() => { setSelectedSources([]); setSelectedCategories([]); setBookmarkedOnly(false); setDateFilter('3m'); }}
               className="w-full h-12 flex items-center gap-3 px-4 rounded-xl bg-[var(--cms-accent-light)] border border-[var(--cms-accent)]/10 text-[var(--cms-accent)] text-[11px] font-black hover:scale-[1.02] transition-all"
             >
               <Globe size={14} /> Global Feed
             </button>
             <button
               onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
               className={`w-full h-12 flex items-center gap-3 px-4 rounded-xl text-[11px] font-black transition-all border ${
                 bookmarkedOnly
                   ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                   : 'bg-white text-gray-700/80 border-gray-100 hover:border-gray-300 hover:text-black'
               }`}
             >
               <Bookmark size={14} className={bookmarkedOnly ? 'fill-current' : ''} />
               {bookmarkedOnly ? 'Active Bookmarks' : 'My Bookmarks'}
             </button>
          </div>

          {/* Sync Control Panel */}
          <div className="space-y-3 bg-gray-50/70 rounded-2xl p-5 border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Radio size={9} /> Sync Control
            </h4>
            <div className="space-y-1.5">
              {syncStatus?.lastIncrementalSyncAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400">Last Quick Sync</span>
                  <span className="text-[9px] font-black text-gray-600">
                    {new Date(syncStatus.lastIncrementalSyncAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {syncStatus?.lastDeepSyncAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400">Last Full Scan</span>
                  <span className="text-[9px] font-black text-gray-600">
                    {new Date(syncStatus.lastDeepSyncAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {syncStatus?.totalSignalsInDB != null && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400">Total in DB</span>
                  <span className="text-[9px] font-black text-[var(--cms-accent)]">{syncStatus.totalSignalsInDB?.toLocaleString()}</span>
                </div>
              )}
              {!syncStatus?.lastIncrementalSyncAt && !syncStatus?.lastDeepSyncAt && (
                <p className="text-[9px] font-black text-gray-300">No sync completed yet this session.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => triggerManualSync('incremental')}
                disabled={syncStatus?.isSyncing}
                className="py-2.5 px-3 bg-white border border-gray-200 rounded-xl text-[9px] font-black text-gray-700 hover:border-gray-400 hover:text-black transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={9} className={syncStatus?.isSyncing && syncStatus?.syncType === 'incremental' ? 'animate-spin' : ''} />
                Quick Sync
              </button>
              <button
                onClick={() => triggerManualSync('deep')}
                disabled={syncStatus?.isSyncing}
                title="Re-scans all historical pages. Takes several minutes."
                className="py-2.5 px-3 bg-black border border-black rounded-xl text-[9px] font-black text-white hover:bg-gray-800 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
              >
                <Zap size={9} fill="currentColor" className={syncStatus?.isSyncing && syncStatus?.syncType === 'deep' ? 'animate-pulse' : ''} />
                Full Rescan
              </button>
            </div>
            <p className="text-[8px] text-gray-400 font-black leading-relaxed">
              Quick Sync fetches latest (~10s). Full Rescan rebuilds entire archive (use sparingly).
            </p>
          </div>

          {/* Section: Temporal Intelligence */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
             <h4 className="text-[11px] font-black text-gray-600/70 px-2 flex items-center justify-between cursor-pointer group" onClick={() => toggleCollapse('temporal')}>
               Temporal Radius
               <ChevronDown size={14} className={`transition-transform duration-300 ${collapsed.temporal ? '' : 'rotate-180'}`} />
             </h4>
             {!collapsed.temporal && (
               <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-300">
                 {['3m', '15d', '7d', '48h', '24h', 'custom'].map(t => (
                   <button 
                     key={t}
                     onClick={() => setDateFilter(t)}
                     className={`h-11 text-left px-4 rounded-xl text-[10.5px] font-black border transition-all ${
                       dateFilter === t 
                         ? 'bg-gray-100 text-black border-gray-400 shadow-inner' 
                         : 'bg-white text-gray-700/80 border-gray-100 hover:border-gray-300 hover:text-black'
                     }`}
                   >
                     {t === '3m' ? 'Anytime Signals (Last 3M)' : t === 'custom' ? '📅 Custom Frame' : `Last ${t.replace('h',' Hours').replace('d',' Days')}`}
                   </button>
                 ))}
                 
                 {dateFilter === 'custom' && (
                   <div className="space-y-2 mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-300">
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')} max={new Date().toLocaleDateString('en-CA')} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-[10px] font-black outline-none" />
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')} max={new Date().toLocaleDateString('en-CA')} className="w-full p-3 bg-white border border-gray-300 rounded-xl text-[10px] font-black outline-none" />
                      <button onClick={() => fetchNews(false, 1)} disabled={!startDate} className="w-full py-3 bg-[var(--cms-accent)] text-white text-[9.5px] font-black rounded-xl hover:bg-black transition-all disabled:opacity-30">Lock Temporal Frame</button>
                   </div>
                 )}
               </div>
             )}
          </div>

          {/* Section: Business Signals */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
             <h4 className="text-[11px] font-black text-indigo-600 px-2 flex items-center justify-between cursor-pointer group" onClick={() => toggleCollapse('signals')}>
               <span className="flex items-center gap-2">
                 <Zap size={10} fill="currentColor" /> Startup Category
               </span>
               <div className="flex items-center gap-3">
                 {!collapsed.signals && (
                   <div className="flex items-center gap-2">
                     <span 
                       className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" 
                       onClick={(e) => { e.stopPropagation(); setSelectedCategories(prev => [...prev.filter(c => !SIGNAL_TYPES.includes(c)), ...SIGNAL_TYPES]); }}
                     >
                       ALL
                     </span>
                     <span className="text-gray-200">|</span>
                     <span className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedCategories(prev => prev.filter(c => !SIGNAL_TYPES.includes(c))); }}>CLR</span>
                   </div>
                 )}
                 <ChevronDown size={14} className={`transition-transform duration-300 ${collapsed.signals ? '' : 'rotate-180'}`} />
               </div>
             </h4>
             {!collapsed.signals && (
               <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                 {SIGNAL_TYPES.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                     className={`px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all shadow-sm ${
                       selectedCategories.includes(cat)
                         ? 'bg-black text-white border-black shadow-lg shadow-black/20 scale-[1.05]'
                         : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Section: Industry Verticals */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
             <h4 className="text-[11px] font-black text-gray-500 px-2 flex items-center justify-between cursor-pointer group" onClick={() => toggleCollapse('industries')}>
               Industries
               <div className="flex items-center gap-3">
                 {!collapsed.industries && (
                   <div className="flex items-center gap-3">
                     <span 
                       className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" 
                       onClick={(e) => {
                         e.stopPropagation();
                         const industryList = allCategories.filter(cat => !SIGNAL_TYPES.includes(cat));
                         setSelectedCategories(prev => [...prev.filter(c => SIGNAL_TYPES.includes(c)), ...industryList]);
                       }}
                     >
                       ALL
                     </span>
                     <span className="text-gray-300">|</span>
                     <span className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedCategories(selectedCategories.filter(c => SIGNAL_TYPES.includes(c))); }}>CLR</span>
                   </div>
                 )}
                 <ChevronDown size={14} className={`transition-transform duration-300 ${collapsed.industries ? '' : 'rotate-180'}`} />
               </div>
             </h4>
             {!collapsed.industries && (
               <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                 {allCategories.filter(cat => !SIGNAL_TYPES.includes(cat)).map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                     className={`px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                       selectedCategories.includes(cat)
                         ? 'bg-[var(--cms-accent)] text-white border-[var(--cms-accent)] shadow-md'
                         : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:text-black'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Section: News Perimeter */}
          <div className="space-y-4">
             <h4 className="text-[11px] font-black text-gray-700/80 px-2 flex items-center justify-between cursor-pointer group" onClick={() => toggleCollapse('sources')}>
               News Perimeter
               <div className="flex items-center gap-3">
                 {!collapsed.sources && (
                   <div className="flex items-center gap-3">
                     <span 
                       className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" 
                       onClick={(e) => { e.stopPropagation(); setSelectedSources(sources.map(s => s.name)); }}
                     >
                       ALL
                     </span>
                     <span className="text-gray-200">|</span>
                     <span className="text-[8px] font-black text-indigo-500 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedSources([]); }}>CLR</span>
                   </div>
                 )}
                 <ChevronDown size={14} className={`transition-transform duration-300 ${collapsed.sources ? '' : 'rotate-180'}`} />
               </div>
             </h4>
             {!collapsed.sources && (
               <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {sources.map(src => (
                    <label key={src.id} className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-all cursor-pointer group/item">
                      <div className="flex items-center gap-3">
                        {src.logoUrl && <img src={src.logoUrl} alt="" className="w-5 h-5 rounded-md object-contain" />}
                        <span className="text-[10.5px] font-black text-gray-800 tracking-tight">{src.name}</span>
                      </div>
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--cms-accent)] focus:ring-[var(--cms-accent)]" checked={selectedSources.includes(src.name)} onChange={() => {
                        setSelectedSources(prev => prev.includes(src.name) ? prev.filter(s => s !== src.name) : [...prev, src.name])
                      }} />
                    </label>
                  ))}
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-500 hover:border-gray-400 hover:text-black transition-all">+ Manage Perimeters</button>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/30">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-gray-700 tracking-tight">Page Density</span>
              <select value={limit} onChange={e => setLimit(parseInt(e.target.value))} className="bg-transparent text-[11px] font-black text-black border-none outline-none cursor-pointer">
                 <option value="10">LOW (10)</option>
                 <option value="20">MID (20)</option>
                 <option value="50">HIGH (50)</option>
              </select>
           </div>
           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--cms-accent)] transition-all duration-500" style={{ width: `${(page / (pagination.totalPages || 1)) * 100}%` }}></div>
           </div>
        </div>
      </div>

      {/* 🚀 Primary Signal Feed Area */}
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar flex flex-col">
        {/* Compact Header Bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-12 py-6 flex items-center justify-between z-10 transition-all duration-300 hover:bg-white">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
               <button 
                 onClick={() => setActiveTab('feed')}
                 className={`px-4 py-2 rounded-lg text-[11px] font-[900] transition-all ${activeTab === 'feed' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
               >
                 LIVE FEED
               </button>
               <button 
                 onClick={() => setActiveTab('trending')}
                 className={`px-4 py-2 rounded-lg text-[11px] font-[900] transition-all flex items-center gap-2 ${activeTab === 'trending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-black'}`}
               >
                 <Sparkles size={14} /> TRENDING
               </button>
             </div>
             {activeTab === 'feed' && (
               <>
                 <div className="bg-black text-[var(--cms-accent-light)] px-5 py-2 rounded-xl text-[11px] font-[900] tracking-tight shadow-lg">
                   DENSITY: {pagination.total} SIGNALS DETECTED
                 </div>
                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      <List size={16} />
                    </button>
                 </div>
               </>
             )}
          </div>


          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-inner overflow-hidden">
                <button 
                  onClick={() => fetchNews(false, page - 1)}
                  disabled={page === 1 || loading}
                  className="p-2.5 bg-white text-gray-400 rounded-lg hover:text-black hover:bg-gray-50 disabled:opacity-10 transition-all font-black text-[9px]"
                >
                  PREV
                </button>
                <div className="px-5 text-[10px] font-black text-black tracking-[0.2em] whitespace-nowrap min-w-[120px] text-center">
                  UNIT {page} / {pagination.totalPages}
                </div>
                <button 
                  onClick={() => fetchNews(false, page + 1)}
                  disabled={page === pagination.totalPages || loading}
                  className="p-2.5 bg-white text-gray-400 rounded-lg hover:text-black hover:bg-gray-50 disabled:opacity-10 transition-all font-black text-[9px]"
                >
                  NEXT
                </button>
             </div>
             <button 
               onClick={() => fetchNews(true, 1, true)}
               disabled={refreshing}
               className="p-3 bg-[var(--cms-accent)] text-white rounded-xl shadow-lg shadow-[var(--cms-accent)]/20 hover:scale-105 active:scale-95 transition-all"
               title="Emergency Signal Sync"
             >
               <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
             </button>
          </div>
        </header>

        {/* 🔴 Live Sync Progress Banner */}
        {syncStatus && (syncStatus.isSyncing || justCompleted) && (
          <div className={`border-b px-12 py-4 flex items-center gap-6 transition-all duration-700 animate-in slide-in-from-top-2 ${
            syncStatus.isSyncing 
              ? 'bg-gradient-to-r from-indigo-950 to-black border-indigo-800/40' 
              : 'bg-gradient-to-r from-emerald-950 to-black border-emerald-700/40'
          }`}>
            {/* Pulsing Status Icon */}
            <div className="relative flex-shrink-0">
              {syncStatus.isSyncing ? (
                <>
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping absolute opacity-60" />
                  <div className="w-3 h-3 bg-indigo-400 rounded-full relative" />
                </>
              ) : (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
            </div>

            {/* Text Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-[900] tracking-[0.15em] uppercase ${syncStatus.isSyncing ? 'text-indigo-300' : 'text-emerald-300'}`}>
                  {syncStatus.isSyncing 
                    ? (syncStatus.syncType === 'deep' ? '⚡ Full Historical Rescan In Progress' : 'Signal Acquisition In Progress')
                    : '✓ Sync Complete — Feed Auto-Refreshed'}
                </span>
                {syncStatus.isSyncing && syncStatus.currentSource && (
                  <span className="text-[9px] font-black text-white/40 tracking-tight bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    ↳ {syncStatus.currentSource}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {syncStatus.isSyncing && (
                <div className="h-1 bg-white/10 rounded-full overflow-hidden w-full max-w-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(2, syncStatus.progressPercent || 0)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 flex-shrink-0">
              {syncStatus.isSyncing && (
                <>
                  <div className="text-center">
                    <div className="text-[18px] font-[900] text-white tabular-nums leading-none">
                      {syncStatus.completedSources}<span className="text-white/30 text-[12px]">/{syncStatus.totalSources}</span>
                    </div>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Sources</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-[18px] font-[900] text-indigo-300 tabular-nums leading-none">
                      {syncStatus.newSignalsAdded?.toLocaleString() || 0}
                    </div>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Signals</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                     <div className="text-[18px] font-[900] text-white/60 tabular-nums leading-none flex items-baseline gap-[2px]">
                       <span>{String(Math.floor(liveElapsedMs / 60000)).padStart(2, '0')}</span>
                       <span className="text-white/30">:</span>
                       <span>{String(Math.floor((liveElapsedMs % 60000) / 1000)).padStart(2, '0')}</span>
                       <span className="text-white/30">.</span>
                       <span className="text-[13px] text-white/40">{String(Math.floor((liveElapsedMs % 1000) / 10)).padStart(2, '0')}</span>
                     </div>
                     <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Elapsed</div>
                   </div>
                </>
              )}
              {!syncStatus.isSyncing && (
                <div className="text-center">
                  <div className="text-[18px] font-[900] text-emerald-300 tabular-nums leading-none">
                    {syncStatus.newSignalsAdded?.toLocaleString() || 0}
                  </div>
                  <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">Total Signals</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Pulse Grid */}
        <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
          {activeTab === 'feed' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-48 gap-8 animate-in fade-in duration-500">
                 <div className="relative">
                   <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-ping absolute opacity-30"></div>
                   <div className="w-24 h-24 border-4 border-t-[var(--cms-accent)] border-transparent rounded-full animate-spin"></div>
                   <Zap className="absolute inset-0 m-auto text-[var(--cms-accent)] animate-pulse" size={32} />
                 </div>
                 <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black text-black tracking-tighter">Initializing Satellite Link</h3>
                   <p className="text-[10px] font-bold text-gray-400 mt-1">Decoding multi-layered RSS payloads...</p>
                 </div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6 opacity-40">
                 <Globe size={80} className="text-gray-200" />
                 <div className="text-center">
                   <h2 className="text-2xl font-black text-gray-300 tracking-tighter">No Signals Captured</h2>
                   <p className="text-[10px] font-bold text-gray-200 mt-2">Adjust your intelligence perimeter</p>
                 </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-10" : "flex flex-col gap-6"}>
                {filteredNews.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-700 overflow-hidden flex flex-col relative ${
                      viewMode === 'grid' ? 'hover:-translate-y-3' : 'sm:flex-row min-h-[220px]'
                    }`}
                  >
                    {/* Visual Accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--cms-accent)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    
                    <div className={`${viewMode === 'grid' ? 'p-10 pb-6' : 'p-10 flex-1'} flex flex-col`}>
                      <div className="flex items-start justify-between mb-8">
                          <div className="flex flex-wrap gap-2">
                             {(item.logoUrl || item.source) && (
                               <div className="h-8 px-4 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm overflow-hidden min-w-[60px]">
                                 <img 
                                   src={item.logoUrl || `https://www.google.com/s2/favicons?domain=${item.source.toLowerCase().replace(/\s+/g, '')}${item.source.includes('.') ? '' : '.com'}&sz=128`} 
                                   alt={item.source} 
                                   className="h-4 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                                   onError={(e) => { 
                                     if (!e.target.dataset.tried) {
                                       e.target.dataset.tried = "1";
                                       e.target.src = `https://www.google.com/s2/favicons?domain=${item.source.split('.')[0]}.com&sz=128`;
                                     } else if (e.target.dataset.tried === "1") {
                                       e.target.dataset.tried = "2";
                                       e.target.src = `https://icon.horse/icon/${item.source.toLowerCase().replace(/\s+/g, '')}${item.source.includes('.') ? '' : '.com'}`;
                                     } else {
                                       e.target.style.display = 'none'; 
                                       e.target.parentElement.innerHTML = `<span class="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">${item.source}</span>`; 
                                     }
                                   }}
                                 />
                               </div>
                             )}
                             <span className="px-3 py-1 bg-white text-gray-700 rounded-lg text-[10px] font-black border border-gray-200">
                               {new Date(item.pubDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                             </span>
                          </div>
                          <button 
                            onClick={(e) => { e.preventDefault(); toggleBookmark(item.id); }}
                            className={`p-2.5 rounded-xl transition-all ${item.isBookmarked ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:text-black border border-gray-200'}`}
                          >
                            {item.isBookmarked ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
                          </button>
                      </div>

                      <h3 className="text-xl font-[900] text-black tracking-tight leading-[1.2] mb-5 group-hover:text-indigo-600 transition-colors duration-500 font-brand">
                        {item.title}
                      </h3>
                      
                      <p className="text-[13.5px] font-semibold text-gray-700 line-clamp-2 leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-all duration-500">
                        {item.content?.replace(/<[^>]*>?/gm, '')}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-auto pt-6 border-t border-gray-50">
                        {/* Signal Highlights: The Primary Intelligence Vector */}
                        {(item.categories || []).filter(cat => SIGNAL_TYPES.includes(cat)).map((cat, i) => (
                          <div key={`sig-${i}`} className="px-5 py-2.5 bg-black text-white text-[11px] font-black rounded-2xl flex items-center gap-3 border-2 border-indigo-500/30 shadow-xl shadow-indigo-500/10 animate-in zoom-in-95 duration-500">
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
                            {cat === 'Funding' ? '💰 ' + cat : cat === 'Acquisition' ? '🤝 ' + cat : cat === 'Shutdown' ? '🛑 ' + cat : cat}
                          </div>
                        ))}

                        {/* Industry Footprints: The Secondary Context Vector */}
                        {(item.categories || []).filter(cat => !SIGNAL_TYPES.includes(cat) && cat !== 'Other / Unclassified').map((cat, i) => (
                          <div key={`ind-${i}`} className="px-4 py-2 bg-gray-100 text-[10px] font-black text-gray-700 rounded-xl border border-gray-300">
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`p-6 bg-gray-50/40 border-t border-gray-100 flex gap-3 ${
                      viewMode === 'grid' ? '' : 'sm:border-t-0 sm:border-l sm:w-56 flex-col justify-center'
                    }`}>
                            <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 h-12 bg-white border border-gray-300 text-black font-black text-[11px] rounded-2xl hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                      >
                        <ExternalLink size={12} />
                        Voice
                      </a>
                      <button 
                        onClick={() => handleImport(item)}
                        className="flex-1 h-12 bg-black text-white font-black text-[11px] rounded-2xl hover:scale-[1.05] shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Send size={12} className="text-indigo-400" />
                        Inject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // TRENDING TAB CONTENT
            loadingTrending ? (
              <div className="flex flex-col items-center justify-center py-48 gap-8 animate-in fade-in duration-500">
                 <div className="relative">
                   <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-ping absolute opacity-30"></div>
                   <div className="w-24 h-24 border-4 border-t-indigo-600 border-transparent rounded-full animate-spin"></div>
                   <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} />
                 </div>
                 <div className="text-center space-y-2">
                   <h3 className="text-2xl font-black text-black tracking-tighter">AI Trend Detection Active</h3>
                   <p className="text-[10px] font-bold text-gray-400 mt-1">Cross-referencing signals across social platforms...</p>
                 </div>
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-48 gap-6 opacity-40">
                 <Sparkles size={80} className="text-gray-200" />
                 <div className="text-center">
                   <h2 className="text-2xl font-black text-gray-300 tracking-tighter">No Trends Detected</h2>
                   <p className="text-[10px] font-bold text-gray-200 mt-2">The AI found no highly active topics in the recent timeframe.</p>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 shrink-0">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-[900] tracking-tighter text-black leading-none">AI Trend Analysis</h2>
                      <p className="text-[11px] font-bold text-gray-500 mt-1">Detected from high-velocity signals across multiple platforms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={trendingFilterDate} 
                      onChange={e => setTrendingFilterDate(e.target.value)}
                      className="bg-white border border-gray-200 text-gray-700 text-[11px] font-black rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-indigo-300 transition-all shadow-sm"
                    >
                      <option value="1">Last 24 Hours</option>
                      <option value="3">Last 3 Days</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                    </select>
                    <select 
                      value={trendingFilterStatus} 
                      onChange={e => setTrendingFilterStatus(e.target.value)}
                      className="bg-white border border-gray-200 text-gray-700 text-[11px] font-black rounded-xl px-4 py-2.5 outline-none cursor-pointer hover:border-indigo-300 transition-all shadow-sm"
                    >
                      <option value="ALL">All Trends</option>
                      <option value="HIGHLY TRENDING">Highly Trending</option>
                      <option value="TRENDING">Trending Only</option>
                    </select>
                  </div>
                </div>

                {trendingTopics.filter(t => trendingFilterStatus === 'ALL' || t.status === trendingFilterStatus).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <p className="text-sm font-bold text-gray-400">No topics match these filters.</p>
                  </div>
                ) : (
                  trendingTopics.filter(t => trendingFilterStatus === 'ALL' || t.status === trendingFilterStatus).map((topic, idx) => (
                  <div key={idx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                    
                    <div className="flex flex-col md:flex-row gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${topic.status === 'HIGHLY TRENDING' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-indigo-100 text-indigo-600 border border-indigo-200'}`}>
                            {topic.status}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Trend Score: {topic.score}/12
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> Momentum: {topic.momentum}
                          </span>
                        </div>
                        
                        <h3 className="text-3xl font-[900] text-black tracking-tight leading-[1.1] mb-6 font-brand">{topic.topic}</h3>
                        
                        <div className="space-y-4 mb-8">
                          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Why it is trending</h4>
                          <ul className="space-y-2">
                            {topic.reasons.map((r, i) => (
                              <li key={i} className="text-[13px] font-medium text-gray-700 flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Suggested Angles</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <span className="block text-[10px] font-black text-indigo-600 mb-1">PR Angle</span>
                              <p className="text-[12px] font-medium text-gray-700">{topic.angles.pr}</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-pink-600 mb-1">Content Angle</span>
                              <p className="text-[12px] font-medium text-gray-700">{topic.angles.content}</p>
                            </div>
                            <div>
                              <span className="block text-[10px] font-black text-amber-600 mb-1">Hook</span>
                              <p className="text-[12px] font-medium text-gray-700 italic">"{topic.angles.hook}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-64 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                           <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-4">Platforms Detected</h4>
                           <div className="space-y-3">
                             {Object.entries(topic.platforms).map(([platform, active]) => (
                               <div key={platform} className="flex items-center justify-between">
                                 <span className="text-[12px] font-bold text-gray-600 capitalize">
                                   {platform === 'googleTrends' ? 'Google Trends' : platform}
                                 </span>
                                 {active ? (
                                   <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black">YES</span>
                                 ) : (
                                   <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md text-[10px] font-black">NO</span>
                                 )}
                               </div>
                             ))}
                           </div>
                        </div>
                        
                        {topic.relatedSignals && topic.relatedSignals.length > 0 ? (
                           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                             <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-4">Coverage Sources</h4>
                             <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                               {topic.relatedSignals.map((signal, sIdx) => (
                                 <a 
                                   key={sIdx}
                                   href={signal.link} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="group/link flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200"
                                   title={signal.title}
                                 >
                                   <div className="flex flex-col min-w-0 pr-2">
                                     <span className="text-[12px] font-[900] text-black truncate group-hover/link:text-indigo-600 transition-colors">
                                       {signal.source}
                                     </span>
                                     <span className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
                                       {new Date(signal.pubDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                     </span>
                                   </div>
                                   <ExternalLink size={12} className="text-gray-300 group-hover/link:text-indigo-500 shrink-0" />
                                 </a>
                               ))}
                             </div>
                           </div>
                        ) : (
                          topic.link && (
                            <a 
                              href={topic.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full h-12 bg-white border border-gray-300 text-black font-black text-[11px] rounded-2xl hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                            >
                              <ExternalLink size={12} />
                              Read Original Signal
                            </a>
                          )
                        )}
                        <button 
                          onClick={() => handleImport(topic)}
                          className="w-full h-14 bg-black text-white font-black text-[12px] rounded-2xl hover:scale-[1.02] shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <Send size={14} className="text-indigo-400" />
                          Inject into Editor
                        </button>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            )
          )}
          <div className="h-20" />
        </main>
      </div>

      {/* Manage Sources Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tighter mb-2">RSS Sources</h2>
                <p className="text-[10px] text-gray-400 font-extrabold pb-2">Configure your discovery perimeter</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white text-gray-400 rounded-2xl hover:bg-gray-50 shadow-sm border border-gray-100 transition-all"><RefreshCw size={24} className="rotate-45" /></button>
            </div>
            
            <div className="p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Add New Source */}
              <form onSubmit={handleAddSource} className="bg-[var(--cms-accent-light)]/30 p-8 rounded-[3rem] border border-[var(--cms-accent)]/5 space-y-6 shadow-inner">
                <h4 className="text-xs font-extrabold text-[var(--cms-accent)] ml-1">Connect New Remote Signal</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 ml-1">Source Identifier</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. TechCrunch"
                      className="w-full px-7 py-5 bg-white border-2 border-transparent rounded-[2rem] text-sm font-medium shadow-sm focus:border-[var(--cms-accent)] transition-all outline-none"
                      value={newSource.name}
                      onChange={e => setNewSource({...newSource, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-gray-400 ml-1">XML Endpoint URL</label>
                    <input 
                      required
                      type="url" 
                      placeholder="https://example.com/feed/"
                      className="w-full px-7 py-5 bg-white border-2 border-transparent rounded-[2rem] text-sm font-medium shadow-sm focus:border-[var(--cms-accent)] transition-all outline-none"
                      value={newSource.url}
                      onChange={e => setNewSource({...newSource, url: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-[var(--cms-accent)] text-white font-extrabold text-xs rounded-[2rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={20} />
                  Activate Remote Feed
                </button>
              </form>

              {/* Current Sources */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-extrabold text-gray-400 ml-1">Active Intelligence Grid</h4>
                <div className="grid grid-cols-1 gap-4">
                  {sources.map(src => (
                    <div key={src.id} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2.5rem] hover:border-[var(--cms-accent)]/20 shadow-sm group transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[var(--cms-accent)] text-lg font-extrabold shadow-inner border border-gray-100">
                          {src.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 tracking-tight text-lg">{src.name}</p>
                          <p className="text-[10px] font-mono text-gray-300 truncate max-w-[280px] tracking-tighter">{src.url}</p>
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
                className="w-full py-6 bg-white border border-gray-200 text-gray-400 font-extrabold text-xs rounded-[2rem] shadow-sm hover:bg-gray-100 transition-all active:scale-95"
              >
                Disconnect Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
