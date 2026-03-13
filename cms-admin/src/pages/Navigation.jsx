import React, { useState, useEffect } from 'react'
import { Plus, GripVertical, Edit2, Trash2, ExternalLink, Move } from 'lucide-react'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- SORTABLE ITEM COMPONENT ---
function SortableMenuItem({ item, level = 0, openModal, handleDelete, updateDisplayOrder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div key={item.id} className="mb-2 relative" ref={setNodeRef} style={style}>
      <div 
        className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group ${level > 0 ? 'ml-8' : ''}`}
      >
        <div className="flex items-center gap-4">
          {level > 0 && (
            <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200" />
          )}
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
            <GripVertical className="text-gray-300 group-hover:text-gray-400" size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 uppercase tracking-tight italic">{item.label}</span>
              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-mono uppercase font-bold">{item.type}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
              <ExternalLink size={10} />
              {item.href}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => openModal(null, item.id, item.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={12} />
            Sub-menu
          </button>
          <button 
            onClick={() => openModal(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {item.children?.length > 0 && (
        <div className="mt-2">
          <SortableContext items={item.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {item.children.map(child => (
              <SortableMenuItem 
                key={child.id} 
                item={child} 
                level={level + 1} 
                openModal={openModal} 
                handleDelete={handleDelete}
                updateDisplayOrder={updateDisplayOrder}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function Navigation() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManualHref, setIsManualHref] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    href: '',
    type: 'link',
    parentId: null,
    parentLabel: null,
    displayOrder: 0
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('http://localhost:3000/cms/v1/navigation')
      const data = await res.json()
      setMenuItems(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch menu items', err)
      setLoading(false)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Find the list that contains the dragged item
    const findAndMove = (list) => {
      const oldIndex = list.findIndex((item) => item.id === active.id)
      const newIndex = list.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(list, oldIndex, newIndex)
        // Update displayOrder for ALL items in this level
        const updatedItems = newList.map((item, index) => ({
          ...item,
          displayOrder: index
        }))
        return { newList: updatedItems, wasFound: true }
      }

      // If not found in this level, check children
      for (let i = 0; i < list.length; i++) {
        if (list[i].children) {
          const { newList: newChildren, wasFound } = findAndMove(list[i].children)
          if (wasFound) {
            const newList = [...list]
            newList[i] = { ...newList[i], children: newChildren }
            return { newList, wasFound: true }
          }
        }
      }

      return { newList: list, wasFound: false }
    }

    const { newList, wasFound } = findAndMove(menuItems)
    if (wasFound) {
      setMenuItems(newList)
      
      // Sync to backend
      const flatten = (items) => {
        let flat = []
        items.forEach(item => {
          flat.push({ id: item.id, displayOrder: item.displayOrder })
          if (item.children) flat = [...flat, ...flatten(item.children)]
        })
        return flat
      }
      
      try {
        await fetch('http://localhost:3000/cms/v1/navigation/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: flatten(newList) })
        })
      } catch (err) {
        console.error('Failed to sync order', err)
      }
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const method = editingItem ? 'PUT' : 'POST'
    const url = editingItem 
      ? `http://localhost:3000/cms/v1/navigation/${editingItem.id}`
      : 'http://localhost:3000/cms/v1/navigation'

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setIsModalOpen(false)
      setEditingItem(null)
      setFormData({ label: '', href: '', type: 'link', parentId: null, parentLabel: null, displayOrder: 0 })
      fetchMenuItems()
    } catch (err) {
      console.error('Failed to save menu item', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item and its submenus?')) return
    try {
      await fetch(`http://localhost:3000/cms/v1/navigation/${id}`, { method: 'DELETE' })
      fetchMenuItems()
    } catch (err) {
      console.error('Failed to delete menu item', err)
    }
  }

  const handleLabelChange = (e) => {
    const label = e.target.value
    let newHref = formData.href

    if (!isManualHref && !editingItem) {
      const slug = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      newHref = slug ? `/category/${slug}` : ''
    }

    setFormData({ ...formData, label, href: newHref })
  }

  const openModal = (item = null, parentId = null, parentLabel = null) => {
    setIsManualHref(item ? true : false)
    if (item) {
      setEditingItem(item)
      setFormData({
        label: item.label,
        href: item.href,
        type: item.type,
        parentId: item.parentId,
        parentLabel: null,
        displayOrder: item.displayOrder
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        label: '', 
        href: '', 
        type: 'link', 
        parentId: parentId, 
        parentLabel: parentLabel,
        displayOrder: menuItems.length 
      })
    }
    setIsModalOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Navigation</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-2">Manage website headers and sub-menus</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-6 py-3 bg-[#E94560] text-white font-black text-sm rounded-xl shadow-lg hover:bg-[#C73652] transition-all flex items-center gap-2 uppercase tracking-widest italic"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-gray-400">Loading Configuration...</span>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-200">
            <Move size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">No Navigation Items</h2>
          <p className="text-gray-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest">
            Your website header is currently empty. Start by adding links or dropdowns.
          </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={menuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {menuItems.map(item => (
                <SortableMenuItem 
                  key={item.id} 
                  item={item} 
                  openModal={openModal} 
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal remains the same */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                {editingItem ? 'Edit Item' : formData.parentId ? `Add Sub-menu` : 'New Menu Item'}
              </h2>
              {formData.parentLabel && !editingItem && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parent:</span>
                  <span className="text-[10px] font-black text-[#E94560] uppercase tracking-widest">{formData.parentLabel}</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                <input 
                  type="text"
                  required
                  value={formData.label}
                  onChange={handleLabelChange}
                  placeholder="e.g. Technology"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all font-bold text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL / Link</label>
                <input 
                  type="text"
                  required
                  value={formData.href}
                  onChange={e => {
                    setIsManualHref(true)
                    setFormData({ ...formData, href: e.target.value })
                  }}
                  placeholder="e.g. /category/technology"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all font-bold text-gray-900 text-sm appearance-none"
                  >
                    <option value="link">LINK</option>
                    <option value="dropdown">DROPDOWN</option>
                    <option value="category_group">CAT GROUP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order</label>
                  <input 
                    type="number"
                    value={formData.displayOrder}
                    onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-gray-900 focus:ring-0 transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-black text-xs rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest italic"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gray-900 text-white font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest italic"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
