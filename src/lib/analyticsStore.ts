import fs from 'fs'
import path from 'path'
import os from 'os'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db, ensureServerAuth } from '@/lib/firebase'

export interface AnalyticsEvent {
  id?: string
  site: string
  eventType: 'pageview' | 'button_click' | 'form_submit' | 'demo_request' | 'quote_used'
  buttonId?: string
  path: string
  device?: 'desktop' | 'mobile'
  source?: 'instagram' | 'google' | 'whatsapp' | 'direct' | 'referral' | string
  metadata?: Record<string, any>
  createdAt: string
}

export interface AnalyticsSummary {
  totalPageviews: number
  uniqueVisitors: number
  desktopPct: number
  mobilePct: number
  conversionRate: number
  totalLeads: number
  trackingSince: string
  trafficSources: { name: string; count: number; percentage: number }[]
  topPages: { path: string; views: number }[]
  topButtons: { buttonId: string; label: string; clicks: number }[]
  conversionFunnel: { step: string; count: number; pct: number }[]
  recentEvents: { id: string; type: string; path: string; time: string; device: string; label?: string }[]
  prevPeriodPageviews?: number
}

const FILE_PATH = path.join(os.tmpdir(), 'kevdev_analytics_events.json')
const FIRESTORE_PROJECT = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kevdev-1234'
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents`

/* ── Firestore REST helpers ──────────────────────────────────────────── */

function normalizeSource(src: string): string {
  const map: Record<string, string> = {
    ig: 'instagram',
    instagram: 'instagram',
    google: 'google_organico',
    google_organico: 'google_organico',
    buscador_organico: 'buscador_organico',
    direct: 'directo',
    directo: 'directo',
    whatsapp: 'whatsapp',
    facebook: 'facebook',
    linkedin: 'linkedin',
    twitter: 'twitter',
  }
  const lower = (src || 'directo').toLowerCase().trim()
  return map[lower] || lower
}

function toFirestoreFields(event: AnalyticsEvent): Record<string, unknown> {
  const fields: Record<string, unknown> = {
    site:      { stringValue: event.site || 'kevdev' },
    eventType: { stringValue: event.eventType },
    path:      { stringValue: event.path || '/' },
    device:    { stringValue: event.device || 'desktop' },
    source:    { stringValue: normalizeSource(event.source || 'directo') },
    buttonId:  { stringValue: event.buttonId || '' },
    createdAt: { stringValue: event.createdAt },
  }
  if (event.id) fields['id'] = { stringValue: event.id }
  if (event.metadata) {
    try {
      fields['metadata'] = {
        mapValue: {
          fields: Object.fromEntries(
            Object.entries(event.metadata).map(([k, v]) => [k, { stringValue: String(v ?? '') }])
          ),
        },
      }
    } catch { /* skip bad metadata */ }
  }
  return fields
}

function fromFirestoreDoc(doc: { name: string; fields?: Record<string, any> }): AnalyticsEvent {
  const f = doc.fields || {}
  const parseStr = (v: any) => v?.stringValue || v?.integerValue || v?.doubleValue || ''
  const parseMeta = (v: any): Record<string, string> => {
    try {
      const inner = v?.mapValue?.fields || {}
      return Object.fromEntries(Object.entries(inner).map(([k, val]: [string, any]) => [k, String(parseStr(val))]))
    } catch { return {} }
  }
  return {
    id:        doc.name.split('/').pop() || '',
    site:      String(parseStr(f.site) || 'kevdev'),
    eventType: (String(parseStr(f.eventType) || 'pageview')) as AnalyticsEvent['eventType'],
    path:      String(parseStr(f.path) || '/'),
    device:    (String(parseStr(f.device) || 'desktop')) as 'desktop' | 'mobile',
    source:    String(parseStr(f.source) || 'directo'),
    buttonId:  String(parseStr(f.buttonId) || ''),
    createdAt: String(parseStr(f.createdAt) || new Date().toISOString()),
    metadata:  parseMeta(f.metadata),
  }
}

async function writeEventToFirestoreRest(event: AnalyticsEvent): Promise<string> {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/analyticsEvents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFirestoreFields(event) }),
    })
    if (!res.ok) {
      console.warn('[Analytics REST] Write failed:', res.status, await res.text().catch(() => ''))
      return ''
    }
    const data = await res.json()
    return String(data.name?.split('/').pop() || '')
  } catch (e) {
    console.warn('[Analytics REST] Write error:', e)
    return ''
  }
}

async function fetchEventsFromFirestoreRest(): Promise<AnalyticsEvent[]> {
  const events: AnalyticsEvent[] = []
  try {
    let pageToken = ''
    let hasMore = true
    while (hasMore) {
      const url = `${FIRESTORE_BASE}/analyticsEvents?pageSize=500${pageToken ? `&pageToken=${pageToken}` : ''}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) break
      const data = await res.json()
      if (data.documents?.length) {
        events.push(...data.documents.map(fromFirestoreDoc))
      }
      if (data.nextPageToken) {
        pageToken = data.nextPageToken
      } else {
        hasMore = false
      }
    }
  } catch (e) {
    console.warn('[Analytics REST] Fetch error:', e)
  }
  return events
}

