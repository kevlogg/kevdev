import type { DemoEstado, Situacion } from '@/lib/firestore'

/* Fuente única de verdad para colores/etiquetas de cliente, compartida
   entre /admin/clientes, /admin/clientes/[id] y /admin/dashboard. */

export const SITUACIONES: Situacion[] = ['', 'NO RESPONDIO', 'EN ESPERA', 'EN PRODUCCION', 'RECHAZADA']

export const SITUACION_LABELS: Record<Situacion, string> = {
  '':              'Sin estado',
  'NO RESPONDIO':  'No respondió',
  'EN ESPERA':     'En espera',
  'EN PRODUCCION': 'En producción',
  'RECHAZADA':     'Rechazada',
}

export const SITUACION_COLORS: Record<Situacion, string> = {
  'NO RESPONDIO':  '#a78bfa',
  'EN ESPERA':     '#fbbf24',
  'EN PRODUCCION': '#4ade80',
  'RECHAZADA':     '#f87171',
  '':              'var(--color-faint)',
}

/* Orden de embudo para el dashboard: de recién presentado a ganado/perdido.
   Distinto del orden de la tabla de /admin/clientes, que prioriza clientes activos. */
export const SITUACION_FUNNEL_ORDER: Situacion[] = ['NO RESPONDIO', 'EN ESPERA', 'EN PRODUCCION', 'RECHAZADA', '']

export const DEMO_LABELS: Record<DemoEstado, string> = {
  '':           'Sin demo',
  'SIN HACER':  'Sin hacer',
  PRESENTADA:   'Presentada',
  HECHA:        'Hecha',
}

export const DEMO_COLORS: Record<DemoEstado, string> = {
  'SIN HACER': '#f87171',
  PRESENTADA:  '#4ade80',
  HECHA:       '#fbbf24',
  '':          'var(--color-faint)',
}

export const ESTADO_PAGO_LABELS: Record<string, string> = {
  'AL_DIA':    'Al día',
  'PENDIENTE': 'Pendiente',
  'VENCIDO':   'Vencido',
  '':          'Sin registrar',
}

export const ESTADO_PAGO_COLORS: Record<string, string> = {
  'AL_DIA':    '#4ade80',
  'PENDIENTE': '#f59e0b',
  'VENCIDO':   '#f87171',
  '':          'var(--color-faint)',
}

export const METODO_COBRO_LABELS: Record<string, string> = {
  'MP_SUSCRIPCION': 'Mercado Pago (Suscripción)',
  'MANUAL':         'Manual / Transferencia',
  'MP_LINK':        'Mercado Pago (Link)',
  '':               'Manual / Transferencia',
}

export const METODO_COBRO_BADGES: Record<string, { label: string; shortLabel: string; color: string; bg: string; border: string }> = {
  'MP_SUSCRIPCION': {
    label: '💳 MP Débito Automático',
    shortLabel: '💳 MP Suscripción',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  'MP_LINK': {
    label: '🔗 MP Link de Pago',
    shortLabel: '🔗 MP Link',
    color: '#00e5ff',
    bg: 'rgba(0, 229, 255, 0.1)',
    border: 'rgba(0, 229, 255, 0.25)',
  },
  'MANUAL': {
    label: '🏦 Cobro Manual / Transferencia',
    shortLabel: '🏦 Manual',
    color: 'var(--color-muted)',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'var(--color-border)',
  },
  '': {
    label: '🏦 Cobro Manual / Transferencia',
    shortLabel: '🏦 Manual',
    color: 'var(--color-muted)',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'var(--color-border)',
  },
}


