'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import {
  getClientes, addCliente,
  type Cliente, type DemoEstado, type Situacion,
} from '@/lib/firestore'

const DEMO_COLORS: Record<DemoEstado, string> = {
  PRESENTADA: '#4ade80',
  HECHA:      '#fbbf24',
  '':         'var(--color-faint)',
}

const SITUACION_COLORS: Record<Situacion, string> = {
  'NO RESPONDIO':  '#a78bfa',
  'EN ESPERA':     '#fbbf24',
  'EN PRODUCCION': '#22d3ee',
  'RECHAZADA':     '#f87171',
  '':              'var(--color-faint)',
}

const SITUACIONES: Situacion[] = ['', 'NO RESPONDIO', 'EN ESPERA', 'EN PRODUCCION', 'RECHAZADA']

const EMPTY_FORM = {
  nombre: '', rubro: '', contacto: '', telefono: '', instagram: '',
  estado: 'prospecto' as const,
  demo: '' as DemoEstado,
  situacion: '' as Situacion,
  plan: '', url: '', notas: '',
}

export default function ClientesPage() {
  const [clientes,  setClientes]  = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<Situacion | 'todos'>('todos')
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)

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

  const visible = filter === 'todos'
    ? clientes
    : clientes.filter(c => c.situacion === filter)

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
          <input placeholder="Rubro"      value={form.rubro}     onChange={e => setForm(f => ({ ...f, rubro:     e.target.value }))} style={inputStyle} />
          <input placeholder="Contacto"   value={form.contacto}  onChange={e => setForm(f => ({ ...f, contacto:  e.target.value }))} style={inputStyle} />
          <input placeholder="Instagram"  value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} style={inputStyle} />
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
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Cliente', 'Demo', 'Situación', 'Plan', 'WSP', 'URL'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,232,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/clientes/${c.id}`} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)', textDecoration: 'none', fontWeight: 500 }}>
                      {c.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.demo ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: DEMO_COLORS[c.demo], background: `${DEMO_COLORS[c.demo]}18`, border: `1px solid ${DEMO_COLORS[c.demo]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em' }}>
                        {c.demo}
                      </span>
                    ) : <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.situacion ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: SITUACION_COLORS[c.situacion], background: `${SITUACION_COLORS[c.situacion]}18`, border: `1px solid ${SITUACION_COLORS[c.situacion]}40`, borderRadius: 99, padding: '2px 10px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {c.situacion}
                      </span>
                    ) : <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {c.plan || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                    {c.telefono ? (
                      <a href={`https://wa.me/54${c.telefono}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                        {c.telefono}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.8125rem' }}>
                    {c.url ? (
                      <a href={c.url.startsWith('http') ? c.url : `https://${c.url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                        {c.url.replace(/^https?:\/\//, '')}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
