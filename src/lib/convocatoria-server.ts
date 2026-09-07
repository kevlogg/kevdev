import fs from 'fs'
import path from 'path'
import { adminDb, FieldValue } from '@/lib/firebase-admin'

export interface PostulacionRecord {
  id: string
  nombre: string
  negocio: string
  whatsapp: string
  instagram: string
  dedicacion: string
  antiguedad: string
  canalVentas: string
  trabaPrincipal: string
  porQueSeleccionado: string
  materialesListos: string
  estado: 'pendiente' | 'en_revision' | 'seleccionado' | 'descartado'
  notasAdmin: string
  creadoEn: string | any
}

// In-memory + persistent file fallback store for zero data loss
const FALLBACK_FILE = path.join(process.cwd(), '.data-convocatoria.json')
let inMemoryStore: PostulacionRecord[] = []

function loadFallbackStore(): PostulacionRecord[] {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.warn('[Convocatoria Server] Error loading fallback store file:', err)
  }
  return inMemoryStore
}

function saveFallbackStore(list: PostulacionRecord[]) {
  inMemoryStore = list
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), 'utf8')
  } catch (err) {
    console.warn('[Convocatoria Server] Error saving fallback store file:', err)
  }
}

export async function savePostulacionServer(data: Omit<PostulacionRecord, 'id' | 'creadoEn'>): Promise<string> {
  const nowIso = new Date().toISOString()
  const fallbackId = 'postulacion-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)

  const record: PostulacionRecord = {
    ...data,
    id: fallbackId,
    creadoEn: nowIso,
  }

  let docId = ''

  // 1. Try Firestore Admin SDK
  try {
    const docRef = await adminDb.collection('convocatoria_postulantes').add({
      ...data,
      creadoEn: FieldValue.serverTimestamp(),
    })
    docId = docRef.id
    record.id = docId
  } catch (err) {
    console.warn('[Convocatoria Server] Firestore Admin write warning:', err)
  }

  // 2. Try Client SDK fallback to guarantee creation in Firestore Console
  try {
    const { addPostulacionImpulso } = await import('@/lib/firestore')
    const cliDocId = await addPostulacionImpulso(data)
    if (!docId) docId = cliDocId
  } catch (cliErr) {
    console.warn('[Convocatoria Server] Client SDK write warning:', cliErr)
  }

  // 3. Always update local fallback store
  const store = loadFallbackStore()
  store.unshift(record)
  saveFallbackStore(store)

  return docId || fallbackId
}

export async function getPostulacionesServer(): Promise<PostulacionRecord[]> {
  const result: PostulacionRecord[] = []
  const idsSet = new Set<string>()

  // 1. Try Firestore Admin SDK
  try {
    const snap = await adminDb.collection('convocatoria_postulantes').orderBy('creadoEn', 'desc').get()
    snap.docs.forEach((d) => {
      idsSet.add(d.id)
      const data = d.data()
      let creadoEnVal = new Date().toISOString()
      if (data.creadoEn && typeof data.creadoEn.toDate === 'function') {
        creadoEnVal = data.creadoEn.toDate().toISOString()
      } else if (data.creadoEn) {
        creadoEnVal = new Date(data.creadoEn).toISOString()
      }

      result.push({
        id: d.id,
        nombre: data.nombre || '',
        negocio: data.negocio || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        dedicacion: data.dedicacion || '',
        antiguedad: data.antiguedad || 'Menos de 6 meses',
        canalVentas: data.canalVentas || 'Mensajes de WhatsApp',
        trabaPrincipal: data.trabaPrincipal || '',
        porQueSeleccionado: data.porQueSeleccionado || '',
        materialesListos: data.materialesListos || 'Sí, tengo todo listo para arrancar',
        estado: data.estado || 'pendiente',
        notasAdmin: data.notasAdmin || '',
        creadoEn: creadoEnVal,
      })
    })
  } catch (err) {
    console.warn('[Convocatoria Server] Firestore Admin read warning, falling back to local store:', err)
  }

  // 2. Merge items from fallback store if not already present
  const store = loadFallbackStore()
  store.forEach((item) => {
    if (!idsSet.has(item.id)) {
      idsSet.add(item.id)
      result.push(item)
    }
  })

  return result
}

export async function updatePostulacionServer(id: string, updates: Partial<PostulacionRecord>): Promise<void> {
  // Update Firestore Admin
  try {
    await adminDb.collection('convocatoria_postulantes').doc(id).update(updates)
  } catch (err) {
    console.warn('[Convocatoria Server] Admin update warning:', err)
  }

  // Update Fallback Store
  const store = loadFallbackStore()
  const idx = store.findIndex((p) => p.id === id)
  if (idx !== -1) {
    store[idx] = { ...store[idx], ...updates }
    saveFallbackStore(store)
  }
}

export async function deletePostulacionServer(id: string): Promise<void> {
  // Delete Firestore Admin
  try {
    await adminDb.collection('convocatoria_postulantes').doc(id).delete()
  } catch (err) {
    console.warn('[Convocatoria Server] Admin delete warning:', err)
  }

  // Delete from Fallback Store
  const store = loadFallbackStore()
  const filtered = store.filter((p) => p.id !== id)
  saveFallbackStore(filtered)
}
