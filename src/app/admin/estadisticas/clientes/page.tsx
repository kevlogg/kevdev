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
} from '@/lib/firestore'
import {
  ESTADO_PAGO_LABELS,
  ESTADO_PAGO_COLORS,
} from '@/lib/cliente-ui'
import ClientRevenueChart from '@/components/admin/ClientRevenueChart'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
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

const AUTOMOTOR_IDS = ['sitioautomotor', 'sitio-automotor', 'sitio_automotor', 'j7rqjxzppbba1bgp1pb7']
const CALVOS_IDS = ['calvoscompresores', 'calvos-compresores', 'fx25djbynqynowq361jv', 'o5su65lqkz2k6ujl7o08']
const DULCE_HOGAR_IDS = ['dulcehogar', 'dulce-hogar', 'dulce_hogar', 'gz3g7r0ld4z3g3k5m7n9', 'q6h68vtjro2cd2qwtslj']
const PAJAROS_IDS = ['pajarosenlacabeza', 'pajaros-en-la-cabeza', 'pajaros_en_la_cabeza', 'pajaros', 'pajaro', 'qrkvonucfeuojzw32bee']
const ONMAS_IDS = ['onmas', 'entre-rios-on', 'entre_rios_on', 'entrerios-on', 'entrerioson', 'on_mas', 'on-mas']

