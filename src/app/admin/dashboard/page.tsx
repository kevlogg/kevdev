'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  getClientes,
  getAllHistorialPagos,
  getPagosMesActual,
  getPagosAcumuladosGlobal,
  type Cliente,
  type HistorialPago,
  type DemoEstado,
} from '@/lib/firestore'
import {
  SITUACION_FUNNEL_ORDER,
  SITUACION_LABELS,
  SITUACION_COLORS,
  DEMO_LABELS,
  DEMO_COLORS,
  ESTADO_PAGO_LABELS,
  ESTADO_PAGO_COLORS,
} from '@/lib/cliente-ui'

const DEMOS: DemoEstado[] = ['SIN HACER', 'PRESENTADA', 'HECHA', '']

function creadoMillis(c: Cliente): number {
  const ts = c.creadoEn as unknown as { toMillis?: () => number } | undefined
  return ts?.toMillis?.() ?? 0
}

function formatARS(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}

function getWhatsAppUrl(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (!clean) return ''
  const num = clean.startsWith('54') ? clean : clean.startsWith('9') ? `54${clean}` : `549${clean}`
  return `https://wa.me/${num}`
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const [y, m, d] = dateStr.split('T')[0].split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    return dateStr
  } catch {
    return dateStr
  }
}

export default function DashboardPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagos, setPagos] = useState<HistorialPago[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [clis, pgs] = await Promise.all([
        getClientes().catch(() => []),
        getAllHistorialPagos().catch(() => []),
      ])
      setClientes(clis)
      setPagos(pgs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Mapa para resolver nombres de clientes en los pagos
  const clientMap = useMemo(() => {
    const map = new Map<string, Cliente>()
    clientes.forEach(c => {
      if (c.id) map.set(c.id.toLowerCase().trim(), c)
      if (c.nombre) map.set(c.nombre.toLowerCase().trim(), c)
    })
    return map
  }, [clientes])

  // Métricas Principales
  const total = clientes.length
  const enProduccion = clientes.filter(c => c.situacion === 'EN PRODUCCION')
  const sinRespuesta = clientes.filter(c => c.situacion === 'NO RESPONDIO')
  const conDemo = clientes.filter(c => c.demo !== '').length
  const conversion = conDemo > 0 ? Math.round((enProduccion.length / conDemo) * 100) : 0

  // Métricas Financieras
  const mrrCalculado = enProduccion.reduce((acc, c) => acc + (Number(c.montoMensual) || 0), 0)
  const cobradoMes = getPagosMesActual(pagos)
  const porCobrarMes = Math.max(0, mrrCalculado - cobradoMes)
  const pctRecaudado = mrrCalculado > 0 ? Math.min(100, Math.round((cobradoMes / mrrCalculado) * 100)) : 0
  const cobradoHistorico = getPagosAcumuladosGlobal(pagos)

  // Alertas Prioritarias
  const pagosAlerta = enProduccion.filter(
    c => c.estadoPago === 'VENCIDO' || c.estadoPago === 'PENDIENTE'
  )
  const demosSinHacer = clientes.filter(c => c.demo === 'SIN HACER')
  const totalAlertas = pagosAlerta.length + demosSinHacer.length + sinRespuesta.length

  // Embudo y Demos
  const funnelBuckets = SITUACION_FUNNEL_ORDER
    .map(s => ({ situacion: s, count: clientes.filter(c => c.situacion === s).length }))
    .filter(b => b.situacion !== '' || b.count > 0)
  const funnelMax = Math.max(...funnelBuckets.map(b => b.count), 1)

  const demoBuckets = DEMOS
    .map(d => ({ demo: d, count: clientes.filter(c => c.demo === d).length }))
    .filter(b => b.demo !== '' || b.count > 0)
  const demoMax = Math.max(...demoBuckets.map(b => b.count), 1)

  // Seguimiento pendiente
  const pendientes = clientes
    .filter(c => c.situacion === 'NO RESPONDIO')
    .slice()
    .sort((a, b) => creadoMillis(a) - creadoMillis(b))
    .slice(0, 8)

  // Últimos pagos registrados
  const ultimosPagos = pagos.slice(0, 5)

  // Clientes recientes
  const recientes = clientes.slice(0, 5)

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1200 }}>
        <div style={{
          padding: '40px 24px',
          background: 'var(--color-depth)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          color: 'var(--color-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem'
        }}>
          <div style={{
            width: 18,
            height: 18,
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'admin-spin 0.7s linear infinite',
          }} />
          <span>Cargando centro de mando y métricas...</span>
        </div>
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1240, width: '100%', margin: '0 auto' }}>
      
      {/* ─── Encabezado y Barra de Acciones Rápidas ─────────────────────── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 4,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.625rem',
            fontWeight: 800,
            color: 'var(--color-star)',
            letterSpacing: '-0.02em',
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>📊</span> Dashboard
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            color: 'var(--color-muted)',
            margin: 0,
          }}>
            Centro de control comercial, financiero y operativo de KevDev.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Link
            href="/admin/clientes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-accent)',
              color: 'var(--color-on-accent)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-ui)',
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            <span>👥</span> + Nuevo Cliente
          </Link>
          <Link
            href="/admin/organizador"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-star)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-ui)',
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            <span>📋</span> Organizador
          </Link>
          <Link
            href="/admin/presupuesto"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-star)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-ui)',
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            <span>💰</span> Presupuesto
          </Link>
          <Link
            href="/admin/mensajes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-star)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-ui)',
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            <span>💬</span> Plantillas
          </Link>
          <Link
            href="/admin/qr"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-star)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-ui)',
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            <span>📱</span> QR
          </Link>
        </div>
      </div>

      {/* ─── Grid de KPIs Principales ────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {/* MRR Activo */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(24, 24, 24, 0.8) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-accent)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              MRR Activo
            </span>
            <span style={{ fontSize: '0.9rem' }}>💳</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-star)',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {formatARS(mrrCalculado)}
          </p>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
          }}>
            {enProduccion.length} proyectos en suscripción
          </span>
        </div>

        {/* Cobrado Mes Actual */}
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Cobrado este Mes
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: pctRecaudado >= 80 ? '#4ade80' : pctRecaudado >= 40 ? '#fbbf24' : 'var(--color-accent)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              {pctRecaudado}%
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#4ade80',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {formatARS(cobradoMes)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              flex: 1,
              height: 4,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pctRecaudado}%`,
                background: '#4ade80',
                borderRadius: 99,
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
              Faltan {formatARS(porCobrarMes)}
            </span>
          </div>
        </div>

        {/* Clientes en Producción */}
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              En Producción
            </span>
            <span style={{ fontSize: '0.9rem' }}>🚀</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-star)',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {enProduccion.length}
          </p>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
          }}>
            De un total de {total} registrados
          </span>
        </div>

        {/* Conversión Demo -> Producción */}
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Efectividad Demo→Prod
            </span>
            <span style={{ fontSize: '0.9rem' }}>📈</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-star)',
            margin: 0,
            lineHeight: 1.1,
          }}>
            {conversion}%
          </p>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
          }}>
            {conDemo} clientes con demo construida
          </span>
        </div>
      </div>

      {/* ─── Banner de Alertas Prioritarias ─────────────────────────────── */}
      <div style={{
        background: totalAlertas > 0
          ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, rgba(24, 24, 24, 0.9) 100%)'
          : 'linear-gradient(90deg, rgba(74, 222, 128, 0.08) 0%, rgba(24, 24, 24, 0.9) 100%)',
        border: `1px solid ${totalAlertas > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(74, 222, 128, 0.2)'}`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 10,
            background: totalAlertas > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(74, 222, 128, 0.15)',
          }}>
            {totalAlertas > 0 ? '⚡' : '✨'}
          </span>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              margin: '0 0 2px',
            }}>
              {totalAlertas > 0 ? `Atención requerida (${totalAlertas} pendientes)` : 'Operaciones al día'}
            </h3>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
              margin: 0,
            }}>
              {totalAlertas > 0
                ? 'Tareas prioritarias para mantener el flujo comercial y la recaudación al máximo.'
                : 'No tenés cuotas vencidas ni demos esperando entrega. ¡Todo en orden!'}
            </p>
          </div>
        </div>

        {totalAlertas > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {pagosAlerta.length > 0 && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                padding: '4px 10px',
                borderRadius: 99,
              }}>
                ⚠️ {pagosAlerta.length} cuota{pagosAlerta.length > 1 ? 's' : ''} vencida/pendiente
              </span>
            )}
            {demosSinHacer.length > 0 && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.12)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                padding: '4px 10px',
                borderRadius: 99,
              }}>
                🔨 {demosSinHacer.length} demo{demosSinHacer.length > 1 ? 's' : ''} sin hacer
              </span>
            )}
            {sinRespuesta.length > 0 && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#a78bfa',
                background: 'rgba(167, 139, 250, 0.12)',
                border: '1px solid rgba(167, 139, 250, 0.25)',
                padding: '4px 10px',
                borderRadius: 99,
              }}>
                💬 {sinRespuesta.length} sin respuesta
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Bento Grid Principal (2 Columnas Balanceadas) ───────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>
        
        {/* ════ COLUMNA IZQUIERDA: PIPELINE COMERCIAL & SEGUIMIENTO ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Card: Embudo por Situación */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Embudo por Situación
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Estado de avance de los prospectos
                </span>
              </div>
              <Link
                href="/admin/clientes"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                Ver todos ({total})
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {funnelBuckets.map(({ situacion, count }) => {
                const pct = (count / funnelMax) * 100
                const color = SITUACION_COLORS[situacion]
                return (
                  <div key={situacion || 'sin-estado'} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-muted)',
                      width: 130,
                      flexShrink: 0,
                    }}>
                      {SITUACION_LABELS[situacion]}
                    </span>
                    <div style={{
                      flex: 1,
                      height: 8,
                      background: 'rgba(255,255,255,0.05)',
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
                      fontWeight: 600,
                      color: 'var(--color-star)',
                      width: 28,
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

          {/* Card: Estado de Demos */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Estado de Demos
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Progreso en prototipos y demos activas
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {demoBuckets.map(({ demo, count }) => {
                const pct = (count / demoMax) * 100
                const color = DEMO_COLORS[demo]
                return (
                  <div key={demo || 'sin-demo'} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-muted)',
                      width: 130,
                      flexShrink: 0,
                    }}>
                      {DEMO_LABELS[demo]}
                    </span>
                    <div style={{
                      flex: 1,
                      height: 8,
                      background: 'rgba(255,255,255,0.05)',
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
                      fontWeight: 600,
                      color: 'var(--color-star)',
                      width: 28,
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

          {/* Card: Seguimiento Pendiente con Enlace Directo a WhatsApp */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Seguimiento Pendiente ({sinRespuesta.length})
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Contactos esperando respuesta o seguimiento
                </span>
              </div>
              <Link
                href="/admin/clientes"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                Ver todos
              </Link>
            </div>

            {pendientes.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
                Nadie esperando respuesta. 🎉
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendientes.map(c => {
                  const waUrl = c.telefono ? getWhatsAppUrl(c.telefono) : ''
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        gap: 12,
                      }}
                    >
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          minWidth: 0,
                          textDecoration: 'none',
                          flex: 1,
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--color-star)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {c.nombre}
                        </span>
                        {c.rubro && (
                          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)' }}>
                            {c.rubro}
                          </span>
                        )}
                      </Link>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {c.telefono ? (
                          <>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: 'var(--color-muted)',
                            }}>
                              {c.telefono}
                            </span>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir WhatsApp Web directo"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '5px 10px',
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: 6,
                                color: '#4ade80',
                                fontFamily: 'var(--font-ui)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                              }}
                            >
                              <span>💬</span> WhatsApp
                            </a>
                          </>
                        ) : (
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.6875rem',
                            color: 'var(--color-faint)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '3px 8px',
                            borderRadius: 4,
                          }}>
                            Sin teléfono
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* ════ COLUMNA DERECHA: FINANZAS, PAGOS & OPERACIONES ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Card: Control Financiero y Recaudación del Mes */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Control Financiero del Mes
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Abonos y facturación de clientes activos
                </span>
              </div>
              <Link
                href="/admin/estadisticas/clientes"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                Métricas completas
              </Link>
            </div>

            {/* Recaudación Actual vs Esperada */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    Recaudado este mes
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#4ade80',
                    margin: 0,
                  }}>
                    {formatARS(cobradoMes)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    Esperado (MRR)
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-star)',
                    margin: 0,
                  }}>
                    {formatARS(mrrCalculado)}
                  </p>
                </div>
              </div>

              {/* Barra de progreso de recaudación */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  height: 10,
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pctRecaudado}%`,
                    background: 'linear-gradient(90deg, #00e5ff 0%, #4ade80 100%)',
                    borderRadius: 99,
                    transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-faint)', fontFamily: 'var(--font-mono)' }}>
                  <span>{pctRecaudado}% recaudado</span>
                  <span>Saldo pendiente: {formatARS(porCobrarMes)}</span>
                </div>
              </div>

              {/* Total acumulado histórico */}
              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
              }}>
                <span style={{ color: 'var(--color-muted)' }}>Histórico global registrado:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {formatARS(cobradoHistorico)}
                </span>
              </div>
            </div>
          </section>

          {/* Card: Últimos Pagos Registrados */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Últimos Pagos Registrados
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Transacciones y cobros confirmados
                </span>
              </div>
              <Link
                href="/admin/estadisticas/clientes"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                Historial completo
              </Link>
            </div>

            {ultimosPagos.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
                No hay pagos registrados aún en Firestore.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ultimosPagos.map(p => {
                  const normCid = (p.clienteId || '').toLowerCase().trim()
                  const clientFound = clientMap.get(normCid)
                  const displayName = clientFound?.nombre || p.concepto || 'Pago registrado'
                  const originLabel = p.origen === 'WEBHOOK' || p.metodo === 'pasarela' ? 'Automático' : 'Manual'

                  return (
                    <div
                      key={p.id || `${p.fecha}-${p.monto}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-star)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {displayName}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            color: 'var(--color-muted)',
                            background: 'rgba(255,255,255,0.06)',
                            padding: '1px 5px',
                            borderRadius: 4,
                          }}>
                            {originLabel}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                          {formatDateDisplay(p.fecha)} • {p.medioPago || 'Transferencia'}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: '#4ade80',
                        }}>
                          +{formatARS(p.monto)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Card: Proyectos Activos (En Producción) */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Proyectos Activos ({enProduccion.length})
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Clientes en producción y estado de abono
                </span>
              </div>
            </div>

            {enProduccion.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
                No hay clientes marcados como &quot;En Producción&quot;.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enProduccion.slice(0, 6).map(c => {
                  const estadoPago = c.estadoPago || ''
                  const pagoColor = ESTADO_PAGO_COLORS[estadoPago] || 'var(--color-faint)'
                  const pagoLabel = ESTADO_PAGO_LABELS[estadoPago] || 'Sin estado'
                  const monto = c.montoMensual ? `${formatARS(c.montoMensual)}/mes` : 'Sin cuota fija'

                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--color-star)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {c.nombre}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: pagoColor,
                            border: `1px solid ${pagoColor}40`,
                            background: `${pagoColor}15`,
                            padding: '1px 6px',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                          }}>
                            {pagoLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                            {c.rubro || 'Desarrollo web'}
                          </span>
                          <span style={{ color: 'var(--color-border)' }}>•</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                            {monto}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {c.url && (
                          <a
                            href={c.url.startsWith('http') ? c.url : `https://${c.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir web en vivo"
                            style={{
                              padding: '5px 8px',
                              background: 'rgba(0, 229, 255, 0.08)',
                              border: '1px solid rgba(0, 229, 255, 0.2)',
                              borderRadius: 6,
                              color: 'var(--color-accent)',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            Web ↗
                          </a>
                        )}
                        <Link
                          href={`/admin/clientes/${c.id}`}
                          title="Administrar en KevDev"
                          style={{
                            padding: '5px 8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 6,
                            color: 'var(--color-star)',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                          }}
                        >
                          Ficha
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Card: Clientes Recientes */}
          <section style={{
            background: 'var(--color-depth)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-star)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  margin: '0 0 2px',
                }}>
                  Clientes Recientes
                </h2>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Últimos registros cargados en el CRM
                </span>
              </div>
              <Link
                href="/admin/clientes"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                Ver todos
              </Link>
            </div>

            {recientes.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: 0 }}>
                Sin clientes aún.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recientes.map(c => (
                  <Link
                    key={c.id}
                    href={`/admin/clientes/${c.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.875rem',
                      color: 'var(--color-star)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {c.nombre}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: SITUACION_COLORS[c.situacion],
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}>
                      {SITUACION_LABELS[c.situacion]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

    </div>
  )
}
