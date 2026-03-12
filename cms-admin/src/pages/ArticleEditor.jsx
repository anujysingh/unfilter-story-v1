import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, ExternalLink, ArrowLeft, Bold, Italic, Strikethrough, Underline, Highlighter, 
  Link as LinkIcon, Unlink, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Code, Copy, CheckCircle2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table as TableIcon, CheckSquare, Minus, Image as ImageIcon, UploadCloud, Link2, Settings2, Trash2, Video, RefreshCw,
  Type, Check, X, Languages, Eye, Send
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, ReactRenderer } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Underline as UnderlineExtension } from '@tiptap/extension-underline'
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight'
import { Link as LinkExtension } from '@tiptap/extension-link'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Image as ImageExtension } from '@tiptap/extension-image'
import { Youtube } from '@tiptap/extension-youtube'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import Suggestion from '@tiptap/suggestion'

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading', 'list_item'] } },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => this.options.types.every(type => commands.updateAttributes(type, { lineHeight })),
      unsetLineHeight: () => ({ commands }) => this.options.types.every(type => commands.resetAttributes(type, 'lineHeight')),
    }
  },
})

const FONT_CATEGORIES = {
  'Sans Serif': ["Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Inter", "Nunito", "Raleway", "Work Sans", "Rubik", "Oxygen", "Ubuntu", "PT Sans", "Fira Sans", "Noto Sans", "DM Sans", "Assistant", "Manrope", "Mulish", "Outfit", "Quicksand", "Public Sans", "Karla", "Urbanist"],
  'Serif': ["Merriweather", "Playfair Display", "Libre Baskerville", "Lora", "PT Serif", "Crimson Text", "EB Garamond", "Spectral", "Domine", "Arvo", "Cardo", "Vollkorn", "Bitter", "Zilla Slab", "Noto Serif", "Source Serif 4"],
  'Display': ["Bebas Neue", "Anton", "Abril Fatface", "Pacifico", "Lobster", "Fredoka", "Satisfy", "Luckiest Guy", "Bangers", "Permanent Marker", "Alfa Slab One", "Bowlby One", "Staatliches", "Archivo Black"],
  'Handwriting': ["Dancing Script", "Great Vibes", "Caveat", "Indie Flower", "Patrick Hand", "Sacramento", "Shadows Into Light", "Kalam", "Architects Daughter", "Reenie Beanie", "Gloria Hallelujah"],
  'Monospace': ["Roboto Mono", "Source Code Pro", "Space Mono", "IBM Plex Mono", "Inconsolata", "JetBrains Mono", "Cousine", "PT Mono", "Anonymous Pro"]
}

// Removed GrammarChecker extension

const ImageComponent = ({ node, updateAttributes, deleteNode }) => {
  const { src, align, width, caption } = node.attrs
  return (
    <NodeViewWrapper className={`flex my-4 w-full ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group" style={{ width }}>
        <img src={src} className="rounded max-w-full h-auto" />
        <input 
          className="w-full text-center text-sm text-gray-500 mt-2 outline-none" 
          value={caption || ''} 
          placeholder="Caption..." 
          onChange={e => updateAttributes({ caption: e.target.value })}
        />
        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
          <button onClick={() => updateAttributes({ align: 'left' })} className="p-1 bg-white rounded shadow"><AlignLeft size={14}/></button>
          <button onClick={() => updateAttributes({ align: 'center' })} className="p-1 bg-white rounded shadow"><AlignCenter size={14}/></button>
          <button onClick={() => updateAttributes({ align: 'right' })} className="p-1 bg-white rounded shadow"><AlignRight size={14}/></button>
          <button onClick={deleteNode} className="p-1 bg-red-500 text-white rounded shadow"><Trash2 size={14}/></button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

const CustomImage = Node.create({
  name: 'customImage', group: 'block', selectable: true, draggable: true,
  addAttributes() { return { src: { default: null }, align: { default: 'center' }, width: { default: '100%' }, caption: { default: null } } },
  parseHTML() { return [{ tag: 'img[src]' }] },
  renderHTML({ HTMLAttributes }) { return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)] },
  addNodeView() { return ReactNodeViewRenderer(ImageComponent) }
})

const ImageDropPaste = Extension.create({
  name: 'imageDropPaste',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDrop(view, event) {
            const files = event.dataTransfer?.files
            if (files?.[0]?.type.startsWith('image/')) {
              event.preventDefault()
              const reader = new FileReader()
              reader.onload = e => view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: e.target.result })))
              reader.readAsDataURL(files[0])
              return true
            }
            return false
          },
          handlePaste(view, event) {
            const item = event.clipboardData?.items[0]
            if (item?.type.startsWith('image/')) {
              const file = item.getAsFile()
              const reader = new FileReader()
              reader.onload = e => view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: e.target.result })))
              reader.readAsDataURL(file)
              return true
            }
            return false
          }
        }
      })
    ]
  }
})

const CommandsList = React.forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectItem = index => {
    const item = props.items[index]
    if (item) props.command(item)
  }
  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') { setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length); return true }
      if (event.key === 'ArrowDown') { setSelectedIndex((selectedIndex + 1) % props.items.length); return true }
      if (event.key === 'Enter') { selectItem(selectedIndex); return true }
      return false
    }
  }))
  return (
    <div className="bg-white border rounded shadow-lg overflow-hidden w-48">
      {props.items.map((item, i) => (
        <button key={i} onClick={() => selectItem(i)} className={`w-full text-left px-3 py-2 text-sm ${i === selectedIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
          {item.title}
        </button>
      ))}
    </div>
  )
})

