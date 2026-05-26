'use client'

import { useEffect, useState, FormEvent } from 'react'
import Link from 'next/link'
import {
  getClientes, addCliente,
  type Cliente, type EstadoCliente,
} from '@/lib/firestore'

const ESTADOS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ESTADO_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

const ESTADO_COLORS: Record<EstadoCliente, string> = {
  prospecto:   '#94a3b8',
  contactado:  '#60a5fa',
  demo:        '#fbbf24',
  negociacion: '#fb923c',
  cerrado:     '#4ade80',
  entregado:   '#22d3ee',
}

const EMPTY_FORM = {
  nombre: '', rubro: '', contacto: '', telefono: '', instagram: '',
  estado: 'prospecto' as EstadoCliente, notas: '',
}

export default function ClientesPage() {
  const [clientes,  setClientes]  = useState<Cliente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<EstadoCliente | 'todos'>('todos')
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getClientes()
      setClientes(data)
    } catch {
      // keeps existing list on refresh failure
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await addCliente(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch {
      // keep form open on failure
    } finally {
      setSaving(false)
    }
  }

  const visible = filter === 'todos'
    ? clientes
    : clientes.filter(c => c.estado === filter)

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
    <div style={{ maxWidth: 960 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['todos', ...ESTADOS] as const).map(e => (
            <button
              key={e}
              onClick={() => setFilter(e)}
              style={{
                padding: '5px 12px',
                borderRadius: 99,
                border: `1px solid ${filter === e ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: filter === e ? 'var(--color-accent-dim)' : 'transparent',
                color: filter === e ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {e === 'todos' ? 'Todos' : ESTADO_LABELS[e as EstadoCliente]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-on-accent)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
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
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <input placeholder="Nombre *" required value={form.nombre}    onChange={e => setForm(f => ({ ...f, nombre:    e.target.value }))} style={inputStyle} />
          <input placeholder="Rubro"             value={form.rubro}     onChange={e => setForm(f => ({ ...f, rubro:     e.target.value }))} style={inputStyle} />
          <input placeholder="Contacto"          value={form.contacto}  onChange={e => setForm(f => ({ ...f, contacto:  e.target.value }))} style={inputStyle} />
          <input placeholder="Teléfono"          value={form.telefono}  onChange={e => setForm(f => ({ ...f, telefono:  e.target.value }))} style={inputStyle} />
          <input placeholder="Instagram"         value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} style={inputStyle} />
          <select
            value={form.estado}
            onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoCliente }))}
            style={{ ...inputStyle }}
          >
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
          </select>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--color-muted)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-on-accent)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
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
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nombre', 'Rubro', 'Contacto', 'Estado'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
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
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.9375rem',
                        color: 'var(--color-star)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {c.rubro || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {c.contacto || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: ESTADO_COLORS[c.estado],
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {ESTADO_LABELS[c.estado]}
                    </span>
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
