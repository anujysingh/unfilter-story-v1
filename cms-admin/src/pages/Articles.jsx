import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const getStatusBadge = (status) => {
  const styles = {
    published: "bg-[#059669]/10 text-[#059669]",
    scheduled: "bg-[#7C3AED]/10 text-[#7C3AED]",
    draft: "bg-[#6B7280]/10 text-[#6B7280]",
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
  const [openDropdownId, setOpenDropdownId] = useState(null)

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

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to permanently delete this article?")) return;
    try {
      await fetch(`http://localhost:3000/cms/v1/articles/${id}`, { method: 'DELETE' })
      setOpenDropdownId(null)
      fetchArticles()
    } catch(err) {
      alert("Failed to delete article")
    }
  }

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.headline.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || a.status === filter
    return matchesSearch && matchesFilter
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

      {/* Filters and Search */}
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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value)} 
               className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
               <option value="all">All Status</option>
               <option value="published">Published</option>
               <option value="draft">Draft</option>
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
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredArticles.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No articles found matching your criteria.</td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
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
                          {article.status === 'draft' && (
                             <Link 
                                to={`/articles/${article.id}`}
                                className="w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                             >
                                Edit Article
                             </Link>
                          )}
                          <button 
                             onClick={() => window.open(`http://localhost:4321/article/${article.slug}`, '_blank')}
                             className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                             Preview / View
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button 
                             onClick={() => handleDelete(article.id)}
                             className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                             Delete
                          </button>
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
    </div>
  )
}
