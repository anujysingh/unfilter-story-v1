import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect } from 'react'
import { Save, Loader } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    siteLogo: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    aboutUs: '',
    termsAndConditions: '',
    privacyPolicy: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await apiFetch(`/cms/v1/settings`)
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiFetch(`/cms/v1/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      alert('Settings saved successfully!')
    } catch (e) {
      console.error(e)
      alert('Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setSettings(prev => ({ ...prev, siteLogo: event.target.result }))
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader className="animate-spin text-gray-500" /></div>

  return (
    <div className="space-y-6 flex flex-col h-full max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-[56px] font-extrabold text-[var(--cms-accent)] tracking-tighter leading-[1.1] mb-2">Settings</h1>
          <p className="text-[16px] font-medium text-[var(--cms-text-secondary)] tracking-tight leading-[1.5] mt-2 px-1">Configure global application preferences</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center px-6 py-3 bg-[var(--cms-accent)] text-white text-sm font-extrabold rounded-xl shadow-[0_8px_20px_rgba(0,93,59,0.2)] hover:scale-105 active:scale-95 transition-all tracking-widest disabled:opacity-50"
        >
          {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 p-8">
        
        {/* Logo settings */}
        <div className="border-b border-gray-50 pb-8 mb-8">
          <h3 className="font-extrabold text-[var(--cms-accent)] tracking-tight text-xl mb-6">Branding & Logo</h3>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
              <div className="flex gap-4 items-center">
                {settings.siteLogo && (
                  <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={settings.siteLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <input 
                    type="text" 
                    name="siteLogo"
                    value={settings.siteLogo || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png or upload a file"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">OR</span>
                    <label className="cursor-pointer text-sm font-extrabold text-[var(--cms-accent)] hover:text-[var(--cms-accent-light)] transition-colors">
                      Upload Logo Image
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social settings */}
        <div className="border-b border-gray-50 pb-8 mb-8">
          <h3 className="font-extrabold text-[var(--cms-accent)] tracking-tight text-xl mb-6">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
              <input 
                type="text" 
                name="twitterUrl"
                value={settings.twitterUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              <input 
                type="text" 
                name="linkedinUrl"
                value={settings.linkedinUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
              <input 
                type="text" 
                name="instagramUrl"
                value={settings.instagramUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Legal settings */}
        <div className="mb-0">
          <h3 className="font-extrabold text-[var(--cms-accent)] tracking-tight text-xl mb-6">Information & Legal Pages</h3>
          <div className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Us</label>
              <textarea 
                rows="6" 
                name="aboutUs"
                value={settings.aboutUs || ''}
                onChange={handleChange}
                placeholder="Enter HTML or text for the About Us page..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all resize-none font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions</label>
              <textarea 
                rows="6" 
                name="termsAndConditions"
                value={settings.termsAndConditions || ''}
                onChange={handleChange}
                placeholder="Enter HTML or text for Terms and Conditions..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all resize-none font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
              <textarea 
                rows="6" 
                name="privacyPolicy"
                value={settings.privacyPolicy || ''}
                onChange={handleChange}
                placeholder="Enter HTML or text for Privacy Policy..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[var(--cms-accent-light)] outline-none transition-all resize-none font-mono"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
