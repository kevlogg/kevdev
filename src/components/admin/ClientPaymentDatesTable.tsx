'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  type Cliente,
  type Situacion,
  type EstadoPago,
  updateCliente,
} from '@/lib/firestore'
import {
  SITUACION_COLORS,
  SITUACION_LABELS,
  ESTADO_PAGO_COLORS,
  ESTADO_PAGO_LABELS,
} from '@/lib/cliente-ui'

export interface ClientPaymentDatesTableProps {
  clientes: Cliente[]
  onUpdateCliente?: (id: string, updates: Partial<Cliente>) => Promise<void> | void
  title?: string
  subtitle?: string
  initialFilter?: 'todos' | 'produccion' | 'alertas' | 'proximos' | 'al_dia' | 'sin_fecha'
  compact?: boolean
  hideHeaderStats?: boolean
}

type SortField = 'urgencia' | 'dia' | 'nombre' | 'monto'
type FilterMode = 'todos' | 'produccion' | 'alertas' | 'proximos' | 'al_dia' | 'sin_fecha'

export interface PaymentScheduleItem {
  cliente: Cliente
  diaCobro: number | null
  fechaInicioFormatted: string
  proximoVencimientoFormatted: string
  proximoVencimientoDate: Date | null
  diasRestantes: number | null
  estadoTemporal: 'vencido' | 'hoy' | 'proximo_urgente' | 'proximo_normal' | 'al_dia' | 'sin_fecha'
  badgeLabel: string
  badgeColor: string
  badgeBg: string
  badgeBorder: string
  montoMensual: number
  wspUrl: string | null
}

function formatARS(val: number): string {
  return `$${Math.round(val).toLocaleString('es-AR')}`
}

