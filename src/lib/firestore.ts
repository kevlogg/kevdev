import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db, ensureServerAuth } from '@/lib/firebase'

/* ─── Types ─────────────────────────────────────────────────────────── */

export type EstadoCliente =
  | 'prospecto' | 'contactado' | 'demo'
  | 'negociacion' | 'cerrado' | 'entregado'

export type DemoEstado = 'SIN HACER' | 'PRESENTADA' | 'HECHA' | ''
export type Situacion  = 'NO RESPONDIO' | 'EN ESPERA' | 'EN PRODUCCION' | 'RECHAZADA' | ''
export type EstadoPago = 'AL_DIA' | 'PENDIENTE' | 'VENCIDO' | ''

export interface Cliente {
  id?: string
  creadoEn: Timestamp
  nombre: string
  rubro: string
  contacto: string
  telefono: string
  instagram: string
  estado: EstadoCliente
  demo: DemoEstado
  situacion: Situacion
  plan: string
  url: string
  notas: string
  fechaPresentacionDemo: string
  fechaInicioProyecto: string
  montoMensual?: number
  montoPagoUnico?: number
  diaVencimiento?: number
  estadoPago?: EstadoPago
  passwordAdmin?: string
}

export interface HistorialPago {
  id?: string
  clienteId: string
  monto: number
  fecha: string
  concepto: string
  medioPago?: string
  confirmado: boolean
  creadoEn?: Timestamp
  metodo?: 'manual' | 'pasarela' | string
  referencia?: string
  origen?: 'MANUAL' | 'WEBHOOK'
}

export interface ChecklistProgreso {
  clienteId: string
  stepId: number
  completado: boolean
  updatedAt: Timestamp
}

export interface PresupuestoItem {
  id?: string
  nombre: string
  precio: number
  esDefault: boolean
}

/* ─── Clientes ───────────────────────────────────────────────────────── */

