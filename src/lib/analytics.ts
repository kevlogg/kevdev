import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface AnalyticsEvent {
  id?: string
  site: string // 'kevdev', 'dulce-hogar', 'don-lorenzo', etc.
  eventType: 'pageview' | 'button_click' | 'form_submit' | 'demo_request' | 'quote_used'
  buttonId?: string
  path: string
  device?: 'desktop' | 'mobile'
  source?: 'instagram' | 'google' | 'whatsapp' | 'direct' | 'referral'
  metadata?: Record<string, any>
  timestamp?: Timestamp | any
  createdAt?: string
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

/* Registrar evento de telemetría */
export async function recordAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'analyticsEvents'), {
      ...event,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    })
    return ref.id
  } catch (error) {
    console.error('Error registrando evento de analítica:', error)
    return ''
  }
}

/* Consultar métricas de analítica (100% datos reales desde Firestore analyticsEvents) */
export async function getAnalyticsSummary(periodDays: number = 30): Promise<AnalyticsSummary> {
  let events: AnalyticsEvent[] = []
  try {
    const snap = await getDocs(collection(db, 'analyticsEvents'))
    events = snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalyticsEvent))
  } catch (e) {
    console.warn('Error leyendo eventos reales de Firestore:', e)
  }

  // Filtrar eventos por periodo de días si tienen fecha
  const now = new Date()
  const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
  
  const filteredEvents = events.filter(ev => {
    if (!ev.createdAt) return true
    const evDate = new Date(ev.createdAt)
    return evDate >= cutoff
  })

  const pageviewEvents = filteredEvents.filter(e => e.eventType === 'pageview')
  const totalPageviews = pageviewEvents.length > 0 ? pageviewEvents.length : filteredEvents.length

  // Calcular visitantes únicos basados en visitor_id o ids de evento
  const visitorSet = new Set<string>()
  filteredEvents.forEach(ev => {
    const vId = ev.metadata?.visitorId || ev.id || Math.random().toString()
    visitorSet.add(vId)
  })
  const uniqueVisitors = filteredEvents.length > 0 ? visitorSet.size : 0

  // Desglose de dispositivos
  const mobileCount = filteredEvents.filter(e => e.device === 'mobile').length
  const desktopCount = filteredEvents.filter(e => e.device === 'desktop').length
  const totalDev = mobileCount + desktopCount
  const mobilePct = totalDev > 0 ? Math.round((mobileCount / totalDev) * 100) : 0
  const desktopPct = totalDev > 0 ? 100 - mobilePct : 0

  // Fuentes de tráfico reales
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

  // Páginas más vistas reales
  const pageMap: Record<string, number> = {}
  filteredEvents.forEach(ev => {
    const p = ev.path || '/'
    pageMap[p] = (pageMap[p] || 0) + 1
  })

  const topPages = Object.entries(pageMap)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)

  // Clics en botones reales
  const buttonMap: Record<string, { label: string; clicks: number }> = {}
  filteredEvents.forEach(ev => {
    if (ev.eventType === 'button_click' || ev.buttonId) {
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
