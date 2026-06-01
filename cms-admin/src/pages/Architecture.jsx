import { apiFetch } from '../lib/api.js';
import { PUBLIC_SITE_URL } from '../lib/config.js';
import React, { useState, useEffect } from 'react'
import { Landmark, Folder, FileText, Share2, ExternalLink, RefreshCw, Layout as LayoutIcon, Globe, Map } from 'lucide-react'

export default function Architecture() {
  const [data, setData] = useState({
    categories: [],
    articles: [],
    navigation: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchitecture()
  }, [])

  const fetchArchitecture = async () => {
    setLoading(true)
    try {
      const [catsRes, artsRes, navRes] = await Promise.all([
        apiFetch(`/cms/v1/categories`),
        apiFetch(`/cms/v1/articles`),
        apiFetch(`/cms/v1/navigation`)
      ])
      
      const [categories, articles, navigation] = await Promise.all([
        catsRes.json(),
        artsRes.json(),
        navRes.json()
      ])

      setData({ categories, articles, navigation })
    } catch (err) {
      console.error('Failed to fetch architecture data', err)
    } finally {
      setLoading(false)
    }
  }

  const renderSection = (title, icon, items) => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-[var(--cms-accent-light)] transition-colors">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-[var(--cms-accent)] text-white">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-extrabold tracking-tight">{title}</h3>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">{items.length} PATHS</span>
      </div>
      <div className="p-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-400 text-xs uppercase font-bold text-center py-4 tracking-widest">No routes registered</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px]">{item.label}</span>
                <span className="text-xs font-mono text-gray-400 font-bold tracking-tighter group-hover:text-gray-900 transition-colors">
                  {item.path}
                </span>
              </div>
              <a 
                href={`${PUBLIC_SITE_URL}${item.path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                title="Open in Frontend"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const staticRoutes = [
    { label: 'Homepage', path: '/' },
    { label: 'Submit Story', path: '/submit-story' }
  ]

  const categoryRoutes = data.categories.map(c => ({
    label: c.name,
    path: `/category/${c.slug}`
  }))

  const articleRoutes = data.articles.filter(a => a.status === 'published').slice(0, 5).map(a => ({
    label: a.headline,
    path: `/article/${a.slug}`
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 rounded-lg bg-[var(--cms-accent)] flex items-center justify-center text-white">
               <Map size={18} />
             </div>
             <span className="text-xs font-black text-[var(--cms-accent)] uppercase tracking-[0.2em]">Discovery Engine</span>
          </div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Site Architecture</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Mapping the structural flow of Unfilter Story</p>
        </div>
        <button 
          onClick={fetchArchitecture}
          className="p-4 bg-white border border-gray-100 text-[var(--cms-accent)] rounded-2xl hover:bg-[var(--cms-accent)] hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95 group"
          title="Refresh Sitemap"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Core Architecture */}
        {renderSection('Core Infrastructure', <Landmark size={20} />, staticRoutes)}
        
        {/* Taxonomy Map */}
        {renderSection('Category Feeds', <Folder size={20} />, categoryRoutes)}
        
        {/* Article Permalinks */}
        {renderSection('Article Routing', <FileText size={20} />, articleRoutes)}
      </div>

      {/* Navigation Mapping */}
      <div className="bg-[var(--cms-accent)] p-8 rounded-[2.5rem] text-white overflow-hidden relative border-4 border-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Share2 className="text-[var(--cms-accent-light)]" />
            <h2 className="text-2xl font-extrabold tracking-tight">Global Navigation Bridge</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.navigation.length === 0 ? (
               <p className="col-span-full py-8 text-center text-gray-500 font-mono text-xs uppercase font-bold tracking-[0.2em]">No navigation hierarchy defined</p>
            ) : (
              data.navigation.map((nav, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors">
                  <span className="text-xs font-black text-[var(--cms-accent-light)] uppercase tracking-widest mb-1 block">{nav.type}</span>
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-tight italic">{nav.label}</span>
                    <ExternalLink size={12} className="text-gray-500" />
                  </div>
                  <div className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-mono text-gray-500 bg-black/20 p-2 rounded-lg border border-white/5 border-dashed">
                    {nav.href}
                  </div>
                  {nav.children && nav.children.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                        {nav.children.map((child, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-[var(--cms-accent-light)] rounded-full"></div>
                             <span className="text-xs uppercase font-bold tracking-tight text-gray-100">{child.label}</span>
                          </div>
                        ))}
                     </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
        <div className="bg-emerald-500 p-3 rounded-2xl text-white">
          <Globe size={24} />
        </div>
        <div>
          <h4 className="font-extrabold text-emerald-900 tracking-tight">Frontend Live Pulse</h4>
          <p className="text-emerald-700/70 text-xs font-bold uppercase tracking-widest mt-0.5">
            All dynamic routes are live-indexed from the public portal at {PUBLIC_SITE_URL}
          </p>
        </div>
      </div>
    </div>
  )
}
