import { apiFetch } from '../lib/api.js';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Type, Check, X, Languages, Eye, EyeOff, Send, GripVertical, AlertCircle, Layout, Eraser, Settings2, ArrowLeft, Save, CheckCircle2, RefreshCw, Bold, Italic, Underline, Strikethrough, List, ListOrdered, CheckSquare, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type as TypeIcon, Highlighter, Code, Quote, Image as ImageIcon, Link as LinkIcon, UploadCloud, Minus, Trash2, Plus, Hash, Tag, Calendar, Rocket, CheckCircle, Info
} from 'lucide-react'

// Helper for image compression
const compressImage = (file, maxWidth = 1920, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'))
    }
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
        
        // Export as JPEG with compression quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

// Helper to register media in the central library
const registerMedia = async (url, filename, mimeType, sizeBytes) => {
  try {
    await apiFetch(`/cms/v1/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, url, mimeType, sizeBytes })
    })
  } catch (err) {
    console.error("Failed to register media", err)
  }
}

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

const STANDARD_COLORS = ['#000000', '#FFFFFF', '#005D3B', '#C9F775', '#4A86E8', '#EA4335', '#FBBC04', '#34A853']


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
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef(null)

  const handleResize = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = containerRef.current.offsetWidth

    const onMouseMove = (moveEvent) => {
      // If centered, resizing happens on both sides, so we double the delta
      const delta = (moveEvent.clientX - startX) * (align === 'center' ? 2 : 1)
      const newWidth = Math.max(100, Math.min(containerRef.current.parentElement.offsetWidth, startWidth + delta))
      updateAttributes({ width: `${newWidth}px` })
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [align, updateAttributes])

  return (
    <NodeViewWrapper className={`flex my-10 w-full transition-all ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div 
        ref={containerRef}
        className={`relative group transition-all duration-300 ${isResizing ? 'ring-2 ring-[var(--cms-accent)] ring-offset-4' : ''}`}
        style={{ width, maxWidth: '100%' }}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
          <img src={src} className="w-full h-auto block select-none" draggable="false" />
          
          {/* Resize Handle */}
          <div 
            onMouseDown={handleResize}
            className="absolute bottom-4 right-4 w-4 h-4 bg-white border-2 border-[var(--cms-accent)] rounded-full cursor-nwse-resize shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100 transform duration-300"
          >
            <div className="absolute inset-0 bg-[var(--cms-accent)] animate-ping rounded-full opacity-20 pointer-events-none"></div>
          </div>

          {/* Alignment & Action Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100 z-30">
            <button 
              onClick={() => updateAttributes({ align: 'left' })} 
              className={`p-1.5 rounded-lg transition-all ${align === 'left' ? 'bg-[var(--cms-accent)] text-white shadow-lg shadow-[var(--cms-accent)]/20' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Align Left"
            >
              <AlignLeft size={16}/>
            </button>
            <button 
              onClick={() => updateAttributes({ align: 'center' })} 
              className={`p-1.5 rounded-lg transition-all ${align === 'center' ? 'bg-[var(--cms-accent)] text-white shadow-lg shadow-[var(--cms-accent)]/20' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Align Center"
            >
              <AlignCenter size={16}/>
            </button>
            <button 
              onClick={() => updateAttributes({ align: 'right' })} 
              className={`p-1.5 rounded-lg transition-all ${align === 'right' ? 'bg-[var(--cms-accent)] text-white shadow-lg shadow-[var(--cms-accent)]/20' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Align Right"
            >
              <AlignRight size={16}/>
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button 
              onClick={deleteNode} 
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Image"
            >
              <Trash2 size={16}/>
            </button>
          </div>
        </div>

        <input 
          className="w-full text-center text-xs font-black text-gray-300 mt-4 outline-none border-none bg-transparent hover:text-gray-500 focus:text-[var(--cms-accent)] transition-colors tracking-widest uppercase" 
          value={caption || ''} 
          placeholder="ENTER CAPTION..." 
          onChange={e => updateAttributes({ caption: e.target.value })}
        />
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
              compressImage(files[0]).then(compressed => {
                view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: compressed })))
              }).catch(err => {
                console.error("Drop compression failed", err)
                const reader = new FileReader()
                reader.onload = e => view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: e.target.result })))
                reader.readAsDataURL(files[0])
              })
              return true
            }
            return false
          },
          handlePaste(view, event) {
            const item = event.clipboardData?.items[0]
            if (item?.type.startsWith('image/')) {
              const file = item.getAsFile()
              compressImage(file).then(compressed => {
                view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: compressed })))
              }).catch(err => {
                console.error("Paste compression failed", err)
                const reader = new FileReader()
                reader.onload = e => view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.customImage.create({ src: e.target.result })))
                reader.readAsDataURL(file)
              })
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
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [availableCategories, setAvailableCategories] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split('T')[0])
  const [dialog, setDialog] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null, onCancel: null })
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const autoSaveTimerRef = useRef(null)
  const isMounted = useRef(false)
  
  // Sticky color state to persist marks across selection changes (clicks)
  const pendingColorRef = useRef(null)
  const pendingHighlightRef = useRef(null)



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
          class: 'text-[var(--cms-accent)] underline decoration-[var(--cms-accent)]/30 underline-offset-4'
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
    // Fetch dynamic taxonomy
    const fetchTaxonomy = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          apiFetch(`/cms/v1/categories`),
          apiFetch(`/cms/v1/tags`)
        ])
        setAvailableCategories(await catRes.json() || [])
        setAvailableTags(await tagRes.json() || [])
      } catch (e) {
        console.error("Failed to fetch taxonomy", e)
      }
    }
    fetchTaxonomy()

    if (id && editor) {
      apiFetch(`/cms/v1/articles/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setHeadline(data.headline || '')
            setStatus(data.status || 'draft')
            setCategory(data.category || '')
            setTags(data.tags || [])
            setFeaturedImageUrl(data.featuredImageUrl || '')
            setImageCaption(data.imageCaption || '')
            if (data.publishedAt) {
              setPublishedAt(new Date(data.publishedAt).toISOString().split('T')[0])
            }
            editor.commands.setContent(data.body || '')
            // Reset dirty state after initial load
            setTimeout(() => {
               setIsDirty(false)
               setLastSaved(new Date())
            }, 500)
          }
        })
        .catch(err => console.error('Failed to fetch article', err))
    }
  }, [id, editor])

  const handlePublish = async () => {
    if (!featuredImageUrl) return setDialog({ show: true, type: 'error', title: 'Action Required', message: 'Header Image is mandatory for publishing.' })
    if (!headline) return setDialog({ show: true, type: 'error', title: 'Action Required', message: 'Article Headline is required.' })
    if (!category) return setDialog({ show: true, type: 'error', title: 'Action Required', message: 'Please select a Category before publishing.' })
    if (!tags || tags.length === 0) return setDialog({ show: true, type: 'error', title: 'Action Required', message: 'Please add at least one Tag before publishing.' })

    setDialog({
      show: true,
      type: 'confirm',
      title: 'Ready to Launch?',
      message: 'This will make your article live immediately for all readers.',
      onConfirm: async () => {
        setDialog({ show: false })
        executePublish()
      },
      onCancel: () => setDialog({ show: false })
    })
  }

  const executePublish = async () => {
    setIsSaving(true)
    
    // Determine status based on date
    const today = new Date().toISOString().split('T')[0]
    const selectedDate = publishedAt
    const targetStatus = selectedDate > today ? 'scheduled' : 'published'

    const articleData = {
      headline,
      body: editor.getHTML(),
      status: targetStatus,
      category,
      featuredImageUrl,
      imageCaption,
      publishedAt: publishedAt || new Date().toISOString()
    }

    try {
      const url = id 
        ? `/cms/v1/articles/${id}` 
        : `/cms/v1/articles`
      
      const method = id ? 'PUT' : 'POST'

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        navigate('/articles')
      } else {
        const errorData = await res.json()
        setDialog({ 
          show: true, 
          type: 'error', 
          title: 'Publish Failed', 
          message: errorData.error || 'The system was unable to publish the article. Please check all fields and try again.' 
        })
      }
    } catch (err) {
      setDialog({ show: true, type: 'error', title: 'Connection Error', message: 'Unable to reach the server. Please check your internet connection.' })
    } finally {
      setIsSaving(false)
      setIsAutoSaving(false)
    }
  }

  const handleUnpublish = async () => {
    setDialog({
      show: true,
      type: 'confirm',
      title: 'Unpublish Article?',
      message: 'This will change the article status to unpublished and remove it from the public site.',
      onConfirm: async () => {
        setDialog({ show: false })
        setIsSaving(true)
        try {
          const res = await apiFetch(`/cms/v1/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'unpublished' })
          })
          if (res.ok) {
            setStatus('unpublished')
          }
        } catch (err) {
          setDialog({ show: true, type: 'error', title: 'Action Failed', message: 'Unable to unpublish at this time.' })
        } finally {
          setIsSaving(false)
        }
      },
      onCancel: () => setDialog({ show: false })
    })
  }

  const handlePublishNowInEditor = async () => {
    if(!window.confirm("Publish this article immediately?")) return;
    setIsSaving(true)
    try {
      const res = await apiFetch(`/cms/v1/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'published',
          publishedAt: new Date().toISOString()
        })
      })
      if (res.ok) {
        setStatus('published')
        setPublishedAt(new Date().toISOString().split('T')[0])
      }
    } catch (err) {
      setDialog({ show: true, type: 'error', title: 'Action Failed', message: 'Unable to publish now.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save logic: triggers 1 second after the last change
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveDraft(true)
      }, 1000)
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [isDirty, headline, category, tags, featuredImageUrl, imageCaption])

  // Track changes in headline, category, tags, image
  useEffect(() => {
    if (!isMounted.current) return
    setIsDirty(true)
  }, [headline, category, tags, featuredImageUrl, imageCaption])

  useEffect(() => {
    isMounted.current = true
  }, [])

  // Track changes in editor
  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
       if (isMounted.current) setIsDirty(true)
    }
    editor.on('update', handleUpdate)
    return () => editor.off('update', handleUpdate)
  }, [editor])

  const handleSaveDraft = async (isAuto = false) => {
    if (isAuto) setIsAutoSaving(true)
    else setIsSaving(true)

    const articleData = {
      headline: headline || 'Untitled',
      body: editor.getHTML(),
      status: 'draft',
      category,
      tags,
      featuredImageUrl,
      imageCaption,
      publishedAt: publishedAt || null
    }

    try {
      const url = id 
        ? `/cms/v1/articles/${id}` 
        : `/cms/v1/articles`
      
      const method = id ? 'PUT' : 'POST'

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        const data = await res.json()
        setLastSaved(new Date())
        setIsDirty(false)
        if (!id && data.id) {
           navigate(`/articles/${data.id}`, { replace: true })
        }
        if (!isAuto) {
          setDialog({ 
            show: true, 
            type: 'success', 
            title: 'Draft Saved', 
            message: 'Your progress has been safely stored.' 
          })
        }
      } else {
        if (!isAuto) {
          setDialog({ 
            show: true, 
            type: 'error', 
            title: 'Save Failed', 
            message: 'System was unable to save the draft. Please check your connection.' 
          })
        }
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
  }, [updateCounter, headline, editor, status, category, tags, featuredImageUrl, imageCaption])

  // Sentinel based scroll detection for reliable sticky behavior in any container
  const sentinelRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: [0], rootMargin: '-20px 0px 0px 0px' }
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  // Handle persistent colors across selection changes and new lines
  useEffect(() => {
    if (!editor) return

    const applyStickyMarks = () => {
      if (editor.state.selection.empty && editor.isFocused) {
        // Apply pending text color if not already active
        if (pendingColorRef.current && !editor.isActive('textStyle', { color: pendingColorRef.current })) {
          editor.commands.setMark('textStyle', { color: pendingColorRef.current })
        }
        // Apply pending highlight if not already active
        if (pendingHighlightRef.current && !editor.isActive('highlight', { color: pendingHighlightRef.current })) {
          editor.commands.setHighlight({ color: pendingHighlightRef.current })
        }
      }
    }

    // Capture click-based selection moves
    editor.on('selectionUpdate', applyStickyMarks)
    // Capture post-apply updates (when Enter or Backspace finishes)
    editor.on('transaction', ({ transaction }) => {
       if (transaction.docChanged || transaction.selectionSet) {
         // Use setTimeout to ensure we run after TipTap has finalized the transaction
         setTimeout(applyStickyMarks, 0)
       }
    })

    return () => {
      editor.off('selectionUpdate', applyStickyMarks)
    }
  }, [editor])

  if (!editor) return null

  const ToolbarButton = ({ onClick, isActive, children, tooltip }) => (
    <button 
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`p-2 rounded-md transition-all ${
        isActive ? 'bg-[var(--cms-accent)] text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={tooltip}
    >
      {children}
    </button>
  )

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      <div ref={sentinelRef} className="absolute top-0 h-1 w-full pointer-events-none" aria-hidden="true" />
      
      {/* Floating Global Header */}
      <div className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'pt-0' : 'pt-6'}`}>
        <div className={`flex items-center justify-between bg-white/70 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 ${isScrolled ? 'mx-[-32px] rounded-none border-x-0 border-t-0 bg-white/95 shadow-md py-3' : ''}`}>
          <div className="flex items-center gap-5">
             <button onClick={() => navigate('/articles')} className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all active:scale-90 text-gray-500">
                <ArrowLeft size={22} />
             </button>
             <div className="flex flex-col">
                 <div className="flex items-center gap-4">
                    <h1 className={`font-extrabold text-[var(--cms-accent)] leading-tight transition-all duration-300 tracking-tighter ${isScrolled ? 'text-2xl max-w-[400px] truncate' : 'text-[56px] py-4'}`}>
                      {isScrolled && headline ? headline : (id ? 'Edit Article' : 'Create New Article')}
                    </h1>
                    {!isScrolled && <div className="h-10 w-px bg-gray-200 ml-4"></div>}
                    <div className={`font-black tracking-[0.2em] text-[var(--cms-accent)] uppercase ${isScrolled ? 'text-[10px]' : 'text-xs ml-4'}`}>
                      {status}
                    </div>
                 </div>
                 <div className="flex items-center gap-2 mt-1">
                   <div className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                   <p className="text-[14px] text-gray-400 font-medium uppercase tracking-[0.1em]">
                     {isAutoSaving ? (
                       'Synchronizing...'
                     ) : lastSaved ? (
                       `Securely saved • ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                     ) : (
                       'Workspace Ready'
                     )} 
                   </p>
                 </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {status === 'published' && (
                <button 
                  onClick={handleUnpublish}
                  disabled={isSaving}
                  className="hidden md:flex items-center px-5 py-2.5 text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
                >
                   <EyeOff className="mr-2.5 w-4.5 h-4.5" /> Unpublish
                </button>
             )}
             {status !== 'published' && status !== 'scheduled' && (
                <button 
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="hidden md:flex items-center px-5 py-2.5 text-gray-600 font-bold bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50"
                >
                   <Save className="mr-2.5 w-4.5 h-4.5 opacity-40" /> {isSaving ? 'Saving...' : (status === 'unpublished' ? 'Save' : 'Draft')}
                </button>
             )}
             {status === 'scheduled' && (
                <button 
                  onClick={handlePublishNowInEditor}
                  disabled={isSaving}
                  className="hidden md:flex items-center px-5 py-2.5 text-green-600 font-bold bg-green-50 border border-green-100 rounded-2xl hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50"
                >
                   <Rocket className="mr-2.5 w-4.5 h-4.5" /> Publish Now
                </button>
             )}
             <button
               onClick={handlePublish}
               disabled={isSaving}
               className="flex items-center px-7 py-3 text-white font-black bg-[var(--cms-accent)] rounded-2xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,93,59,0.3)] active:scale-95 disabled:opacity-50 uppercase tracking-widest italic text-xs"
             >
                <span className="mr-2.5">
                  {isSaving ? 'Sending...' : ((status === 'published' || status === 'unpublished') ? 'Republish' : (publishedAt > new Date().toISOString().split('T')[0] ? 'Schedule' : 'Publish'))}
                </span>
                <Send className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 mb-8 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--cms-accent)]/80"></div>
         
         {/* Mandatory Header Image Section */}
         <div className="mb-10 group/header-image">
            <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/header-image:bg-[var(--cms-accent)]/10 group-hover/header-image:text-[var(--cms-accent)] transition-all">
                  <ImageIcon size={14} />
              </div>
              Header Image (Mandatory)
            </label>
            
          <div className={`relative w-full aspect-[21/9] rounded-3xl overflow-hidden border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center bg-gray-50/50 ${featuredImageUrl ? 'border-transparent shadow-2xl' : 'border-gray-200 hover:border-[var(--cms-accent)]/30 hover:bg-[var(--cms-accent-light)]'}`}>
               {featuredImageUrl ? (
                 <>
                   <img src={featuredImageUrl} className="w-full h-full object-cover" alt="Header" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/header-image:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <label className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-black text-sm cursor-pointer hover:scale-105 transition-all shadow-xl">
                        Change Image
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png"
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (file) {
                               if (file.size > 5 * 1024 * 1024) {
                                 return setDialog({ show: true, type: 'error', title: 'File Too Large', message: 'Header image must be less than 5MB.' })
                               }
                               if (!['image/jpeg', 'image/png'].includes(file.type)) {
                                 return setDialog({ show: true, type: 'error', title: 'Invalid Format', message: 'Please upload a PNG or JPEG image.' })
                               }
                               try {
                                 const compressed = await compressImage(file)
                                 setFeaturedImageUrl(compressed)
                                 registerMedia(compressed, file.name, file.type, file.size)
                               } catch (err) {
                                 console.error("Compression failed", err)
                                 const reader = new FileReader()
                                 reader.onload = (event) => setFeaturedImageUrl(event.target.result)
                                 reader.readAsDataURL(file)
                               }
                            }
                          }}
                        />
                      </label>
                      <button 
                        onClick={() => setFeaturedImageUrl('')}
                        className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all shadow-xl hover:scale-105"
                      >
                        Remove
                      </button>
                   </div>
                 </>
               ) : (
                 <label className="flex flex-col items-center cursor-pointer group/upload">
                   <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 text-gray-400 group-hover/upload:text-[var(--cms-accent)] group-hover/upload:scale-110 transition-all duration-500">
                      <UploadCloud size={32} />
                   </div>
                   <p className="text-gray-900 font-black text-lg mb-1">Click to upload header image</p>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Recommended: 1600x900px • Max: 5MB (PNG/JPEG)</p>
                   <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg, image/png"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                           if (file.size > 5 * 1024 * 1024) {
                             return setDialog({ show: true, type: 'error', title: 'File Too Large', message: 'Header image must be less than 5MB.' })
                           }
                           if (!['image/jpeg', 'image/png'].includes(file.type)) {
                             return setDialog({ show: true, type: 'error', title: 'Invalid Format', message: 'Please upload a PNG or JPEG image.' })
                           }
                           try {
                             const compressed = await compressImage(file)
                             setFeaturedImageUrl(compressed)
                             registerMedia(compressed, file.name, file.type, file.size)
                           } catch (err) {
                             console.error("Compression failed", err)
                             const reader = new FileReader()
                             reader.onload = (event) => setFeaturedImageUrl(event.target.result)
                             reader.readAsDataURL(file)
                           }
                        }
                      }}
                    />
                 </label>
               )}
            </div>
            {featuredImageUrl && (
              <input 
                className="w-full text-center text-xs font-black text-gray-300 mt-4 outline-none border-none bg-transparent hover:text-gray-500 focus:text-[var(--cms-accent)] transition-colors tracking-widest uppercase" 
                value={imageCaption} 
                placeholder="ENTER IMAGE CAPTION..." 
                onChange={e => setImageCaption(e.target.value)}
              />
            )}
         </div>
         
         <input 
            className="text-5xl font-black w-full outline-none placeholder-gray-100 text-gray-900 border-none focus:ring-0 mb-10 tracking-tight leading-tight"
            placeholder="Enter Article Headline..."
            value={headline}
            onChange={e => setHeadline(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-gray-50">
            {/* Category Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--cms-accent)]/10 group-hover:text-[var(--cms-accent)] transition-all">
                   <Layout size={14} />
                </div>
                Article Category
              </label>
              
              <div className="relative group">
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:border-[var(--cms-accent)] focus:ring-4 focus:ring-[var(--cms-accent)]/5 focus:bg-white transition-all appearance-none cursor-pointer hover:bg-gray-100/50"
                >
                  <option value="">Choose a category...</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[var(--cms-accent)] group-focus-within:rotate-180 transition-all">
                  <ArrowLeft size={16} className="-rotate-90" />
                </div>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all">
                   <Tag size={14} />
                </div>
                Searchable Tags
              </label>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2.5 p-2 min-h-[58px] bg-gray-50/80 border border-gray-200 rounded-2xl focus-within:border-[var(--cms-accent)] focus-within:ring-4 focus-within:ring-[var(--cms-accent)]/5 focus-within:bg-white transition-all shadow-sm">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:border-[var(--cms-accent)]/30 transition-all group/tag">
                      <span className="text-[var(--cms-accent)] opacity-50">#</span>
                      {tag}
                      <button 
                        onClick={() => setTags(tags.filter(t => t !== tag))} 
                        className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover/tag:opacity-100"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm px-3 font-bold text-gray-800 placeholder-gray-300 min-w-[120px]"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault()
                        if (!tags.includes(tagInput.trim())) {
                          setTags([...tags, tagInput.trim()])
                        }
                        setTagInput('')
                      }
                    }}
                  />
                </div>
                
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {availableTags
                      .filter(t => !tags.includes(t.name))
                      .slice(0, 6)
                      .map(tag => (
                        <button 
                          key={tag.id}
                          onClick={() => setTags([...tags, tag.name])}
                          className="text-[10px] font-black text-gray-400 bg-white border border-gray-100 hover:border-[var(--cms-accent)]/30 hover:text-[var(--cms-accent)] px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                          + {tag.name}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Date */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all">
                   <Calendar size={14} />
                </div>
                Publishing Date
              </label>
              
              <div className="relative group">
                <input 
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={publishedAt}
                  onChange={e => setPublishedAt(e.target.value)}
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none focus:border-[var(--cms-accent)] focus:ring-4 focus:ring-[var(--cms-accent)]/5 focus:bg-white transition-all cursor-pointer hover:bg-gray-100/50"
                  required
                />
              </div>
            </div>
          </div>
          
      </div>

      {/* Styled Toolbar */}
      <div className={`sticky z-40 transition-all duration-300 ${isScrolled ? 'top-[78px]' : 'top-[100px]'} bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-2.5 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-wrap gap-1 items-center`}>
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} tooltip="Bold"><Bold size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} tooltip="Italic"><Italic size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} tooltip="Underline"><Underline size={18}/></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} tooltip="Strikethrough"><Strikethrough size={18}/></ToolbarButton>
        </div>

        <div className="flex items-center gap-2 px-2 border-r border-gray-200">
          <select 
            className="w-[70px] border border-gray-200 rounded-md px-1 py-1 text-sm focus:border-[var(--cms-accent)] outline-none h-[34px]"
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
            className="border border-gray-200 rounded-md text-sm px-2 py-1 h-[34px] focus:border-[var(--cms-accent)] outline-none max-w-[140px]"
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
            className="border border-gray-200 rounded-md text-sm px-2 py-1 h-[34px] focus:border-[var(--cms-accent)] outline-none"
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
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[var(--cms-accent)] outline-none bg-gray-50/50"
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
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[var(--cms-accent)] outline-none bg-gray-50/50"
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
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[var(--cms-accent)] outline-none bg-gray-50/50"
                      onChange={e => editor.chain().focus().setParagraphSpacing(e.target.value).run()}
                      value={editor.getAttributes('paragraph').paragraphSpacing || ''}
                    >
                      <option value="">Default</option>
                      {['0px', '8px', '16px', '24px', '32px', '40px', '48px'].map(val => <option key={val} value={val}>{val}</option>)}
                    </select>
                  </div>

                  {/* Indentation */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">Text Indent</label>
                    <select 
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:border-[var(--cms-accent)] outline-none bg-gray-50/50"
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
                      className={`p-2 rounded-lg transition-all ${editor.isActive('paragraph', { dropCap: true }) ? 'bg-[var(--cms-accent)] text-white shadow-lg shadow-[var(--cms-accent)]/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
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
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      editor.chain().focus().unsetColor().run(); 
                      pendingColorRef.current = null;
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 mb-3 transition-colors"
                  >
                    <Eraser size={14} className="text-gray-400" /> Reset Color
                  </button>
                  
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {COLOR_PALETTE.flat().map(c => (
                      <button 
                        key={c} 
                        onMouseDown={(e) => { 
                          e.preventDefault(); 
                          editor.chain().focus().setColor(c).run(); 
                          pendingColorRef.current = c;
                        }} 
                        className={`w-5.5 h-5.5 rounded-full border border-gray-100 hover:scale-125 transition-all ${editor.isActive('textStyle', { color: c }) ? 'ring-2 ring-offset-1 ring-[var(--cms-accent)]' : ''}`} 
                        style={{ backgroundColor: c }}
                        title={c}
                      ></button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Standard</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {STANDARD_COLORS.map(c => (
                        <button 
                          key={c} 
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            editor.chain().focus().setColor(c).run(); 
                            pendingColorRef.current = c;
                          }} 
                          className="w-7 h-7 rounded-full border border-gray-100 hover:scale-110 shadow-sm" 
                          style={{ backgroundColor: c }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Custom</p>
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
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      editor.chain().focus().unsetHighlight().run(); 
                      pendingHighlightRef.current = null;
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 mb-3 transition-colors"
                  >
                    <Eraser size={14} className="text-gray-400" /> Clear Highlight
                  </button>
                  
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {COLOR_PALETTE.flat().map(c => (
                      <button 
                        key={c} 
                        onMouseDown={(e) => { 
                          e.preventDefault(); 
                          editor.chain().focus().toggleHighlight({ color: c }).run(); 
                          pendingHighlightRef.current = c;
                        }} 
                        className={`w-5.5 h-5.5 rounded-full border border-gray-100 hover:scale-125 transition-all ${editor.isActive('highlight', { color: c }) ? 'ring-2 ring-offset-1 ring-[var(--cms-accent)]' : ''}`} 
                        style={{ backgroundColor: c }}
                        title={c}
                      ></button>
                    ))}
                  </div>

                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Standard</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {STANDARD_COLORS.map(c => (
                        <button 
                          key={c} 
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            editor.chain().focus().toggleHighlight({ color: c }).run(); 
                            pendingHighlightRef.current = c;
                          }} 
                          className="w-7 h-7 rounded-full border border-gray-100 hover:scale-110 shadow-sm" 
                          style={{ backgroundColor: c }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Custom</p>
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
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-black hover:bg-gray-50 rounded cursor-pointer text-gray-700 uppercase">
                    <UploadCloud size={14} /> Upload File (Max 5MB • PNG/JPEG)
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg, image/png"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                           if (file.size > 5 * 1024 * 1024) {
                             return setDialog({ show: true, type: 'error', title: 'File Too Large', message: 'Image must be less than 5MB.' })
                           }
                           if (!['image/jpeg', 'image/png'].includes(file.type)) {
                             return setDialog({ show: true, type: 'error', title: 'Invalid Format', message: 'Please upload a PNG or JPEG image.' })
                           }
                           try {
                             const compressed = await compressImage(file)
                             editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: compressed } }).run()
                             registerMedia(compressed, file.name, file.type, file.size)
                           } catch (err) {
                             console.error("Compression failed", err)
                             const reader = new FileReader()
                             reader.onload = (event) => {
                               editor.chain().focus().insertContent({ type: 'customImage', attrs: { src: event.target.result } }).run()
                             }
                             reader.readAsDataURL(file)
                           }
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

      <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-2.5 rounded-full shadow-2xl text-sm font-semibold text-gray-600 flex items-center gap-4 z-40 transition-all hover:scale-105 border-b-2 border-b-[var(--cms-accent)]">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-[var(--cms-accent)]" />
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <span>{editor.storage.characterCount.characters()} characters</span>
      </div>

      {/* AI loading removed */}
      {/* Custom Dialog Modal */}
      {dialog.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="p-8 text-center">
                 <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                    dialog.type === 'error' ? 'bg-red-50 text-red-500' :
                    dialog.type === 'success' ? 'bg-green-50 text-green-500' :
                    dialog.type === 'confirm' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'
                 }`}>
                    {dialog.type === 'error' && <AlertCircle size={32} />}
                    {dialog.type === 'success' && <CheckCircle size={32} />}
                    {dialog.type === 'confirm' && <Rocket size={32} />}
                    {dialog.type === 'info' && <Info size={32} />}
                 </div>
                 
                 <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{dialog.title}</h3>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed px-4">{dialog.message}</p>
              </div>
              
              <div className="p-6 bg-gray-50/50 flex gap-3 border-t border-gray-100">
                 {dialog.type === 'confirm' ? (
                   <>
                     <button 
                        onClick={dialog.onCancel}
                        className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-white transition-all active:scale-95"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={dialog.onConfirm}
                        className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[var(--cms-accent)] text-white shadow-lg shadow-[var(--cms-accent)]/20 hover:bg-[var(--cms-accent)]/90 transition-all active:scale-95"
                     >
                        Confirm
                     </button>
                   </>
                 ) : (
                   <button 
                      onClick={() => setDialog({ ...dialog, show: false })}
                      className="w-full px-6 py-3.5 rounded-2xl text-sm font-bold bg-gray-900 text-white hover:bg-black transition-all active:scale-95"
                   >
                      Got it
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