function buildWspUrl(c: Cliente, text: string): string | null {
  if (!c.telefono) return null
  const clean = c.telefono.replace(/\D/g, '')
  if (!clean) return null
  const number = clean.startsWith('54')
    ? clean
    : `549${clean.replace(/^0/, '').replace(/^15/, '')}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

function computeSchedule(c: Cliente, now: Date): PaymentScheduleItem {
  const montoMensual = Number(c.montoMensual) || 0
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() // 0-11
  const nowDay = now.getDate()
  const todayMidnight = new Date(nowYear, nowMonth, nowDay)

  let diaCobro: number | null = null
  let fechaInicioFormatted = '—'
  let startDate: Date | null = null

  if (c.fechaInicioProyecto && c.fechaInicioProyecto.trim() !== '') {
    const parts = c.fechaInicioProyecto.split('-').map(p => parseInt(p, 10))
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const [y, m, d] = parts
      diaCobro = d
      fechaInicioFormatted = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
      startDate = new Date(y, m - 1, d)
    }
  } else if (c.diaVencimiento && !isNaN(c.diaVencimiento)) {
    diaCobro = c.diaVencimiento
    fechaInicioFormatted = `Día ${c.diaVencimiento} de cada mes`
  }

  // Sin fecha asignada
  if (!diaCobro) {
    return {
      cliente: c,
      diaCobro: null,
      fechaInicioFormatted: '—',
      proximoVencimientoFormatted: 'Sin fecha',
      proximoVencimientoDate: null,
      diasRestantes: null,
      estadoTemporal: 'sin_fecha',
      badgeLabel: 'Sin fecha de cobro',
      badgeColor: 'var(--color-faint)',
      badgeBg: 'rgba(255, 255, 255, 0.03)',
      badgeBorder: 'rgba(255, 255, 255, 0.08)',
      montoMensual,
      wspUrl: buildWspUrl(
        c,
        `Hola ${c.nombre}! Te escribo de KevDev para saludarte y coordinar la fecha de inicio del servicio web. ¡Saludos!`
      ),
    }
  }

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

  // Caso 1: Fecha de inicio en el futuro
  if (startDate && startDate.getTime() > todayMidnight.getTime()) {
    const diffMs = startDate.getTime() - todayMidnight.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const [sy, sm, sd] = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()]
    const proxStr = `${String(sd).padStart(2, '0')}/${String(sm).padStart(2, '0')}/${sy}`

    return {
      cliente: c,
      diaCobro,
      fechaInicioFormatted,
      proximoVencimientoFormatted: proxStr,
      proximoVencimientoDate: startDate,
      diasRestantes: diffDays,
      estadoTemporal: 'proximo_normal',
      badgeLabel: `Inicia en ${diffDays}d (${proxStr})`,
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.3)',
      montoMensual,
      wspUrl: buildWspUrl(
        c,
        `Hola ${c.nombre}! Te escribo de KevDev por el inicio del proyecto programado para el ${proxStr}. ¡Saludos!`
      ),
    }
  }

  // Caso 2: Cliente activo
  const maxDayCur = getDaysInMonth(nowYear, nowMonth)
  const clampedDayCur = Math.min(diaCobro, maxDayCur)
  const dueCur = new Date(nowYear, nowMonth, clampedDayCur)

  const diffMs = dueCur.getTime() - todayMidnight.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  // Cliente marcado como AL DÍA
  if (c.estadoPago === 'AL_DIA') {
    let nextM = nowMonth + 1
    let nextY = nowYear
    if (nextM > 11) {
      nextM = 0
      nextY += 1
    }
    const maxDayNext = getDaysInMonth(nextY, nextM)
    const clampedDayNext = Math.min(diaCobro, maxDayNext)
    const dueNext = new Date(nextY, nextM, clampedDayNext)
    const nextDiffDays = Math.round((dueNext.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
    const proxStr = `${String(clampedDayNext).padStart(2, '0')}/${String(nextM + 1).padStart(2, '0')}/${nextY}`

    return {
      cliente: c,
      diaCobro,
      fechaInicioFormatted,
      proximoVencimientoFormatted: proxStr,
      proximoVencimientoDate: dueNext,
      diasRestantes: nextDiffDays,
      estadoTemporal: 'al_dia',
      badgeLabel: `Al día (próx. en ${nextDiffDays}d)`,
      badgeColor: '#4ade80',
      badgeBg: 'rgba(74, 222, 128, 0.12)',
      badgeBorder: 'rgba(74, 222, 128, 0.3)',
      montoMensual,
      wspUrl: buildWspUrl(
        c,
        `Hola ${c.nombre}! Te escribo de KevDev. Tu abono mensual se encuentra al día. ¡Muchas gracias por confiar en nosotros!`
      ),
    }
  }

  // Cliente PENDIENTE o VENCIDO
  const curStr = `${String(clampedDayCur).padStart(2, '0')}/${String(nowMonth + 1).padStart(2, '0')}/${nowYear}`

  if (diffDays < 0 || c.estadoPago === 'VENCIDO') {
    const daysAgo = Math.abs(diffDays)
    const label = daysAgo === 0 ? 'Vencido (saldo pendiente)' : `Vencido hace ${daysAgo}d`
    return {
      cliente: c,
      diaCobro,
      fechaInicioFormatted,
      proximoVencimientoFormatted: curStr,
      proximoVencimientoDate: dueCur,
      diasRestantes: diffDays,
      estadoTemporal: 'vencido',
      badgeLabel: label,
      badgeColor: '#f87171',
      badgeBg: 'rgba(248, 113, 113, 0.15)',
      badgeBorder: 'rgba(248, 113, 113, 0.4)',
      montoMensual,
      wspUrl: buildWspUrl(
        c,
        `Hola ${c.nombre}! Te escribo de KevDev para recordarte que tenés pendiente el abono mensual del servicio web (vencimiento ${curStr}). Avisame por favor si precisás los datos de transferencia. ¡Muchas gracias!`
      ),
    }
  }

  if (diffDays === 0) {
    return {
      cliente: c,
      diaCobro,
      fechaInicioFormatted,
      proximoVencimientoFormatted: curStr,
      proximoVencimientoDate: dueCur,
      diasRestantes: 0,
      estadoTemporal: 'hoy',
      badgeLabel: '🚨 ¡Vence hoy!',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeBorder: '#f59e0b',
      montoMensual,
      wspUrl: buildWspUrl(
        c,
        `Hola ${c.nombre}! Te escribo de KevDev para avisarte que hoy vence tu abono mensual del servicio web. Avisame cuando realices el pago así lo dejamos asentado. ¡Muchas gracias!`
      ),
    }
  }

  const isUrgent = diffDays <= 7
  return {
    cliente: c,
    diaCobro,
    fechaInicioFormatted,
    proximoVencimientoFormatted: curStr,
    proximoVencimientoDate: dueCur,
    diasRestantes: diffDays,
    estadoTemporal: isUrgent ? 'proximo_urgente' : 'proximo_normal',
    badgeLabel: `Vence en ${diffDays} día${diffDays > 1 ? 's' : ''}`,
    badgeColor: isUrgent ? '#fbbf24' : 'var(--color-star)',
    badgeBg: isUrgent ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255, 255, 255, 0.04)',
    badgeBorder: isUrgent ? 'rgba(251, 191, 36, 0.3)' : 'var(--color-border)',
    montoMensual,
    wspUrl: buildWspUrl(
      c,
      `Hola ${c.nombre}! Te escribo de KevDev para recordarte que el próximo ${curStr} vence tu abono mensual del servicio web. ¡Muchas gracias!`
    ),
  }
}

export default function ClientPaymentDatesTable({
  clientes,
  onUpdateCliente,
  title = '📅 Fechas de Pago y Vencimientos de Clientes',
  subtitle = 'Cronograma mensual de cobros calculado a partir de la fecha de inicio en la fila situación de cada cliente.',
  initialFilter = 'produccion',
  compact = false,
  hideHeaderStats = false,
}: ClientPaymentDatesTableProps) {
  const [filter, setFilter] = useState<FilterMode>(initialFilter)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('urgencia')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [savingState, setSavingState] = useState<Record<string, boolean>>({})

  // Computar cronograma para todos los clientes
  const now = useMemo(() => new Date(), [])
  const allSchedules = useMemo(() => {
    return clientes.map(c => computeSchedule(c, now))
  }, [clientes, now])

  // Contadores para métricas y tabs
  const stats = useMemo(() => {
    const total = allSchedules.length
    const enProduccion = allSchedules.filter(s => s.cliente.situacion === 'EN PRODUCCION')
    const alertas = allSchedules.filter(s => s.estadoTemporal === 'vencido' || s.estadoTemporal === 'hoy')
    const proximos = allSchedules.filter(s => s.estadoTemporal === 'proximo_urgente')
    const alDia = allSchedules.filter(s => s.estadoTemporal === 'al_dia')
    const sinFecha = allSchedules.filter(s => s.diaCobro === null)

    const mrrTotal = enProduccion.reduce((acc, s) => acc + s.montoMensual, 0)
    const mrrCobrado = allSchedules
      .filter(s => s.cliente.estadoPago === 'AL_DIA')
      .reduce((acc, s) => acc + s.montoMensual, 0)

    return {
      total,
      enProduccionCount: enProduccion.length,
      alertasCount: alertas.length,
      proximosCount: proximos.length,
      alDiaCount: alDia.length,
      sinFechaCount: sinFecha.length,
      mrrTotal,
      mrrCobrado,
    }
  }, [allSchedules])

  // Filtrado
  const filtered = useMemo(() => {
    return allSchedules.filter(item => {
      const c = item.cliente

      // Filtro de pestaña
      if (filter === 'produccion' && c.situacion !== 'EN PRODUCCION') return false
      if (filter === 'alertas' && item.estadoTemporal !== 'vencido' && item.estadoTemporal !== 'hoy') return false
      if (filter === 'proximos' && item.estadoTemporal !== 'proximo_urgente') return false
      if (filter === 'al_dia' && item.estadoTemporal !== 'al_dia') return false
      if (filter === 'sin_fecha' && item.diaCobro !== null) return false

      // Búsqueda
      if (search.trim()) {
        const q = search.toLowerCase()
        const text = `${c.nombre || ''} ${c.rubro || ''} ${c.plan || ''} ${c.telefono || ''} ${item.diaCobro || ''} ${item.proximoVencimientoFormatted || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  }, [allSchedules, filter, search])

  // Ordenamiento
  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      if (sortField === 'urgencia') {
        const priorityOrder: Record<string, number> = {
          hoy: 0,
          vencido: 1,
          proximo_urgente: 2,
          proximo_normal: 3,
          al_dia: 4,
          sin_fecha: 5,
        }
        const diff = (priorityOrder[a.estadoTemporal] ?? 9) - (priorityOrder[b.estadoTemporal] ?? 9)
        if (diff !== 0) return diff
        // Si tienen igual prioridad, ordenar por días restantes
        return (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999)
      }
      if (sortField === 'dia') {
        return (a.diaCobro ?? 999) - (b.diaCobro ?? 999)
      }
      if (sortField === 'nombre') {
        return (a.cliente.nombre || '').localeCompare(b.cliente.nombre || '')
      }
      if (sortField === 'monto') {
        return b.montoMensual - a.montoMensual
      }
      return 0
    })
    return list
  }, [filtered, sortField])

  // Manejo de actualización inline de estado de pago
  const handleEstadoPagoChange = async (clienteId: string, nuevoEstado: EstadoPago) => {
    if (!clienteId) return
    setSavingState(prev => ({ ...prev, [clienteId]: true }))
    try {
      await updateCliente(clienteId, { estadoPago: nuevoEstado })
      if (onUpdateCliente) {
        await onUpdateCliente(clienteId, { estadoPago: nuevoEstado })
      }
    } catch (err) {
      console.error('Error al actualizar estado de pago:', err)
    } finally {
      setSavingState(prev => ({ ...prev, [clienteId]: false }))
    }
  }

  // Manejo de actualización inline de fecha de inicio
  const handleFechaInicioChange = async (clienteId: string, nuevaFecha: string) => {
    if (!clienteId) return
    setEditingDateId(null)
    setSavingState(prev => ({ ...prev, [clienteId]: true }))
    try {
      // También podemos derivar diaVencimiento automáticamente si se define la fecha
      const dia = nuevaFecha ? parseInt(nuevaFecha.split('-')[2], 10) : undefined
      const updates: Partial<Cliente> = { fechaInicioProyecto: nuevaFecha }
      if (dia && !isNaN(dia)) {
        updates.diaVencimiento = dia
      }
      await updateCliente(clienteId, updates)
      if (onUpdateCliente) {
        await onUpdateCliente(clienteId, updates)
      }
    } catch (err) {
      console.error('Error al actualizar fecha de inicio:', err)
    } finally {
      setSavingState(prev => ({ ...prev, [clienteId]: false }))
    }
  }

  return (
    <section style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: compact ? '16px' : '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* ── Cabecera y Resumen ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: compact ? '0.9375rem' : '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              letterSpacing: '0.02em',
              margin: 0,
            }}>
              {title}
            </h2>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-dim)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              padding: '2px 8px',
              borderRadius: 99,
              fontWeight: 700,
            }}>
              {allSchedules.length} clientes
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
            margin: '4px 0 0',
            maxWidth: 720,
            lineHeight: 1.4,
          }}>
            {subtitle}
          </p>
        </div>

        {/* Resumen de KPIs rápidos */}
        {!hideHeaderStats && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Abonos Activos (MRR)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>
                {formatARS(stats.mrrTotal)}
              </span>
            </div>

            {stats.alertasCount > 0 && (
              <div style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: 8,
                padding: '6px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.625rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>
                  ⚠️ Vencidos / Pendientes
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 800, color: '#f87171' }}>
                  {stats.alertasCount} cuota{stats.alertasCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Barra de Filtros, Pestañas y Búsqueda ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        paddingBottom: 4,
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}>
        {/* Pestañas de estado */}
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {(
            [
              { id: 'produccion', label: 'En Producción', count: stats.enProduccionCount },
              { id: 'alertas', label: '⚠️ Vencidos/Pendientes', count: stats.alertasCount },
              { id: 'proximos', label: '⏰ Vencen pronto (7d)', count: stats.proximosCount },
              { id: 'al_dia', label: '✅ Al día', count: stats.alDiaCount },
              { id: 'todos', label: 'Todos', count: stats.total },
              { id: 'sin_fecha', label: 'Sin Fecha', count: stats.sinFechaCount },
            ] as const
          ).map(tab => {
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  background: active ? 'var(--color-accent-dim)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  background: active ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  padding: '1px 5px',
                  borderRadius: 99,
                  fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Buscador y selector de orden */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar por cliente o rubro..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '5px 10px',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                color: 'var(--color-star)',
                outline: 'none',
                width: 200,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortField}
            onChange={e => setSortField(e.target.value as SortField)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '5px 8px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--color-star)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="urgencia">Ordenar: Urgencia / Vencimiento</option>
            <option value="dia">Ordenar: Día de cobro (1-31)</option>
            <option value="nombre">Ordenar: Nombre (A-Z)</option>
            <option value="monto">Ordenar: Monto mayor</option>
          </select>
        </div>
      </div>

      {/* ── Tabla de Fechas de Pago ── */}
      <div style={{
        overflowX: 'auto',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-ui)',
        }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <th style={{ padding: '10px 14px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cliente
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Situación
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fecha Inicio
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Día de Cobro
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Próximo Vencimiento
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Abono Mensual
              </th>
              <th style={{ padding: '10px 12px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estado de Pago
              </th>
              <th style={{ padding: '10px 14px', color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-faint)' }}>
                  No se encontraron clientes con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              sorted.map((item) => {
                const c = item.cliente
                const id = c.id || ''
                const isSaving = savingState[id]
                const situacionColor = SITUACION_COLORS[c.situacion] || 'var(--color-faint)'
                const estadoPagoVal = c.estadoPago || ''
                const pagoColor = ESTADO_PAGO_COLORS[estadoPagoVal] || 'var(--color-faint)'

                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Cliente */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Link
                            href={`/admin/clientes/${id}`}
                            title="Ver ficha completa"
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontWeight: 700,
                              color: 'var(--color-star)',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                            }}
                          >
                            {c.nombre}
                          </Link>
                          {c.url && (
                            <a
                              href={c.url.startsWith('http') ? c.url : `https://${c.url}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir web en vivo"
                              style={{
                                color: 'var(--color-accent)',
                                textDecoration: 'none',
                                fontSize: '0.6875rem',
                              }}
                            >
                              ↗
                            </a>
                          )}
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                          {c.rubro || 'Desarrollo web'}
                        </span>
                      </div>
                    </td>

                    {/* Situación */}
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: situacionColor,
                        background: `${situacionColor}15`,
                        border: `1px solid ${situacionColor}35`,
                        borderRadius: 99,
                        padding: '2px 8px',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.04em',
                      }}>
                        {SITUACION_LABELS[c.situacion] || c.situacion || '—'}
                      </span>
                    </td>

                    {/* Fecha Inicio (la fecha que tienen en fila situación) */}
                    <td style={{ padding: '10px 12px' }}>
                      {editingDateId === id ? (
                        <input
                          type="date"
                          autoFocus
                          defaultValue={c.fechaInicioProyecto || ''}
                          onBlur={e => handleFechaInicioChange(id, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleFechaInicioChange(id, e.currentTarget.value)
                            if (e.key === 'Escape') setEditingDateId(null)
                          }}
                          style={{
                            background: 'rgba(0, 229, 255, 0.08)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: 6,
                            padding: '3px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--color-star)',
                            outline: 'none',
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingDateId(id)}
                          title="Hacer clic para editar fecha de inicio"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid transparent',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: c.fechaInicioProyecto ? 'var(--color-star)' : 'var(--color-faint)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
                        >
                          <span>{item.fechaInicioFormatted}</span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--color-faint)', opacity: 0.6 }}>✏️</span>
                        </div>
                      )}
                    </td>

                    {/* Día de Cobro */}
                    <td style={{ padding: '10px 12px' }}>
                      {item.diaCobro !== null ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.08)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            padding: '2px 8px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap',
                          }}>
                            📅 Día {item.diaCobro}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)' }}>
                          Sin definir
                        </span>
                      )}
                    </td>

                    {/* Próximo Vencimiento / Countdown */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-star)',
                        }}>
                          {item.proximoVencimientoFormatted}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: item.badgeColor,
                          background: item.badgeBg,
                          border: `1px solid ${item.badgeBorder}`,
                          padding: '1px 7px',
                          borderRadius: 99,
                          whiteSpace: 'nowrap',
                        }}>
                          {item.badgeLabel}
                        </span>
                      </div>
                    </td>

                    {/* Abono Mensual */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: item.montoMensual > 0 ? '#4ade80' : 'var(--color-muted)',
                        }}>
                          {item.montoMensual > 0 ? `${formatARS(item.montoMensual)}/mes` : (c.plan || 'Sin cuota fija')}
                        </span>
                        {c.montoPagoUnico ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-faint)' }}>
                            Único: {formatARS(c.montoPagoUnico)}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Estado de Pago (Selector interactivo) */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <select
                          disabled={isSaving}
                          value={c.estadoPago || ''}
                          onChange={e => handleEstadoPagoChange(id, e.target.value as EstadoPago)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: pagoColor,
                            background: `${pagoColor}15`,
                            border: `1px solid ${pagoColor}50`,
                            borderRadius: 6,
                            padding: '3px 8px',
                            cursor: isSaving ? 'wait' : 'pointer',
                            outline: 'none',
                            textTransform: 'uppercase',
                          }}
                        >
                          <option value="AL_DIA" style={{ background: '#0f172a', color: '#4ade80' }}>
                            🟢 Al día
                          </option>
                          <option value="PENDIENTE" style={{ background: '#0f172a', color: '#f59e0b' }}>
                            🟡 Pendiente
                          </option>
                          <option value="VENCIDO" style={{ background: '#0f172a', color: '#f87171' }}>
                            🔴 Vencido
                          </option>
                          <option value="" style={{ background: '#0f172a', color: 'var(--color-muted)' }}>
                            ⚪ Sin registrar
                          </option>
                        </select>
                        {isSaving && (
                          <span style={{ marginLeft: 6, fontSize: '0.6875rem', color: 'var(--color-accent)' }}>
                            ⌛
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        {item.wspUrl && (
                          <a
                            href={item.wspUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Enviar recordatorio o saludo por WhatsApp"
                            style={{
                              padding: '4px 8px',
                              background: 'rgba(37, 211, 102, 0.1)',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              borderRadius: 6,
                              color: '#25d366',
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            💬 WSP
                          </a>
                        )}

                        <Link
                          href={`/admin/clientes/${id}`}
                          title="Abrir ficha completa"
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 6,
                            color: 'var(--color-star)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          Ficha
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pie de tabla con ayuda rápida */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '0.6875rem',
        color: 'var(--color-faint)',
        fontFamily: 'var(--font-ui)',
        paddingTop: 4,
      }}>
        <span>
          💡 <strong>Tip:</strong> Podés hacer clic en la <strong>Fecha Inicio</strong> para cambiarla directamente, o cambiar el <strong>Estado de Pago</strong> desde el desplegable.
        </span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          Mostrando {sorted.length} de {allSchedules.length} clientes
        </span>
      </div>
    </section>
  )
}
