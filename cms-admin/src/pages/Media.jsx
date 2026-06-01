import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect } from 'react'
import { Upload, ImageIcon, Filter, Search, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react'

// Helper for image compression (copied from ArticleEditor for consistency)
const compressImage = (file, maxWidth = 1920, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('not an image'))
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
    }
  })
}

export default function Media() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [errorDialog, setErrorDialog] = useState({ show: false, title: '', message: '' })

  const fetchMedia = async () => {
    try {
      const res = await apiFetch(`/cms/v1/media`)
      const data = await res.json()
      setMedia(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorDialog({ show: true, title: 'File Too Large', message: 'Maximum file size allowed is 5MB.' })
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorDialog({ show: true, title: 'Invalid Format', message: 'Only PNG and JPEG formats are supported.' })
      return
    }

    setIsUploading(true)
    try {
      const compressedUrl = await compressImage(file)
      const res = await apiFetch(`/cms/v1/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          url: compressedUrl,
          mimeType: file.type,
          sizeBytes: file.size
        })
      })

      if (res.ok) {
        fetchMedia()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media permanently?')) return
    try {
      const res = await apiFetch(`/cms/v1/media/${id}`, { method: 'DELETE' })
      if (res.ok) fetchMedia()
    } catch (err) {
      console.error(err)
    }
  }

  const filteredMedia = media.filter(m => 
    m.filename?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[56px] font-extrabold tracking-tighter text-[var(--cms-accent)] leading-[1.1] mb-2">Media Library</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Manage assets and editorial resources</p>
        </div>
        
        <label className={`
          relative flex items-center gap-3 px-8 py-4 bg-[var(--cms-accent)] text-white rounded-2xl font-extrabold text-sm 
          shadow-[0_8px_30px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-widest
          ${isUploading ? 'opacity-50 cursor-wait' : ''}
        `}>
          <Upload size={18} className={isUploading ? 'animate-bounce' : ''} />
          {isUploading ? 'Uploading...' : 'Upload Asset'}
          <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--cms-accent)] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder-gray-300 focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredMedia.map((m) => (
            <div key={m.id} className="group relative aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white">
              <img src={m.url} alt={m.filename} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 backdrop-blur-[2px]">
                <button 
                  onClick={() => handleDelete(m.id)}
                  className="self-end p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="text-white">
                  <p className="text-xs font-black uppercase tracking-tighter truncate leading-none mb-1">{m.filename || 'Untitled'}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold opacity-70">
                    <span>{formatSize(m.sizeBytes)}</span>
                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 flex flex-col items-center text-center shadow-[0_20px_60px_rgb(0,0,0,0.03)]">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 mb-8 border-2 border-dashed border-gray-100 group">
             <ImageIcon size={48} className="transition-transform group-hover:scale-110 duration-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">No Assets Found</h2>
          <p className="text-gray-400 font-bold text-sm max-w-xs mb-10 leading-relaxed uppercase tracking-widest">Your media library is currently empty. Start by uploading images or publishing articles. Max 5MB (PNG/JPEG) allowed.</p>
          <label className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-widest italic">
            Select Files
            <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {/* Error Dialog */}
      {errorDialog.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-10 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
                <Filter size={32} />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">{errorDialog.title}</h3>
              <p className="text-gray-500 font-bold mb-10 uppercase tracking-widest text-xs leading-loose">{errorDialog.message}</p>
              <button 
                onClick={() => setErrorDialog({ show: false, title: '', message: '' })}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-extrabold text-sm tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
