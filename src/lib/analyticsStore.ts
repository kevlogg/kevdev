import fs from 'fs'
import path from 'path'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface AnalyticsEvent {
  id?: string
  site: string
  eventType: 'pageview' | 'button_click' | 'form_submit' | 'demo_request' | 'quote_used'
  buttonId?: string
  path: string
  device?: 'desktop' | 'mobile'
  source?: 'instagram' | 'google' | 'whatsapp' | 'direct' | 'referral'
  metadata?: Record<string, any>
  createdAt: string
}

export interface AnalyticsSummary {
  totalPageviews: number
  uniqueVisitors: number
  desktopPct: number
  mobilePct: number
  trafficSources: { name: string; count: number; percentage: number }[]
  topPages: { path: string; views: number }[]
  topButtons: { buttonId: string; label: string; clicks: number }[]
  conversionFunnel: { step: string; count: number; pct: number }[]
}

import os from 'os'

const FILE_PATH = path.join(os.tmpdir(), 'kevdev_analytics_events.json')

// Leer eventos persistidos del servidor
function readLocalEvents(): AnalyticsEvent[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8')
      return JSON.parse(data) as AnalyticsEvent[]
    }
  } catch (e) {
    console.warn('Error leyendo archivo local de analítica:', e)
  }
  return []
}

// Guardar evento localmente
function saveLocalEvent(event: AnalyticsEvent) {
  try {
    const events = readLocalEvents()
    events.push(event)
    const trimmed = events.slice(-5000)
    fs.writeFileSync(FILE_PATH, JSON.stringify(trimmed, null, 2), 'utf8')
  } catch (e) {
    console.warn('Error guardando evento localmente:', e)
  }
}

// Registrar nuevo evento
export async function addAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<string> {
  const newEvent: AnalyticsEvent = {
    ...eventData,
    id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  }

  // 1. Guardar en memoria/tmp local
  saveLocalEvent(newEvent)

  // 2. Guardar permanentemente en Firestore
  try {
    await addDoc(collection(db, 'analyticsEvents'), {
      ...newEvent,
    })
  } catch (e) {
    console.warn('Advertencia guardando evento en Firestore:', e)
  }

  return newEvent.id || ''
}

// Memory cache to preserve metrics across transient cold starts or Firestore hiccups
let memoryEventsCache: AnalyticsEvent[] = []

// Obtener resumen de analítica
export async function getStoreAnalyticsSummary(periodDays: number = 30): Promise<AnalyticsSummary> {
  let events = readLocalEvents()

  // Fusionar con cache en memoria
  if (memoryEventsCache.length > 0) {
    const eventMap = new Map<string, AnalyticsEvent>()
    events.forEach(e => e.id && eventMap.set(e.id, e))
    memoryEventsCache.forEach(e => e.id && eventMap.set(e.id, e))
    events = Array.from(eventMap.values())
  }

  // Intentar consultar eventos reales de Firestore
  try {
    const snap = await getDocs(collection(db, 'analyticsEvents'))
    if (!snap.empty) {
      const firestoreEvents = snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalyticsEvent))
      const eventMap = new Map<string, AnalyticsEvent>()
      events.forEach(e => e.id && eventMap.set(e.id, e))
      firestoreEvents.forEach(e => e.id && eventMap.set(e.id, e))
      events = Array.from(eventMap.values())
      // Actualizar cache en memoria
      memoryEventsCache = events
    }
  } catch (e) {
    console.warn('Usando respaldo de analítica en memoria/local:', e)
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

  const filteredEvents = events.filter(ev => {
    if (!ev.createdAt) return true
    const evDate = new Date(ev.createdAt)
    return evDate >= cutoff
  })

  const pageviewEvents = filteredEvents.filter(e => e.eventType === 'pageview')
  const totalPageviews = pageviewEvents.length

  const visitorSet = new Set<string>()
  filteredEvents.forEach(ev => {
    const vId = ev.metadata?.visitorId || 'visitante_unico_default'
    visitorSet.add(vId)
  })
  const uniqueVisitors = filteredEvents.length > 0 ? visitorSet.size : 0

  const mobileCount = filteredEvents.filter(e => e.device === 'mobile').length
  const desktopCount = filteredEvents.filter(e => e.device === 'desktop').length
  const totalDev = mobileCount + desktopCount
  const mobilePct = totalDev > 0 ? Math.round((mobileCount / totalDev) * 100) : 0
  const desktopPct = totalDev > 0 ? 100 - mobilePct : 0

  const sourcesCount: Record<string, number> = {}
  filteredEvents.forEach(ev => {
    const src = ev.source || 'directo'
    sourcesCount[src] = (sourcesCount[src] || 0) + 1
  })

  const totalSrcEvents = filteredEvents.length || 1
  const trafficSources = Object.entries(sourcesCount)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / totalSrcEvents) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  const pageMap: Record<string, number> = {}
  filteredEvents.forEach(ev => {
    const p = ev.path || '/'
    pageMap[p] = (pageMap[p] || 0) + 1
  })

  const topPages = Object.entries(pageMap)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)

  const buttonMap: Record<string, { label: string; clicks: number }> = {}
  filteredEvents.forEach(ev => {
    if (ev.eventType === 'button_click') {
      const bId = ev.buttonId || 'boton_desconocido'
      const label = ev.metadata?.label || ev.buttonId || 'Clic en Botón'
      if (!buttonMap[bId]) {
        buttonMap[bId] = { label, clicks: 0 }
      }
      buttonMap[bId].clicks += 1
    }
  })

  const topButtons = Object.entries(buttonMap)
    .map(([buttonId, data]) => ({ buttonId, label: data.label, clicks: data.clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  return {
    totalPageviews,
    uniqueVisitors,
    desktopPct,
    mobilePct,
    trafficSources,
    topPages,
    topButtons,
    conversionFunnel: [
      { step: 'Visitas Totales', count: totalPageviews, pct: 100 },
      { step: 'Visitantes Únicos', count: uniqueVisitors, pct: totalPageviews > 0 ? Math.round((uniqueVisitors / totalPageviews) * 100) : 0 },
      { step: 'Clics en Botones / CTAs', count: topButtons.reduce((a, b) => a + b.clicks, 0), pct: uniqueVisitors > 0 ? Math.round((topButtons.reduce((a, b) => a + b.clicks, 0) / uniqueVisitors) * 100) : 0 },
    ],
  }
}
