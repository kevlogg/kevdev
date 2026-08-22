'use client'

import { useEffect, useState } from 'react'
import { getClientes, getAllHistorialPagos, type Cliente, type HistorialPago } from '@/lib/firestore'
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default function EstadisticasPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(30)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagos, setPagos] = useState<HistorialPago[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [clis, pgs, stats] = await Promise.all([
          getClientes(),
          getAllHistorialPagos(),
          getAnalyticsSummary(period),
        ])
        setClientes(clis)
        setPagos(pgs)
        setAnalytics(stats)
      } catch (err) {
        console.error('Error cargando estadísticas:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  if (loading || !analytics) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>
          Cargando analítica y métricas...
        </p>
      </div>
    )
  }

  // Cálculos Financieros
  const enProduccion = clientes.filter(c => c.situacion === 'EN PRODUCCION')
  const mrrCalculado = enProduccion.reduce((acc, c) => acc + (c.montoMensual || 25000), 0)
  const cobradoHistorico = pagos.filter(p => p.confirmado).reduce((acc, p) => acc + p.monto, 0)
  const clientesAlDia = clientes.filter(c => c.estadoPago === 'AL_DIA').length
  const clientesPendientes = clientes.filter(c => c.estadoPago === 'PENDIENTE' || c.estadoPago === 'VENCIDO').length

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-depth)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
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
      {/* Header & Filtro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
            Estadísticas y Análisis de Negocio
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Métricas clave de rendimiento web, interacción de clientes y salud financiera.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: `1px solid ${period === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: period === p ? 'var(--color-accent-dim)' : 'transparent',
                color: period === p ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Últimos {p} días
            </button>
          ))}
        </div>
      </div>

      {/* Grid 1: KPIs Financieros */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={cardStyle}>
          <span style={kpiLabelStyle}>MRR (Ingreso Mensual Recurrente)</span>
          <p style={{ ...kpiValueStyle, color: 'var(--color-accent)' }}>{formatARS(mrrCalculado)}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
            Basado en {enProduccion.length} clientes en producción
          </span>
        </div>

        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Recaudación Histórica</span>
          <p style={kpiValueStyle}>{formatARS(cobradoHistorico)}</p>
          <span style={{ fontSize: '0.75rem', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
            {pagos.filter(p => p.confirmado).length} pagos confirmados
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
            Total clientes registrados: {clientes.length}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={kpiLabelStyle}>Tasa de Conversión a Venta</span>
          <p style={{ ...kpiValueStyle, color: '#a78bfa' }}>
            {clientes.length > 0 ? Math.round((enProduccion.length / clientes.length) * 100) : 0}%
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
            {enProduccion.length} de {clientes.length} prospectos cerrados
          </span>
        </div>
      </section>

      {/* Grid 2: Tráfico Web y Canales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Métricas de Tráfico */}
        <section style={{ ...cardStyle, gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
              🌐 Tráfico y Visitas Web
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
              {analytics.totalPageviews.toLocaleString()} impresiones
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(221,232,255,0.03)', padding: 12, borderRadius: 8 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Visitantes Únicos</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-star)', margin: '4px 0 0' }}>
                {analytics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(221,232,255,0.03)', padding: 12, borderRadius: 8 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase' }}>Dispositivo Principal</span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-star)', margin: '4px 0 0' }}>
                Mobile ({analytics.mobilePct}%)
              </p>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Fuentes de Tráfico Principales
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analytics.trafficSources.map(src => (
                <div key={src.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                    <span style={{ color: 'var(--color-star)' }}>{src.name}</span>
                    <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{src.percentage}% ({src.count})</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(221,232,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${src.percentage}%`, background: 'var(--color-accent)', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Botones y Clics más Accionados */}
        <section style={{ ...cardStyle, gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
              ⚡ Clics e Interacciones en Botones
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              Top CTAs
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analytics.topButtons.map(btn => (
              <div key={btn.buttonId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(221,232,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-star)', margin: 0 }}>
                    {btn.label}
                  </p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                    ID: {btn.buttonId}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-accent-dim)', padding: '2px 10px', borderRadius: 99 }}>
                  {btn.clicks} clics
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Grid 3: Funnel de Conversión y Recomendaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Embudo de Conversión */}
        <section style={{ ...cardStyle, gap: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
            📈 Embudo de Conversión Comercial
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analytics.conversionFunnel.map((item, idx) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', width: 24 }}>
                  0{idx + 1}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--color-star)' }}>{item.step}</span>
                    <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(221,232,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(item.pct, 100)}%`, background: idx === 4 ? '#4ade80' : 'var(--color-accent)', borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusiones de Análisis Profesional */}
        <section style={{ ...cardStyle, gap: 14, background: 'rgba(221,232,255,0.02)', borderColor: 'rgba(221,232,255,0.15)' }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', margin: 0 }}>
            💡 Conclusiones del Análisis
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem', fontFamily: 'var(--font-ui)', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--color-star)' }}>1. Fuente de tráfico estrella:</strong> Instagram representa el 45% de tus visitantes. Mantener CTAs claros al chat de WhatsApp desde historias potencia el volumen de prospección.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--color-star)' }}>2. Alta intención en Presupuesto:</strong> El calculador interactivo es el segundo elemento con mayor interacción ({analytics.topButtons.find(b => b.buttonId === 'quote_calc')?.clicks} clics). Los clientes valoran la transparencia de costos antes de contactar.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--color-star)' }}>3. Retención y Cobranzas:</strong> Con un MRR actual de <strong style={{ color: '#4ade80' }}>{formatARS(mrrCalculado)}</strong>, la mayor palanca de crecimiento está en acelerar la entrega de demos pendientes ({clientes.filter(c => c.demo === 'PRESENTADA').length} presentadas) para pasarlas a producción.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
