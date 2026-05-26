'use client'

import { useEffect, useState, FormEvent } from 'react'
import {
  getPresupuestoItems, addPresupuestoItem,
  updatePresupuestoItem, deletePresupuestoItem,
  type PresupuestoItem,
} from '@/lib/firestore'

type Modalidad = 'unico' | 'mensual'

const EMPTY_ITEM: Omit<PresupuestoItem, 'id'> = { nombre: '', precio: 0, esDefault: false }

function formatPrecio(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function PresupuestoPage() {
  const [items,     setItems]     = useState<PresupuestoItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_ITEM)
  const [saving,    setSaving]    = useState(false)
  const [modalidad, setModalidad] = useState<Modalidad>('unico')
  const [copied,    setCopied]    = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getPresupuestoItems()
    setItems(data)
    setLoading(false)
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await addPresupuestoItem(form)
    setForm(EMPTY_ITEM)
    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deletePresupuestoItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.precio, 0)

  function buildTexto() {
    const lines = items.map(i =>
      `• ${i.nombre}: ${formatPrecio(i.precio)}`
    )
    const label = modalidad === 'mensual' ? 'Mensual' : 'Pago único'
    return [
      `Presupuesto kevdev — ${label}`,
      '',
      ...lines,
      '',
      `TOTAL: ${formatPrecio(total)}`,
    ].join('\n')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildTexto())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Modalidad toggle */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['unico', 'mensual'] as Modalidad[]).map(m => (
            <button
              key={m}
              onClick={() => setModalidad(m)}
              style={{
                padding: '6px 16px',
                background: modalidad === m ? 'var(--color-accent-dim)' : 'transparent',
                border: 'none',
                color: modalidad === m ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'unico' ? 'Pago único' : 'Mensual'}
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
          + Agregar ítem
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
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <label style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre *</span>
            <input placeholder="Ej: Landing page" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} />
          </label>
          <label style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Precio (ARS) *</span>
            <input type="number" min={0} required value={form.precio || ''} onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} style={inputStyle} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer', color: 'var(--color-muted)' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)', border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      {loading ? (
        <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Cargando...</p>
      ) : (
        <div style={{ background: 'var(--color-depth)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <p style={{ padding: 20, fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>Sin ítems.</p>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ flex: 1, fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)' }}>
                    {item.nombre}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-accent)' }}>
                    {formatPrecio(item.precio)}
                  </span>
                  <button
                    onClick={() => item.id && handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-faint)', fontSize: '0.875rem', padding: '2px 6px', borderRadius: 4, transition: 'color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-faint)' }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                  Total {modalidad === 'mensual' ? 'mensual' : 'único'}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {formatPrecio(total)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Copy button */}
      {items.length > 0 && (
        <button
          onClick={handleCopy}
          style={{
            alignSelf: 'flex-start',
            background: copied ? '#4ade8020' : 'transparent',
            border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
            color: copied ? '#4ade80' : 'var(--color-muted)',
            borderRadius: 8,
            padding: '10px 20px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '¡Copiado!' : 'Copiar presupuesto'}
        </button>
      )}
    </div>
  )
}
