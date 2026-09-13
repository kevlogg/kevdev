'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { HistorialPago } from '@/lib/firestore'

interface ClientRevenueChartProps {
  pagos: HistorialPago[]
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export default function ClientRevenueChart({ pagos }: ClientRevenueChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<{ monthLabel: string; total: number; count: number } | null>(null)

  // 1. Filtrar solo pagos confirmados
  const pagosConfirmados = pagos.filter(p => p.confirmado && p.fecha)

  // 2. Agrupar por YYYY-MM
  const monthMap: Record<string, { total: number; count: number }> = {}

  // Asegurar al menos los últimos 6 meses en la escala temporal
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${yyyy}-${mm}`
    monthMap[key] = { total: 0, count: 0 }
  }

  // Llenar con datos reales
  pagosConfirmados.forEach(p => {
    const key = p.fecha.slice(0, 7) // YYYY-MM
    if (!monthMap[key]) {
      monthMap[key] = { total: 0, count: 0 }
    }
    monthMap[key].total += Number(p.monto) || 0
    monthMap[key].count += 1
  })

  const sortedKeys = Object.keys(monthMap).sort()
  const chartData = sortedKeys.map(key => {
    const [yearStr, monthStr] = key.split('-')
    const monthIdx = parseInt(monthStr, 10) - 1
    const yearShort = yearStr.slice(2)
    const monthLabel = `${MONTH_NAMES[monthIdx]} '${yearShort}`
    return {
      key,
      monthLabel,
      total: monthMap[key].total,
      count: monthMap[key].count,
    }
  })

  const values = chartData.map(d => d.total)
  const maxVal = Math.max(...values, 1000)
  const totalHistorico = values.reduce((a, b) => a + b, 0)
  const avgMensual = (totalHistorico / (chartData.length || 1)).toFixed(0)

  const peakIdx = values.indexOf(Math.max(...values))
  const peakMonth = chartData[peakIdx]

  return (
    <div
      style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-star)', margin: 0 }}>
              Evolución Mensual de Cobros Recaudados
            </h3>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
            Historial de facturación efectiva abonada mes a mes por los clientes.
          </p>
        </div>

        {/* Resumen Promedio */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 12px', borderRadius: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8', textTransform: 'uppercase' }}>
              Promedio Mensual
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
              {formatARS(Number(avgMensual))}
            </p>
          </div>

          <div style={{ background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '6px 12px', borderRadius: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#4ade80', textTransform: 'uppercase' }}>
              Mes Pico ({peakMonth?.monthLabel})
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
              {formatARS(peakMonth?.total || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Area del Gráfico */}
      <div style={{ position: 'relative', marginTop: '0.5rem' }}>
        {/* Tooltip */}
        {hoveredMonth && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: -55,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #38bdf8',
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.25)',
              borderRadius: 10,
              padding: '0.45rem 0.85rem',
              zIndex: 30,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
              📅 {hoveredMonth.monthLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>
              {formatARS(hoveredMonth.total)} ({hoveredMonth.count} {hoveredMonth.count === 1 ? 'cobro' : 'cobros'})
            </span>
          </motion.div>
        )}

        {/* Barras */}
        <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '2px', position: 'relative' }}>
          {/* Lineas de guia de fondo */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.08)', width: '100%', height: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginTop: -12 }}>{formatARS(maxVal)}</span>
            </div>
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.04)', width: '100%', height: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)', marginTop: -12 }}>{formatARS(Math.round(maxVal / 2))}</span>
            </div>
            <div style={{ width: '100%', height: 0 }} />
          </div>

          {chartData.map((d, idx) => {
            const heightPct = maxVal > 0 ? (d.total / maxVal) * 100 : 0
            const isPeak = idx === peakIdx && d.total > 0

            return (
              <div
                key={d.key}
                onMouseEnter={() => setHoveredMonth({ monthLabel: d.monthLabel, total: d.total, count: d.count })}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {d.total > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: isPeak ? '#4ade80' : 'var(--color-muted)',
                      marginBottom: '4px',
                      fontWeight: 600,
                    }}
                  >
                    ${Math.round(d.total / 1000)}k
                  </span>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, d.total > 0 ? 6 : 3)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    background: d.total === 0
                      ? 'rgba(255, 255, 255, 0.04)'
                      : isPeak
                      ? 'linear-gradient(180deg, #4ade80 0%, #059669 100%)'
                      : 'linear-gradient(180deg, #38bdf8 0%, rgba(14, 165, 233, 0.2) 100%)',
                    borderRadius: '6px 6px 2px 2px',
                    boxShadow: isPeak
                      ? '0 0 14px rgba(74, 222, 128, 0.4)'
                      : d.total > 0
                      ? '0 0 8px rgba(56, 189, 248, 0.2)'
                      : 'none',
                    transition: 'opacity 0.2s',
                    opacity: hoveredMonth && hoveredMonth.monthLabel !== d.monthLabel ? 0.45 : 1,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Eje X */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
          {chartData.map(d => (
            <div key={d.key} style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
              {d.monthLabel}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
