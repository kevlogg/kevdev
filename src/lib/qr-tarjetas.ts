import {
  collection,
  doc,
  getDocs,
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
 * Eliminar una tarjeta
 */
export async function deleteTarjeta(code: string): Promise<void> {
  await ensureServerAuth()
  const docRef = doc(db, 'qr_tarjetas', code)
  await deleteDoc(docRef)
}
