'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import {
  getClientes, addCliente, updateCliente,
  type Cliente, type DemoEstado, type Situacion,
} from '@/lib/firestore'
import { SITUACIONES, SITUACION_COLORS, DEMO_COLORS } from '@/lib/cliente-ui'

/* Normaliza la url guardada y arma el link al panel de plan del sitio del cliente */
function siteBase(url: string) {
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`
}
function planUrl(url: string) {
  return `${siteBase(url)}/admin/plan`
}

/* yyyy-mm-dd -> dd/mm/aa */
function formatDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

/* Orden por defecto de la tabla: "En producción" primero */
const SITUACION_ORDER: Record<Situacion, number> = {
  'EN PRODUCCION': 0,
  'EN ESPERA':     1,
  'NO RESPONDIO':  2,
  'RECHAZADA':     3,
  '':              4,
}

const EMPTY_FORM = {
  nombre: '', rubro: '', contacto: '', telefono: '', instagram: '',
  estado: 'prospecto' as const,
  demo: '' as DemoEstado,
  situacion: '' as Situacion,
  plan: '', url: '', notas: '',
  fechaPresentacionDemo: '', fechaInicioProyecto: '',
  passwordAdmin: '',
}

export default function ClientesPage() {
  const [clientes,  setClientes]  = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<Situacion | 'todos'>('todos')
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [editing,   setEditing]   = useState<{ id: string; field: string } | null>(null)
  const [editVal,   setEditVal]   = useState('')
  const [showPass,  setShowPass]  = useState<Record<string, boolean>>({})

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setClientes(await getClientes()) }
    catch { /* keep existing */ }
    finally { setLoading(false) }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await addCliente(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch { /* keep form open */ }
    finally { setSaving(false) }
  }

  async function saveInline(id: string, field: string, value: string) {
    setEditing(null)
    try {
      await updateCliente(id, { [field]: value })
      setClientes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    } catch { /* silent */ }
  }

  function startEdit(id: string, field: string, current: string) {
    setEditing({ id, field })
    setEditVal(current)
  }

  const visible = (filter === 'todos' ? clientes : clientes.filter(c => c.situacion === filter))
    .slice()
    .sort((a, b) => SITUACION_ORDER[a.situacion] - SITUACION_ORDER[b.situacion])

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

  const cellInputStyle = {
    background: 'rgba(221,232,255,0.08)',
    border: '1px solid var(--color-accent)',
    borderRadius: 6,
    padding: '4px 8px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
    minWidth: 110,
  }

  const FILTER_LABELS: Record<Situacion | 'todos', string> = {
    todos: 'Todos',
    '': 'Sin estado',
    'NO RESPONDIO': 'No respondió',
    'EN ESPERA': 'En espera',
    'EN PRODUCCION': 'En producción',
    'RECHAZADA': 'Rechazada',
  }

  const [syncingAll, setSyncingAll] = useState(false)
  const [syncAllMsg, setSyncAllMsg] = useState('')

  async function handleSyncAllClients() {
    setSyncingAll(true)
    setSyncAllMsg('Sincronizando...')
    try {
      const activeClients = clientes.filter(c => c.url && c.id)
      let count = 0
      for (const c of activeClients) {
        if (!c.id) continue
        await fetch('/api/admin/sync-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clienteId: c.id }),
        })
        count++
      }
      setSyncAllMsg(`Sincronizadas ${count} webs.`)
      await load()
    } catch {
      setSyncAllMsg('Error durante sincronización.')
    } finally {
      setSyncingAll(false)
      setTimeout(() => setSyncAllMsg(''), 4000)
    }
  }

  return (
    <div style={{ maxWidth: 1080 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['todos', ...SITUACIONES] as const).filter(s => s !== '').map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '5px 12px',
                borderRadius: 99,
                border: `1px solid ${filter === s ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: filter === s ? 'var(--color-accent-dim)' : 'transparent',
                color: filter === s ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {syncAllMsg && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#4ade80' }}>
              {syncAllMsg}
            </span>
          )}
          <button
            onClick={handleSyncAllClients}
            disabled={syncingAll}
            title="Sincronizar planes y pagos automáticamente desde las webs de los clientes"
            style={{
              background: 'var(--color-accent-dim)', color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)', borderRadius: 8, padding: '8px 14px',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, cursor: syncingAll ? 'wait' : 'pointer',
            }}
          >
            {syncingAll ? '⌛ Sincronizando...' : '⚡ Sincronizar Webs'}
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              background: 'var(--color-accent)', color: 'var(--color-on-accent)',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Nuevo cliente
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          style={{
            background: 'var(--color-depth)', border: '1px solid var(--color-border)',
            borderRadius: 12, padding: 20, marginBottom: 20,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
          }}
        >
          <input placeholder="Nombre *" required value={form.nombre}   onChange={e => setForm(f => ({ ...f, nombre:   e.target.value }))} style={inputStyle} />
          <input placeholder="Rubro"              value={form.rubro}    onChange={e => setForm(f => ({ ...f, rubro:    e.target.value }))} style={inputStyle} />
          <input placeholder="Teléfono (WSP)"    value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={inputStyle} />
          <input placeholder="URL del sitio"     value={form.url}      onChange={e => setForm(f => ({ ...f, url:      e.target.value }))} style={inputStyle} />
          <input placeholder="Plan (Mensual / Único)" value={form.plan} onChange={e => setForm(f => ({ ...f, plan:    e.target.value }))} style={inputStyle} />
          <input placeholder="Contraseña Admin" type="password" value={form.passwordAdmin} onChange={e => setForm(f => ({ ...f, passwordAdmin: e.target.value }))} style={inputStyle} />
          <select value={form.demo} onChange={e => setForm(f => ({ ...f, demo: e.target.value as DemoEstado }))} style={{ ...inputStyle }}>
            <option value="">Demo: —</option>
            <option value="PRESENTADA">PRESENTADA</option>
            <option value="HECHA">HECHA</option>
          </select>
          <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value as Situacion }))} style={{ ...inputStyle }}>
            <option value="">Situación: —</option>
            {SITUACIONES.filter(s => s !== '').map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Fecha presentación demo
            </span>
            <input type="date" value={form.fechaPresentacionDemo} onChange={e => setForm(f => ({ ...f, fechaPresentacionDemo: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Fecha inicio proyecto
            </span>
            <input type="date" value={form.fechaInicioProyecto} onChange={e => setForm(f => ({ ...f, fechaInicioProyecto: e.target.value }))} style={inputStyle} />
          </label>
          <textarea
            placeholder="Observaciones (Ctrl+Enter para salto de línea)"
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical', lineHeight: 1.4 }}
          />
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--color-muted)' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Sin clientes.</p>
      ) : (
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Cliente', 'Demo', 'Situación', 'Plan', 'Pass Admin', 'WSP', 'URL', 'Observaciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(c => {
                const id = c.id
                if (!id) return null
                return (
                <tr
                  key={id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,232,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Cliente (+ rubro) */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Link href={`/admin/clientes/${id}`} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)', textDecoration: 'none', fontWeight: 500 }}>
                        {c.nombre}
                      </Link>
                      {editing?.id === id && editing.field === 'rubro' ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={e => saveInline(id, 'rubro', e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveInline(id, 'rubro', editVal)}
                          style={{ ...cellInputStyle, fontSize: '0.75rem', padding: '2px 6px', minWidth: 0 }}
                        />
                      ) : (
                        <span onClick={() => startEdit(id, 'rubro', c.rubro ?? '')} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)', cursor: 'pointer' }}>
                          {c.rubro || '—'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Demo (+ fecha presentación) */}
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                      {editing?.id === id && editing.field === 'demo' ? (
                        <select
                          autoFocus
                          value={editVal}
                          onChange={e => saveInline(id, 'demo', e.target.value)}
                          onBlur={() => setEditing(null)}
                          style={cellInputStyle}
                        >
                          <option value="">—</option>
                          <option value="PRESENTADA">PRESENTADA</option>
                          <option value="HECHA">HECHA</option>
                        </select>
                      ) : c.demo ? (
                        <span onClick={() => startEdit(id, 'demo', c.demo ?? '')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: DEMO_COLORS[c.demo], background: `${DEMO_COLORS[c.demo]}18`, border: `1px solid ${DEMO_COLORS[c.demo]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em', cursor: 'pointer' }}>
                          {c.demo}
                        </span>
                      ) : (
                        <span onClick={() => startEdit(id, 'demo', '')} style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                      )}
                      {editing?.id === id && editing.field === 'fechaPresentacionDemo' ? (
                        <input
                          type="date"
                          autoFocus
                          value={editVal}
                          onChange={e => saveInline(id, 'fechaPresentacionDemo', e.target.value)}
                          onBlur={() => setEditing(null)}
                          style={{ ...cellInputStyle, fontSize: '0.75rem', padding: '2px 6px' }}
                        />
                      ) : (
                        <span onClick={() => startEdit(id, 'fechaPresentacionDemo', c.fechaPresentacionDemo ?? '')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {formatDate(c.fechaPresentacionDemo) || '—'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Situacion (+ fecha inicio proyecto) */}
                  <td style={{ padding: '8px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                      {editing?.id === id && editing.field === 'situacion' ? (
                        <select
                          autoFocus
                          value={editVal}
                          onChange={e => saveInline(id, 'situacion', e.target.value)}
                          onBlur={() => setEditing(null)}
                          style={cellInputStyle}
                        >
                          {SITUACIONES.map(s => <option key={s} value={s}>{s || '—'}</option>)}
                        </select>
                      ) : c.situacion ? (
                        <span onClick={() => startEdit(id, 'situacion', c.situacion ?? '')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: SITUACION_COLORS[c.situacion], background: `${SITUACION_COLORS[c.situacion]}18`, border: `1px solid ${SITUACION_COLORS[c.situacion]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                          {c.situacion}
                        </span>
                      ) : (
                        <span onClick={() => startEdit(id, 'situacion', '')} style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                      )}
                      {editing?.id === id && editing.field === 'fechaInicioProyecto' ? (
                        <input
                          type="date"
                          autoFocus
                          value={editVal}
                          onChange={e => saveInline(id, 'fechaInicioProyecto', e.target.value)}
                          onBlur={() => setEditing(null)}
                          style={{ ...cellInputStyle, fontSize: '0.75rem', padding: '2px 6px' }}
                        />
                      ) : (
                        <span onClick={() => startEdit(id, 'fechaInicioProyecto', c.fechaInicioProyecto ?? '')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {formatDate(c.fechaInicioProyecto) || '—'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'plan', c.plan ?? '')}>
                    {editing?.id === id && editing.field === 'plan' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'plan', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'plan', editVal)}
                        style={cellInputStyle}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', cursor: 'pointer' }}>
                          {c.plan || (c.montoMensual ? `$${c.montoMensual.toLocaleString('es-AR')}/mes` : '—')}
                        </span>
                        {c.estadoPago === 'AL_DIA' && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: 99, padding: '1px 6px' }}>
                            Al día
                          </span>
                        )}
                        {c.estadoPago === 'PENDIENTE' && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 99, padding: '1px 6px' }}>
                            Pendiente
                          </span>
                        )}
                        {c.estadoPago === 'VENCIDO' && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: 99, padding: '1px 6px' }}>
                            Vencido
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Pass Admin */}
                  <td style={{ padding: '8px 16px' }} onClick={e => e.stopPropagation()}>
                    {editing?.id === id && editing.field === 'passwordAdmin' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'passwordAdmin', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'passwordAdmin', editVal)}
                        style={{ ...cellInputStyle, minWidth: 100 }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          onClick={() => startEdit(id, 'passwordAdmin', c.passwordAdmin ?? '')}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            color: c.passwordAdmin ? 'var(--color-star)' : 'var(--color-faint)',
                            cursor: 'pointer',
                            letterSpacing: showPass[id] ? '0.02em' : '0.12em',
                          }}
                        >
                          {c.passwordAdmin ? (showPass[id] ? c.passwordAdmin : '••••••••') : '—'}
                        </span>
                        {c.passwordAdmin && (
                          <button
                            type="button"
                            onClick={() => setShowPass(prev => ({ ...prev, [id]: !prev[id] }))}
                            title={showPass[id] ? 'Ocultar contraseña' : 'Ver contraseña'}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-muted)',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              padding: '2px',
                              lineHeight: 1,
                            }}
                          >
                            {showPass[id] ? '🙈' : '👁️'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* WSP */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'telefono', c.telefono ?? '')}>
                    {editing?.id === id && editing.field === 'telefono' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'telefono', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'telefono', editVal)}
                        style={cellInputStyle}
                      />
                    ) : c.telefono ? (
                      <a
                        href={`https://wa.me/54${c.telefono}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-accent)', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {c.telefono}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                    )}
                  </td>

                  {/* URL */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'url', c.url ?? '')}>
                    {editing?.id === id && editing.field === 'url' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'url', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'url', editVal)}
                        style={cellInputStyle}
                      />
                    ) : c.url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a
                          href={siteBase(c.url)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-accent)', textDecoration: 'none', cursor: 'pointer' }}
                        >
                          {c.url.replace(/^https?:\/\//, '')}
                        </a>
                        {c.situacion === 'EN PRODUCCION' && (
                          <a
                            href={planUrl(c.url)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            title="Ver /admin/plan de este cliente"
                            style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)',
                              textDecoration: 'none', border: '1px solid var(--color-border)', borderRadius: 99,
                              padding: '2px 8px', whiteSpace: 'nowrap',
                            }}
                          >
                            Plan ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                    )}
                  </td>

                  {/* Observaciones */}
                  <td style={{ padding: '8px 16px', minWidth: 220, maxWidth: 300 }} onClick={() => editing?.id !== id && startEdit(id, 'notas', c.notas ?? '')}>
                    {editing?.id === id && editing.field === 'notas' ? (
                      <textarea
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'notas', e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
                            // Salto de linea con Ctrl+Enter o Shift+Enter
                            e.stopPropagation()
                          } else if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                            // Guardar con Enter solo
                            e.preventDefault()
                            saveInline(id, 'notas', editVal)
                          }
                        }}
                        rows={3}
                        style={{
                          ...cellInputStyle,
                          width: '100%',
                          minWidth: 200,
                          resize: 'vertical',
                          lineHeight: 1.4,
                        }}
                      />
                    ) : (
                      <div style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 140,
                        overflowY: 'auto',
                        lineHeight: 1.4,
                      }}>
                        {c.notas || '—'}
                      </div>
                    )}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
