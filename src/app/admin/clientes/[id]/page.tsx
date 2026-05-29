'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getCliente, updateCliente, getChecklistProgreso, toggleChecklistStep,
  type Cliente, type EstadoCliente, type DemoEstado, type Situacion,
} from '@/lib/firestore'
import { CHECKLIST_STEPS } from '@/lib/checklist-steps'

const ESTADOS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const SITUACIONES: Situacion[] = ['', 'NO RESPONDIO', 'EN ESPERA', 'EN PRODUCCION', 'RECHAZADA']

const ESTADO_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

type EditableField = 'nombre' | 'rubro' | 'contacto' | 'telefono' | 'instagram' | 'notas' | 'estado' | 'demo' | 'situacion' | 'plan' | 'url'

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente,   setCliente]   = useState<Cliente | null>(null)
  const [progreso,  setProgreso]  = useState<Record<number, boolean>>({})
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [form,      setForm]      = useState<Partial<Cliente>>({})
  const notasTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [c, p] = await Promise.all([
          getCliente(id),
          getChecklistProgreso(id),
        ])
        if (!c) { router.replace('/admin/clientes'); return }
        setCliente(c)
        setForm(c)
        setProgreso(p)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        </div>

        {/* Notas */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Notas {saving && <span style={{ color: 'var(--color-accent)' }}>(guardando...)</span>}
          </span>
          <textarea
            value={form.notas ?? ''}
            onChange={e => handleNotasChange(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
        </label>
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
