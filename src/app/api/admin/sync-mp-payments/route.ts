import { NextResponse } from 'next/server'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db, ensureServerAuth } from '@/lib/firebase'
import type { Cliente } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN

export async function POST() {
  try {
    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'MP_ACCESS_TOKEN no está configurado en las variables de entorno.' },
        { status: 500 }
      )
    }

    await ensureServerAuth()

    // 1. Obtener todos los clientes de KevDev
    const clisSnap = await getDocs(collection(db, 'clientes'))
    const clientes: Cliente[] = clisSnap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))

    // Helper para emparejar un pago o suscripción con un cliente
    const findMatchingCliente = (textSearch: string, extRef?: string, preapprovalId?: string): Cliente | undefined => {
      const target = (textSearch || '').toLowerCase()
      const ref = (extRef || '').toLowerCase()

      // 1. Coincidencia por preapproval ID guardado
      if (preapprovalId) {
        const found = clientes.find(c => c.mpPreapprovalId === preapprovalId)
        if (found) return found
      }

      // 2. Coincidencia por external reference
      if (ref) {
        const found = clientes.find(c => {
          const cName = (c.nombre || '').toLowerCase().replace(/\s+/g, '')
          const cUrl = (c.url || '').toLowerCase()
          return ref.includes(cName) || (cUrl && ref.includes(cUrl.replace(/https?:\/\//, '').split('.')[0]))
        })
        if (found) return found
      }

      // 3. Coincidencia por nombre o URL en la descripción / motivo
      return clientes.find(c => {
        const nameClean = (c.nombre || '').toLowerCase().trim()
        if (nameClean && nameClean.length >= 3 && target.includes(nameClean)) return true

        const urlClean = (c.url || '')
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/.*$/, '')
          .replace(/^www\./, '')
          .split('.')[0]
        if (urlClean && urlClean.length >= 4 && target.includes(urlClean)) return true

        return false
      })
    }

    // 2. Consultar Preapprovals (Suscripciones) autorizadas en Mercado Pago
    const preapprovalRes = await fetch('https://api.mercadopago.com/preapproval/search?limit=50', {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const preapprovalData = await preapprovalRes.json().catch(() => ({ results: [] }))
    const preapprovals = preapprovalData.results || []

    const updatedClients: string[] = []

    for (const sub of preapprovals) {
      if (sub.status === 'authorized') {
        const fullSearchText = `${sub.reason || ''} ${sub.back_url || ''} ${sub.external_reference || ''} ${sub.payer_first_name || ''} ${sub.payer_last_name || ''}`
        const matched = findMatchingCliente(fullSearchText, sub.external_reference, sub.id)

        if (matched && matched.id) {
          const needsUpdate = matched.metodoCobro !== 'MP_SUSCRIPCION' || matched.mpPreapprovalId !== sub.id
          if (needsUpdate) {
            await updateDoc(doc(db, 'clientes', matched.id), {
              metodoCobro: 'MP_SUSCRIPCION',
              mpPreapprovalId: sub.id,
              actualizadoEn: serverTimestamp(),
            })
            updatedClients.push(matched.nombre)
          }
        }
      }
    }

    // 3. Consultar últimos pagos de Mercado Pago para detectar cobros de suscripción
    const paymentsRes = await fetch('https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=50', {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const paymentsData = await paymentsRes.json().catch(() => ({ results: [] }))
    const payments = paymentsData.results || []

    const synchronizedPayments: Array<{ cliente: string; monto: number; fecha: string; ref: string }> = []

    for (const p of payments) {
      if (p.status !== 'approved') continue

      const desc = p.description || ''
      const extRef = p.external_reference || ''
      const fullSearch = `${desc} ${extRef} ${p.payer?.email || ''}`

      // Descartar compras de productos del Vault
      if (desc.includes('WhatsApp AI Closer') || desc.includes('Blueprints') || extRef.startsWith('VAULT-')) {
        continue
      }

      // Buscar si corresponde a un cliente
      const matched = findMatchingCliente(fullSearch, extRef)
      if (!matched || !matched.id) continue

      const refId = String(p.id)
      const fechaPago = (p.date_approved || p.date_created || new Date().toISOString()).split('T')[0]
      const monto = Number(p.transaction_amount) || 0

      // Comprobar si ya existe en historialPagos
      const dupQuery = query(
        collection(db, 'historialPagos'),
        where('referencia', '==', refId)
      )
      const dupSnap = await getDocs(dupQuery)

      if (dupSnap.empty) {
        // También verificar si ya había un pago manual equivalente el mismo día y monto para no duplicar
        const manualQuery = query(
          collection(db, 'historialPagos'),
          where('clienteId', '==', matched.id),
          where('fecha', '==', fechaPago),
          where('monto', '==', monto)
        )
        const manualSnap = await getDocs(manualQuery)

        if (!manualSnap.empty) {
          // Ya fue cargado manualmente, actualizamos la referencia y el método para enriquecerlo
          const existingManualDoc = manualSnap.docs[0]
          await updateDoc(doc(db, 'historialPagos', existingManualDoc.id), {
            referencia: refId,
            medioPago: 'MercadoPago',
            metodo: 'pasarela',
            origen: 'WEBHOOK',
          })
          await updateDoc(doc(db, 'clientes', matched.id), {
            metodoCobro: 'MP_SUSCRIPCION',
            estadoPago: 'AL_DIA',
            actualizadoEn: serverTimestamp(),
          })
          synchronizedPayments.push({
            cliente: matched.nombre,
            monto,
            fecha: fechaPago,
            ref: `${refId} (vinculado a registro existente)`,
          })
        } else {
          // Registrar nuevo pago automático
          await addDoc(collection(db, 'historialPagos'), {
            clienteId: matched.id,
            monto,
            fecha: fechaPago,
            concepto: desc || 'Cuota Mensual (Suscripción Mercado Pago)',
            medioPago: 'MercadoPago',
            metodo: 'pasarela',
            referencia: refId,
            confirmado: true,
            origen: 'WEBHOOK',
            creadoEn: serverTimestamp(),
          })

          await updateDoc(doc(db, 'clientes', matched.id), {
            estadoPago: 'AL_DIA',
            metodoCobro: 'MP_SUSCRIPCION',
            ultimoPago: fechaPago,
            actualizadoEn: serverTimestamp(),
          })

          synchronizedPayments.push({
            cliente: matched.nombre,
            monto,
            fecha: fechaPago,
            ref: refId,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      synchronizedPaymentsCount: synchronizedPayments.length,
      updatedClientsCount: updatedClients.length,
      synchronizedPayments,
      updatedClients,
      message: `Sincronización completada. ${synchronizedPayments.length} pagos sincronizados y ${updatedClients.length} suscripciones activas vinculadas.`,
    })
  } catch (error: any) {
    console.error('Error en sync-mp-payments:', error)
    return NextResponse.json(
      { error: 'Error durante la sincronización: ' + (error?.message || 'Desconocido') },
      { status: 500 }
    )
  }
}
