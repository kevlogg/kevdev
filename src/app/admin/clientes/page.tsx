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
                {['Cliente', 'Rubro', 'Demo', 'Fecha demo', 'Situación', 'Plan', 'Fecha inicio', 'WSP', 'URL', 'Observaciones'].map(h => (
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
                  {/* Cliente */}
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/clientes/${id}`} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)', textDecoration: 'none', fontWeight: 500 }}>
                      {c.nombre}
                    </Link>
                  </td>

                  {/* Rubro */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'rubro', c.rubro ?? '')}>
                    {editing?.id === id && editing.field === 'rubro' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'rubro', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'rubro', editVal)}
                        style={cellInputStyle}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', cursor: 'pointer' }}>
                        {c.rubro || '—'}
                      </span>
                    )}
                  </td>

                  {/* Demo */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'demo', c.demo ?? '')}>
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
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: DEMO_COLORS[c.demo], background: `${DEMO_COLORS[c.demo]}18`, border: `1px solid ${DEMO_COLORS[c.demo]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em', cursor: 'pointer' }}>
                        {c.demo}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                    )}
                  </td>

                  {/* Fecha demo */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'fechaPresentacionDemo', c.fechaPresentacionDemo ?? '')}>
                    {editing?.id === id && editing.field === 'fechaPresentacionDemo' ? (
                      <input
                        type="date"
                        autoFocus
                        value={editVal}
                        onChange={e => saveInline(id, 'fechaPresentacionDemo', e.target.value)}
                        onBlur={() => setEditing(null)}
                        style={cellInputStyle}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {formatDate(c.fechaPresentacionDemo) || '—'}
                      </span>
                    )}
                  </td>

                  {/* Situacion */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'situacion', c.situacion ?? '')}>
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
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: SITUACION_COLORS[c.situacion], background: `${SITUACION_COLORS[c.situacion]}18`, border: `1px solid ${SITUACION_COLORS[c.situacion]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        {c.situacion}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', cursor: 'pointer' }}>—</span>
                    )}
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
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', cursor: 'pointer' }}>
                        {c.plan || '—'}
                      </span>
                    )}
                  </td>

                  {/* Fecha inicio */}
                  <td style={{ padding: '8px 16px' }} onClick={() => editing?.id !== id && startEdit(id, 'fechaInicioProyecto', c.fechaInicioProyecto ?? '')}>
                    {editing?.id === id && editing.field === 'fechaInicioProyecto' ? (
                      <input
                        type="date"
                        autoFocus
                        value={editVal}
                        onChange={e => saveInline(id, 'fechaInicioProyecto', e.target.value)}
                        onBlur={() => setEditing(null)}
                        style={cellInputStyle}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {formatDate(c.fechaInicioProyecto) || '—'}
                      </span>
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
                  <td style={{ padding: '8px 16px', maxWidth: 220 }} onClick={() => editing?.id !== id && startEdit(id, 'notas', c.notas ?? '')}>
                    {editing?.id === id && editing.field === 'notas' ? (
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={e => saveInline(id, 'notas', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveInline(id, 'notas', editVal)}
                        style={{ ...cellInputStyle, minWidth: 180 }}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', cursor: 'pointer', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.notas || '—'}
                      </span>
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
