import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, ExternalLink, ArrowLeft, Bold, Italic, Strikethrough, Underline, Highlighter, 
  Link as LinkIcon, Unlink, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Code, Copy, CheckCircle2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Table as TableIcon, CheckSquare, Minus, Image as ImageIcon, UploadCloud, Link2, Settings2, Trash2, Video, RefreshCw,
  Type, Check, X, Languages, Eye, Send, GripVertical, AlertCircle, Layout, Eraser
} from 'lucide-react'

const COLOR_PALETTE = [
  ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF'],
  ['#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF'],
  ['#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC'],
  ['#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD'],
  ['#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0'],
  ['#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79'],
  ['#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47'],
  ['#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130']
]

const STANDARD_COLORS = ['#000000', '#FFFFFF', '#4A86E8', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6']
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

const TypographyAdvanced = Extension.create({
  name: 'typographyAdvanced',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing || null,
            renderHTML: attributes => {
              if (!attributes.letterSpacing) return {}
              return { style: `letter-spacing: ${attributes.letterSpacing}` }
            },
          },
          paragraphSpacing: {
            default: null,
            parseHTML: element => element.style.marginBottom || null,
            renderHTML: attributes => {
              if (!attributes.paragraphSpacing) return {}
              return { style: `margin-bottom: ${attributes.paragraphSpacing}` }
            },
          },
          textIndent: {
            default: null,
            parseHTML: element => element.style.textIndent || null,
            renderHTML: attributes => {
              if (!attributes.textIndent) return {}
              return { style: `text-indent: ${attributes.textIndent}` }
            },
          },
          dropCap: {
            default: false,
            parseHTML: element => element.classList.contains('drop-cap'),
            renderHTML: attributes => {
              if (!attributes.dropCap) return {}
              return { class: 'drop-cap' }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setLetterSpacing: letterSpacing => ({ commands }) => this.options.types.every(type => commands.updateAttributes(type, { letterSpacing })),
      setParagraphSpacing: paragraphSpacing => ({ commands }) => this.options.types.every(type => commands.updateAttributes(type, { paragraphSpacing })),
      setTextIndent: textIndent => ({ commands }) => this.options.types.every(type => commands.updateAttributes(type, { textIndent })),
      toggleDropCap: () => ({ commands, editor }) => {
        const isActive = editor.getAttributes('paragraph').dropCap
        return commands.updateAttributes('paragraph', { dropCap: !isActive })
      },
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

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  draggable: true,
  addAttributes() {
    return {
      type: { default: 'info' }
    }
  },
  parseHTML() { return [{ tag: 'div[data-type="callout"]' }] },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout', class: 'callout-block' }), 0]
  },
  addCommands() {
    return {
      toggleCallout: () => ({ commands }) => commands.toggleNode(this.name, 'paragraph')
    }
  }
})

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
    { title: 'Callout', command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCallout().run() },
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
  const [editorMode, setEditorMode] = useState('normal') // 'normal' or 'block'
  const autoSaveTimerRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: true,
        bulletList: {},
        orderedList: {},
      }),
      UnderlineExtension,
      HighlightExtension.configure({ multicolor: true }),
      Callout,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#E94560] underline decoration-[#E94560]/30 underline-offset-4'
        }
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FontFamily,
      FontSize,
      LineHeight,
      TypographyAdvanced,
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
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
      },
    },
    onTransaction: ({ editor }) => {
      // Force React to re-render to update counters
      setUpdateCounter(c => c + 1)
      const currentSize = editor.getAttributes('textStyle').fontSize?.replace('px', '') || ''
      setLocalSize(currentSize)
    }
  })

  // Mode switch is now handled by parent divine class
  
  useEffect(() => {
    if (id && editor) {
      fetch(`http://localhost:3000/cms/v1/articles/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setHeadline(data.headline || '')
            setStatus(data.status || 'draft')
            editor.commands.setContent(data.body || '')
          }
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

  // Auto-save logic with proper cleanup
  useEffect(() => {
    if (!editor || status === 'published') return

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

    autoSaveTimerRef.current = setTimeout(() => {
      const content = editor.getHTML()
      if (content && content !== '<p></p>' && !isSaving && !isAutoSaving) {
        handleSaveDraft(true)
      }
    }, 5000)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [updateCounter, headline, editor, status])

  // Block Drag Handle positioning logic
  useEffect(() => {
    if (editorMode !== 'block') return

    const handleMouseOver = (e) => {
      const editorEl = document.querySelector('.is-block-editor')
      if (!editorEl) return

      const target = e.target.closest('.is-block-editor > *')
      const handle = document.getElementById('block-drag-handle')
      
      if (target && handle) {
        const rect = target.getBoundingClientRect()
        const editorRect = editorEl.getBoundingClientRect()
        
        handle.style.opacity = '1'
        handle.style.top = `${rect.top - editorRect.top + 8}px`
        handle.style.left = `-40px`
      } else if (handle) {
        handle.style.opacity = '0'
      }
    }

    const editorEl = document.querySelector('.is-block-editor')
    if (editorEl) {
      editorEl.addEventListener('mouseover', handleMouseOver)
    }

    return () => {
      if (editorEl) editorEl.removeEventListener('mouseover', handleMouseOver)
    }
  }, [editorMode, updateCounter])

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
        <div className="flex items-center gap-6">
           <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button 
                onClick={() => setEditorMode('normal')}
                className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${editorMode === 'normal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Type className="w-3.5 h-3.5 mr-1.5" /> Normal
              </button>
              <button 
                onClick={() => setEditorMode('block')}
                className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${editorMode === 'block' ? 'bg-[#E94560] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Layout className="w-3.5 h-3.5 mr-1.5" /> Block
              </button>
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
      </div>

      {/* Article Title Block */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
         <input 
            className="text-4xl font-extrabold w-full outline-none placeholder-gray-100 text-gray-900 border-none focus:ring-0"
            placeholder="Enter Article Headline..."
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
          <select 
            className="w-[70px] border border-gray-200 rounded-md px-1 py-1 text-sm focus:border-[#E94560] outline-none h-[34px]"
            value={localSize}
            onChange={e => {
              const val = e.target.value
              setLocalSize(val)
              if (val) {
                editor.chain().focus().setFontSize(val + 'px').run()
              } else {
                editor.chain().unsetFontSize().run()
              }
            }}
          >
            <option value="">Size</option>
            {Array.from({ length: 100 }, (_, i) => i + 1).map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
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
          <select 
            className="border border-gray-200 rounded-md text-sm px-2 py-1 h-[34px] focus:border-[#E94560] outline-none"
            onChange={e => {
              const val = e.target.value
              if (val === 'p') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run()
            }}
            value={editor.isActive('heading') ? editor.getAttributes('heading').level : 'p'}
          >
            <option value="p">Paragraph</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} tooltip="Bullet List"><List size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} tooltip="Numbered List"><ListOrdered size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} tooltip="Checklist"><CheckSquare size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} tooltip="Align Left"><AlignLeft size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} tooltip="Align Center"><AlignCenter size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} tooltip="Align Right"><AlignRight size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} tooltip="Justify"><AlignJustify size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <div className="relative group">
            <button className="p-2 rounded hover:bg-gray-100 flex items-center gap-1 text-gray-600 transition-colors" title="Typography Settings">
              <Settings2 size={18} />
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 pt-2 z-50">
              <div className="bg-white p-5 border border-gray-100 rounded-xl shadow-2xl w-[260px]">
                <div className="space-y-5">
                  {/* Line Spacing */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Line Spacing</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[#E94560] outline-none bg-gray-50/50"
                      onChange={e => editor.chain().focus().setLineHeight(e.target.value).run()}
                      value={editor.getAttributes('paragraph').lineHeight || ''}
                    >
                      <option value="">Default</option>
                      {['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '2.5', '3.0'].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Letter Spacing</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[#E94560] outline-none bg-gray-50/50"
                      onChange={e => editor.chain().focus().setLetterSpacing(e.target.value).run()}
                      value={editor.getAttributes('paragraph').letterSpacing || ''}
                    >
                      <option value="">Default</option>
                      {['-0.05em', '-0.02em', '0.02em', '0.05em', '0.1em', '0.15em', '0.2em'].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>

                  {/* Paragraph Spacing */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Paragraph Spacing (Bottom)</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[#E94560] outline-none bg-gray-50/50"
                      onChange={e => editor.chain().focus().setParagraphSpacing(e.target.value).run()}
                      value={editor.getAttributes('paragraph').paragraphSpacing || ''}
                    >
                      <option value="">Default</option>
                      {['0px', '8px', '16px', '24px', '32px', '40px', '48px'].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>

                  {/* Indentation */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Text Indent</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[#E94560] outline-none bg-gray-50/50"
                      onChange={e => editor.chain().focus().setTextIndent(e.target.value).run()}
                      value={editor.getAttributes('paragraph').textIndent || ''}
                    >
                      <option value="">None</option>
                      {['12px', '24px', '36px', '48px', '60px'].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>

                  {/* Drop Cap */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">Drop Cap</span>
                      <span className="text-[9px] text-gray-400 uppercase">First letter highlight</span>
                    </div>
                    <button 
                      onClick={() => editor.chain().focus().toggleDropCap().run()}
                      className={`p-2 rounded-lg transition-all ${editor.isActive('paragraph', { dropCap: true }) ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      <div className="text-sm font-black">A</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-2 px-2 border-r border-gray-200">
          <div className="flex items-center gap-1">
            {/* Text Color Picker */}
            <div className="relative group">
              <button className="p-2 rounded hover:bg-gray-100 flex items-center gap-1" title="Text Color">
                <Type size={18} style={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
                <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }}></div>
              </button>
              <div className="hidden group-hover:flex flex-col absolute top-full left-0 pt-2 z-50">
                <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-2xl w-[300px]">
                  <button 
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 mb-3 transition-colors"
                  >
                    <Eraser size={14} className="text-gray-400" /> Reset Color
                  </button>
                  
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {COLOR_PALETTE.flat().map(c => (
                      <button 
                        key={c} 
                        onClick={() => editor.chain().focus().setColor(c).run()} 
                        className={`w-5.5 h-5.5 rounded-full border border-gray-100 hover:scale-125 transition-all ${editor.isActive('textStyle', { color: c }) ? 'ring-2 ring-offset-1 ring-[#E94560]' : ''}`} 
                        style={{ backgroundColor: c }}
                        title={c}
                      ></button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Standard</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {STANDARD_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => editor.chain().focus().setColor(c).run()} 
                          className="w-7 h-7 rounded-full border border-gray-100 hover:scale-110 shadow-sm" 
                          style={{ backgroundColor: c }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Custom</p>
                     <input 
                       type="color" 
                       className="w-8 h-8 rounded p-0 border-none cursor-pointer overflow-hidden bg-transparent"
                       onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                     />
                  </div>
                </div>
              </div>
            </div>

            {/* Highlight Color Picker */}
            <div className="relative group">
              <button className="p-2 rounded hover:bg-gray-100 flex items-center gap-1" title="Highlight">
                <Highlighter size={18} />
                <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }}></div>
              </button>
              <div className="hidden group-hover:flex flex-col absolute top-full left-0 pt-2 z-50">
                <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-2xl w-[300px]">
                  <button 
                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                    className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 mb-3 transition-colors"
                  >
                    <Eraser size={14} className="text-gray-400" /> Clear Highlight
                  </button>
                  
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {COLOR_PALETTE.flat().map(c => (
                      <button 
                        key={c} 
                        onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} 
                        className={`w-5.5 h-5.5 rounded-full border border-gray-100 hover:scale-125 transition-all ${editor.isActive('highlight', { color: c }) ? 'ring-2 ring-offset-1 ring-[#E94560]' : ''}`} 
                        style={{ backgroundColor: c }}
                        title={c}
                      ></button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Standard</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {STANDARD_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} 
                          className="w-7 h-7 rounded-full border border-gray-100 hover:scale-110 shadow-sm" 
                          style={{ backgroundColor: c }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Custom</p>
                     <input 
                       type="color" 
                       className="w-8 h-8 rounded p-0 border-none cursor-pointer overflow-hidden bg-transparent"
                       onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                     />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} tooltip="Code Block"><Code size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} tooltip="Blockquote"><Quote size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCallout().run()} isActive={editor.isActive('callout')} tooltip="Callout"><AlertCircle size={18}/></ToolbarButton>
          <div className="relative group">
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" title="Add Image">
              <ImageIcon size={18} />
            </button>
            <div className="hidden group-hover:block absolute bottom-full left-0 pb-2 z-50">
              <div className="flex flex-col gap-2 bg-white p-2 border border-gray-100 rounded-lg shadow-2xl w-40">
                <button 
                  onClick={() => {
                    const url = window.prompt('Enter Image URL')
                    if (url) editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: url } }).run()
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 rounded text-gray-700"
                >
                  <LinkIcon size={14} /> From URL
                </button>
                <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 rounded cursor-pointer text-gray-700">
                  <UploadCloud size={14} /> Upload File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: event.target.result } }).run()
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] p-10 relative group ${editorMode === 'block' ? 'is-block-editor-container' : ''}`}>
        {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-white shadow-xl border border-gray-100 rounded-lg relative z-50">
          <div className="flex p-1 gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold size={16}/></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic size={16}/></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><Underline size={16}/></ToolbarButton>
          </div>
        </BubbleMenu>}

        <div className={editorMode === 'block' ? 'tiptap is-block-editor' : 'tiptap'}>
          <EditorContent editor={editor} className="prose prose-lg max-w-none focus:outline-none min-h-[500px]" />
        </div>
        
        {editorMode === 'block' && (
          <div className="absolute left-[-40px] top-0 pointer-events-none transition-all duration-200 opacity-0 group/handle hover:opacity-100" id="block-drag-handle">
            <button className="p-1 px-1.5 bg-white border border-gray-100 shadow-sm rounded-md text-gray-400 hover:text-gray-900 pointer-events-auto cursor-grab active:cursor-grabbing">
               <GripVertical size={16} />
            </button>
          </div>
        )}
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