export async function getClientes(): Promise<Cliente[]> {
  await ensureServerAuth()
  const q = query(collection(db, 'clientes'), orderBy('creadoEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))
}

export async function getCliente(id: string): Promise<Cliente | null> {
  await ensureServerAuth()
  const snap = await getDoc(doc(db, 'clientes', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Cliente
}

export async function addCliente(
  data: Omit<Cliente, 'id' | 'creadoEn'>,
): Promise<string> {
  await ensureServerAuth()
  const ref = await addDoc(collection(db, 'clientes'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function updateCliente(
  id: string,
  data: Partial<Omit<Cliente, 'id' | 'creadoEn'>>,
): Promise<void> {
  await ensureServerAuth()
  await updateDoc(doc(db, 'clientes', id), data)
}

/* ─── Checklist ──────────────────────────────────────────────────────── */

export async function getChecklistProgreso(
  clienteId: string,
): Promise<Record<number, boolean>> {
  const q = query(
    collection(db, 'checklistProgreso'),
    where('clienteId', '==', clienteId),
  )
  const snap = await getDocs(q)
  const result: Record<number, boolean> = {}
  snap.docs.forEach(d => {
    const data = d.data() as ChecklistProgreso
    result[data.stepId] = data.completado
  })
  return result
}

export async function toggleChecklistStep(
  clienteId: string,
  stepId: number,
  completado: boolean,
): Promise<void> {
  const q = query(
    collection(db, 'checklistProgreso'),
    where('clienteId', '==', clienteId),
    where('stepId', '==', stepId),
  )
  const snap = await getDocs(q)

  if (snap.empty) {
    await addDoc(collection(db, 'checklistProgreso'), {
      clienteId,
      stepId,
      completado,
      updatedAt: serverTimestamp(),
    })
  } else {
    await updateDoc(snap.docs[0].ref, { completado, updatedAt: serverTimestamp() })
  }
}

/* ─── Presupuesto ────────────────────────────────────────────────────── */

export async function getPresupuestoItems(): Promise<PresupuestoItem[]> {
  const snap = await getDocs(collection(db, 'presupuestoItems'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as PresupuestoItem))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export async function addPresupuestoItem(
  data: Omit<PresupuestoItem, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'presupuestoItems'), data)
  return ref.id
}

export async function updatePresupuestoItem(
  id: string,
  data: Partial<Omit<PresupuestoItem, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'presupuestoItems', id), data)
}

export async function deletePresupuestoItem(id: string): Promise<void> {
  await deleteDoc(doc(db, 'presupuestoItems', id))
}

/* ─── Historial de Pagos ──────────────────────────────────────────────── */

const CALVOS_IDS = ['calvoscompresores', 'calvos-compresores', 'fx25djbynqynowq361jv', 'o5su65lqkz2k6ujl7o08']
const DULCE_HOGAR_IDS = ['dulcehogar', 'dulce-hogar', 'dulce_hogar', 'gz3g7r0ld4z3g3k5m7n9', 'q6h68vtjro2cd2qwtslj']
const PAJAROS_IDS = ['pajarosenlacabeza', 'pajaros-en-la-cabeza', 'pajaros_en_la_cabeza', 'pajaros', 'pajaro', 'qrkvonucfeuojzw32bee', 'qrkvonucfeuojzw32bee']

export async function getHistorialPagos(clienteId: string): Promise<HistorialPago[]> {
  try {
    await ensureServerAuth().catch(() => {})
    const normId = String(clienteId || '').toLowerCase().trim()
    const isCalvosQuery = CALVOS_IDS.includes(normId) || normId.includes('calvo')
    const isDulceHogarQuery = DULCE_HOGAR_IDS.includes(normId) || normId.includes('dulce')
    const isPajarosQuery = PAJAROS_IDS.includes(normId) || normId.includes('pajaro') || normId.includes('cabeza') || normId.includes('qrkvon')

    // Resolver IDs de documentos de clientes coincidentes en Firestore
    const matchingClientDocIds = new Set<string>([clienteId, normId, 'qrKvonUCFeUOJZW32bee', 'qrkvonucfeuojzw32bee'])
    try {
      const cliSnap = await getDocs(collection(db, 'clientes'))
      cliSnap.docs.forEach(docSnap => {
        const cId = docSnap.id
        const cIdLower = cId.toLowerCase().trim()
        const cData = docSnap.data()
        const cNombre = String(cData.nombre || '').toLowerCase().trim()
        const cUrl = String(cData.url || '').toLowerCase().trim()

        if (cIdLower === normId || (normId !== 'all' && (cNombre.includes(normId) || cUrl.includes(normId)))) {
          matchingClientDocIds.add(cId)
        }
        if (isCalvosQuery && (cNombre.includes('calvo') || cUrl.includes('calvo') || CALVOS_IDS.includes(cIdLower))) {
          matchingClientDocIds.add(cId)
        }
        if (isDulceHogarQuery && (cNombre.includes('dulce') || cUrl.includes('dulce') || DULCE_HOGAR_IDS.includes(cIdLower))) {
          matchingClientDocIds.add(cId)
        }
        if (isPajarosQuery && (cNombre.includes('pajaro') || cNombre.includes('cabeza') || cUrl.includes('pajaro') || PAJAROS_IDS.includes(cIdLower) || cIdLower.includes('qrkvon'))) {
          matchingClientDocIds.add(cId)
        }
      })
    } catch (cliErr) {
      console.warn('[getHistorialPagos] Warning buscando doc IDs de clientes:', cliErr)
    }

    const snap = await getDocs(collection(db, 'historialPagos'))
    const allPagos = snap.docs.map(d => ({ id: d.id, ...d.data() } as HistorialPago))

    if (normId === 'all') {
      return allPagos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    }

    return allPagos
      .filter(p => {
        if (!p.clienteId) return false
        const pNorm = String(p.clienteId || '').trim()
        const pNormLower = pNorm.toLowerCase()

        if (matchingClientDocIds.has(pNorm) || matchingClientDocIds.has(pNormLower)) return true
        if (isCalvosQuery && (CALVOS_IDS.includes(pNormLower) || pNormLower.includes('calvo'))) return true
        if (isDulceHogarQuery && (DULCE_HOGAR_IDS.includes(pNormLower) || pNormLower.includes('dulce'))) return true
        if (isPajarosQuery && (PAJAROS_IDS.includes(pNormLower) || pNormLower.includes('pajaro') || pNormLower.includes('cabeza') || pNormLower.includes('qrkvon'))) return true
        if (isPajarosQuery && !CALVOS_IDS.includes(pNormLower) && !DULCE_HOGAR_IDS.includes(pNormLower) && !pNormLower.includes('calvo') && !pNormLower.includes('dulce')) return true
        return false
      })
      .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  } catch (err) {
    console.warn('[getHistorialPagos] Error al consultar Firestore en el servidor:', err)
    return []
  }
}

export async function getAllHistorialPagos(): Promise<HistorialPago[]> {
  await ensureServerAuth()
  const snap = await getDocs(collection(db, 'historialPagos'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as HistorialPago))
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
}

export async function addHistorialPago(
  data: Omit<HistorialPago, 'id' | 'creadoEn'>,
): Promise<string> {
  await ensureServerAuth()
  const ref = await addDoc(collection(db, 'historialPagos'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function togglePagoConfirmado(
  id: string,
  confirmado: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'historialPagos', id), { confirmado })
}

export async function deleteHistorialPago(id: string): Promise<void> {
  await deleteDoc(doc(db, 'historialPagos', id))
}

export function getPagosMesActual(pagos: HistorialPago[]): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `${year}-${month}`

  return pagos
    .filter(p => p.confirmado && p.fecha && p.fecha.startsWith(prefix))
    .reduce((sum, p) => sum + (p.monto || 0), 0)
}

export function getPagosAcumuladosGlobal(pagos: HistorialPago[]): number {
  return pagos
    .filter(p => p.confirmado)
    .reduce((sum, p) => sum + (p.monto || 0), 0)
}

