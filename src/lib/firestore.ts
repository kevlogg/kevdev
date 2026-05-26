import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/* ─── Types ─────────────────────────────────────────────────────────── */

export type EstadoCliente =
  | 'prospecto' | 'contactado' | 'demo'
  | 'negociacion' | 'cerrado' | 'entregado'

export interface Cliente {
  id?: string
  creadoEn: Timestamp
  nombre: string
  rubro: string
  contacto: string
  telefono: string
  instagram: string
  estado: EstadoCliente
  notas: string
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
  const q = query(collection(db, 'clientes'), orderBy('creadoEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const snap = await getDoc(doc(db, 'clientes', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Cliente
}

export async function addCliente(
  data: Omit<Cliente, 'id' | 'creadoEn'>,
): Promise<string> {
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
