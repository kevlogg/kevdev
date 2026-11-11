import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db, ensureServerAuth } from '@/lib/firebase'

export type QrTarjetaStatus = 'unassigned' | 'active'

export interface QrTarjeta {
  code: string // ej: "001"
  targetUrl: string // URL de Google Reviews asignada
  clientName: string // Nombre del comercio o cliente
  status: QrTarjetaStatus // 'unassigned' | 'active'
  batchName: string // ej: "Lote #1"
  batchId?: string
  scanCount: number // contador de escaneos
  lastScannedAt?: string | null
  createdAt?: string
  updatedAt?: string
  notes?: string
}

export const BASE_REDIRECT_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kevdev.net.ar'

export function getCardRedirectUrl(code: string): string {
  const base = BASE_REDIRECT_URL.replace(/\/+$/, '')
  return `${base}/r/${code}`
}

/**
 * Obtener todas las tarjetas registradas
 */
export async function fetchTarjetas(): Promise<QrTarjeta[]> {
  await ensureServerAuth()
  const colRef = collection(db, 'qr_tarjetas')
  const q = query(colRef)
  const snap = await getDocs(q)

  const items: QrTarjeta[] = []
  snap.forEach((docSnap) => {
    const data = docSnap.data()
    items.push({
      code: docSnap.id,
      targetUrl: data.targetUrl || '',
      clientName: data.clientName || '',
      status: (data.status as QrTarjetaStatus) || (data.targetUrl ? 'active' : 'unassigned'),
      batchName: data.batchName || 'General',
      batchId: data.batchId || '',
      scanCount: data.scanCount || 0,
      lastScannedAt: data.lastScannedAt ? (typeof data.lastScannedAt === 'string' ? data.lastScannedAt : data.lastScannedAt.toDate?.().toISOString()) : null,
      createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate?.().toISOString()) : undefined,
      updatedAt: data.updatedAt ? (typeof data.updatedAt === 'string' ? data.updatedAt : data.updatedAt.toDate?.().toISOString()) : undefined,
      notes: data.notes || '',
    })
  })

  // Ordenar numéricamente por código (ej: 001, 002, 003...)
  items.sort((a, b) => {
    const numA = parseInt(a.code.replace(/\D/g, ''), 10)
    const numB = parseInt(b.code.replace(/\D/g, ''), 10)
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    return a.code.localeCompare(b.code)
  })

  return items
}

/**
 * Crear un lote de tarjetas correlativas
 */
export async function createBatchTarjetas(
  count: number,
  batchName: string = ''
): Promise<{ created: QrTarjeta[]; startCode: string; endCode: string }> {
  await ensureServerAuth()
  const existing = await fetchTarjetas()

  // Buscar el número más alto existente
  let maxNumber = 0
  for (const t of existing) {
    const numeric = parseInt(t.code.replace(/\D/g, ''), 10)
    if (!isNaN(numeric) && numeric > maxNumber) {
      maxNumber = numeric
    }
  }

  const batchId = `batch_${Date.now()}`
  const finalBatchName =
    batchName.trim() || `Lote #${new Date().toLocaleDateString('es-AR')}`

  const batch = writeBatch(db)
  const created: QrTarjeta[] = []

  const startNum = maxNumber + 1
  const endNum = maxNumber + count

  // Si los números son menores a 1000, usamos 3 dígitos como mínimo (001, 002). Si supera 1000, 4 dígitos.
  const padLength = Math.max(3, String(endNum).length)

  for (let i = startNum; i <= endNum; i++) {
    const code = String(i).padStart(padLength, '0')
    const cardData: QrTarjeta = {
      code,
      targetUrl: '',
      clientName: '',
      status: 'unassigned',
      batchName: finalBatchName,
      batchId,
      scanCount: 0,
      lastScannedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
    }

    const docRef = doc(db, 'qr_tarjetas', code)
    batch.set(docRef, {
      ...cardData,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    })

    created.push(cardData)
  }

  await batch.commit()

  return {
    created,
    startCode: String(startNum).padStart(padLength, '0'),
    endCode: String(endNum).padStart(padLength, '0'),
  }
}

/**
 * Actualizar una tarjeta específica (asignar cliente, enlace de reseñas, estado)
 */
export async function updateTarjeta(
  code: string,
  updates: Partial<Pick<QrTarjeta, 'targetUrl' | 'clientName' | 'notes' | 'status'>>
): Promise<void> {
  await ensureServerAuth()
  const docRef = doc(db, 'qr_tarjetas', code)

  const normalizedUrl = updates.targetUrl ? updates.targetUrl.trim() : ''
  const newStatus: QrTarjetaStatus =
    updates.status !== undefined
      ? updates.status
      : normalizedUrl.length > 0
      ? 'active'
      : 'unassigned'

  await updateDoc(docRef, {
    ...updates,
    targetUrl: normalizedUrl,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
  })
}

/**
 * Eliminar una tarjeta específica por su código
 */
export async function deleteTarjeta(code: string): Promise<void> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return
  await ensureServerAuth()
  const docRef = doc(db, 'qr_tarjetas', cleanCode)
  await deleteDoc(docRef)
}

/**
 * Consulta ultrarrápida de una tarjeta individual vía Firestore REST API (~80ms)
 * Compatible con Node.js, Vercel Serverless y Edge Runtime.
 */