/* ── Local /tmp fallback ─────────────────────────────────────────────── */

function readLocalEvents(): AnalyticsEvent[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')) as AnalyticsEvent[]
    }
  } catch (e) {
    console.warn('[Analytics] Error reading local file:', e)
  }
  return []
}

function saveLocalEvent(event: AnalyticsEvent) {
  try {
    const events = readLocalEvents()
    events.push(event)
    fs.writeFileSync(FILE_PATH, JSON.stringify(events.slice(-5000), null, 2), 'utf8')
  } catch (e) {
    console.warn('[Analytics] Error saving local event:', e)
  }
}

/* ── Public API ──────────────────────────────────────────────────────── */

export async function addAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<string> {
  const newEvent: AnalyticsEvent = {
    ...eventData,
    source: normalizeSource(eventData.source || 'directo'),
    id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  }

  // 1. Primary: Firestore REST API — always reliable, no auth required
  const firestoreId = await writeEventToFirestoreRest(newEvent)
  if (firestoreId) newEvent.id = firestoreId

  // 2. Fallback: local /tmp (hot cache within same serverless instance)
  saveLocalEvent(newEvent)

  // 3. Legacy Client SDK — best effort, usually fails silently, REST already saved above
  try {
    await ensureServerAuth()
    await addDoc(collection(db, 'analyticsEvents'), { ...newEvent })
  } catch { /* expected — REST API already persisted the event */ }

  return newEvent.id || ''
}

let memoryEventsCache: AnalyticsEvent[] = []

