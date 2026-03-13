import React from 'react'
import { Save } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6 flex flex-col h-full max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Settings</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Configure global application preferences</p>
        </div>
        <button className="flex items-center px-6 py-3 bg-[var(--cms-accent)] text-white text-sm font-extrabold rounded-xl shadow-[0_8px_20px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all tracking-widest">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 p-8">
        <div className="border-b border-gray-50 pb-8 mb-8">
          <h3 className="font-extrabold text-[var(--cms-accent)] tracking-tight text-xl">Site Configuration</h3>
        </div>
          
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Title</label>
              <input 
                type="text" 
                defaultValue="Unfilter Story" 
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description / SEO Meta Description</label>
              <textarea 
                rows="3" 
                defaultValue="Delivering authentic, unfiltered news on startups, technology, and business."
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] transition-all"
              />
            </div>

            <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Enable Newsletter Signups</h4>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Show subscription widget on public portal</p>
              </div>
              <button 
                type="button" 
                className="bg-[var(--cms-accent)] relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--cms-accent-light)] focus:ring-offset-2" 
                role="switch" 
                aria-checked="true"
              >
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}
