'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getCliente, updateCliente, getChecklistProgreso, toggleChecklistStep,
  getHistorialPagos, addHistorialPago, togglePagoConfirmado, deleteHistorialPago,
  type Cliente, type EstadoCliente, type DemoEstado, type Situacion, type EstadoPago, type HistorialPago,
} from '@/lib/firestore'
import { CHECKLIST_STEPS } from '@/lib/checklist-steps'
import { SITUACIONES } from '@/lib/cliente-ui'

const ESTADOS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ESTADOS_PAGO: { value: EstadoPago; label: string; color: string }[] = [
  { value: 'AL_DIA',    label: 'Al día',    color: '#4ade80' },
  { value: 'PENDIENTE', label: 'Pendiente', color: '#f59e0b' },
  { value: 'VENCIDO',   label: 'Vencido',   color: '#f87171' },
]

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

/* Normaliza la url guardada y arma el link al panel de plan del sitio del cliente */
function siteBase(url: string) {
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`
}
function planUrl(url: string) {
  return `${siteBase(url)}/admin`
}

const ESTADO_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

type EditableField = 'nombre' | 'rubro' | 'contacto' | 'telefono' | 'instagram' | 'notas' | 'estado' | 'demo' | 'situacion' | 'plan' | 'url' | 'fechaPresentacionDemo' | 'fechaInicioProyecto' | 'montoMensual' | 'montoPagoUnico' | 'diaVencimiento' | 'estadoPago' | 'passwordAdmin'

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente,        setCliente]        = useState<Cliente | null>(null)
  const [progreso,       setProgreso]       = useState<Record<number, boolean>>({})
  const [pagos,          setPagos]          = useState<HistorialPago[]>([])
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [form,           setForm]           = useState<Partial<Cliente>>({})
  const [showPass,       setShowPass]       = useState(false)
  
  // Formulario nuevo pago
  const todayIso = new Date().toISOString().split('T')[0]
  const [pagoForm, setPagoForm] = useState({
    monto: '',
    fecha: todayIso,
    concepto: 'Cuota Mensual',
    medioPago: 'Transferencia',
    confirmado: true,
  })
  const [savingPago, setSavingPago] = useState(false)

  const notasTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [c, p, h] = await Promise.all([
          getCliente(id),
          getChecklistProgreso(id),
          getHistorialPagos(id),
        ])
        if (!c) { router.replace('/admin/clientes'); return }
        setCliente(c)
        setForm(c)
        setProgreso(p)
        setPagos(h)
      } catch {
        router.replace('/admin/clientes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  useEffect(() => {
    return () => {
      if (notasTimer.current) clearTimeout(notasTimer.current)
    }
  }, [])

  async function saveField(field: EditableField, value: string) {
    setSaving(true)
    try {
      await updateCliente(id, { [field]: value })
      setCliente(prev => prev ? { ...prev, [field]: value } : prev)
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch {
      // save failed silently - form value stays as edited
    } finally {
      setSaving(false)
    }
  }

  function handleNotasChange(value: string) {
    setForm(f => ({ ...f, notas: value }))
    if (notasTimer.current) clearTimeout(notasTimer.current)
    notasTimer.current = setTimeout(() => saveField('notas', value), 900)
  }

  async function handleChecklistToggle(stepId: number) {
    const next = !progreso[stepId]
    setProgreso(p => ({ ...p, [stepId]: next }))
    try {
      await toggleChecklistStep(id, stepId, next)
    } catch {
      // revert optimistic update on failure
      setProgreso(p => ({ ...p, [stepId]: !next }))
    }
  }

  async function handleAddPago(e: React.FormEvent) {
    e.preventDefault()
    if (!pagoForm.monto || !pagoForm.fecha) return
    setSavingPago(true)
    try {
      const montoNum = parseFloat(pagoForm.monto) || 0
      const newId = await addHistorialPago({
        clienteId: id,
        monto: montoNum,
        fecha: pagoForm.fecha,
        concepto: pagoForm.concepto || 'Cuota Mensual',
        medioPago: pagoForm.medioPago || 'Transferencia',
        confirmado: pagoForm.confirmado,
      })
      setPagos(prev => [
        {
          id: newId,
          clienteId: id,
          monto: montoNum,
          fecha: pagoForm.fecha,
          concepto: pagoForm.concepto || 'Cuota Mensual',
          medioPago: pagoForm.medioPago || 'Transferencia',
          confirmado: pagoForm.confirmado,
        },
        ...prev,
      ])
      setPagoForm({
        monto: '',
        fecha: todayIso,
        concepto: 'Cuota Mensual',
        medioPago: 'Transferencia',
        confirmado: true,
      })
    } catch (err) {
      console.error('Error al guardar pago:', err)
    } finally {
      setSavingPago(false)
    }
  }

  async function handleTogglePago(pagoId: string, actual: boolean) {
    try {
      await togglePagoConfirmado(pagoId, !actual)
      setPagos(prev => prev.map(p => p.id === pagoId ? { ...p, confirmado: !actual } : p))
    } catch (err) {
      console.error('Error al actualizar pago:', err)
    }
  }

  async function handleDeletePago(pagoId: string) {
    if (!confirm('¿Eliminar este registro de pago?')) return
    try {
      await deleteHistorialPago(pagoId)
      setPagos(prev => prev.filter(p => p.id !== pagoId))
    } catch (err) {
      console.error('Error al eliminar pago:', err)
    }
  }

  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  async function handleSyncFromClientWeb() {
    if (!cliente?.id || !cliente?.url) return
    setSyncing(true)
    setSyncMsg('Sincronizando...')
    try {
      const res = await fetch('/api/admin/sync-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: cliente.id }),
      })
      const data = await res.json()
      if (data.success) {
        // Aplicar actualizaciones y nuevos pagos con la sesión autenticada del navegador
        if (data.updates && Object.keys(data.updates).length > 0) {
          await updateCliente(cliente.id, data.updates).catch(() => {})
        }
        if (data.paymentsToImport && Array.isArray(data.paymentsToImport)) {
          for (const p of data.paymentsToImport) {
            await addHistorialPago({
              clienteId: cliente.id,
              monto: p.amount,
              fecha: p.date || new Date().toISOString().split('T')[0],
              concepto: p.concept || (p as any).concepto || 'Cobro Automático Web',
              medioPago: 'MercadoPago / Web',
              confirmado: p.confirmed ?? true,
            }).catch(() => {})
          }
        }
        setSyncMsg(data.message || '¡Sincronización exitosa!')
        // Recargar cliente e historial
        const [c, h] = await Promise.all([
          getCliente(cliente.id),
          getHistorialPagos(cliente.id),
        ])
        if (c) { setCliente(c); setForm(c) }
        setPagos(h)
      } else {
        setSyncMsg(data.error || 'No se pudo conectar con la web.')
      }
    } catch {
      setSyncMsg('Error de red al sincronizar.')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 4000)
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
  }

  if (!cliente) return null

  const completados  = CHECKLIST_STEPS.filter(s => progreso[s.id]).length
  const progressPct  = Math.round((completados / CHECKLIST_STEPS.length) * 100)

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: '0 0 4px' }}>
            {cliente.nombre}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {cliente.rubro}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {cliente.url && (
            <button
              onClick={handleSyncFromClientWeb}
              disabled={syncing}
              title="Sincronizar plan y pagos guardados en la web del cliente"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-accent)',
                background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)', borderRadius: 8,
                padding: '8px 14px', whiteSpace: 'nowrap', cursor: syncing ? 'wait' : 'pointer',
              }}
            >
              {syncing ? '⌛ Sincronizando...' : '⚡ Sincronizar desde Web'}
            </button>
          )}
          {cliente.situacion === 'EN PRODUCCION' && cliente.url && (
            <a
              href={planUrl(cliente.url)}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-accent)',
                textDecoration: 'none', border: '1px solid var(--color-border)', borderRadius: 8,
                padding: '8px 14px', whiteSpace: 'nowrap',
              }}
            >
              Ver plan ↗
            </a>
          )}
          {syncMsg && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#4ade80' }}>
              {syncMsg}
            </span>
          )}
          {saved && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#4ade80', letterSpacing: '0.06em' }}>
              Guardado
            </span>
          )}
          <select
            value={form.estado ?? cliente.estado}
            onChange={e => {
              const v = e.target.value as EstadoCliente
              setForm(f => ({ ...f, estado: v }))
              saveField('estado', v)
            }}
            style={{ ...inputStyle, width: 'auto' }}
          >
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
        </div>
      </div>

      {/* Data card */}
      <section style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Datos del cliente
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {(
            [
              { field: 'nombre',    label: 'Nombre'    },
              { field: 'rubro',     label: 'Rubro'     },
              { field: 'contacto',  label: 'Contacto'  },
              { field: 'telefono',  label: 'Teléfono'  },
              { field: 'instagram', label: 'Instagram' },
              { field: 'plan',      label: 'Plan'      },
              { field: 'url',       label: 'URL'        },
            ] as { field: EditableField; label: string }[]
          ).map(({ field, label }) => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <input
                value={(form[field] as string) ?? ''}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                onBlur={e => saveField(field, e.target.value)}
                style={inputStyle}
              />
            </label>
          ))}

          {/* Contraseña Admin con Ojo */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Contraseña Admin
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="ej: admin123"
                value={form.passwordAdmin ?? ''}
                onChange={e => setForm(f => ({ ...f, passwordAdmin: e.target.value }))}
                onBlur={e => saveField('passwordAdmin', e.target.value)}
                style={{ ...inputStyle, paddingRight: 36, fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                title={showPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                style={{
                  position: 'absolute',
                  right: 8,
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          {/* Fecha presentación demo */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Fecha presentación demo
            </span>
            <input
              type="date"
              value={(form.fechaPresentacionDemo as string) ?? ''}
              onChange={e => setForm(f => ({ ...f, fechaPresentacionDemo: e.target.value }))}
              onBlur={e => saveField('fechaPresentacionDemo', e.target.value)}
              style={inputStyle}
            />
          </label>

          {/* Fecha inicio proyecto */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Fecha inicio proyecto
            </span>
            <input
              type="date"
              value={(form.fechaInicioProyecto as string) ?? ''}
              onChange={e => setForm(f => ({ ...f, fechaInicioProyecto: e.target.value }))}
              onBlur={e => saveField('fechaInicioProyecto', e.target.value)}
              style={inputStyle}
            />
          </label>

          {/* Demo */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Demo
            </span>
            <select
              value={(form.demo as string) ?? ''}
              onChange={e => {
                const v = e.target.value as DemoEstado
                setForm(f => ({ ...f, demo: v }))
                saveField('demo', v)
              }}
              style={inputStyle}
            >
              <option value="">—</option>
              <option value="PRESENTADA">PRESENTADA</option>
              <option value="HECHA">HECHA</option>
            </select>
          </label>

          {/* Situacion */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Situacion
            </span>
            <select
              value={(form.situacion as string) ?? ''}
              onChange={e => {
                const v = e.target.value as Situacion
                setForm(f => ({ ...f, situacion: v }))
                saveField('situacion', v)
              }}
              style={inputStyle}
            >
              {SITUACIONES.map(s => <option key={s} value={s}>{s || '—'}</option>)}
            </select>
          </label>

          {/* Monto Mensual */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Monto Mensual (ARS)
            </span>
            <input
              type="number"
              placeholder="ej: 25000"
              value={form.montoMensual ?? ''}
              onChange={e => setForm(f => ({ ...f, montoMensual: parseFloat(e.target.value) || 0 }))}
              onBlur={e => saveField('montoMensual', (form.montoMensual ?? 0).toString())}
              style={inputStyle}
            />
          </label>

          {/* Estado de Pago */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Estado de Pago
            </span>
            <select
              value={form.estadoPago ?? ''}
              onChange={e => {
                const v = e.target.value as EstadoPago
                setForm(f => ({ ...f, estadoPago: v }))
                saveField('estadoPago', v)
              }}
              style={inputStyle}
            >
              <option value="">— Sin definir —</option>
              {ESTADOS_PAGO.map(ep => (
                <option key={ep.value} value={ep.value}>{ep.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Notas */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Notas / Observaciones {saving && <span style={{ color: 'var(--color-accent)' }}>(guardando...)</span>}
          </span>
          <textarea
            value={form.notas ?? ''}
            onChange={e => handleNotasChange(e.target.value)}
            rows={4}
            placeholder="Anotaciones generales del cliente (Shift/Ctrl+Enter para salto de línea)..."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
          />
        </label>
      </section>

      {/* Historial de Pagos y Plan */}
      <section style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Historial de Pagos y Control de Plan
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              Registrá los cobros realizados y consultá la recaudación histórica de este cliente.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: 'var(--color-star)', background: 'rgba(221,232,255,0.06)',
              padding: '4px 10px', borderRadius: 99, border: '1px solid var(--color-border)'
            }}>
              Total cobrado: {formatARS(pagos.filter(p => p.confirmado).reduce((sum, p) => sum + p.monto, 0))}
            </span>
          </div>
        </div>

        {/* Formulario nuevo pago */}
        <form onSubmit={handleAddPago} style={{
          background: 'rgba(221,232,255,0.02)',
          border: '1px dashed var(--color-border)',
          borderRadius: 8,
          padding: 14,
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
          alignItems: 'end'
        }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Fecha *</span>
            <input type="date" required value={pagoForm.fecha} onChange={e => setPagoForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Monto ($) *</span>
            <input type="number" step="any" placeholder="ej: 25000" required value={pagoForm.monto} onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Concepto</span>
            <input placeholder="ej: Cuota Mayo" value={pagoForm.concepto} onChange={e => setPagoForm(f => ({ ...f, concepto: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Medio de pago</span>
            <select value={pagoForm.medioPago} onChange={e => setPagoForm(f => ({ ...f, medioPago: e.target.value }))} style={inputStyle}>
              <option value="Transferencia">Transferencia</option>
              <option value="MercadoPago">MercadoPago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </label>
          <button type="submit" disabled={savingPago} style={{
            background: 'var(--color-accent)', color: 'var(--color-on-accent)',
            border: 'none', borderRadius: 8, padding: '8px 14px',
            fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 600, cursor: savingPago ? 'not-allowed' : 'pointer'
          }}>
            {savingPago ? 'Guardando...' : '+ Registrar pago'}
          </button>
        </form>

        {/* Tabla de historial de pagos */}
        {pagos.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-faint)', margin: 0 }}>
            Sin pagos registrados para este cliente.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Fecha', 'Concepto', 'Medio / Origen', 'Monto', 'Ref / ID', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagos.map(p => {
                  const isWebhook = p.origen === 'WEBHOOK' || p.metodo === 'pasarela'
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-star)' }}>
                        {p.fecha}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-star)' }}>
                        {p.concepto}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.medioPago || 'Transferencia'}</span>
                          {isWebhook && (
                            <span style={{ fontSize: '0.625rem', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', padding: '1px 6px', borderRadius: 99, fontFamily: 'var(--font-mono)' }}>
                              ⚡ Pasarela
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)' }}>
                        {formatARS(p.monto)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                        {p.referencia || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => p.id && handleTogglePago(p.id, p.confirmado)}
                          style={{
                            background: p.confirmado ? 'rgba(74, 222, 128, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: p.confirmado ? '#4ade80' : '#f59e0b',
                            border: `1px solid ${p.confirmado ? '#4ade8040' : '#f59e0b40'}`,
                            borderRadius: 99, padding: '2px 8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
                            cursor: 'pointer'
                          }}
                        >
                          {p.confirmado ? '✓ Confirmado' : '⏳ Pendiente'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => p.id && handleDeletePago(p.id)}
                          title="Eliminar registro"
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Checklist */}
      <section style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Checklist de venta
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
            {completados}/{CHECKLIST_STEPS.length} — {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(221,232,255,0.06)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'var(--color-accent)',
            borderRadius: 99,
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CHECKLIST_STEPS.map(step => {
            const done = !!progreso[step.id]
            return (
              <button
                key={step.id}
                onClick={() => handleChecklistToggle(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 8,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,232,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {/* Checkbox */}
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: done ? 'var(--color-accent-dim)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  fontSize: '0.6875rem',
                  color: 'var(--color-accent)',
                }}>
                  {done && '✓'}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.875rem',
                    color: done ? 'var(--color-faint)' : 'var(--color-star)',
                    textDecoration: done ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {step.texto}
                  </span>
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--color-faint)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {step.etapa}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
