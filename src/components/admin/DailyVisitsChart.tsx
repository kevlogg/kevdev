'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { DailyStat } from '@/lib/analyticsStore'

interface DailyVisitsChartProps {
  dailyStats: DailyStat[]
  periodDays: number
}

type MetricType = 'pageviews' | 'visitors' | 'leads'

export default function DailyVisitsChart({ dailyStats, periodDays }: DailyVisitsChartProps) {
  const [metric, setMetric] = useState<MetricType>('pageviews')
  const [hoveredDay, setHoveredDay] = useState<DailyStat | null>(null)

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <p style={{ margin: 0 }}>📊 No hay suficientes datos diarios registrados para este período.</p>
      </div>
    )
  }

  // Calculate summary metrics
  const metricKey = metric === 'pageviews' ? 'pageviews' : metric === 'visitors' ? 'visitors' : 'leads'
  const values = dailyStats.map(d => d[metricKey])
  const maxVal = Math.max(...values, 1)
  const totalVal = values.reduce((a, b) => a + b, 0)
  const avgVal = (totalVal / dailyStats.length).toFixed(1)

  // Find peak day
  const peakDayIndex = values.indexOf(Math.max(...values))
  const peakDay = dailyStats[peakDayIndex] || dailyStats[0]

  const metricColors: Record<MetricType, { main: string; bg: string; border: string; label: string; icon: string }> = {
    pageviews: {
      main: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.35)',
      label: 'Impresiones (Pageviews)',
      icon: '👁️',
    },
    visitors: {
      main: '#4ade80',
      bg: 'rgba(74, 222, 128, 0.15)',
      border: 'rgba(74, 222, 128, 0.35)',
      label: 'Visitantes Únicos',
      icon: '👤',
    },
    leads: {
      main: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.35)',
      label: 'Leads & Conversiones',
      icon: '⚡',
    },
  }

  const currentTheme = metricColors[metric]

  // Sampling for X-axis labels to avoid overlap
  const totalDays = dailyStats.length
  const step = totalDays <= 10 ? 1 : totalDays <= 21 ? 2 : totalDays <= 45 ? 4 : 7

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: '1.75rem',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* ── HEADER Y CONTROLES DEL GRÁFICO ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📈</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              Evolución Diaria de Visitas & Tráfico
            </h3>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
            Visualización detallada de métricas por día para el período seleccionado ({periodDays} días).
          </p>
        </div>

        {/* METRIC TOGGLES */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {(['pageviews', 'visitors', 'leads'] as MetricType[]).map(m => {
            const active = metric === m
            const theme = metricColors[m]
            return (
              <button
                key={m}
                onClick={() => setMetric(m)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 9,
                  border: active ? `1px solid ${theme.border}` : '1px solid transparent',
                  background: active ? theme.bg : 'transparent',
                  color: active ? theme.main : 'var(--color-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? `0 0 12px ${theme.bg}` : 'none',
                }}
              >
                <span>{theme.icon}</span>
                <span>{theme.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── TARJETAS DE RESUMEN DEL PERÍODO DIARIO ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total {currentTheme.label}
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: currentTheme.main, margin: '2px 0 0' }}>
            {totalVal.toLocaleString()}
          </p>
        </div>

        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Promedio Diario
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
            {avgVal} <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>/ día</span>
          </p>
        </div>

        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Día Pico de Tráfico
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#34d399', margin: '2px 0 0' }}>
            {peakDay ? peakDay[metricKey] : 0} <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500 }}>({peakDay?.displayDate})</span>
          </p>
        </div>
      </div>

      {/* ── ÁREA PRINCIPAL DEL GRÁFICO (BARS & TOOLTIP) ───────────────────────── */}
      <div style={{ position: 'relative', marginTop: '0.5rem' }}>
        {/* Tooltip flotante al hacer hover */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${currentTheme.main}`,
              boxShadow: `0 10px 25px -5px ${currentTheme.bg}`,
              borderRadius: 12,
              padding: '0.5rem 0.85rem',
              zIndex: 30,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
              📅 {hoveredDay.displayDate}
            </span>
            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#38bdf8' }}>👁️ {hoveredDay.pageviews}</span>
              <span style={{ color: '#4ade80' }}>👤 {hoveredDay.visitors}</span>
              <span style={{ color: '#a855f7' }}>⚡ {hoveredDay.leads}</span>
            </div>
          </motion.div>
        )}

        {/* Contenedor del gráfico con barras */}
        <div style={{ height: 210, display: 'flex', alignItems: 'flex-end', gap: totalDays > 40 ? '2px' : '4px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '2px', position: 'relative' }}>
          
          {/* Guías horizontales de fondo */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.06)', width: '100%', height: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginTop: -12 }}>{maxVal}</span>
            </div>
            <div style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.04)', width: '100%', height: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)', marginTop: -12 }}>{Math.round(maxVal / 2)}</span>
            </div>
            <div style={{ width: '100%', height: 0 }} />
          </div>

          {/* Renderizado de barras por cada día */}
          {dailyStats.map((d, idx) => {
            const val = d[metricKey]
            const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0
            const isPeak = idx === peakDayIndex && val > 0

            return (
              <div
                key={d.date}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
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
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, val > 0 ? 4 : 2)}%` }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.015, 0.4), ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    maxWidth: 24,
                    background: val === 0
                      ? 'rgba(255, 255, 255, 0.04)'
                      : isPeak
                      ? `linear-gradient(180deg, #ffffff 0%, ${currentTheme.main} 100%)`
                      : `linear-gradient(180deg, ${currentTheme.main} 0%, rgba(15, 23, 42, 0.4) 100%)`,
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: isPeak
                      ? `0 0 12px ${currentTheme.main}`
                      : val > 0
                      ? `0 0 6px ${currentTheme.bg}`
                      : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    opacity: hoveredDay && hoveredDay.date !== d.date ? 0.45 : 1,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Eje X: Fechas muestreadas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
          {dailyStats.map((d, idx) => {
            const showLabel = idx === 0 || idx === dailyStats.length - 1 || idx % step === 0
            return (
              <div key={d.date} style={{ flex: 1, textAlign: 'center', opacity: showLabel ? 1 : 0 }}>
                {showLabel && d.displayDate}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
