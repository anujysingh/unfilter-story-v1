import { apiFetch } from '../lib/api.js';
import React, { useState } from 'react'
import { Sparkles, Brain, Zap, Copy, RefreshCcw, Wand2, Type, MessageSquare, Save } from 'lucide-react'

const MODELS = [
  { id: 'gpt', name: 'GPT-4o mini', provider: 'OpenAI', icon: Zap, description: 'High-Speed Editorial Engine. Online and stable.' },
  { id: 'gemini', name: 'Gemini / Gemma Studio', provider: 'Google', icon: Brain, description: 'Premium Google Editorial Weights (Limitless).' }
]

const ACTIONS = [
  { label: 'Rewrite Professionally', value: 'Rewrite this text professionally, maintaining a sophisticated editorial tone.' },
  { label: 'Summarize for News', value: 'Summarize this into a concise 1-2 paragraph news snippet.' },
  { label: 'Optimize for SEO', value: 'Rewrite this to be SEO-friendly, highlighting startup keywords and metrics.' },
  { label: 'Change for Social', value: 'Rewrite this into a compelling LinkedIn/Twitter style post.' },
  { label: 'Custom Prompt...', value: 'custom' }
]

export default function AIStudio() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt')
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0].value)
  const [customAction, setCustomAction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [changePercentage, setChangePercentage] = useState(0)
  const [geminiCooldown, setGeminiCooldown] = useState(0)

  // Countdown effect for Gemini rate limiting
  React.useEffect(() => {
    let timer
    if (geminiCooldown > 0) {
      timer = setInterval(() => {
        setGeminiCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [geminiCooldown])

  const calculateChange = (original, transformed) => {
    if (!original || !transformed) return 0
    
    const levenshtein = (s1, s2) => {
      const len1 = s1.length, len2 = s2.length
      const matrix = Array.from({ length: len1 + 1 }, (_, i) => [i])
      for (let j = 1; j <= len2; j++) matrix[0][j] = j
      
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          )
        }
      }
      return matrix[len1][len2]
    }

    // For large texts, we use word-based comparison for performance
    if (original.length > 2000 || transformed.length > 2000) {
      const words1 = new Set(original.toLowerCase().split(/\W+/).filter(Boolean))
      const words2 = new Set(transformed.toLowerCase().split(/\W+/).filter(Boolean))
      const combined = new Set([...words1, ...words2])
      let intersection = 0
      words1.forEach(w => { if (words2.has(w)) intersection++ })
      return Math.round((1 - (intersection / combined.size)) * 100)
    }

    const dist = levenshtein(original, transformed)
    const maxLen = Math.max(original.length, transformed.length)
    return Math.round((dist / maxLen) * 100)
  }

  const handleTransform = async () => {
    if (!inputText.trim()) {
      setError('Please provide some text to transform.')
      return
    }

    setIsLoading(true)
    setError(null)
    setOutputText('')
    setChangePercentage(0)
    
    try {
      const response = await apiFetch(`/cms/v1/ai/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          model: selectedModel,
          action: selectedAction === 'custom' ? customAction : selectedAction
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      
      setOutputText(data.result)
      setChangePercentage(calculateChange(inputText, data.result))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Sparkles className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 italic">AI <span className="text-indigo-600">Studio</span></h1>
        </div>
        <p className="text-gray-500 font-medium ml-14">Transform your content with the world's most powerful language models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 border border-indigo-50/50">
            <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <RefreshCcw size={12} />
              Engine Selection
            </h2>
            
            <div className="space-y-3">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                    selectedModel === m.id 
                    ? 'border-indigo-600 bg-indigo-50/30' 
                    : 'border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${selectedModel === m.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <m.icon size={20} />
                  </div>
                  <div>
                    <div className="font-black text-sm text-gray-900">{m.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{m.provider}</div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 border border-indigo-50/50">
            <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Wand2 size={12} />
              Transformation
            </h2>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Action</label>
              <select 
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                {ACTIONS.map(a => (
                  <option key={a.label} value={a.value}>{a.label}</option>
                ))}
              </select>

              {selectedAction === 'custom' && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Instruction</label>
                  <textarea 
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    placeholder="e.g. Rewrite as a funny rhyming poem..."
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-indigo-500 transition-all min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleTransform}
              disabled={isLoading}
              className={`w-full mt-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Execute Magic
                </>
              )}
            </button>
          </section>
        </div>

        {/* Right Columns: Editor Pane */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-8">
          {/* Input Area */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 border border-indigo-50/50 flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                <Type size={12} />
                Source Content
              </h2>
              <span className="text-[10px] font-bold text-gray-400">{inputText.length} characters</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your article or notes here..."
              className="flex-1 w-full p-6 bg-gray-50/50 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-medium text-gray-700 resize-none leading-relaxed"
            />
          </div>

          {/* Output Area */}
          <div className="bg-indigo-900 rounded-[2rem] p-8 shadow-2xl shadow-indigo-900/40 relative flex flex-col h-[450px] overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} />
                Studio Result
              </h2>
              <div className="flex items-center gap-4">
                {outputText && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl animate-in zoom-in duration-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">
                      {changePercentage}% Metamorphosis
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  {outputText && (
                    <button 
                      onClick={handleCopy}
                      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
                    >
                      {copied ? <RefreshCcw size={14} className="animate-spin" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-[1.5rem] p-8 relative z-10 overflow-y-auto custom-scrollbar border border-white/10">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-200">
                  <div className="relative">
                    <Brain className="w-12 h-12 opacity-50 pulse-animation" />
                    <Sparkles className="absolute -top-1 -right-1 w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest animate-pulse">Model is thinking...</p>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-red-400">
                  <span className="p-4 bg-red-400/10 rounded-full text-2xl">⚠️</span>
                  <p className="text-sm font-bold text-center max-w-xs">{error}</p>
                </div>
              ) : outputText ? (
                <div className="prose prose-invert prose-p:text-indigo-50 prose-p:leading-relaxed prose-p:font-medium max-w-none">
                  {outputText.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-indigo-300/30">
                  <MessageSquare size={48} strokeWidth={1} />
                  <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Transformation</p>
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            {outputText && (
              <div className="absolute bottom-12 right-12 z-20">
                <button className="flex items-center gap-2 px-6 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/40 transition-all hover:scale-105 active:scale-95">
                  <Save size={16} />
                  Push to Articles
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .pulse-animation {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(0.95); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
