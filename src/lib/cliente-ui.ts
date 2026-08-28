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
  PRESENTADA:  '#fbbf24',
  HECHA:       '#4ade80',
  '':          'var(--color-faint)',
}
