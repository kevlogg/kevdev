'use client'

import { useEffect, useState } from 'react'
import {
  PostulacionImpulso,
  EstadoPostulacion,
} from '@/lib/firestore'

export default function AdminConvocatoriaPage() {
  const [postulantes, setPostulantes] = useState<PostulacionImpulso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')
  const [filterAntiguedad, setFilterAntiguedad] = useState<string>('todos')
  const [filterMaterial, setFilterMaterial] = useState<string>('todos')

  // Modal / Detail state
  const [selectedPostulante, setSelectedPostulante] = useState<PostulacionImpulso | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Load data via Server API Route
  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/convocatoria')
      const data = await res.json()
      if (res.ok && data.success) {
        setPostulantes(data.postulantes || [])
      } else {
        throw new Error(data.error || 'Error al obtener postulantes.')
      }
    } catch (err: any) {
      console.error('[Admin Convocatoria] Error al cargar:', err)
      setError('Error al cargar la lista de postulantes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle status update via API
  const handleStatusChange = async (id: string, newEstado: EstadoPostulacion) => {
    try {
      const res = await fetch('/api/convocatoria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: newEstado }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      setPostulantes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: newEstado } : item))
      )
      if (selectedPostulante?.id === id) {
        setSelectedPostulante((prev) => (prev ? { ...prev, estado: newEstado } : null))
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      alert('No se pudo actualizar el estado.')
    }
  }

  // Handle notes save via API
  const handleSaveNotes = async () => {
    if (!selectedPostulante?.id) return
    setSavingNotes(true)
    try {
      const res = await fetch('/api/convocatoria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPostulante.id, notasAdmin: adminNotes }),
      })
      if (!res.ok) throw new Error('Error al guardar notas')
      setPostulantes((prev) =>
        prev.map((item) =>
          item.id === selectedPostulante.id ? { ...item, notasAdmin: adminNotes } : item
        )
      )
      setSelectedPostulante((prev) => (prev ? { ...prev, notasAdmin: adminNotes } : null))
      alert('Notas guardadas correctamente.')
    } catch (err) {
      console.error('Error al guardar notas:', err)
      alert('Error al guardar las notas.')
    } finally {
      setSavingNotes(false)
    }
  }

  // Handle delete via API
  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la postulación de "${nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }
    try {
      const res = await fetch(`/api/convocatoria?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar')
      setPostulantes((prev) => prev.filter((item) => item.id !== id))
      if (selectedPostulante?.id === id) {
        setSelectedPostulante(null)
      }
    } catch (err) {
      console.error('Error al eliminar:', err)
      alert('Error al eliminar la postulación.')
    }
  }

  // Open WhatsApp helper
  const handleOpenWhatsApp = (p: PostulacionImpulso) => {
    const cleanWa = p.whatsapp.replace(/[^\d+]/g, '')
    const msg = `¡Hola ${p.nombre}! Te escribo desde KevDev respecto a la postulación de tu negocio (${p.negocio}) para la Convocatoria Impulso Digital 🚀`
    const url = `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  // Format timestamp
  const formatDate = (ts: any) => {
    if (!ts) return 'Reciente'
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts)
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Reciente'
    }
  }

  // Filtered List
  const filteredList = postulantes.filter((p) => {
    const matchesSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.negocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.instagram?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado =
      filterEstado === 'todos' || (p.estado || 'pendiente') === filterEstado

    const matchesAntiguedad =
      filterAntiguedad === 'todos' || p.antiguedad === filterAntiguedad

    const matchesMaterial =
      filterMaterial === 'todos' ||
      (filterMaterial === 'listo' && p.materialesListos?.startsWith('Sí')) ||
      (filterMaterial === 'pulir' && p.materialesListos?.includes('pulir')) ||
      (filterMaterial === 'cero' && p.materialesListos?.includes('cero'))

    return matchesSearch && matchesEstado && matchesAntiguedad && matchesMaterial
  })

  // Stats calculation
  const totalCount = postulantes.length
  const pendientesCount = postulantes.filter((p) => (p.estado || 'pendiente') === 'pendiente').length
  const enRevisionCount = postulantes.filter((p) => p.estado === 'en_revision').length
  const seleccionadosCount = postulantes.filter((p) => p.estado === 'seleccionado').length
  const materialListoCount = postulantes.filter((p) => p.materialesListos?.startsWith('Sí')).length

  const getBadgeColor = (estado?: string) => {
    switch (estado) {
      case 'seleccionado':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#4ade80' }
      case 'en_revision':
        return { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', text: '#fde047' }
      case 'descartado':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#f87171' }
      default:
        return { bg: 'rgba(0, 229, 255, 0.15)', border: '#00e5ff', text: '#38bdf8' }
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── HEADER DE PÁGINA ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Convocatoria Impulso Digital 🚀
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Control de postulaciones recibidas, evaluación de casos y contacto con emprendedores.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-star)',
            padding: '8px 16px',
            borderRadius: 8,
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          🔄 Recargar lista
        </button>
      </div>

      {/* ── METRICS CARDS ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {/* Total */}
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Postulantes
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>{totalCount}</div>
        </div>

        {/* Pendientes */}
        <div style={{ background: 'var(--color-depth)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Pendientes
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00e5ff', marginTop: 4 }}>{pendientesCount}</div>
        </div>

        {/* En Revisión */}
        <div style={{ background: 'var(--color-depth)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            En Revisión
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', marginTop: 4 }}>{enRevisionCount}</div>
        </div>

        {/* Seleccionados */}
        <div style={{ background: 'var(--color-depth)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Seleccionados
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', marginTop: 4 }}>{seleccionadosCount}</div>
        </div>

        {/* Material Listo */}
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Material Completo
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', marginTop: 4 }}>{materialListoCount}</div>
        </div>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, marca, WhatsApp o Instagram..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(221,232,255,0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--color-star)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Estado */}
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={{
            background: 'rgba(221,232,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--color-star)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En Revisión</option>
          <option value="seleccionado">Seleccionado</option>
          <option value="descartado">Descartado</option>
        </select>

        {/* Filter Antigüedad */}
        <select
          value={filterAntiguedad}
          onChange={(e) => setFilterAntiguedad(e.target.value)}
          style={{
            background: 'rgba(221,232,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--color-star)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Toda Antigüedad</option>
          <option value="Menos de 6 meses">Menos de 6 meses</option>
          <option value="Entre 6 meses y 2 años">Entre 6 meses y 2 años</option>
          <option value="Más de 2 años">Más de 2 años</option>
        </select>

        {/* Filter Material */}
        <select
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
          style={{
            background: 'rgba(221,232,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--color-star)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="todos">Todo Material</option>
          <option value="listo">Material Listo</option>
          <option value="pulir">Falta Pulir</option>
          <option value="cero">Desde Cero</option>
        </select>
      </div>

      {/* ── TABLA DE POSTULANTES ──────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
            Cargando postulaciones de Firestore...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#f87171' }}>{error}</div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>
            No se encontraron postulaciones con los filtros seleccionados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Negocio & IG</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contacto</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Antigüedad</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Materiales</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ padding: '14px 16px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const badge = getBadgeColor(item.estado)

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {/* Fecha */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                        {formatDate(item.creadoEn)}
                      </td>

                      {/* Negocio & Instagram */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.negocio}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#c084fc' }}>{item.instagram}</div>
                      </td>

                      {/* Contacto */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--color-star)' }}>{item.nombre}</div>
                        <button
                          onClick={() => handleOpenWhatsApp(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#25D366',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          📱 {item.whatsapp}
                        </button>
                      </td>

                      {/* Antigüedad & Ventas */}
                      <td style={{ padding: '14px 16px', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                        <div>{item.antiguedad}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-faint)' }}>Ventas: {item.canalVentas}</div>
                      </td>

                      {/* Materiales */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.materialesListos?.startsWith('Sí') ? (
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            ● Listo
                          </span>
                        ) : item.materialesListos?.includes('pulir') ? (
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                            ◐ En desarrollo
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 99, background: 'rgba(255, 255, 255, 0.08)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                            ○ Desde cero
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={item.estado || 'pendiente'}
                          onChange={(e) => item.id && handleStatusChange(item.id, e.target.value as EstadoPostulacion)}
                          style={{
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.text,
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="pendiente" style={{ background: '#181818', color: '#38bdf8' }}>Pendiente</option>
                          <option value="en_revision" style={{ background: '#181818', color: '#fde047' }}>En Revisión</option>
                          <option value="seleccionado" style={{ background: '#181818', color: '#4ade80' }}>Seleccionado</option>
                          <option value="descartado" style={{ background: '#181818', color: '#f87171' }}>Descartado</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => {
                            setSelectedPostulante(item)
                            setAdminNotes(item.notasAdmin || '')
                          }}
                          style={{
                            background: 'var(--color-accent-dim)',
                            border: '1px solid var(--color-accent)',
                            color: 'var(--color-accent)',
                            padding: '5px 10px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginRight: 6,
                          }}
                        >
                          🔍 Ver detalle
                        </button>

                        <button
                          onClick={() => item.id && handleDelete(item.id, item.negocio)}
                          title="Eliminar postulación"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '5px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL DE DETALLE COMPLETO ────────────────────────────── */}
      {selectedPostulante && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPostulante(null)
          }}
        >
          <div
            style={{
              background: '#121212',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#00e5ff', textTransform: 'uppercase' }}>
                  Detalle de Postulación • {formatDate(selectedPostulante.creadoEn)}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                  {selectedPostulante.negocio}
                </h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: 2 }}>
                  Postulante: <strong>{selectedPostulante.nombre}</strong> ({selectedPostulante.instagram})
                </div>
              </div>

              <button
                onClick={() => setSelectedPostulante(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Contacto & WA quick button */}
              <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-mono)' }}>WHATSAPP DE CONTACTO</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#25D366' }}>{selectedPostulante.whatsapp}</div>
                </div>

                <button
                  onClick={() => handleOpenWhatsApp(selectedPostulante)}
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  💬 Abrir Chat de WhatsApp
                </button>
              </div>

              {/* 1. Estado del negocio */}
              <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ color: '#00e5ff', fontSize: '0.875rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>
                  1. Estado del negocio
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
                  <div>
                    <strong style={{ color: 'var(--color-star)' }}>¿A qué se dedica y qué ofrece?</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selectedPostulante.dedicacion}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <span style={{ color: 'var(--color-faint)' }}>Antigüedad: </span>
                      <strong style={{ color: '#38bdf8' }}>{selectedPostulante.antiguedad}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-faint)' }}>Canal de ventas: </span>
                      <strong style={{ color: '#38bdf8' }}>{selectedPostulante.canalVentas}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Necesidad y compromiso */}
              <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ color: '#00e5ff', fontSize: '0.875rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>
                  2. Necesidad y compromiso
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem' }}>
                  <div>
                    <strong style={{ color: 'var(--color-star)' }}>Principal traba hoy por no tener página web:</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selectedPostulante.trabaPrincipal}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-star)' }}>¿Por qué debería ser el seleccionado?</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selectedPostulante.porQueSeleccionado}
                    </p>
                  </div>
                  <div style={{ paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--color-faint)' }}>Disponibilidad de material básico: </span>
                    <strong style={{ color: '#4ade80' }}>{selectedPostulante.materialesListos}</strong>
                  </div>
                </div>
              </div>

              {/* Notas de administración */}
              <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ color: '#c084fc', fontSize: '0.875rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>
                  📝 Notas internas del Administrador
                </h4>
                <textarea
                  rows={3}
                  placeholder="Agregar notas sobre el caso, seguimiento o acuerdos..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(221,232,255,0.04)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: 10,
                    color: 'var(--color-star)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{
                      background: 'var(--color-accent)',
                      border: 'none',
                      color: 'var(--color-on-accent)',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: savingNotes ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {savingNotes ? 'Guardando...' : 'Guardar notas'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>Estado:</span>
                <select
                  value={selectedPostulante.estado || 'pendiente'}
                  onChange={(e) => selectedPostulante.id && handleStatusChange(selectedPostulante.id, e.target.value as EstadoPostulacion)}
                  style={{
                    background: 'rgba(221,232,255,0.04)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value="pendiente" style={{ background: '#181818' }}>Pendiente</option>
                  <option value="en_revision" style={{ background: '#181818' }}>En Revisión</option>
                  <option value="seleccionado" style={{ background: '#181818' }}>Seleccionado</option>
                  <option value="descartado" style={{ background: '#181818' }}>Descartado</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedPostulante(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--color-border)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
