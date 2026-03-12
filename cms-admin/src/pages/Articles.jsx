import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, Calendar, ArrowRight, History, X, Tag as TagIcon, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'

const getStatusBadge = (status) => {
  const styles = {
    published: "bg-[#059669]/10 text-[#059669]",
    scheduled: "bg-[#7C3AED]/10 text-[#7C3AED]",
    draft: "bg-[#6B7280]/10 text-[#6B7280]",
    unpublished: "bg-red-50 text-red-600 border border-red-100",
    under_review: "bg-[#D97706]/10 text-[#D97706]"
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

  // Derive unique categories and tags from articles
  const availableCategories = ['all', ...new Set(articles.map(a => a.category).filter(Boolean))]
  const availableTags = ['all', ...new Set(articles.flatMap(a => a.tags || []).filter(Boolean))]

  const fetchArticles = () => {
    fetch('http://localhost:3000/cms/v1/articles')
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

  useEffect(() => {
    fetchArticles()
  }, [])

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
    if(!window.confirm("Unpublish this article? It will be removed from the public site.")) return;
    try {
      await fetch(`http://localhost:3000/cms/v1/articles/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unpublished' })
      })
      setOpenDropdownId(null)
      fetchArticles()
    } catch(err) {
      alert("Failed to unpublish article")
    }
  }

  const handlePublishNow = async (id) => {
    if(!window.confirm("Publish this article immediately?")) return;
    try {
      await fetch(`http://localhost:3000/cms/v1/articles/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'published',
          publishedAt: new Date().toISOString()
        })
      })
      setOpenDropdownId(null)
      fetchArticles()
    } catch(err) {
      alert("Failed to publish article")
    }
  }

  const handleReschedule = async () => {
    if(!newPublishDate) return;
    try {
      const today = new Date().toISOString().split('T')[0]
      const targetStatus = newPublishDate > today ? 'scheduled' : 'published'
      
      await fetch(`http://localhost:3000/cms/v1/articles/${datePickerId}`, { 
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Articles</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all your news stories, drafts, and scheduled posts.</p>
        </div>
        <Link to="/articles/new" className="flex items-center px-4 py-2 bg-[#E94560] text-white text-sm font-medium rounded-md hover:bg-[#C73652] transition-colors cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by headline..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94560]/20 focus:border-[#E94560]"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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
                className="bg-transparent text-[12px] font-medium text-gray-600 focus:outline-none cursor-pointer w-[110px]"
                placeholder="From"
              />
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[12px] font-medium text-gray-600 focus:outline-none cursor-pointer w-[110px]"
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
               <option value="all">Status</option>
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
               <option value="all">Category</option>
               {availableCategories.filter(c => c !== 'all').map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
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
               <option value="all">Tag</option>
               {availableTags.filter(t => t !== 'all').map(tag => (
                 <option key={tag} value={tag}>{tag}</option>
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
                        <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-600">
                          {tag}
                        </span>
                      )) : <span className="text-gray-400 text-[10px]">No tags</span>}
                      {article.tags && article.tags.length > 4 && (
                        <span className="text-[10px] text-gray-400">+{article.tags.length - 3} more</span>
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
                       <div className="absolute right-8 top-12 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
                          {article.status === 'published' ? (
                             <button 
                                onClick={() => handleUnpublish(article.id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                             >
                                Unpublish
                             </button>
                          ) : (
                             <>
                                <Link 
                                   to={`/articles/${article.id}`}
                                   className="w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                   Edit Article
                                </Link>

                                {article.status === 'scheduled' && (
                                   <>
                                      <button 
                                         onClick={() => handlePublishNow(article.id)}
                                         className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 cursor-pointer font-medium"
                                      >
                                         Publish Now
                                      </button>
                                      <button 
                                         onClick={() => {
                                           setDatePickerId(article.id)
                                           setNewPublishDate(article.publishedAt ? article.publishedAt.split('T')[0] : '')
                                         }}
                                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                         Change publishing date
                                      </button>
                                   </>
                                )}

                                {article.status === 'unpublished' && (
                                   <>
                                      <button 
                                         onClick={() => handlePublishNow(article.id)}
                                         className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 cursor-pointer font-medium"
                                      >
                                         Republish
                                      </button>
                                      <button 
                                         onClick={() => {
                                           setDatePickerId(article.id)
                                           setNewPublishDate(article.publishedAt ? article.publishedAt.split('T')[0] : '')
                                         }}
                                         className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                      >
                                         Schedule for republishing
                                      </button>
                                   </>
                                )}

                                <button 
                                   onClick={() => window.open(`http://localhost:4321/article/${article.slug}`, '_blank')}
                                   className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                   Preview / View
                                </button>
                             </>
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
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Publishing Date</label>
                 <div className="relative group">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#E94560] transition-colors" />
                   <input 
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     value={newPublishDate}
                     onChange={(e) => setNewPublishDate(e.target.value)}
                     className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#E94560] focus:outline-none transition-all text-gray-700 font-bold shadow-inner"
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
                 className="px-8 py-3 bg-[#E94560] text-white font-black rounded-xl hover:bg-[#d63d56] transition-all shadow-lg shadow-[#E94560]/20 active:scale-95"
               >
                 Update Date
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