export default function EstadisticasClientesPage() {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagos, setPagos] = useState<HistorialPago[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Filtros del explorador de pagos
  const [searchPayment, setSearchPayment] = useState('')
  const [filterMetodo, setFilterMetodo] = useState<'ALL' | 'WEBHOOK' | 'MANUAL'>('ALL')
  const [visiblePaymentsCount, setVisiblePaymentsCount] = useState(15)

  const loadData = async () => {
    setLoading(true)
    try {
      const [clis, pgs] = await Promise.all([getClientes(), getAllHistorialPagos()])
      setClientes(clis)
      setPagos(pgs)
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      console.error('Error cargando métricas de clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Mapa para vincular rápidamente cualquier cliente con sus pagos
  const clientResolver = useMemo(() => {
    const byId = new Map<string, Cliente>()
    const byName = new Map<string, Cliente>()

    clientes.forEach(c => {
      if (c.id) byId.set(c.id.toLowerCase().trim(), c)
      if (c.nombre) byName.set(c.nombre.toLowerCase().trim(), c)
    })

    function resolve(clientRef?: string, concept?: string): Cliente | undefined {
      if (!clientRef && !concept) return undefined
      const ref = (clientRef || '').toLowerCase().trim()
      const conc = (concept || '').toLowerCase().trim()

      if (byId.has(ref)) return byId.get(ref)
      if (byName.has(ref)) return byName.get(ref)

      if (AUTOMOTOR_IDS.includes(ref) || ref.includes('automotor') || conc.includes('automotor')) {
        return clientes.find(c => c.nombre.toLowerCase().includes('automotor') || (c.url && c.url.includes('automotor')))
      }
      if (CALVOS_IDS.includes(ref) || ref.includes('calvo') || conc.includes('calvo')) {
        return clientes.find(c => c.nombre.toLowerCase().includes('calvo'))
      }
      if (DULCE_HOGAR_IDS.includes(ref) || ref.includes('dulce') || conc.includes('dulce')) {
        return clientes.find(c => c.nombre.toLowerCase().includes('dulce'))
      }
      if (PAJAROS_IDS.includes(ref) || ref.includes('pajaro') || conc.includes('pajaro')) {
        return clientes.find(c => c.nombre.toLowerCase().includes('pajaro'))
      }
      if (ONMAS_IDS.includes(ref) || ref.includes('onmas') || conc.includes('onmas')) {
        return clientes.find(c => c.nombre.toLowerCase().includes('onmas') || (c.url && c.url.includes('onmas')))
      }

      return undefined
    }

    return { resolve }
  }, [clientes])

  // Cálculos Financieros Principales
  const enProduccion = clientes.filter(c => c.situacion === 'EN PRODUCCION')
  const mrrCalculado = enProduccion.reduce((acc, c) => acc + (Number(c.montoMensual) || 0), 0)
  const arpuPromedio = enProduccion.length > 0 ? Math.round(mrrCalculado / enProduccion.length) : 0
  
  const cobradoMesActual = getPagosMesActual(pagos)
  const saldoFaltanteMes = Math.max(0, mrrCalculado - cobradoMesActual)
  const tasaCobroMes = mrrCalculado > 0 ? Math.min(Math.round((cobradoMesActual / mrrCalculado) * 100), 100) : 0
  const cobradoHistoricoGlobal = getPagosAcumuladosGlobal(pagos)

  // LTV (Lifetime Value)
  const ltvPromedio = enProduccion.length > 0 ? Math.round(cobradoHistoricoGlobal / enProduccion.length) : 0

  // Salud de Cobranzas y Deuda Morosa
  const clientesAlDia = clientes.filter(c => c.estadoPago === 'AL_DIA').length
  const clientesVencidos = clientes.filter(c => c.estadoPago === 'VENCIDO')
  const clientesPendientes = clientes.filter(c => c.estadoPago === 'PENDIENTE')
  const totalMorosos = clientesVencidos.length + clientesPendientes.length
  const deudaEstimada = clientesVencidos.reduce((acc, c) => acc + (Number(c.montoMensual) || 0), 0)

  // Métodos de Pago
  const pagosConfirmados = pagos.filter(p => p.confirmado)
  const pagosWebhookCount = pagosConfirmados.filter(p => p.origen === 'WEBHOOK' || p.metodo === 'pasarela').length
  const pagosManualesCount = pagosConfirmados.length - pagosWebhookCount

  // Ranking de Clientes por Facturación Histórica
  const rankingClientes = useMemo(() => {
    const totalsByClient = new Map<string, { cliente: Cliente; totalAbonado: number; pagosCount: number }>()

    clientes.forEach(c => {
      if (c.id) {
        totalsByClient.set(c.id, { cliente: c, totalAbonado: 0, pagosCount: 0 })
      }
    })

    pagosConfirmados.forEach(p => {
      const found = clientResolver.resolve(p.clienteId, p.concepto)
      if (found && found.id && totalsByClient.has(found.id)) {
        const item = totalsByClient.get(found.id)!
        item.totalAbonado += Number(p.monto) || 0
        item.pagosCount += 1
      }
    })

    return Array.from(totalsByClient.values())
      .filter(item => item.totalAbonado > 0 || item.cliente.situacion === 'EN PRODUCCION')
      .sort((a, b) => b.totalAbonado - a.totalAbonado)
  }, [clientes, pagosConfirmados, clientResolver])

  // Embudo de Conversión Comercial (Corregido y Preciso)
  const funnelSteps = useMemo(() => {
    const totalRegistrados = clientes.length
    const conDemo = clientes.filter(c => c.demo === 'HECHA' || c.demo === 'PRESENTADA').length
    const presentadas = clientes.filter(c => c.demo === 'PRESENTADA').length
    const enEspera = clientes.filter(c => c.situacion === 'EN ESPERA').length
    const produccion = enProduccion.length

    return [
      { label: 'Total Registrados en CRM', count: totalRegistrados, color: '#38bdf8' },
      { label: 'Demos Construidas',        count: conDemo,          color: '#818cf8' },
      { label: 'Demos Presentadas',       count: presentadas,      color: '#a78bfa' },
      { label: 'En Espera / Negociación', count: enEspera,         color: '#fbbf24' },
      { label: 'Cerrados en Producción',  count: produccion,       color: '#4ade80' },
    ]
  }, [clientes, enProduccion])

  const conversionReal = clientes.length > 0 ? Math.round((enProduccion.length / clientes.length) * 100) : 0

  // Distribución por Rubros
  const topRubros = useMemo(() => {
    const rubroCounts: Record<string, number> = {}
    clientes.forEach(c => {
      const r = c.rubro && c.rubro.trim() ? c.rubro.trim() : 'Sin especificar'
      rubroCounts[r] = (rubroCounts[r] || 0) + 1
    })
    return Object.entries(rubroCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [clientes])

  // Filtrado de Pagos para el Explorador
  const filteredPagos = useMemo(() => {
    return pagos.filter(p => {
      const clientFound = clientResolver.resolve(p.clienteId, p.concepto)
      const clientName = clientFound?.nombre || ''
      const searchTarget = `${clientName} ${p.concepto || ''} ${p.id || ''} ${p.medioPago || ''} ${p.fecha || ''}`.toLowerCase()

      if (searchPayment && !searchTarget.includes(searchPayment.toLowerCase().trim())) {
        return false
      }

      if (filterMetodo === 'WEBHOOK') {
        return p.origen === 'WEBHOOK' || p.metodo === 'pasarela'
      }
      if (filterMetodo === 'MANUAL') {
        return p.origen !== 'WEBHOOK' && p.metodo !== 'pasarela'
      }

      return true
    })
  }, [pagos, searchPayment, filterMetodo, clientResolver])

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-depth)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  }

  const kpiLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }

  const kpiValueStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: 800,
    color: 'var(--color-star)',
    margin: 0,
    lineHeight: 1.1,
  }

  return (
    <div style={{ maxWidth: 1240, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 50 }}>
      
      {/* ── 1. NAVEGACIÓN SUPERIOR DE PANELES (TABS) ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, flexWrap: 'wrap' }}>
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
          🌐 Estadísticas Web & SEO
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
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          💼 Métricas y Salud Financiera de Clientes
        </Link>
      </div>

      {/* ── 2. HEADER Y ACCIONES ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-star)', margin: 0 }}>
            Métricas de Clientes & Salud Financiera
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            Indicadores de ingreso recurrente (MRR), valor por cliente (LTV), cobranzas, ranking y auditoría de transacciones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {lastUpdated && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
              Actualizado: {lastUpdated}
            </span>
          )}
          <button
            onClick={loadData}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-accent)',
              background: 'var(--color-accent-dim)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🔄</span> Actualizar Datos
          </button>
          <Link
            href="/admin/clientes"
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--color-star)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Lista de Clientes ↗
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
            <div style={{
              width: 18,
              height: 18,
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-accent)',
              borderRadius: '50%',
              animation: 'admin-spin 0.7s linear infinite',
            }} />
            <span>Calculando balances, métricas de retención y cobros...</span>
          </div>
          <style>{`@keyframes admin-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ── 3. GRID DE KPIS FINANCIEROS Y OPERATIVOS (5 CARDS) ──────────── */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* MRR */}
            <div style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(24, 24, 24, 0.8) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
            }}>
              <span style={{ ...kpiLabelStyle, color: 'var(--color-accent)' }}>MRR (Ingreso Recurrente)</span>
              <p style={{ ...kpiValueStyle, color: 'var(--color-star)' }}>{formatARS(mrrCalculado)}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                <span>{enProduccion.length} cuentas activas</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Ticket: {formatARS(arpuPromedio)}</span>
              </div>
            </div>

            {/* Cobrado Mes */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={kpiLabelStyle}>Cobrado este Mes</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: tasaCobroMes >= 80 ? '#4ade80' : '#fbbf24',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  {tasaCobroMes}%
                </span>
              </div>
              <p style={{ ...kpiValueStyle, color: '#4ade80' }}>{formatARS(cobradoMesActual)}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                <span>Saldo por recaudar:</span>
                <span style={{ color: 'var(--color-star)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatARS(saldoFaltanteMes)}</span>
              </div>
            </div>

            {/* LTV Promedio */}
            <div style={cardStyle}>
              <span style={kpiLabelStyle}>LTV Promedio (Valor de Vida)</span>
              <p style={{ ...kpiValueStyle, color: '#38bdf8' }}>{formatARS(ltvPromedio)}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                Recaudación histórica media por cuenta activa
              </span>
            </div>

            {/* Salud de Cobranzas / Deuda */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={kpiLabelStyle}>Salud de Cobranzas</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: deudaEstimada > 0 ? '#f87171' : '#4ade80',
                  fontWeight: 700,
                }}>
                  {deudaEstimada > 0 ? 'Con morosidad' : '100% al día'}
                </span>
              </div>
              <p style={{ ...kpiValueStyle, color: deudaEstimada > 0 ? '#f87171' : '#4ade80' }}>
                {deudaEstimada > 0 ? formatARS(deudaEstimada) : `${clientesAlDia} al día`}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                <span>{clientesVencidos.length} vencidos • {clientesPendientes.length} pendientes</span>
                <span style={{ color: 'var(--color-muted)' }}>Total: {clientes.length}</span>
              </div>
            </div>

            {/* Total Histórico */}
            <div style={cardStyle}>
              <span style={kpiLabelStyle}>Recaudación Global Histórica</span>
              <p style={kpiValueStyle}>{formatARS(cobradoHistoricoGlobal)}</p>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {pagosConfirmados.length} cobros auditados
              </span>
            </div>
          </section>

          {/* ── 4. GRÁFICO INTERACTIVO DE RECAUDACIÓN Y EVOLUCIÓN ─────────────── */}
          <ClientRevenueChart pagos={pagos} />

          {/* ── 5. MÓDULO DIVIDIDO: RANKING DE CLIENTES vs EMBUDO Y RUBROS ───── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}>
            
            {/* 🏆 COLUMNA IZQUIERDA: RANKING DE CLIENTES POR FACTURACIÓN HISTÓRICA */}
            <section style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
                    🏆 Ranking de Clientes (Top Accounts)
                  </h2>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
                    Clientes ordenados por facturación total aportada a KevDev.
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                  {rankingClientes.length} analizados
                </span>
              </div>

              {rankingClientes.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-faint)', margin: '10px 0' }}>
                  Sin pagos confirmados para armar el ranking aún.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rankingClientes.map((item, index) => {
                    const c = item.cliente
                    const sharePct = cobradoHistoricoGlobal > 0
                      ? Math.round((item.totalAbonado / cobradoHistoricoGlobal) * 100)
                      : 0
                    const estadoPago = c.estadoPago || ''
                    const pagoColor = ESTADO_PAGO_COLORS[estadoPago] || 'var(--color-faint)'
                    const pagoLabel = ESTADO_PAGO_LABELS[estadoPago] || 'Sin estado'
                    const cuotaMensual = c.montoMensual ? `${formatARS(c.montoMensual)}/mes` : 'Sin abono mensual'

                    return (
                      <div
                        key={c.id || index}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 12,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: index === 0 ? '#fbbf24' : index === 1 ? '#e2e8f0' : index === 2 ? '#b45309' : 'var(--color-faint)',
                              width: 22,
                            }}>
                              #{index + 1}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <Link
                                href={`/admin/clientes/${c.id}`}
                                style={{
                                  fontFamily: 'var(--font-ui)',
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: 'var(--color-star)',
                                  textDecoration: 'none',
                                }}
                              >
                                {c.nombre}
                              </Link>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                                <span>{c.rubro || 'General'}</span>
                                <span>•</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{cuotaMensual}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: 800, color: '#4ade80' }}>
                              {formatARS(item.totalAbonado)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.625rem',
                                color: pagoColor,
                                background: `${pagoColor}15`,
                                border: `1px solid ${pagoColor}40`,
                                padding: '1px 5px',
                                borderRadius: 4,
                                textTransform: 'uppercase',
                              }}>
                                {pagoLabel}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)' }}>
                                {sharePct}% de ingresos
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Barra de Aporte al Negocio */}
                        <div style={{
                          height: 4,
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(sharePct, 2))}%`,
                            background: index === 0 ? '#fbbf24' : 'var(--color-accent)',
                            borderRadius: 99,
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 📈 COLUMNA DERECHA: EMBUDO COMERCIAL, METODOS & RUBROS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Embudo Comercial Corregido */}
              <section style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
                      📈 Embudo de Conversión Comercial
                    </h2>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
                      Efectividad paso a paso desde el primer contacto hasta el cierre.
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.12)',
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}>
                    {conversionReal}% conversión
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {funnelSteps.map((step) => {
                    const maxCount = Math.max(...funnelSteps.map(s => s.count), 1)
                    const pctOfMax = (step.count / maxCount) * 100
                    return (
                      <div key={step.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                          <span style={{ color: 'var(--color-muted)' }}>{step.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: step.color }}>
                            {step.count}
                          </span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pctOfMax}%`,
                            background: step.color,
                            borderRadius: 99,
                            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Canales y Métodos de Cobro */}
              <section style={cardStyle}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
                  💳 Canales y Métodos de Cobro
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: 14,
                    borderRadius: 12,
                  }}>
                    <span style={{ fontSize: '0.6875rem', color: '#38bdf8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      MercadoPago (Webhooks)
                    </span>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-star)', margin: '4px 0 0' }}>
                      {pagosWebhookCount}
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                      Cobros automáticos
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    padding: 14,
                    borderRadius: 12,
                  }}>
                    <span style={{ fontSize: '0.6875rem', color: '#f59e0b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      Manual / Transferencias
                    </span>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-star)', margin: '4px 0 0' }}>
                      {pagosManualesCount}
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                      Registrados en panel
                    </span>
                  </div>
                </div>
              </section>

              {/* Distribución por Rubros */}
              <section style={cardStyle}>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
                  🏢 Principales Rubros en Cartera
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topRubros.map(([rubro, count]) => {
                    const pct = Math.round((count / (clientes.length || 1)) * 100)
                    return (
                      <div key={rubro} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                          <span style={{ color: 'var(--color-star)' }}>{rubro}</span>
                          <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#38bdf8', borderRadius: 99 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

            </div>
          </div>

          {/* ── 6. AUDITORÍA Y EXPLORADOR DE TRANSACCIONES EN VIVO ────────────── */}
          <section style={cardStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
                  🔎 Explorador y Auditoría de Historial de Pagos
                </h2>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
                  Consulta detallada de cada transacción registrada en la base de datos de KevDev.
                </p>
              </div>

              {/* Filtros de origen */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['ALL', 'WEBHOOK', 'MANUAL'] as const).map(mode => {
                  const labels = { ALL: 'Todos', WEBHOOK: 'Pasarela Webhook', MANUAL: 'Manual' }
                  const active = filterMetodo === mode
                  return (
                    <button
                      key={mode}
                      onClick={() => setFilterMetodo(mode)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: active ? 'var(--color-accent-dim)' : 'transparent',
                        color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {labels[mode]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input de Búsqueda */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por cliente, concepto, medio de pago o fecha..."
                value={searchPayment}
                onChange={e => setSearchPayment(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: 'var(--color-star)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Tabla de Resultados */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Fecha</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Cliente / Concepto</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Medio / Origen</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Monto</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPagos.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>
                        No se encontraron pagos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredPagos.slice(0, visiblePaymentsCount).map((p, idx) => {
                      const clientFound = clientResolver.resolve(p.clienteId, p.concepto)
                      const clientName = clientFound?.nombre || 'Cliente General'
                      const isWebhook = p.origen === 'WEBHOOK' || p.metodo === 'pasarela'

                      return (
                        <tr
                          key={p.id || `${p.fecha}-${idx}`}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.15s',
                          }}
                        >
                          <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-star)' }}>
                            {formatDateDisplay(p.fecha)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {clientFound?.id ? (
                                <Link
                                  href={`/admin/clientes/${clientFound.id}`}
                                  style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    color: 'var(--color-star)',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {clientName}
                                </Link>
                              ) : (
                                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-star)' }}>
                                  {clientName}
                                </span>
                              )}
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                                {p.concepto || 'Cuota de servicio'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                                {p.medioPago || 'Transferencia'}
                              </span>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.625rem',
                                color: isWebhook ? '#38bdf8' : '#f59e0b',
                                background: isWebhook ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                border: `1px solid ${isWebhook ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                                padding: '1px 5px',
                                borderRadius: 4,
                              }}>
                                {isWebhook ? 'Automático' : 'Manual'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>
                            +{formatARS(p.monto)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: p.confirmado ? '#4ade80' : '#f59e0b',
                              background: p.confirmado ? 'rgba(74, 222, 128, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              padding: '2px 8px',
                              borderRadius: 99,
                            }}>
                              {p.confirmado ? 'Auditado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación / Cargar Más */}
            {filteredPagos.length > visiblePaymentsCount && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
                <button
                  onClick={() => setVisiblePaymentsCount(prev => prev + 15)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-star)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cargar más transacciones ({filteredPagos.length - visiblePaymentsCount} restantes)
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
