'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics'

export default function EstadisticasWebPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(30)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      const res = await fetch(`/api/analytics/summary?period=${period}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Error cargando analítica web:', err)
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => loadData(false), 8000)
    return () => clearInterval(interval)
  }, [period])

  const gscConfigured = true // Tag ready in metadata
  const gscVerificationKey = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
          🌐 Estadísticas de la Página Web & SEO
        </Link>
        <Link
          href="/admin/estadisticas/clientes"
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
          💼 Métricas y Salud Financiera de Clientes
        </Link>
      </div>

      {/* Header principal y Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
            Estadísticas Web & Google Search Console
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Telemetría de rendimiento web, posicionamiento orgánico en Google y conversión de la página.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => loadData(true)}
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
              marginRight: 6,
            }}
          >
            🔄 Actualizar
          </button>
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

      {/* Diagnóstico de Google Search Console & Motores de Búsqueda */}
      <section style={{ ...cardStyle, background: 'rgba(0, 229, 255, 0.02)', borderColor: 'rgba(0, 229, 255, 0.2)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>🔎</span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                Integración de Google Search Console & SEO Health
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
                Verificación de propiedad del dominio <strong style={{ color: 'var(--color-star)' }}>kevdev.net.ar</strong> y etiquetas estructuradas.
              </p>
            </div>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Abrir Console Oficial ↗
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 8 }}>
          {/* Item 1: Meta Tag Google Search Console */}
          <div style={{ padding: 12, background: 'rgba(221,232,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Etiqueta Meta GSC
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: '#4ade80', fontSize: '1rem' }}>●</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-star)', fontWeight: 600 }}>
                Soporte en HEAD Habilitado
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              {gscVerificationKey ? `Clave: ${gscVerificationKey.slice(0, 12)}...` : 'Listo para colocar tu código de GSC'}
            </p>
          </div>

          {/* Item 2: URL Canónica Base */}
          <div style={{ padding: 12, background: 'rgba(221,232,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Dominio Canónico
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: '#38bdf8', fontSize: '1rem' }}>●</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-star)', fontWeight: 600 }}>
                https://kevdev.net.ar
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              Optimizado para la indexación de Google
            </p>
          </div>

          {/* Item 3: Sitemap XML */}
          <div style={{ padding: 12, background: 'rgba(221,232,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Rastreo de Sitemap
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: '#4ade80', fontSize: '1rem' }}>●</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-star)', fontWeight: 600 }}>
                Sitemap Activo
              </span>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-block', marginTop: 4 }}
            >
              Ver /sitemap.xml ↗
            </a>
          </div>

          {/* Item 4: Google Analytics 4 */}
          <div style={{ padding: 12, background: 'rgba(221,232,255,0.02)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Google Analytics 4
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: gaId ? '#4ade80' : '#f59e0b', fontSize: '1rem' }}>●</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-star)', fontWeight: 600 }}>
                {gaId ? 'GA4 Conectado' : 'GA4 Script Listo'}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              {gaId ? `ID: ${gaId}` : 'Configura NEXT_PUBLIC_GA_MEASUREMENT_ID en .env'}
            </p>
          </div>
        </div>
      </section>

      {loading || !analytics ? (
        <div style={cardStyle}>
          <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem', margin: 0 }}>
            Cargando estadísticas web...
          </p>
        </div>
      ) : (
        <>
          {/* Grid KPIs de Tráfico */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Visitas Totales (Pageviews)</span>
              <p style={{ ...kpiValueStyle, color: '#38bdf8' }}>{analytics.totalPageviews.toLocaleString()}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Impresiones de páginas cargadas
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Visitantes Únicos</span>
              <p style={{ ...kpiValueStyle, color: '#4ade80' }}>{analytics.uniqueVisitors.toLocaleString()}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Dispositivos / Usuarios individuales
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Tráfico Móvil</span>
              <p style={{ ...kpiValueStyle, color: 'var(--color-accent)' }}>{analytics.mobilePct}%</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Navegación desde Smartphones
              </span>
            </div>

            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Tráfico Desktop</span>
              <p style={kpiValueStyle}>{analytics.desktopPct}%</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                Navegación desde Computadoras
              </span>
            </div>
          </section>

          {/* Grid 2: Fuentes de Tráfico y Páginas Más Vistas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Fuentes de Tráfico */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                  🚀 Fuentes de Tráfico (Google, Instagram, Directo, etc.)
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analytics.trafficSources.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-faint)' }}>
                    Sin datos de origen en este período.
                  </p>
                ) : (
                  analytics.trafficSources.map(src => (
                    <div key={src.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                        <span style={{ color: 'var(--color-star)', fontWeight: 500 }}>{src.name}</span>
                        <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{src.percentage}% ({src.count})</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(221,232,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${src.percentage}%`, background: src.name.includes('Google') ? '#38bdf8' : 'var(--color-accent)', borderRadius: 99 }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Páginas Más Vistas */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                  📄 Páginas Más Vistas (URLs)
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.topPages.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-faint)' }}>
                    Sin páginas registradas.
                  </p>
                ) : (
                  analytics.topPages.slice(0, 5).map(pg => (
                    <div key={pg.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(221,232,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-star)' }}>
                        {pg.path}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                        {pg.views} vistas
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Grid 3: Clics en CTAs y Embudo de Conversión Web */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Clics en Botones */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                  ⚡ Clics en Botones & CTAs
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.topButtons.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-faint)', margin: 0 }}>
                    Sin interacciones en botones registradas aún.
                  </p>
                ) : (
                  analytics.topButtons.map(btn => (
                    <div key={btn.buttonId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(221,232,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-star)', margin: 0 }}>
                          {btn.label}
                        </p>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                          ID: {btn.buttonId}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-accent-dim)', padding: '2px 10px', borderRadius: 99 }}>
                        {btn.clicks} clics
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Embudo Web */}
            <section style={{ ...cardStyle, gap: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-star)', margin: 0 }}>
                📈 Embudo de Conversión Web
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                        <div style={{ height: '100%', width: `${Math.min(item.pct, 100)}%`, background: idx === 2 ? '#4ade80' : 'var(--color-accent)', borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
