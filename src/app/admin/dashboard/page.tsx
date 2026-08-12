'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientes, type Cliente } from '@/lib/firestore'
import {
  SITUACION_FUNNEL_ORDER, SITUACION_LABELS, SITUACION_COLORS,
  DEMO_LABELS, DEMO_COLORS,
} from '@/lib/cliente-ui'
import type { DemoEstado } from '@/lib/firestore'

const DEMOS: DemoEstado[] = ['PRESENTADA', 'HECHA', '']

function creadoMillis(c: Cliente): number {
  const ts = c.creadoEn as unknown as { toMillis?: () => number } | undefined
  return ts?.toMillis?.() ?? 0
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
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
        color: color ?? 'var(--color-star)',
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = (count / max) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.8125rem',
        color: 'var(--color-muted)',
        width: 120,
        flexShrink: 0,
      }}>
        {label}
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
          background: color,
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
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        {children}
      </h2>
      {action}
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

  const total         = clientes.length
  const enProduccion  = clientes.filter(c => c.situacion === 'EN PRODUCCION').length
  const sinRespuesta  = clientes.filter(c => c.situacion === 'NO RESPONDIO').length
  const conDemo       = clientes.filter(c => c.demo !== '').length
  const conversion    = conDemo > 0 ? Math.round((enProduccion / conDemo) * 100) : 0

  const funnelBuckets = SITUACION_FUNNEL_ORDER
    .map(s => ({ situacion: s, count: clientes.filter(c => c.situacion === s).length }))
    .filter(b => b.situacion !== '' || b.count > 0)
  const funnelMax = Math.max(...funnelBuckets.map(b => b.count), 1)

  const demoBuckets = DEMOS
    .map(d => ({ demo: d, count: clientes.filter(c => c.demo === d).length }))
    .filter(b => b.demo !== '' || b.count > 0)
  const demoMax = Math.max(...demoBuckets.map(b => b.count), 1)

  const pendientes = clientes
    .filter(c => c.situacion === 'NO RESPONDIO')
    .slice()
    .sort((a, b) => creadoMillis(a) - creadoMillis(b))
    .slice(0, 8)

  const recientes = clientes.slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
      }}>
        <Stat label="Total clientes"       value={total} />
        <Stat label="En producción"        value={enProduccion} color={SITUACION_COLORS['EN PRODUCCION']} />
        <Stat label="Sin respuesta"        value={sinRespuesta} color={SITUACION_COLORS['NO RESPONDIO']} />
        <Stat label="Conversión demo→prod" value={`${conversion}%`} />
      </div>

      {/* Embudo por situación */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <SectionTitle>Embudo por situación</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {funnelBuckets.map(({ situacion, count }) => (
            <BarRow
              key={situacion || 'sin-estado'}
              label={SITUACION_LABELS[situacion]}
              count={count}
              max={funnelMax}
              color={SITUACION_COLORS[situacion]}
            />
          ))}
        </div>
      </section>

      {/* Estado de demos */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <SectionTitle>Estado de demos</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {demoBuckets.map(({ demo, count }) => (
            <BarRow
              key={demo || 'sin-demo'}
              label={DEMO_LABELS[demo]}
              count={count}
              max={demoMax}
              color={DEMO_COLORS[demo]}
            />
          ))}
        </div>
      </section>

      {/* Seguimiento pendiente */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <SectionTitle
          action={
            <Link href="/admin/clientes" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}>
              Ver todos
            </Link>
          }
        >
          Seguimiento pendiente ({sinRespuesta})
        </SectionTitle>
        {pendientes.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
            Nadie esperando respuesta. 🎉
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pendientes.map(c => (
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
                  gap: 12,
                }}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-star)' }}>
                    {c.nombre}
                  </span>
                  {c.rubro && (
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)' }}>
                      {c.rubro}
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: c.telefono ? 'var(--color-accent)' : 'var(--color-faint)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {c.telefono || 'Sin teléfono'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recientes */}
      <section style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
      }}>
        <SectionTitle
          action={
            <Link href="/admin/clientes" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}>
              Ver todos
            </Link>
          }
        >
          Clientes recientes
        </SectionTitle>
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
                  color: SITUACION_COLORS[c.situacion],
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {SITUACION_LABELS[c.situacion]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