const CustomCommands = Extension.create({
  name: 'customCommands',
  addOptions() { return { suggestion: { char: '/', command: ({ editor, range, props }) => props.command({ editor, range }) } } },
  addProseMirrorPlugins() { 
    return [
      Suggestion({ 
        editor: this.editor, 
        ...this.options.suggestion 
      })
    ] 
  }
})

const getSuggestionItems = ({ query }) => {
  return [
    { title: 'Heading 1', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
    { title: 'Heading 2', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
    { title: 'Bullet List', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
    { title: 'Image', command: ({ editor, range }) => { 
        editor.chain().focus().deleteRange(range).run()
        const url = window.prompt('Image URL')
        if (url) editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: url } }).run()
    } }
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
}

export default function ArticleEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [headline, setHeadline] = useState('')
  const [localSize, setLocalSize] = useState('')
  const [updateCounter, setUpdateCounter] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState('draft')
  const [lastSaved, setLastSaved] = useState(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      UnderlineExtension,
      HighlightExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#E94560] underline decoration-[#E94560]/30 underline-offset-4'
        }
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      CharacterCount,
      CustomImage,
      ImageDropPaste,
      CustomCommands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: () => {
            let component, popup
            return {
              onStart: props => {
                if (!props.clientRect) return
                component = new ReactRenderer(CommandsList, { props, editor: props.editor })
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  content: component.element,
                  showOnCreate: true, interactive: true, trigger: 'manual', placement: 'bottom-start'
                })
              },
              onUpdate: props => {
                component.updateProps(props)
                if (props.clientRect) {
                  popup[0].setProps({ getReferenceClientRect: props.clientRect })
                }
              },
              onKeyDown: props => {
                if (props.event.key === 'Escape') {
                  popup[0].hide()
                  return true
                }
                return component.ref?.onKeyDown(props)
              },
              onExit: () => { 
                if (popup && popup[0]) popup[0].destroy()
                if (component) component.destroy()
              }
            }
          }
        }
      })
    ],
    content: '',
    onTransaction: ({ editor }) => {
      // Force React to re-render to update counters
      setUpdateCounter(c => c + 1)
      const currentSize = editor.getAttributes('textStyle').fontSize?.replace('px', '') || ''
      setLocalSize(currentSize)
    }
  })

  useEffect(() => {
    if (id && editor) {
      fetch(`http://localhost:3000/cms/v1/articles/${id}`)
        .then(res => res.json())
        .then(data => {
          setHeadline(data.headline)
          setStatus(data.status)
          editor.commands.setContent(data.body)
        })
        .catch(err => console.error('Failed to fetch article', err))
    }
  }, [id, editor])

  const handlePublish = async () => {
    if (!headline) return alert("Headline is required")
    setIsSaving(true)
    
    const articleData = {
      headline,
      body: editor.getHTML(),
      status: 'published'
    }

    try {
      const url = id 
        ? `http://localhost:3000/cms/v1/articles/${id}` 
        : 'http://localhost:3000/cms/v1/articles'
      
      const method = id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        navigate('/articles')
      } else {
        alert("Failed to save article")
      }
    } catch (err) {
      alert("Error saving article")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async (isAuto = false) => {
    if (isAuto) setIsAutoSaving(true)
    else setIsSaving(true)

    const articleData = {
      headline: headline || 'Untitled',
      body: editor.getHTML(),
      status: 'draft'
    }

    try {
      const url = id 
        ? `http://localhost:3000/cms/v1/articles/${id}` 
        : 'http://localhost:3000/cms/v1/articles'
      
      const method = id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        const data = await res.json()
        setLastSaved(new Date())
        if (!id && data.id) {
           navigate(`/articles/${data.id}`, { replace: true })
        }
        if (!isAuto) alert("Draft saved successfully")
      }
    } catch (err) {
      console.error("Error saving draft", err)
    } finally {
      setIsSaving(false)
      setIsAutoSaving(false)
    }
  }

  // Auto-save logic
  useEffect(() => {
    if (!editor || status === 'published') return

    const timer = setTimeout(() => {
      const content = editor.getHTML()
      if (content && content !== '<p></p>') {
        handleSaveDraft(true)
      }
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timer)
  }, [updateCounter, headline])

  if (!editor) return null

  const ToolbarButton = ({ onClick, isActive, children, tooltip }) => (
    <button 
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`p-2 rounded-md transition-all ${
        isActive ? 'bg-[#E94560] text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={tooltip}
    >
      {children}
    </button>
  )

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/articles')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft size={24} />
           </button>
           <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {id ? 'Edit Article' : 'Create New Article'}
              </h2>
              <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                {status === 'published' ? (
                  <span className="flex items-center text-green-600"><Check className="w-3 h-3 mr-1"/> Published</span>
                ) : isAutoSaving ? (
                  <span className="flex items-center"><RefreshCw className="w-3 h-3 mr-1 animate-spin"/> Saving...</span>
                ) : lastSaved ? (
                  <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-green-500"/> Auto-saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                ) : (
                  'Drafting...'
                )} 
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSaveDraft}
             disabled={isSaving}
             className="flex items-center px-4 py-2 text-gray-700 font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
           >
              <Save className="mr-2 w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Draft'}
           </button>
           <button 
             onClick={handlePublish}
             disabled={isSaving}
             className="flex items-center px-5 py-2 text-white font-bold bg-[#E94560] rounded-lg hover:bg-[#d63d56] transition-all shadow-lg shadow-[#E94560]/20 disabled:opacity-50"
           >
              <span className="mr-2">{isSaving ? 'Sending...' : 'Publish Now'}</span> <Send className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <input 
          className="text-4xl font-bold w-full outline-none placeholder-gray-200 text-gray-900 border-none focus:ring-0"
          placeholder="Enter headline here..."
          value={headline}
          onChange={e => setHeadline(e.target.value)}
        />
      </div>

      {/* Styled Toolbar */}
      <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl p-2 mb-6 shadow-md flex flex-wrap gap-1 items-center">
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="Bold"><Bold size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="Italic"><Italic size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="Underline"><Underline size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} tooltip="Strikethrough"><Strikethrough size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-2 px-2 border-r border-gray-200">
          <input 
            className="w-12 border border-gray-200 rounded-md px-2 py-1 text-sm focus:border-[#E94560] outline-none" 
            value={localSize} 
            placeholder="Size"
            onChange={e => {
              setLocalSize(e.target.value)
              if (e.target.value && !isNaN(e.target.value)) {
                editor.chain().setFontSize(e.target.value + 'px').run()
              } else if (!e.target.value) {
                editor.chain().unsetFontSize().run()
              }
            }}
            onBlur={() => editor.chain().focus().run()}
          />
          <select 
            className="border border-gray-200 rounded-md text-sm px-2 py-1 h-[34px] focus:border-[#E94560] outline-none max-w-[140px]"
            onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
            value={editor.getAttributes('textStyle').fontFamily || ''}
          >
            <option value="">Default Font</option>
            {Object.entries(FONT_CATEGORIES).map(([cat, fonts]) => (
              <optgroup key={cat} label={cat}>
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} tooltip="H1"><Heading1 size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} tooltip="H2"><Heading2 size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} tooltip="H3"><Heading3 size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tooltip="Bullet List"><List size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tooltip="Numbered List"><ListOrdered size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} tooltip="Quote"><Quote size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 pr-4 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <button 
            onClick={() => {
              const url = window.prompt('Enter Image URL')
              if (url) editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: url } }).run()
            }}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ImageIcon size={18} />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] p-10 relative">
        {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-white shadow-xl border border-gray-100 rounded-lg relative z-50">
          <div className="flex p-1 gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold size={16}/></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic size={16}/></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><Underline size={16}/></ToolbarButton>
          </div>
        </BubbleMenu>}

        <EditorContent editor={editor} className="prose prose-lg max-w-none outline-none min-h-[500px]" />
      </div>

      <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-2.5 rounded-full shadow-2xl text-sm font-semibold text-gray-600 flex items-center gap-4 z-40 transition-all hover:scale-105 border-b-2 border-b-[#E94560]">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-[#E94560]" />
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span>{editor.storage.characterCount.characters()} characters</span>
      </div>

      {/* AI loading removed */}
    </div>
  )
}