export async function getTarjetaFast(code: string): Promise<QrTarjeta | null> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return null

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kevdev-1234'
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAcoTvuqhnDegDQc49z4iH4GL3X0OHB5po'
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/qr_tarjetas/${cleanCode}?key=${apiKey}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1800),
      cache: 'no-store',
    })

    if (!res.ok) {
      return getTarjeta(cleanCode)
    }

    const data = await res.json()
    const fields = data?.fields || {}

    const targetUrl = fields?.targetUrl?.stringValue || ''
    const status = (fields?.status?.stringValue as QrTarjetaStatus) || (targetUrl ? 'active' : 'unassigned')

    return {
      code: cleanCode,
      targetUrl,
      clientName: fields?.clientName?.stringValue || '',
      status,
      batchName: fields?.batchName?.stringValue || 'General',
      batchId: fields?.batchId?.stringValue || '',
      scanCount: parseInt(fields?.scanCount?.integerValue || '0', 10),
      lastScannedAt: fields?.lastScannedAt?.stringValue || fields?.lastScannedAt?.timestampValue || null,
      createdAt: fields?.createdAt?.stringValue || undefined,
      updatedAt: fields?.updatedAt?.stringValue || undefined,
      notes: fields?.notes?.stringValue || '',
    }
  } catch (err) {
    console.warn(`[getTarjetaFast] Fallback a client SDK para #${cleanCode}:`, err)
    return getTarjeta(cleanCode)
  }
}

/**
 * Obtener una tarjeta individual por su código
 */
export async function getTarjeta(code: string): Promise<QrTarjeta | null> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return null

  try {
    const docRef = doc(db, 'qr_tarjetas', cleanCode)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      code: docSnap.id,
      targetUrl: data.targetUrl || '',
      clientName: data.clientName || '',
      status: (data.status as QrTarjetaStatus) || (data.targetUrl ? 'active' : 'unassigned'),
      batchName: data.batchName || 'General',
      batchId: data.batchId || '',
      scanCount: data.scanCount || 0,
      lastScannedAt: data.lastScannedAt
        ? typeof data.lastScannedAt === 'string'
          ? data.lastScannedAt
          : data.lastScannedAt.toDate?.().toISOString()
        : null,
      createdAt: data.createdAt
        ? typeof data.createdAt === 'string'
          ? data.createdAt
          : data.createdAt.toDate?.().toISOString()
        : undefined,
      updatedAt: data.updatedAt
        ? typeof data.updatedAt === 'string'
          ? data.updatedAt
          : data.updatedAt.toDate?.().toISOString()
        : undefined,
      notes: data.notes || '',
    }
  } catch (err) {
    console.error(`[getTarjeta] Error al consultar tarjeta #${cleanCode}:`, err)
    return null
  }
}

/**
 * Registrar escaneo e incrementar contador de forma atómica y no bloqueante
 */
export async function incrementTarjetaScan(code: string): Promise<void> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kevdev-1234'
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAcoTvuqhnDegDQc49z4iH4GL3X0OHB5po'
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`

  const body = {
    writes: [
      {
        transform: {
          document: `projects/${projectId}/databases/(default)/documents/qr_tarjetas/${cleanCode}`,
          fieldTransforms: [
            {
              fieldPath: 'scanCount',
              increment: { integerValue: '1' },
            },
            {
              fieldPath: 'lastScannedAt',
              setToServerValue: 'REQUEST_TIME',
            },
            {
              fieldPath: 'serverLastScannedAt',
              setToServerValue: 'REQUEST_TIME',
            },
          ],
        },
      },
    ],
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    })
  } catch (err) {
    console.warn(`[incrementTarjetaScan] Error registrando escaneo para #${cleanCode}:`, err)
  }
}

/**
 * Guardar o activar enlace de una tarjeta (incluso si no existía antes en Firestore)
 */
export async function saveTarjetaActivation(
  code: string,
  targetUrl: string,
  clientName: string = ''
): Promise<QrTarjeta> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) throw new Error('Código de tarjeta inválido')

  let normalizedUrl = (targetUrl || '').trim()
  if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`
  }

  await ensureServerAuth()
  const docRef = doc(db, 'qr_tarjetas', cleanCode)
  const docSnap = await getDoc(docRef)

  const nowIso = new Date().toISOString()
  const cleanClient = (clientName || '').trim()
  const newStatus: QrTarjetaStatus = normalizedUrl ? 'active' : 'unassigned'

  if (docSnap.exists()) {
    const existing = docSnap.data()
    const updatedData = {
      targetUrl: normalizedUrl,
      clientName: cleanClient || existing.clientName || '',
      status: newStatus,
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    }
    await updateDoc(docRef, updatedData)

    return {
      code: cleanCode,
      targetUrl: normalizedUrl,
      clientName: cleanClient || existing.clientName || '',
      status: newStatus,
      batchName: existing.batchName || 'General',
      batchId: existing.batchId || '',
      scanCount: existing.scanCount || 0,
      lastScannedAt: existing.lastScannedAt || null,
      createdAt: existing.createdAt || nowIso,
      updatedAt: nowIso,
    }
  } else {
    // Si la tarjeta no estaba registrada en la base, crearla directamente
    const newCard: QrTarjeta = {
      code: cleanCode,
      targetUrl: normalizedUrl,
      clientName: cleanClient,
      status: newStatus,
      batchName: 'Activación Directa',
      scanCount: 0,
      lastScannedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    await setDoc(docRef, {
      ...newCard,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    })
    return newCard
  }
}

