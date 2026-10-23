'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'

/* ─── Types ─────────────────────────────────────────────────────────── */

export type PriorityLevel = 'baja' | 'media' | 'alta' | 'urgente'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface CardItem {
  id: string
  title: string
  description?: string
  priority: PriorityLevel
  tag?: string
  dueDate?: string
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export interface ColumnItem {
  id: string
  title: string
  color?: string
  cards: CardItem[]
}

export interface TabWorkspace {
  id: string
  name: string
  icon: string
  color: string
  columns: ColumnItem[]
  notes: string
  viewMode: 'kanban' | 'notes' | 'split'
  updatedAt: string
}

export interface OrganizadorData {
  tabs: TabWorkspace[]
  activeTabId: string
  updatedAt: string
}

/* ─── Defaults ──────────────────────────────────────────────────────── */

const DEFAULT_TABS: TabWorkspace[] = [
  {
    id: 'tab-proyectos',
    name: 'Proyectos Activos',
    icon: '🚀',
    color: '#00e5ff',
    viewMode: 'split',
    updatedAt: new Date().toISOString(),
    notes: `# 🚀 NOTAS DE PROYECTOS ACTIVOS
- Recordar solicitar logos en formato SVG o PNG en alta resolución transparente.
- Enviar siempre credenciales de producción cifradas o por canal seguro.

## Checklist de lanzamiento:
[x] Optimización SEO y OpenGraph para redes
[x] Favicon oficial y Web Manifest responsive
[ ] Verificar puntuación Lighthouse > 90 en mobile y desktop
[ ] Configurar analíticas y Google Search Console
[ ] Prueba de pasarela de pago o formulario de contacto`,
    columns: [
      {
        id: 'col-1',
        title: 'Por Iniciar',
        color: '#64748b',
        cards: [
          {
            id: 'card-1',
            title: 'Kickoff & Briefing nuevo cliente',
            description: 'Definir paleta de colores, objetivos comerciales y secciones clave.',
            priority: 'alta',
            tag: 'Diseño',
            checklist: [
              { id: 'chk-1', text: 'Recibir referencias visuales', completed: true },
              { id: 'chk-2', text: 'Definir estructura de páginas', completed: false },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-2',
        title: 'En Desarrollo',
        color: '#00e5ff',
        cards: [
          {
            id: 'card-2',
            title: 'Maquetado responsive y animaciones',
            description: 'Implementar carrusel 3D, transiciones suaves y modo oscuro pulido.',
            priority: 'urgente',
            tag: 'Frontend',
            checklist: [
              { id: 'chk-3', text: 'Hero interactivo', completed: true },
              { id: 'chk-4', text: 'Galería de productos', completed: true },
              { id: 'chk-5', text: 'Formulario de presupuesto', completed: false },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-3',
        title: 'Revisión & QA',
        color: '#eab308',
        cards: [
          {
            id: 'card-3',
            title: 'Test cross-device & velocidad',
            description: 'Revisar tiempos de carga en redes móviles y ajustes de tipografía.',
            priority: 'media',
            tag: 'QA',
            checklist: [
              { id: 'chk-6', text: 'Probar en iPhone Safari', completed: true },
              { id: 'chk-7', text: 'Probar en Android Chrome', completed: false },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-4',
        title: 'Entregado / Producción',
        color: '#10b981',
        cards: [
          {
            id: 'card-4',
            title: 'Despliegue Vercel & Dominio',
            description: 'Configurar registros DNS, certificado SSL automático y testing final.',
            priority: 'baja',
            tag: 'Deploy',
            checklist: [
              { id: 'chk-8', text: 'DNS propagados', completed: true },
              { id: 'chk-9', text: 'Entrega formal al cliente', completed: true },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: 'tab-comercial',
    name: 'Clientes & Pipeline',
    icon: '💼',
    color: '#a855f7',
    viewMode: 'kanban',
    updatedAt: new Date().toISOString(),
    notes: `# 💼 PIPELINE COMERCIAL KEVDEV
- Regla de oro: Hacer seguimiento a las 48hs de enviada la demo interactiva.
- Enfocarse en el retorno de inversión y la velocidad de carga frente a sitios lentos de WordPress.
- Plantillas de mensajes rápidos listas en /admin/mensajes.`,
    columns: [
      {
        id: 'col-c1',
        title: 'Prospectos Detectados',
        color: '#64748b',
        cards: [
          {
            id: 'card-c1',
            title: 'Contactar negocio de gastronomía local',
            description: 'Tienen un menú en PDF pesado en Instagram. Ofrecerles catálogo interactivo web.',
            priority: 'alta',
            tag: 'Prospecto',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-c2',
        title: 'Demo Presentada',
        color: '#3b82f6',
        cards: [
          {
            id: 'card-c2',
            title: 'Demo personalizada enviada por WhatsApp',
            description: 'Link enviado con video explicativo corto de 40 segundos.',
            priority: 'media',
            tag: 'Demo',
            checklist: [
              { id: 'chk-c1', text: 'Enviar mensaje de seguimiento 48hs', completed: false },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-c3',
        title: 'En Negociación',
        color: '#eab308',
        cards: [
          {
            id: 'card-c3',
            title: 'Definir plan único vs mensual',
            description: 'Enviar comparativa de costos desde el cotizador oficial.',
            priority: 'urgente',
            tag: 'Negociación',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-c4',
        title: 'Cerrado / Cobrado',
        color: '#10b981',
        cards: [
          {
            id: 'card-c4',
            title: 'Seña 50% confirmada',
            description: 'Ingreso asentado en el panel de clientes con fecha de entrega acordada.',
            priority: 'baja',
            tag: 'Cerrado',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: 'tab-ideas',
    name: 'Ideas & Contenido',
    icon: '💡',
    color: '#eab308',
    viewMode: 'kanban',
    updatedAt: new Date().toISOString(),
    notes: `# 📱 IDEAS DE CONTENIDO PARA REDES
- Formato Reel / TikTok: Gancho visual de 3 segundos + Solución práctica + CTA claro.
- Audio en tendencia pero con narración clara y subtítulos estilizados.`,
    columns: [
      {
        id: 'col-i1',
        title: 'Banco de Ideas',
        color: '#64748b',
        cards: [
          {
            id: 'card-i1',
            title: 'Reel: "¿Por qué tu web no vende?"',
            description: 'Analizar 3 errores comunes: tipografía ilegible, sin WhatsApp directo y carga lenta.',
            priority: 'alta',
            tag: 'Reels',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-i2',
        title: 'Guión en Preparación',
        color: '#a855f7',
        cards: [
          {
            id: 'card-i2',
            title: 'Antes vs Después: Rediseño real',
            description: 'Comparar versión antigua de cliente con el nuevo sitio veloz en Next.js.',
            priority: 'media',
            tag: 'Guión',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'col-i3',
        title: 'Grabado & Editado',
        color: '#00e5ff',
        cards: [],
      },
      {
        id: 'col-i4',
        title: 'Publicado',
        color: '#10b981',
        cards: [],
      },
    ],
  },
  {
    id: 'tab-notas',
    name: 'Scratchpad Rápido',
    icon: '📝',
    color: '#10b981',
    viewMode: 'notes',
    updatedAt: new Date().toISOString(),
    notes: `# ⚡ BLOC DE NOTAS GENERAL Y ANOTACIONES
Espacio libre para notas de reuniones, números de teléfono temporales, ideas al vuelo o fragmentos de código mientras trabajás en el panel.

## Anotaciones rápidas de hoy:
- 

## Enlaces útiles:
- Panel Vercel: https://vercel.com
- Firebase Console: https://console.firebase.google.com
- Dominio NIC Argentina / DonWeb`,
    columns: [
      {
        id: 'col-n1',
        title: 'Pendientes Rápidos de Hoy',
        color: '#00e5ff',
        cards: [],
      },
      {
        id: 'col-n2',
        title: 'Resuelto',
        color: '#10b981',
        cards: [],
      },
    ],
  },
]

const PRIORITY_STYLES: Record<PriorityLevel, { label: string; bg: string; color: string; border: string }> = {
  baja: {
    label: 'Baja',
    bg: 'rgba(148, 163, 184, 0.1)',
    color: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.25)',
  },
  media: {
    label: 'Media',
    bg: 'rgba(0, 229, 255, 0.1)',
    color: '#00e5ff',
    border: 'rgba(0, 229, 255, 0.3)',
  },
  alta: {
    label: 'Alta',
    bg: 'rgba(249, 115, 22, 0.12)',
    color: '#fb923c',
    border: 'rgba(249, 115, 22, 0.3)',
  },
  urgente: {
    label: 'Urgente',
    bg: 'rgba(244, 63, 94, 0.15)',
    color: '#fb7185',
    border: 'rgba(244, 63, 94, 0.35)',
  },
}

const TAB_COLOR_PRESETS = [
  '#00e5ff', // Electric Cyan
  '#a855f7', // Purple
  '#eab308', // Amber / Gold
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6', // Teal
]

const TAB_ICON_PRESETS = ['🚀', '💼', '💡', '📝', '🎯', '⚡', '🛠️', '🎨', '📈', '🔒', '👥', '⭐']

const LOCAL_STORAGE_KEY = 'kevdev_organizador_v1'

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function OrganizadorPage() {
  const [data, setData] = useState<OrganizadorData>(() => ({
    tabs: DEFAULT_TABS,
    activeTabId: DEFAULT_TABS[0].id,
    updatedAt: new Date().toISOString(),
  }))
  const [isLoaded, setIsLoaded] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced')
  const [searchQuery, setSearchQuery] = useState('')

  // Drag & Drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [draggedSourceColId, setDraggedSourceColId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  // Card modal state
  const [editingCard, setEditingCard] = useState<{
    card: CardItem
    colId: string
  } | null>(null)

  // Quick inline add state
  const [quickAddColId, setQuickAddColId] = useState<string | null>(null)
  const [quickAddText, setQuickAddText] = useState('')

  // Tab Modal state
  const [showTabModal, setShowTabModal] = useState(false)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [tabForm, setTabForm] = useState({
    name: '',
    icon: '🚀',
    color: '#00e5ff',
  })

  // Add Column prompt state
  const [showAddColModal, setShowAddColModal] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [, startTransition] = useTransition()

  /* 1. Initial Load from LocalStorage + Cloud Sync */
  useEffect(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (local) {
        const parsed = JSON.parse(local)
        if (parsed?.tabs?.length) {
          setData(parsed)
        }
      }
    } catch (e) {
      console.warn('Could not read local organizador data:', e)
    }
    setIsLoaded(true)

    // Background fetch cloud data
    fetch('/api/admin/organizador')
      .then(res => res.json())
      .then(res => {
        if (res?.data?.tabs?.length) {
          setData(res.data)
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data))
          } catch {}
        }
      })
      .catch(err => {
        console.warn('Could not fetch cloud organizador:', err)
        setSyncStatus('offline')
      })
  }, [])

  /* 2. Debounced save to LocalStorage + Cloud */
  function saveState(updater: (prev: OrganizadorData) => OrganizadorData) {
    setData(prev => {
      const next = updater(prev)
      next.updatedAt = new Date().toISOString()

      // 1. Instant local storage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('LocalStorage error:', e)
      }

      // 2. Debounced cloud sync
      setSyncStatus('saving')
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/admin/organizador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next),
          })
          if (res.ok) {
            setSyncStatus('synced')
          } else {
            setSyncStatus('offline')
          }
        } catch {
          setSyncStatus('offline')
        }
      }, 700)

      return next
    })
  }

  const activeTab = data.tabs.find(t => t.id === data.activeTabId) || data.tabs[0] || DEFAULT_TABS[0]

  /* ─── Tab Operations ────────────────────────────────────────────────── */

  function handleSelectTab(tabId: string) {
    saveState(prev => ({ ...prev, activeTabId: tabId }))
  }

  function handleOpenCreateTab() {
    setEditingTabId(null)
    setTabForm({ name: '', icon: '📌', color: '#00e5ff' })
    setShowTabModal(true)
  }

  function handleOpenEditTab(tab: TabWorkspace, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingTabId(tab.id)
    setTabForm({ name: tab.name, icon: tab.icon, color: tab.color })
    setShowTabModal(true)
  }

  function handleSaveTab() {
    if (!tabForm.name.trim()) return

    if (editingTabId) {
      saveState(prev => ({
        ...prev,
        tabs: prev.tabs.map(t =>
          t.id === editingTabId
            ? { ...t, name: tabForm.name.trim(), icon: tabForm.icon, color: tabForm.color }
            : t
        ),
      }))
    } else {
      const newTab: TabWorkspace = {
        id: `tab-${Date.now()}`,
        name: tabForm.name.trim(),
        icon: tabForm.icon,
        color: tabForm.color,
        viewMode: 'kanban',
        notes: `# 📝 Notas de ${tabForm.name.trim()}\nEscribí acá tus ideas, checklists o anotaciones para este tema...`,
        columns: [
          { id: `col-${Date.now()}-1`, title: 'Por Hacer', color: '#64748b', cards: [] },
          { id: `col-${Date.now()}-2`, title: 'En Progreso', color: tabForm.color, cards: [] },
          { id: `col-${Date.now()}-3`, title: 'Completado', color: '#10b981', cards: [] },
        ],
        updatedAt: new Date().toISOString(),
      }
      saveState(prev => ({
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
      }))
    }
    setShowTabModal(false)
  }

  function handleDeleteTab(tabId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (data.tabs.length <= 1) {
      alert('Tenés que mantener al menos una pestaña de organización.')
      return
    }
    if (!confirm('¿Seguro que querés eliminar esta pestaña con todos sus tableros y notas?')) return

    saveState(prev => {
      const remaining = prev.tabs.filter(t => t.id !== tabId)
      const nextActiveId = prev.activeTabId === tabId ? remaining[0].id : prev.activeTabId
      return {
        ...prev,
        tabs: remaining,
        activeTabId: nextActiveId,
      }
    })
  }

  function handleSetViewMode(mode: 'kanban' | 'notes' | 'split') {
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => (t.id === activeTab.id ? { ...t, viewMode: mode } : t)),
    }))
  }

  /* ─── Notes Operations ──────────────────────────────────────────────── */

  function handleNotesChange(newText: string) {
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => (t.id === activeTab.id ? { ...t, notes: newText } : t)),
    }))
  }

  function handleInsertNotesSnippet(snippet: string) {
    const updated = activeTab.notes ? `${activeTab.notes}\n${snippet}` : snippet
    handleNotesChange(updated)
  }

  /* ─── Column Operations ─────────────────────────────────────────────── */

  function handleAddColumn() {
    if (!newColTitle.trim()) return
    const newCol: ColumnItem = {
      id: `col-${Date.now()}`,
      title: newColTitle.trim(),
      color: activeTab.color || '#00e5ff',
      cards: [],
    }
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === activeTab.id ? { ...t, columns: [...t.columns, newCol] } : t
      ),
    }))
    setNewColTitle('')
    setShowAddColModal(false)
  }

  function handleDeleteColumn(colId: string) {
    const col = activeTab.columns.find(c => c.id === colId)
    if (col && col.cards.length > 0) {
      if (!confirm(`La columna "${col.title}" contiene ${col.cards.length} tarjeta(s). ¿Eliminarla de todos modos?`)) return
    }
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === activeTab.id
          ? { ...t, columns: t.columns.filter(c => c.id !== colId) }
          : t
      ),
    }))
  }

  function handleRenameColumn(colId: string) {
    const current = activeTab.columns.find(c => c.id === colId)
    const newTitle = prompt('Nuevo nombre para la columna:', current?.title || '')
    if (!newTitle || !newTitle.trim()) return
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === activeTab.id
          ? {
              ...t,
              columns: t.columns.map(c =>
                c.id === colId ? { ...c, title: newTitle.trim() } : c
              ),
            }
          : t
      ),
    }))
  }

  /* ─── Card Operations & Drag-and-Drop ───────────────────────────────── */

  function handleQuickAddCard(colId: string) {
    if (!quickAddText.trim()) return
    const newCard: CardItem = {
      id: `card-${Date.now()}`,
      title: quickAddText.trim(),
      priority: 'media',
      checklist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === activeTab.id
          ? {
              ...t,
              columns: t.columns.map(c =>
                c.id === colId ? { ...c, cards: [...c.cards, newCard] } : c
              ),
            }
          : t
      ),
    }))
    setQuickAddText('')
    setQuickAddColId(null)
  }

  function handleDragStart(cardId: string, colId: string) {
    setDraggedCardId(cardId)
    setDraggedSourceColId(colId)
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault()
    if (dragOverColId !== colId) {
      setDragOverColId(colId)
    }
  }

  function handleDrop(targetColId: string) {
    if (!draggedCardId || !draggedSourceColId) return
    if (draggedSourceColId === targetColId) {
      setDraggedCardId(null)
      setDraggedSourceColId(null)
      setDragOverColId(null)
      return
    }

    saveState(prev => {
      let movedCard: CardItem | null = null

      const updatedCols = activeTab.columns.map(col => {
        if (col.id === draggedSourceColId) {
          const card = col.cards.find(c => c.id === draggedCardId)
          if (card) movedCard = card
          return { ...col, cards: col.cards.filter(c => c.id !== draggedCardId) }
        }
        return col
      })

      if (!movedCard) return prev

      const finalCols = updatedCols.map(col => {
        if (col.id === targetColId) {
          return { ...col, cards: [...col.cards, movedCard!] }
        }
        return col
      })

      return {
        ...prev,
        tabs: prev.tabs.map(t => (t.id === activeTab.id ? { ...t, columns: finalCols } : t)),
      }
    })

    setDraggedCardId(null)
    setDraggedSourceColId(null)
    setDragOverColId(null)
  }

  function handleMoveCardCol(cardId: string, fromColId: string, toColId: string) {
    if (fromColId === toColId) return
    saveState(prev => {
      let cardToMove: CardItem | null = null
      const tabCols = activeTab.columns.map(col => {
        if (col.id === fromColId) {
          const found = col.cards.find(c => c.id === cardId)
          if (found) cardToMove = found
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        }
        return col
      })
      if (!cardToMove) return prev
      const updatedCols = tabCols.map(col => {
        if (col.id === toColId) {
          return { ...col, cards: [...col.cards, cardToMove!] }
        }
        return col
      })
      return {
        ...prev,
        tabs: prev.tabs.map(t => (t.id === activeTab.id ? { ...t, columns: updatedCols } : t)),
      }
    })
  }

  function handleDeleteCard(cardId: string, colId: string) {
    if (!confirm('¿Eliminar esta tarjeta?')) return
    saveState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t =>
        t.id === activeTab.id
          ? {
              ...t,
              columns: t.columns.map(c =>
                c.id === colId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c
              ),
            }
          : t
      ),
    }))
    if (editingCard?.card.id === cardId) {
      setEditingCard(null)
    }
  }

  function handleSaveCardModal(updated: CardItem, targetColId: string) {
    saveState(prev => {
      const fromColId = editingCard?.colId || targetColId
      let cols = activeTab.columns

      if (fromColId !== targetColId) {
        // Move to target column
        cols = cols.map(col => {
          if (col.id === fromColId) {
            return { ...col, cards: col.cards.filter(c => c.id !== updated.id) }
          }
          if (col.id === targetColId) {
            return { ...col, cards: [...col.cards, { ...updated, updatedAt: new Date().toISOString() }] }
          }
          return col
        })
      } else {
        // Update in-place
        cols = cols.map(col => {
          if (col.id === targetColId) {
            return {
              ...col,
              cards: col.cards.map(c =>
                c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c
              ),
            }
          }
          return col
        })
      }

      return {
        ...prev,
        tabs: prev.tabs.map(t => (t.id === activeTab.id ? { ...t, columns: cols } : t)),
      }
    })
    setEditingCard(null)
  }

  /* ─── Backup & Restore ──────────────────────────────────────────────── */

  function handleExportJSON() {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonStr)
    downloadAnchor.setAttribute('download', `kevdev_organizador_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed && Array.isArray(parsed.tabs)) {
          saveState(() => parsed)
          alert('¡Copia de seguridad importada con éxito!')
        } else {
          alert('El archivo seleccionado no tiene el formato correcto de Organizador.')
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.')
      }
    }
    reader.readAsText(file)
  }

  /* Filter cards by search query */
  const query = searchQuery.trim().toLowerCase()
  const filterCards = (cards: CardItem[]) => {
    if (!query) return cards
    return cards.filter(
      c =>
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query)) ||
        (c.tag && c.tag.toLowerCase().includes(query)) ||
        c.checklist.some(chk => chk.text.toLowerCase().includes(query))
    )
  }

  const totalTabCards = activeTab.columns.reduce((acc, col) => acc + col.cards.length, 0)

  if (!isLoaded) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>Cargando organizador...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1600, margin: '0 auto' }}>
      
      {/* ─── Header & Top Actions ───────────────────────────────────── */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 16,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <h1 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Organizador & Workflow
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              background: syncStatus === 'synced' ? 'rgba(16,185,129,0.12)' : 'rgba(234,179,8,0.12)',
              color: syncStatus === 'synced' ? '#10b981' : '#eab308',
              border: `1px solid ${syncStatus === 'synced' ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: syncStatus === 'synced' ? '#10b981' : '#eab308',
              }} />
              {syncStatus === 'synced' ? 'Sincronizado' : 'Guardando...'}
            </span>
          </div>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--color-muted)',
            marginTop: 4,
          }}>
            Espacio de trabajo centralizado estilo Trello con pestañas temáticas, notas rápidas y seguimiento continuo.
          </p>
        </div>

        {/* View Mode Switcher & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar tareas o notas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--color-depth)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '7px 12px 7px 30px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
                width: 200,
                transition: 'width 0.2s, border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              color: 'var(--color-faint)',
              pointerEvents: 'none',
            }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 3,
            gap: 2,
          }}>
            <button
              onClick={() => handleSetViewMode('kanban')}
              title="Vista Tablero Kanban (Trello)"
              style={{
                background: activeTab.viewMode === 'kanban' ? 'var(--color-accent-dim)' : 'transparent',
                color: activeTab.viewMode === 'kanban' ? 'var(--color-accent)' : 'var(--color-muted)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.8125rem',
                fontWeight: activeTab.viewMode === 'kanban' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <span>📊</span>
              <span>Tablero</span>
            </button>
            <button
              onClick={() => handleSetViewMode('split')}
              title="Vista Combinada (Tablero + Bloc de notas lateral)"
              style={{
                background: activeTab.viewMode === 'split' ? 'var(--color-accent-dim)' : 'transparent',
                color: activeTab.viewMode === 'split' ? 'var(--color-accent)' : 'var(--color-muted)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.8125rem',
                fontWeight: activeTab.viewMode === 'split' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <span>⚡</span>
              <span>Dividida</span>
            </button>
            <button
              onClick={() => handleSetViewMode('notes')}
              title="Vista Bloc de Notas"
              style={{
                background: activeTab.viewMode === 'notes' ? 'var(--color-accent-dim)' : 'transparent',
                color: activeTab.viewMode === 'notes' ? 'var(--color-accent)' : 'var(--color-muted)',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.8125rem',
                fontWeight: activeTab.viewMode === 'notes' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <span>📝</span>
              <span>Bloc</span>
            </button>
          </div>

          {/* Backup menu / Export */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleExportJSON}
              title="Descargar copia de seguridad en JSON"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '6px 10px',
                color: 'var(--color-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>💾</span>
              <span>Exportar</span>
            </button>
            <label
              title="Importar copia de seguridad en JSON"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '6px 10px',
                color: 'var(--color-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>📂</span>
              <span>Importar</span>
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </header>

      {/* ─── Pestañas Superiores (Tabs Bar) ─────────────────────────── */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'thin',
      }}>
        {data.tabs.map(tab => {
          const isActive = tab.id === activeTab.id
          const cardCount = tab.columns.reduce((sum, c) => sum + c.cards.length, 0)

          return (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: '10px 10px 0 0',
                background: isActive ? 'var(--color-depth)' : 'rgba(255,255,255,0.02)',
                borderTop: isActive ? `2px solid ${tab.color || 'var(--color-accent)'}` : '2px solid transparent',
                borderLeft: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                borderBottom: isActive ? 'none' : '1px solid var(--color-border)',
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-star)' : 'var(--color-muted)',
              }}>
                {tab.name}
              </span>

              {/* Badge count */}
              <span style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                color: isActive ? tab.color : 'var(--color-faint)',
                padding: '1px 6px',
                borderRadius: 12,
              }}>
                {cardCount}
              </span>

              {/* Edit icon */}
              <button
                onClick={e => handleOpenEditTab(tab, e)}
                title="Editar pestaña"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-faint)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: 2,
                  marginLeft: 2,
                  opacity: isActive ? 0.7 : 0.3,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = isActive ? '0.7' : '0.3')}
              >
                ✏️
              </button>

              {/* Delete icon (only if more than 1 tab) */}
              {data.tabs.length > 1 && (
                <button
                  onClick={e => handleDeleteTab(tab.id, e)}
                  title="Eliminar pestaña"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-faint)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: 2,
                    opacity: 0.3,
                    transition: 'opacity 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.color = '#f43f5e'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0.3'
                    e.currentTarget.style.color = 'var(--color-faint)'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}

        {/* Button to add new Tab */}
        <button
          onClick={handleOpenCreateTab}
          title="Crear nueva pestaña temática"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'rgba(0,229,255,0.06)',
            border: '1px dashed var(--color-border-hover)',
            color: 'var(--color-accent)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-accent-dim)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,229,255,0.06)'
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
          <span>Nueva Pestaña</span>
        </button>
      </section>

      {/* ─── Main Content Area (Kanban / Notes / Split) ─────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns:
          activeTab.viewMode === 'split' ? 'minmax(0, 1.6fr) minmax(360px, 1fr)' : '1fr',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ─── A) Kanban Board ──────────────────────────────────────── */}
        {(activeTab.viewMode === 'kanban' || activeTab.viewMode === 'split') && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 0,
          }}>
            {/* Board subheader */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-muted)',
                }}>
                  {activeTab.columns.length} columnas · {totalTabCards} tarjetas
                </span>
                {searchQuery && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                    (Filtrando por: &quot;{searchQuery}&quot;)
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowAddColModal(true)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  color: 'var(--color-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-star)'
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-muted)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <span>+</span> Añadir Columna
              </button>
            </div>

            {/* Columns Container */}
            <div style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              paddingBottom: 16,
              alignItems: 'flex-start',
              scrollbarWidth: 'thin',
              minHeight: 520,
            }}>
              {activeTab.columns.map(column => {
                const visibleCards = filterCards(column.cards)
                const isOver = dragOverColId === column.id

                return (
                  <div
                    key={column.id}
                    onDragOver={e => handleDragOver(e, column.id)}
                    onDrop={() => handleDrop(column.id)}
                    style={{
                      width: activeTab.viewMode === 'split' ? 260 : 290,
                      minWidth: activeTab.viewMode === 'split' ? 260 : 290,
                      background: 'var(--color-depth)',
                      border: `1px solid ${isOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      boxShadow: isOver ? '0 0 16px rgba(0,229,255,0.2)' : 'none',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: 'calc(100vh - 250px)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    {/* Column Header */}
                    <div style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `3px solid ${column.color || 'var(--color-accent)'}`,
                      borderRadius: '12px 12px 0 0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <h3 style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-star)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {column.title}
                        </h3>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--color-muted)',
                          padding: '1px 6px',
                          borderRadius: 10,
                        }}>
                          {column.cards.length}
                        </span>
                      </div>

                      {/* Column menu */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleRenameColumn(column.id)}
                          title="Renombrar columna"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-faint)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: 2,
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          title="Eliminar columna"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-faint)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            padding: 2,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Cards list */}
                    <div style={{
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      overflowY: 'auto',
                      flex: 1,
                      minHeight: 80,
                    }}>
                      {visibleCards.map(card => {
                        const prio = PRIORITY_STYLES[card.priority] || PRIORITY_STYLES.media
                        const completedChecks = card.checklist.filter(c => c.completed).length
                        const totalChecks = card.checklist.length

                        return (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={() => handleDragStart(card.id, column.id)}
                            onClick={() => setEditingCard({ card, colId: column.id })}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 8,
                              padding: '10px 12px',
                              cursor: 'grab',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                              transition: 'transform 0.15s, border-color 0.15s, background 0.15s',
                              userSelect: 'none',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--color-border-hover)'
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                              e.currentTarget.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--color-border)'
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            {/* Badges row: Priority + Tag */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                              <span style={{
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: prio.bg,
                                color: prio.color,
                                border: `1px solid ${prio.border}`,
                                fontWeight: 600,
                              }}>
                                {prio.label}
                              </span>

                              {card.tag && (
                                <span style={{
                                  fontSize: '0.625rem',
                                  fontFamily: 'var(--font-mono)',
                                  background: 'rgba(255,255,255,0.06)',
                                  color: 'var(--color-muted)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 100,
                                }}>
                                  #{card.tag}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4 style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              color: 'var(--color-star)',
                              margin: 0,
                              lineHeight: 1.4,
                            }}>
                              {card.title}
                            </h4>

                            {/* Description preview */}
                            {card.description && (
                              <p style={{
                                fontSize: '0.6875rem',
                                color: 'var(--color-faint)',
                                margin: 0,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {card.description}
                              </p>
                            )}

                            {/* Checklist progress bar */}
                            {totalChecks > 0 && (
                              <div style={{ marginTop: 2 }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.625rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: completedChecks === totalChecks ? '#10b981' : 'var(--color-muted)',
                                  marginBottom: 2,
                                }}>
                                  <span>Checklist</span>
                                  <span>{completedChecks}/{totalChecks}</span>
                                </div>
                                <div style={{
                                  height: 3,
                                  background: 'rgba(255,255,255,0.08)',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${(completedChecks / totalChecks) * 100}%`,
                                    background: completedChecks === totalChecks ? '#10b981' : 'var(--color-accent)',
                                    borderRadius: 2,
                                    transition: 'width 0.2s',
                                  }} />
                                </div>
                              </div>
                            )}

                            {/* Footer: Due date + Quick shift */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginTop: 4,
                              paddingTop: 4,
                              borderTop: '1px solid rgba(255,255,255,0.04)',
                            }}>
                              {card.dueDate ? (
                                <span style={{
                                  fontSize: '0.625rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--color-faint)',
                                }}>
                                  📅 {card.dueDate}
                                </span>
                              ) : (
                                <span />
                              )}

                              <div style={{ display: 'flex', gap: 2 }}>
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteCard(card.id, column.id)
                                  }}
                                  title="Eliminar tarjeta"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-faint)',
                                    cursor: 'pointer',
                                    fontSize: '0.6875rem',
                                    padding: '1px 4px',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-faint)')}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {visibleCards.length === 0 && (
                        <div style={{
                          padding: '16px 8px',
                          textAlign: 'center',
                          color: 'var(--color-faint)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          border: '1px dashed rgba(255,255,255,0.06)',
                          borderRadius: 8,
                        }}>
                          {searchQuery ? 'Sin coincidencias' : 'Columna vacía'}
                        </div>
                      )}
                    </div>

                    {/* Quick Add Card Input / Button */}
                    <div style={{
                      padding: 8,
                      borderTop: '1px solid var(--color-border)',
                    }}>
                      {quickAddColId === column.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input
                            type="text"
                            placeholder="Nombre de la tarea..."
                            value={quickAddText}
                            autoFocus
                            onChange={e => setQuickAddText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleQuickAddCard(column.id)
                              if (e.key === 'Escape') setQuickAddColId(null)
                            }}
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid var(--color-accent)',
                              borderRadius: 6,
                              padding: '6px 8px',
                              color: 'var(--color-star)',
                              fontSize: '0.8125rem',
                              outline: 'none',
                            }}
                          />
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setQuickAddColId(null)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-muted)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleQuickAddCard(column.id)}
                              style={{
                                background: 'var(--color-accent)',
                                color: 'var(--color-on-accent)',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Añadir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuickAddColId(column.id)
                            setQuickAddText('')
                          }}
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px',
                            color: 'var(--color-muted)',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            transition: 'color 0.2s, background 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--color-star)'
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--color-muted)'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem' }}>+</span>
                          <span>Añadir tarea</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Add Column Button Card */}
              <button
                onClick={() => setShowAddColModal(true)}
                style={{
                  width: 220,
                  minWidth: 220,
                  height: 120,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 12,
                  color: 'var(--color-muted)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.color = 'var(--color-accent)'
                  e.currentTarget.style.background = 'var(--color-accent-dim)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-muted)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>+</span>
                <span>Añadir nueva columna</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── B) Bloc de Notas (Scratchpad) ────────────────────────── */}
        {(activeTab.viewMode === 'notes' || activeTab.viewMode === 'split') && (
          <div style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 560,
          }}>
            {/* Notepad Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>📝</span>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-star)',
                }}>
                  Bloc de Notas ({activeTab.name})
                </span>
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleInsertNotesSnippet('\n- [ ] ')}
                  title="Insertar tarea / checklist"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    color: 'var(--color-muted)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                  }}
                >
                  ☑ Checkbox
                </button>
                <button
                  onClick={() => handleInsertNotesSnippet(`\n### ${new Date().toLocaleDateString('es-AR')} - `)}
                  title="Insertar fecha"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    color: 'var(--color-muted)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                  }}
                >
                  🕒 Fecha
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeTab.notes)
                    alert('Notas copiadas al portapapeles.')
                  }}
                  title="Copiar todas las notas"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    color: 'var(--color-muted)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            </div>

            {/* Notepad Textarea */}
            <textarea
              value={activeTab.notes || ''}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Escribí acá tus notas, enlaces, recordatorios de reuniones o requerimientos para este tema..."
              style={{
                flex: 1,
                minHeight: 450,
                background: 'transparent',
                border: 'none',
                padding: '16px',
                color: 'var(--color-star)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
              }}
            />

            {/* Notepad Footer Info */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-faint)',
              background: 'rgba(0,0,0,0.15)',
            }}>
              <span>
                {activeTab.notes?.length || 0} caracteres · {(activeTab.notes?.trim().split(/\s+/).filter(Boolean).length) || 0} palabras
              </span>
              <span>Guardado en local y nube</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal: Crear / Editar Pestaña ──────────────────────────── */}
      {showTabModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 440,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--color-star)',
              margin: 0,
            }}>
              {editingTabId ? 'Editar Pestaña' : 'Nueva Pestaña Temática'}
            </h3>

            {/* Name input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                marginBottom: 6,
              }}>
                Nombre de la pestaña
              </label>
              <input
                type="text"
                placeholder="Ej: Finanzas, Marketing, Rediseño 2026..."
                value={tabForm.name}
                autoFocus
                onChange={e => setTabForm({ ...tabForm, name: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTab() }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--color-star)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Icon picker */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                marginBottom: 6,
              }}>
                Ícono / Emoji
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TAB_ICON_PRESETS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setTabForm({ ...tabForm, icon })}
                    style={{
                      background: tabForm.icon === icon ? 'var(--color-accent-dim)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tabForm.icon === icon ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-muted)',
                marginBottom: 6,
              }}>
                Color de acento
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {TAB_COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTabForm({ ...tabForm, color: c })}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: c,
                      border: tabForm.color === c ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      boxShadow: tabForm.color === c ? `0 0 10px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowTabModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  color: 'var(--color-muted)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTab}
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Guardar Pestaña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Crear Columna ───────────────────────────────────── */}
      {showAddColModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 380,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <h3 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--color-star)',
              margin: 0,
            }}>
              Añadir Columna
            </h3>
            <input
              type="text"
              placeholder="Ej: En Prueba, Pausado, Aprobado..."
              value={newColTitle}
              autoFocus
              onChange={e => setNewColTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddColumn() }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--color-star)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowAddColModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  color: 'var(--color-muted)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddColumn}
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Crear Columna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Editar Tarjeta (Detalles, Checklist, Prioridad) ─── */}
      {editingCard && (
        <CardDetailModal
          card={editingCard.card}
          colId={editingCard.colId}
          columns={activeTab.columns}
          onClose={() => setEditingCard(null)}
          onSave={(updated, targetCol) => handleSaveCardModal(updated, targetCol)}
          onDelete={cardId => handleDeleteCard(cardId, editingCard.colId)}
        />
      )}
    </div>
  )
}

/* ─── Subcomponent: Card Detail Modal ────────────────────────────────── */

function CardDetailModal({
  card,
  colId,
  columns,
  onClose,
  onSave,
  onDelete,
}: {
  card: CardItem
  colId: string
  columns: ColumnItem[]
  onClose: () => void
  onSave: (updated: CardItem, targetColId: string) => void
  onDelete: (cardId: string) => void
}) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [priority, setPriority] = useState<PriorityLevel>(card.priority)
  const [tag, setTag] = useState(card.tag || '')
  const [dueDate, setDueDate] = useState(card.dueDate || '')
  const [selectedColId, setSelectedColId] = useState(colId)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || [])
  const [newCheckText, setNewCheckText] = useState('')

  function handleAddCheckItem() {
    if (!newCheckText.trim()) return
    setChecklist([
      ...checklist,
      {
        id: `chk-${Date.now()}`,
        text: newCheckText.trim(),
        completed: false,
      },
    ])
    setNewCheckText('')
  }

  function handleToggleCheck(id: string) {
    setChecklist(checklist.map(c => (c.id === id ? { ...c, completed: !c.completed } : c)))
  }

  function handleDeleteCheck(id: string) {
    setChecklist(checklist.filter(c => c.id !== id))
  }

  function handleSave() {
    if (!title.trim()) return
    onSave(
      {
        ...card,
        title: title.trim(),
        description: description.trim(),
        priority,
        tag: tag.trim(),
        dueDate,
        checklist,
      },
      selectedColId
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}>
      <div style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 580,
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Detalles de la Tarjeta
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted)',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
            Título de la tarea
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--color-star)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              outline: 'none',
            }}
          />
        </div>

        {/* Column & Priority Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Column selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
              Columna
            </label>
            <select
              value={selectedColId}
              onChange={e => setSelectedColId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--color-void)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            >
              {columns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
              Prioridad
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as PriorityLevel)}
              style={{
                width: '100%',
                background: 'var(--color-void)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Tag & Due date row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
              Etiqueta / Tag (ej: Frontend, Cliente, Fix)
            </label>
            <input
              type="text"
              placeholder="Tag..."
              value={tag}
              onChange={e => setTag(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
              Fecha Límite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '7px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: 4 }}>
            Descripción & Anotaciones
          </label>
          <textarea
            rows={4}
            placeholder="Detalles sobre esta tarea, requerimientos específicos o recordatorios..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '10px 12px',
              color: 'var(--color-star)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Interactive Checklist */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
              Checklist ({checklist.filter(c => c.completed).length}/{checklist.length})
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {checklist.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleCheck(item.id)}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                />
                <span style={{
                  flex: 1,
                  fontSize: '0.8125rem',
                  color: item.completed ? 'var(--color-faint)' : 'var(--color-star)',
                  textDecoration: item.completed ? 'line-through' : 'none',
                }}>
                  {item.text}
                </span>
                <button
                  onClick={() => handleDeleteCheck(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-faint)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Añadir item al checklist..."
              value={newCheckText}
              onChange={e => setNewCheckText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCheckItem() }}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '6px 10px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddCheckItem}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '6px 12px',
                color: 'var(--color-star)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              + Item
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          paddingTop: 14,
          borderTop: '1px solid var(--color-border)',
        }}>
          <button
            onClick={() => onDelete(card.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f43f5e',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🗑️ Eliminar tarjeta
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 14px',
                color: 'var(--color-muted)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-on-accent)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
