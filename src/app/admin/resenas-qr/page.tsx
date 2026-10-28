'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import {
  fetchTarjetas,
  createBatchTarjetas,
  updateTarjeta,
  deleteTarjeta,
  getCardRedirectUrl,
  type QrTarjeta,
} from '@/lib/qr-tarjetas'

export default function ResenasQrAdminPage() {
  const [tarjetas, setTarjetas] = useState<QrTarjeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unassigned' | 'active'>('all')
  const [batchFilter, setBatchFilter] = useState<string>('all')

  // Estado de edición en filas (key = code, value = { clientName, targetUrl, saving, saved })
  const [editingRows, setEditingRows] = useState<
    Record<string, { clientName: string; targetUrl: string; saving?: boolean; saved?: boolean }>
  >({})

  // Modal Crear Lote
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchCount, setBatchCount] = useState<number>(50)
  const [batchName, setBatchName] = useState<string>('')
  const [creatingBatch, setCreatingBatch] = useState(false)

  // Modal Ver QR individual
  const [selectedCardForQr, setSelectedCardForQr] = useState<QrTarjeta | null>(null)
  const [qrModalDataUrl, setQrModalDataUrl] = useState<string | null>(null)

  // Modal Vista Imprenta / Catálogo
  const [showPrintView, setShowPrintView] = useState(false)
  const [exportingZip, setExportingZip] = useState(false)
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null)

  // Toast notification
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // Cargar tarjetas de Firestore
  const loadTarjetas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTarjetas()
      setTarjetas(data)

      // Inicializar estado editable de cada fila
      const initialRows: Record<string, { clientName: string; targetUrl: string }> = {}
      for (const t of data) {
        initialRows[t.code] = {
          clientName: t.clientName || '',
          targetUrl: t.targetUrl || '',
        }
      }
      setEditingRows(initialRows)
    } catch (err) {
      console.error('Error al cargar tarjetas:', err)
      showToast('❌ Error al cargar tarjetas de Firestore')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTarjetas()
  }, [loadTarjetas])

  // Obtener lotes únicos para el filtro
  const batchNames = useMemo(() => {
    const set = new Set<string>()
    for (const t of tarjetas) {
      if (t.batchName) set.add(t.batchName)
    }
    return Array.from(set)
  }, [tarjetas])

  // Próximo número correlativo sugerido para nuevo lote
  const nextNumberEstimate = useMemo(() => {
    let max = 0
    for (const t of tarjetas) {
      const n = parseInt(t.code.replace(/\D/g, ''), 10)
      if (!isNaN(n) && n > max) max = n
    }
    return max + 1
  }, [tarjetas])

  // Métricas
  const stats = useMemo(() => {
    const total = tarjetas.length
    const active = tarjetas.filter((t) => t.status === 'active' && Boolean(t.targetUrl)).length
    const unassigned = total - active
    const totalScans = tarjetas.reduce((acc, t) => acc + (t.scanCount || 0), 0)
    return { total, active, unassigned, totalScans }
  }, [tarjetas])

  // Tarjetas filtradas
  const filteredTarjetas = useMemo(() => {
    return tarjetas.filter((t) => {
      // Filtro de búsqueda
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.clientName.toLowerCase().includes(q) ||
        t.targetUrl.toLowerCase().includes(q) ||
        t.batchName.toLowerCase().includes(q)

      // Filtro de estado
      const isActive = t.status === 'active' && Boolean(t.targetUrl)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'unassigned' && !isActive)

      // Filtro de lote
      const matchesBatch = batchFilter === 'all' || t.batchName === batchFilter

      return matchesSearch && matchesStatus && matchesBatch
    })
  }, [tarjetas, search, statusFilter, batchFilter])

  // Guardar cambios de una fila (cliente y targetUrl)
  const handleSaveRow = async (code: string) => {
    const row = editingRows[code]
    if (!row) return

    setEditingRows((prev) => ({
      ...prev,
      [code]: { ...prev[code], saving: true },
    }))

    try {
      await updateTarjeta(code, {
        clientName: row.clientName.trim(),
        targetUrl: row.targetUrl.trim(),
      })

      // Actualizar tarjeta en la lista local
      const isNowActive = row.targetUrl.trim().length > 0
      setTarjetas((prev) =>
        prev.map((item) =>
          item.code === code
            ? {
                ...item,
                clientName: row.clientName.trim(),
                targetUrl: row.targetUrl.trim(),
                status: isNowActive ? 'active' : 'unassigned',
              }
            : item
        )
      )

      setEditingRows((prev) => ({
        ...prev,
        [code]: { ...prev[code], saving: false, saved: true },
      }))

      setTimeout(() => {
        setEditingRows((prev) => ({
          ...prev,
          [code]: { ...prev[code], saved: false },
        }))
      }, 2500)

      showToast(`✅ Tarjeta #${code} guardada con éxito`)
    } catch (err) {
      console.error(`Error guardando tarjeta #${code}:`, err)
      setEditingRows((prev) => ({
        ...prev,
        [code]: { ...prev[code], saving: false },
      }))
      showToast(`❌ Error al guardar tarjeta #${code}`)
    }
  }

  // Eliminar una tarjeta
  const handleDeleteRow = async (code: string) => {
    if (!confirm(`¿Estás seguro de eliminar la tarjeta #${code}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await deleteTarjeta(code)
      setTarjetas((prev) => prev.filter((t) => t.code !== code))
      showToast(`🗑️ Tarjeta #${code} eliminada`)
    } catch (err) {
      console.error(`Error eliminando tarjeta #${code}:`, err)
      showToast(`❌ Error al eliminar tarjeta #${code}`)
    }
  }

  // Crear nuevo lote
  const handleCreateBatch = async () => {
    if (batchCount <= 0 || batchCount > 500) {
      alert('La cantidad debe ser entre 1 y 500 tarjetas por lote.')
      return
    }

    setCreatingBatch(true)
    try {
      const res = await createBatchTarjetas(batchCount, batchName)
      showToast(`🎉 ¡Lote creado! Tarjetas creadas desde #${res.startCode} hasta #${res.endCode}`)
      setShowBatchModal(false)
      setBatchName('')
      await loadTarjetas()
    } catch (err) {
      console.error('Error creando lote:', err)
      showToast('❌ Error al crear el lote en Firestore')
    } finally {
      setCreatingBatch(false)
    }
  }

  // Abrir modal con QR individual en HD
  const handleOpenQrModal = async (t: QrTarjeta) => {
    setSelectedCardForQr(t)
    const url = getCardRedirectUrl(t.code)
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      setQrModalDataUrl(dataUrl)
    } catch (err) {
      console.error('Error generando QR data URL:', err)
    }
  }

  // Descargar QR individual
  const handleDownloadQrPng = (code: string, dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `tarjeta-qr-${code}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Copiar imagen QR al portapapeles
  const handleCopyQrImage = async (dataUrl: string) => {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      showToast('📋 ¡Imagen QR copiada al portapapeles!')
    } catch (err) {
      console.error('Error copiando QR al portapapeles:', err)
      showToast('⚠️ No se pudo copiar la imagen al portapapeles')
    }
  }

  // Copiar enlace directo de la tarjeta
  const handleCopyLink = (code: string) => {
    const url = getCardRedirectUrl(code)
    navigator.clipboard.writeText(url)
    showToast(`📋 Enlace copiado: ${url}`)
  }

  // Exportar todas las tarjetas filtradas en un archivo ZIP para la imprenta
  const handleExportZip = async () => {
    if (filteredTarjetas.length === 0) {
      alert('No hay tarjetas en la vista actual para exportar.')
      return
    }

    setExportingZip(true)
    const total = filteredTarjetas.length
    setZipProgress({ current: 0, total })

    try {
      const zip = new JSZip()
      const folder = zip.folder('tarjetas-qr-imprenta') || zip

      for (let i = 0; i < total; i++) {
        const card = filteredTarjetas[i]
        const url = getCardRedirectUrl(card.code)

        // Generar PNG en 1024x1024 con máxima nitidez
        const dataUrl = await QRCode.toDataURL(url, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })

        // Convertir base64 a binario para JSZip
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
        folder.file(`qr-${card.code}.png`, base64Data, { base64: true })

        setZipProgress({ current: i + 1, total })
      }

      // Añadir archivo de índice README.txt
      const indexText = [
        '=== LOTE DE TARJETAS QR DINÁMICAS — KEVDEV ===',
        `Fecha de exportación: ${new Date().toLocaleString('es-AR')}`,
        `Total tarjetas: ${total}`,
        'Resolución de cada archivo: 1024x1024 px (300 DPI recomendados para impresión)',
        'Dominio de destino: https://www.kevdev.net.ar/r/[CODIGO]',
        '',
        'Listado de archivos y enlaces correspondientes:',
        ...filteredTarjetas.map(
          (c) => `qr-${c.code}.png -> ${getCardRedirectUrl(c.code)} [${c.clientName || 'Sin asignar'}]`
        ),
      ].join('\n')

      folder.file('indice-tarjetas.txt', indexText)

      // Generar ZIP y descargar
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `lote-tarjetas-qr-kevdev-${total}-unidades.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      showToast(`📦 ¡Archivo ZIP de ${total} tarjetas descargado con éxito!`)
    } catch (err) {
      console.error('Error generando ZIP:', err)
      showToast('❌ Error al empaquetar el archivo ZIP')
    } finally {
      setExportingZip(false)
      setZipProgress(null)
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', color: '#e8e8e8' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            background: 'rgba(18, 18, 18, 0.95)',
            border: '1px solid #00e5ff',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-mono, monospace)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 229, 255, 0.3)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.75rem' }}>⭐</span>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Reseñas / QR Dinámicos
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: 0 }}>
            Gestión y configuración de tarjetas físicas para Google Reseñas e imprenta.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#00e5ff',
              color: '#0c0c0c',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8125rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              padding: '10px 18px',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <span>+</span> CREAR NUEVO LOTE
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            disabled={exportingZip || filteredTarjetas.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              padding: '10px 16px',
              borderRadius: '99px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: exportingZip ? 'not-allowed' : 'pointer',
              opacity: exportingZip ? 0.6 : 1,
            }}
          >
            <span>📦</span>
            {exportingZip
              ? `Empaquetando (${zipProgress?.current}/${zipProgress?.total})...`
              : 'Descargar Lote (.ZIP)'}
          </button>

          <button
            type="button"
            onClick={() => setShowPrintView(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              padding: '10px 16px',
              borderRadius: '99px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
            }}
          >
            <span>🖨️</span> Hoja de Imprenta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Total Tarjetas
            </span>
            <span style={{ fontSize: '1.25rem' }}>🪪</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Registradas en el sistema
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Sin Asignar (Stock)
            </span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '8px' }}>
            {stats.unassigned}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Listas para vender y configurar
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Activas (Vendidas)
            </span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Redirigiendo a Google Reseñas
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Total Escaneos
            </span>
            <span style={{ fontSize: '1.25rem' }}>📲</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
            {stats.totalScans}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Interacciones en comercios
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ej: 001), comercio o enlace..."
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.85rem' }}>
              🔍
            </span>
          </div>

          {/* Status Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'unassigned', label: 'Sin asignar' },
                { id: 'active', label: 'Activas' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                style={{
                  background: statusFilter === item.id ? 'var(--color-accent-dim)' : 'transparent',
                  color: statusFilter === item.id ? 'var(--color-accent)' : 'var(--color-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Batch Selector */}
          {batchNames.length > 0 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="all">Todos los lotes ({tarjetas.length})</option>
              {batchNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
          Mostrando {filteredTarjetas.length} de {tarjetas.length} tarjetas
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                margin: '0 auto 14px',
              }}
            />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Cargando tarjetas físicas...</p>
          </div>
        ) : filteredTarjetas.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📭</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
              No se encontraron tarjetas
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              {search || statusFilter !== 'all' || batchFilter !== 'all'
                ? 'Probá ajustando los filtros de búsqueda.'
                : 'Todavía no creaste ningún lote de tarjetas para imprimir.'}
            </p>
            {tarjetas.length === 0 && (
              <button
                type="button"
                onClick={() => setShowBatchModal(true)}
                style={{
                  background: '#00e5ff',
                  color: '#0c0c0c',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '10px 20px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + CREAR PRIMER LOTE DE TARJETAS
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--color-faint)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '14px 16px', width: '100px' }}>Código</th>
                  <th style={{ padding: '14px 16px', width: '130px' }}>Estado</th>
                  <th style={{ padding: '14px 16px', width: '220px' }}>Cliente / Comercio</th>
                  <th style={{ padding: '14px 16px', minWidth: '320px' }}>Enlace Google Reseñas</th>
                  <th style={{ padding: '14px 16px', width: '90px', textAlign: 'center' }}>Escaneos</th>
                  <th style={{ padding: '14px 16px', width: '180px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTarjetas.map((card) => {
                  const edit = editingRows[card.code] || {
                    clientName: card.clientName || '',
                    targetUrl: card.targetUrl || '',
                  }
                  const hasUrl = Boolean(edit.targetUrl.trim())
                  const isSaved = edit.saved
                  const isSaving = edit.saving
                  const redirectUrl = getCardRedirectUrl(card.code)

                  return (
                    <tr
                      key={card.code}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {/* Código */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              color: '#00e5ff',
                              background: 'rgba(0, 229, 255, 0.08)',
                              border: '1px solid rgba(0, 229, 255, 0.3)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'inline-block',
                            }}
                          >
                            #{card.code}
                          </span>
                          <button
                            type="button"
                            title="Copiar enlace directo"
                            onClick={() => handleCopyLink(card.code)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              opacity: 0.6,
                              padding: '2px',
                            }}
                          >
                            📋
                          </button>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-faint)', marginTop: '3px' }}>
                          {card.batchName || 'General'}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 16px' }}>
                        {hasUrl ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              borderRadius: '99px',
                              padding: '3px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                            Activa
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '99px',
                              padding: '3px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                            Sin asignar
                          </span>
                        )}
                      </td>

                      {/* Cliente / Comercio */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          value={edit.clientName}
                          onChange={(e) =>
                            setEditingRows((prev) => ({
                              ...prev,
                              [card.code]: { ...prev[card.code], clientName: e.target.value },
                            }))
                          }
                          placeholder="Nombre del comercio..."
                          style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </td>

                      {/* Enlace Google Reseñas */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="url"
                            value={edit.targetUrl}
                            onChange={(e) =>
                              setEditingRows((prev) => ({
                                ...prev,
                                [card.code]: { ...prev[card.code], targetUrl: e.target.value },
                              }))
                            }
                            placeholder="Pegar link de Google Reseñas (ej: https://g.page/r/...)"
                            style={{
                              flex: 1,
                              background: 'rgba(0, 0, 0, 0.35)',
                              border: edit.targetUrl.trim()
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              color: '#ffffff',
                              fontSize: '0.82rem',
                              fontFamily: 'var(--font-mono)',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>

                      {/* Escaneos */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: card.scanCount ? '#f59e0b' : 'var(--color-faint)',
                          }}
                        >
                          {card.scanCount || 0}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Guardar */}
                          <button
                            type="button"
                            onClick={() => handleSaveRow(card.code)}
                            disabled={isSaving}
                            title="Guardar cambios"
                            style={{
                              background: isSaved ? '#10b981' : '#00e5ff',
                              color: '#0c0c0c',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isSaving ? '...' : isSaved ? '✓ OK' : 'GUARDAR'}
                          </button>

                          {/* Probar / Previsualizar */}
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Probar redirección de la tarjeta"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            ↗
                          </a>

                          {/* Ver QR */}
                          <button
                            type="button"
                            onClick={() => handleOpenQrModal(card)}
                            title="Ver y descargar código QR"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                            }}
                          >
                            📱
                          </button>

                          {/* Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(card.code)}
                            title="Eliminar tarjeta"
                            style={{
                              background: 'transparent',
                              color: 'rgba(239, 68, 68, 0.7)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL CREAR NUEVO LOTE ────────────────────────────────── */}
      {showBatchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !creatingBatch && setShowBatchModal(false)}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: '#181818',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Generar Nuevo Lote de Tarjetas
              </h2>
              <button
                type="button"
                onClick={() => !creatingBatch && setShowBatchModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Las tarjetas recibirán códigos únicos correlativos y enlaces dinámicos automáticos.
            </p>

            {/* Presets de cantidad */}
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-faint)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Cantidad de tarjetas a generar:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {[10, 25, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setBatchCount(qty)}
                  style={{
                    background: batchCount === qty ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: batchCount === qty ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: batchCount === qty ? '#00e5ff' : '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 0',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {qty}
                </button>
              ))}
            </div>

            {/* Input cantidad personalizada */}
            <input
              type="number"
              min={1}
              max={500}
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none',
                marginBottom: '18px',
              }}
            />

            {/* Nombre del Lote */}
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-faint)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Nombre de referencia para la imprenta (opcional):
            </label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder={`Ej: Lote #${new Date().toLocaleDateString('es-AR')}`}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none',
                marginBottom: '20px',
              }}
            />

            {/* Rango estimado */}
            <div
              style={{
                background: 'rgba(0, 229, 255, 0.05)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '24px',
                fontSize: '0.85rem',
                color: 'rgba(232, 232, 232, 0.85)',
              }}
            >
              📍 <strong>Rango estimado:</strong> Se crearán tarjetas desde la{' '}
              <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                #{String(nextNumberEstimate).padStart(3, '0')}
              </span>{' '}
              hasta la{' '}
              <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                #{String(nextNumberEstimate + batchCount - 1).padStart(3, '0')}
              </span>.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                disabled={creatingBatch}
                style={{
                  background: 'transparent',
                  color: 'var(--color-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '99px',
                  padding: '10px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateBatch}
                disabled={creatingBatch}
                style={{
                  background: '#00e5ff',
                  color: '#0c0c0c',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '10px 24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: creatingBatch ? 'not-allowed' : 'pointer',
                  opacity: creatingBatch ? 0.7 : 1,
                  boxShadow: '0 4px 18px rgba(0, 229, 255, 0.4)',
                }}
              >
                {creatingBatch ? 'GENERANDO EN FIRESTORE...' : 'CONFIRMAR Y CREAR LOTE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL VER QR INDIVIDUAL EN HD ─────────────────────────── */}
      {selectedCardForQr && qrModalDataUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedCardForQr(null)}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#181818',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#00e5ff',
                  background: 'rgba(0, 229, 255, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '99px',
                }}
              >
                TARJETA #{selectedCardForQr.code}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCardForQr(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              {selectedCardForQr.clientName || 'Tarjeta Sin Asignar'}
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '18px' }}>
              {getCardRedirectUrl(selectedCardForQr.code)}
            </p>

            {/* QR Image Container (White background for clean printing preview) */}
            <div
              style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '16px',
                margin: '0 auto 20px',
                width: '260px',
                height: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
              }}
            >
              <img
                src={qrModalDataUrl}
                alt={`QR Tarjeta ${selectedCardForQr.code}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleDownloadQrPng(selectedCardForQr.code, qrModalDataUrl)}
                style={{
                  background: '#00e5ff',
                  color: '#0c0c0c',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 229, 255, 0.35)',
                }}
              >
                DESCARGAR PNG HD (1024x1024)
              </button>
              <button
                type="button"
                onClick={() => handleCopyQrImage(qrModalDataUrl)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '99px',
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Copiar Imagen al Portapapeles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VISTA HOJA DE IMPRENTA / CATÁLOGO ───────────────────────── */}
      {showPrintView && (
        <PrintViewCatalog
          tarjetas={filteredTarjetas}
          onClose={() => setShowPrintView(false)}
        />
      )}
    </div>
  )
}

/* ─── Componente de Vista de Imprenta / Catálogo ─────────────────────── */
function PrintViewCatalog({
  tarjetas,
  onClose,
}: {
  tarjetas: QrTarjeta[]
  onClose: () => void
}) {
  const [qrImages, setQrImages] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    let isMounted = true
    const generateAll = async () => {
      setGenerating(true)
      const map: Record<string, string> = {}
      for (const t of tarjetas) {
        try {
          const url = getCardRedirectUrl(t.code)
          const data = await QRCode.toDataURL(url, {
            width: 400,
            margin: 1,
            errorCorrectionLevel: 'H',
            color: { dark: '#000000', light: '#ffffff' },
          })
          map[t.code] = data
        } catch {}
      }
      if (isMounted) {
        setQrImages(map)
        setGenerating(false)
      }
    }

    generateAll()
    return () => {
      isMounted = false
    }
  }, [tarjetas])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#ffffff',
        color: '#000000',
        overflowY: 'auto',
        padding: '24px',
      }}
    >
      {/* Top toolbar (hidden when printing) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '2px solid #e2e8f0',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
            Hoja de Impresión — Tarjetas QR Físicas ({tarjetas.length} unidades)
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Listo para enviar a la imprenta o guardar en PDF (Ctrl + P / Cmd + P).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={generating}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🖨️ IMPRIMIR / GUARDAR PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar Vista
          </button>
        </div>
      </div>

      {generating ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Generando códigos QR en alta resolución para la imprenta...</p>
        </div>
      ) : (
        /* Printable grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {tarjetas.map((card) => {
            const qrSrc = qrImages[card.code]
            return (
              <div
                key={card.code}
                style={{
                  border: '1px dashed #94a3b8',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  pageBreakInside: 'avoid',
                  background: '#ffffff',
                }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                  }}
                >
                  TARJETA #{card.code}
                </div>

                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt={`QR #${card.code}`}
                    style={{ width: '150px', height: '150px', margin: '0 auto 8px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '150px', height: '150px', background: '#f8fafc', margin: '0 auto 8px' }} />
                )}

                <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {getCardRedirectUrl(card.code)}
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: card.clientName ? '#0f172a' : '#94a3b8',
                    marginTop: '6px',
                  }}
                >
                  {card.clientName || 'Sin asignar'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Print stylesheet */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
        }
      `}</style>
    </div>
  )
}
