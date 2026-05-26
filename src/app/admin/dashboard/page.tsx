'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientes, type Cliente, type EstadoCliente } from '@/lib/firestore'

const ETAPAS: EstadoCliente[] = [
  'prospecto', 'contactado', 'demo', 'negociacion', 'cerrado', 'entregado',
]

const ETAPA_LABELS: Record<EstadoCliente, string> = {
  prospecto:   'Prospecto',
  contactado:  'Contactado',
  demo:        'Demo',
  negociacion: 'Negociación',
  cerrado:     'Cerrado',
  entregado:   'Entregado',
}

const ETAPA_COLORS: Record<EstadoCliente, string> = {
  prospecto:   'rgba(148,163,184,0.6)',
  contactado:  'rgba(96,165,250,0.8)',
  demo:        'rgba(251,191,36,0.8)',
  negociacion: 'rgba(251,146,60,0.8)',
  cerrado:     'rgba(74,222,128,0.8)',
  entregado:   'rgba(34,211,238,0.9)',
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        color: 'var(--color-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '0 0 8px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--color-star)',
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getClientes()
      .then(data => setClientes(data))
      .catch(() => {/* silent fail - dashboard degrades gracefully to zeros */})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>
        Cargando...
      </div>
    )
  }

  const total     = clientes.length
  const enProceso = clientes.filter(c => !['cerrado', 'entregado'].includes(c.estado)).length
  const cerrados  = clientes.filter(c => ['cerrado', 'entregado'].includes(c.estado)).length
  const recientes = [...clientes].slice(0, 5)
  const maxPipeline = Math.max(...ETAPAS.map(e => clientes.filter(c => c.estado === e).length), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
      }}>
        <Stat label="Total clientes" value={total} />
        <Stat label="En proceso"     value={enProceso} />
        <Stat label="Cerrados"       value={cerrados} />
      </div>

      {/* Pipeline */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: '0 0 20px',
        }}>
          Pipeline por etapa
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ETAPAS.map(etapa => {
            const count = clientes.filter(c => c.estado === etapa).length
            const pct   = (count / maxPipeline) * 100
            return (
              <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-muted)',
                  width: 100,
                  flexShrink: 0,
                }}>
                  {ETAPA_LABELS[etapa]}
                </span>
                <div style={{
                  flex: 1,
                  height: 6,
                  background: 'rgba(221,232,255,0.06)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: ETAPA_COLORS[etapa],
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-faint)',
                  width: 24,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recientes */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Clientes recientes
          </h2>
          <Link href="/admin/clientes" style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-accent)',
            textDecoration: 'none',
          }}>
            Ver todos
          </Link>
        </div>
        {recientes.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
            Sin clientes aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recientes.map(c => (
              <Link
                key={c.id}
                href={`/admin/clientes/${c.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)' }}>
                  {c.nombre}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: ETAPA_COLORS[c.estado],
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {ETAPA_LABELS[c.estado]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
