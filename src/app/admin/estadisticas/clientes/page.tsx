'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getClientes, getAllHistorialPagos, getPagosMesActual, getPagosAcumuladosGlobal, type Cliente, type HistorialPago, type Situacion } from '@/lib/firestore'
import { SITUACION_LABELS, SITUACION_COLORS, DEMO_LABELS, DEMO_COLORS } from '@/lib/cliente-ui'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default function EstadisticasClientesPage() {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagos, setPagos] = useState<HistorialPago[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [clis, pgs] = await Promise.all([getClientes(), getAllHistorialPagos()])
      setClientes(clis)
      setPagos(pgs)
    } catch (err) {
      console.error('Error cargando métricas de clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Cálculos Financieros y de Clientes
  const enProduccion = clientes.filter(c => c.situacion === 'EN PRODUCCION')
  const mrrCalculado = enProduccion.reduce((acc, c) => acc + (c.montoMensual || 0), 0)
  const cobradoMesActual = getPagosMesActual(pagos)
  const cobradoHistoricoGlobal = getPagosAcumuladosGlobal(pagos)
  const clientesAlDia = clientes.filter(c => c.estadoPago === 'AL_DIA').length
  const clientesPendientes = clientes.filter(c => c.estadoPago === 'PENDIENTE' || c.estadoPago === 'VENCIDO').length

  const pagosConfirmados = pagos.filter(p => p.confirmado)
  const pagosWebhookCount = pagosConfirmados.filter(p => p.origen === 'WEBHOOK' || p.metodo === 'pasarela').length
  const pagosManualesCount = pagosConfirmados.length - pagosWebhookCount

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-depth)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
  }

  const kpiLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }

  const kpiValueStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-star)',
    margin: 0,
  }

  return (
    <div style={{ maxWidth: 1080, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Selector de Paneles Superior (Tab Header) */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
        <Link
          href="/admin/estadisticas/web"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          🌐 Estadísticas de la Página Web & SEO
        </Link>
        <Link
          href="/admin/estadisticas/clientes"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--color-accent-dim)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          💼 Métricas y Salud Financiera de Clientes
        </Link>
      </div>

      {/* Header y Acción */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
            Métricas de Clientes & Salud Financiera
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Indicadores de ingreso recurrente (MRR), cobranzas, flujo de pagos y conversión de clientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={loadData}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-accent)',
              background: 'var(--color-accent-dim)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 Actualizar Métricas
          </button>
          <Link
            href="/admin/clientes"
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'rgba(221,232,255,0.03)',
              color: 'var(--color-star)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ir a Lista de Clientes ↗
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', margin: 0 }}>
            Cargando finanzas y métricas de clientes...
          </p>
        </div>
      ) : (
        <>
          {/* Grid 1: KPIs Financieros Clave */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={cardStyle}>
              <span style={kpiLabelStyle}>MRR (Ingreso Recurrente Mensual)</span>
              <p style={{ ...kpiValueStyle, color: 'var(--color-accent)' }}>{formatARS(mrrCalculado)}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Basado en {enProduccion.length} clientes activos en producción
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Cobrado Mes Actual</span>
              <p style={{ ...kpiValueStyle, color: '#4ade80' }}>{formatARS(cobradoMesActual)}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Ingresos abonados este mes
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Historial Acumulado Global</span>
              <p style={kpiValueStyle}>{formatARS(cobradoHistoricoGlobal)}</p>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {pagosConfirmados.length} cobros auditados
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Salud de Cobranzas</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <p style={{ ...kpiValueStyle, color: '#4ade80' }}>{clientesAlDia}</p>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>al día</span>
                {clientesPendientes > 0 && (
                  <span style={{ color: '#f59e0b', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    {clientesPendientes} pendientes
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Total de clientes en sistema: {clientes.length}
              </span>
            </div>
          </section>

          {/* Grid 2: Canales de Cobro & Estado de Clientes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Desglose de Métodos de Pago */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                  💳 Métodos y Origen de Cobros
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: 14, borderRadius: 8 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#38bdf8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Pasarela MercadoPago (Webhooks)
                  </span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: '4px 0 0' }}>
                    {pagosWebhookCount} cobros
                  </p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                    Acreditación automática
                  </span>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 14, borderRadius: 8 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#f59e0b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    Cobros Manuales / Efct / Transf
                  </span>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: '4px 0 0' }}>
                    {pagosManualesCount} cobros
                  </p>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                    Registrados en panel
                  </span>
                </div>
              </div>
            </section>

            {/* Embudo Comercial de Clientes */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                  📊 Embudo y Estado de Demos
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['EN PRODUCCION', 'DEMO PRESENTADA', 'NO RESPONDIO'].map(sit => {
                  const count = clientes.filter(c => c.situacion === sit).length
                  const pct = clientes.length > 0 ? Math.round((count / clientes.length) * 100) : 0
                  return (
                    <div key={sit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                        <span style={{ color: (SITUACION_COLORS as any)[sit] || 'var(--color-star)', fontWeight: 600 }}>
                          {(SITUACION_LABELS as any)[sit] || sit}
                        </span>
                        <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                          {count} clientes ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(221,232,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: (SITUACION_COLORS as any)[sit] || 'var(--color-accent)', borderRadius: 99 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