export async function getStoreAnalyticsSummary(periodDays: number = 30): Promise<AnalyticsSummary> {
  // 1. Primary: Firestore REST API — always has the full durable dataset
  let events = await fetchEventsFromFirestoreRest()

  // 2. Merge with local /tmp and in-memory cache (catches very recent events)
  const localEvents = readLocalEvents()
  if (localEvents.length > 0 || memoryEventsCache.length > 0) {
    const eventMap = new Map<string, AnalyticsEvent>()
    events.forEach(e => e.id && eventMap.set(e.id, e))
    localEvents.forEach(e => e.id && !eventMap.has(e.id) && eventMap.set(e.id, e))
    memoryEventsCache.forEach(e => e.id && !eventMap.has(e.id) && eventMap.set(e.id, e))
    events = Array.from(eventMap.values())
  }

  // 3. Legacy Client SDK merge — optional, usually fails
  try {
    await ensureServerAuth()
    const snap = await getDocs(collection(db, 'analyticsEvents'))
    if (!snap.empty) {
      const eventMap = new Map<string, AnalyticsEvent>()
      events.forEach(e => e.id && eventMap.set(e.id, e))
      snap.docs.forEach(d => {
        const ev = { id: d.id, ...d.data() } as AnalyticsEvent
        if (ev.id && !eventMap.has(ev.id)) eventMap.set(ev.id, ev)
      })
      events = Array.from(eventMap.values())
    }
  } catch { /* expected */ }

  memoryEventsCache = events

  /* ── Filter by period ── */
  const now    = new Date()
  const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
  const filtered = events.filter(ev => {
    if (!ev.createdAt) return true
    return new Date(ev.createdAt) >= cutoff
  })

  /* ── Compute metrics ── */
  const pageviewEvents  = filtered.filter(e => e.eventType === 'pageview')
  const totalPageviews  = pageviewEvents.length

  const visitorSet = new Set<string>()
  filtered.forEach(ev => {
    const vId = (ev.metadata as any)?.visitorId || ev.id || 'v_anon'
    visitorSet.add(String(vId))
  })
  const uniqueVisitors = filtered.length > 0 ? visitorSet.size : 0

  const mobileCount  = filtered.filter(e => e.device === 'mobile').length
  const desktopCount = filtered.filter(e => e.device === 'desktop').length
  const totalDev     = mobileCount + desktopCount
  const mobilePct    = totalDev > 0 ? Math.round((mobileCount  / totalDev) * 100) : 0
  const desktopPct   = totalDev > 0 ? 100 - mobilePct : 0

  const SOURCE_LABELS: Record<string, string> = {
    google_organico:   'Google (Búsqueda Orgánica)',
    buscador_organico: 'Buscador (Bing / DuckDuckGo)',
    instagram:         'Instagram',
    whatsapp:          'WhatsApp',
    facebook:          'Facebook',
    linkedin:          'LinkedIn',
    twitter:           'Twitter / X',
    directo:           'Directo (Navegador)',
  }

  const sourcesCount: Record<string, number> = {}
  filtered.forEach(ev => {
    const src = normalizeSource(ev.source || 'directo')
    sourcesCount[src] = (sourcesCount[src] || 0) + 1
  })

  const totalSrcEvents = filtered.length || 1
  const trafficSources = Object.entries(sourcesCount)
    .map(([name, count]) => ({
      name: SOURCE_LABELS[name] || (name.charAt(0).toUpperCase() + name.slice(1)),
      count,
      percentage: Math.round((count / totalSrcEvents) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  const pageMap: Record<string, number> = {}
  pageviewEvents.forEach(ev => {
    const p = ev.path || '/'
    pageMap[p] = (pageMap[p] || 0) + 1
  })
  const topPages = Object.entries(pageMap)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)

  const buttonMap: Record<string, { label: string; clicks: number }> = {}
  filtered.forEach(ev => {
    if (ev.eventType === 'button_click' || ev.eventType === 'form_submit' || ev.eventType === 'demo_request') {
      const bId   = ev.buttonId || ev.eventType || 'btn_generic'
      const label = (ev.metadata as any)?.label || ev.buttonId || 'Interacción de Lead'
      if (!buttonMap[bId]) buttonMap[bId] = { label, clicks: 0 }
      buttonMap[bId].clicks += 1
    }
  })
  const topButtons = Object.entries(buttonMap)
    .map(([buttonId, data]) => ({ buttonId, label: data.label, clicks: data.clicks }))
    .sort((a, b) => b.clicks - a.clicks)

  const totalLeads     = topButtons.reduce((a, b) => a + b.clicks, 0)
  const rawRate        = uniqueVisitors > 0 ? (totalLeads / uniqueVisitors) * 100 : 0
  const conversionRate = parseFloat(Math.min(rawRate, 100).toFixed(1))

  const recentEvents = [...filtered]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)
    .map(ev => ({
      id:     ev.id || Math.random().toString(36),
      type:   ev.eventType,
      path:   ev.path || '/',
      time:   ev.createdAt
        ? new Date(ev.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Reciente',
      device: ev.device || 'desktop',
      label:  (ev.metadata as any)?.label || ev.buttonId,
    }))

  // Previous period pageviews for comparison
  const prevCutoff = new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000)
  const prevPeriodPageviews = events
    .filter(ev => ev.eventType === 'pageview' && ev.createdAt)
    .filter(ev => {
      const d = new Date(ev.createdAt)
      return d >= prevCutoff && d < cutoff
    }).length

  const trackingSince = (() => {
    const allWithDate = events.filter(e => e.createdAt)
    if (!allWithDate.length) return '1 de Septiembre de 2026'
    const oldest = allWithDate.reduce((min, e) => e.createdAt < min ? e.createdAt : min, allWithDate[0].createdAt)
    return new Date(oldest).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  })()

  return {
    totalPageviews,
    uniqueVisitors,
    desktopPct,
    mobilePct,
    conversionRate,
    totalLeads,
    trackingSince,
    trafficSources,
    topPages,
    topButtons,
    conversionFunnel: [
      { step: 'Visitas Totales',     count: totalPageviews, pct: 100 },
      { step: 'Visitantes Únicos',   count: uniqueVisitors, pct: totalPageviews > 0 ? Math.round((uniqueVisitors / totalPageviews) * 100) : 0 },
      { step: 'Interacción / Leads', count: totalLeads,     pct: uniqueVisitors > 0 ? Math.round((totalLeads / uniqueVisitors) * 100) : 0 },
    ],
    recentEvents,
    prevPeriodPageviews,
  }
}
