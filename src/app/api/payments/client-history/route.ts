import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-kevdev-secret',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const DULCE_HOGAR_IDS = ['dulcehogar', 'dulce-hogar', 'dulce_hogar', 'gz3g7r0ld4z3g3k5m7n9', 'q6h68vtjro2cd2qwtslj']
const CALVOS_IDS = ['calvoscompresores', 'calvos-compresores', 'fx25djbynqynowq361jv', 'o5su65lqkz2k6ujl7o08']
const PAJAROS_IDS = ['pajarosenlacabeza', 'pajaros-en-la-cabeza', 'pajaros_en_la_cabeza', 'pajaros', 'pajaro']

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clienteId = searchParams.get('clienteId') || searchParams.get('id') || ''

    if (!clienteId) {
      return NextResponse.json(
        { error: 'Falta parámetro clienteId en la URL' },
        { status: 400, headers: corsHeaders }
      )
    }

    const normId = clienteId.toLowerCase().trim()
    const isCalvosQuery = CALVOS_IDS.includes(normId) || normId.includes('calvo')
    const isDulceHogarQuery = DULCE_HOGAR_IDS.includes(normId) || normId.includes('dulce')
    const isPajarosQuery = PAJAROS_IDS.includes(normId) || normId.includes('pajaro') || normId.includes('cabeza')

    // 1. Obtener los documentos de clientes coincidentes en Firestore usando adminDb
    const matchingDocIds = new Set<string>([clienteId, normId])
    let estadoPago = 'AL_DIA'

    try {
      const cliSnap = await adminDb.collection('clientes').get()
      cliSnap.docs.forEach(docSnap => {
        const dId = docSnap.id
        const dIdLower = dId.toLowerCase().trim()
        const dData = docSnap.data()
        const dNombre = String(dData.nombre || '').toLowerCase().trim()
        const dUrl = String(dData.url || '').toLowerCase().trim()

        let isMatch = false
        if (dIdLower === normId || (normId !== 'all' && (dNombre.includes(normId) || dUrl.includes(normId)))) isMatch = true
        if (isCalvosQuery && (CALVOS_IDS.includes(dIdLower) || dNombre.includes('calvo') || dUrl.includes('calvo'))) isMatch = true
        if (isDulceHogarQuery && (DULCE_HOGAR_IDS.includes(dIdLower) || dNombre.includes('dulce') || dUrl.includes('dulce'))) isMatch = true
        if (isPajarosQuery && (PAJAROS_IDS.includes(dIdLower) || dNombre.includes('pajaro') || dNombre.includes('cabeza') || dUrl.includes('pajaro'))) isMatch = true

        if (isMatch) {
          matchingDocIds.add(dId)
          if (dData.estadoPago) estadoPago = dData.estadoPago
        }
      })
    } catch (cliErr) {
      console.warn('[client-history] Warning consultando clientes:', cliErr)
    }

    // 2. Obtener todos los pagos y filtrar los que pertenecen al cliente
    const paySnap = await adminDb.collection('historialPagos').get()
    const allPagos = paySnap.docs.map(d => ({ id: d.id, ...d.data() } as any))

    const filteredPagos = allPagos.filter(p => {
      if (!p.clienteId) return false
      const pNorm = String(p.clienteId || '').trim()
      const pNormLower = pNorm.toLowerCase()

      if (normId === 'all') return true
      if (matchingDocIds.has(pNorm) || matchingDocIds.has(pNormLower)) return true
      if (isCalvosQuery && (CALVOS_IDS.includes(pNormLower) || pNormLower.includes('calvo'))) return true
      if (isDulceHogarQuery && (DULCE_HOGAR_IDS.includes(pNormLower) || pNormLower.includes('dulce'))) return true
      if (isPajarosQuery && (PAJAROS_IDS.includes(pNormLower) || pNormLower.includes('pajaro') || pNormLower.includes('cabeza'))) return true
      return false
    })

    filteredPagos.sort((a, b) => String(b.fecha || b.date || '').localeCompare(String(a.fecha || a.date || '')))

    const formattedPayments = filteredPagos.map(p => ({
      id: p.id || '',
      date: p.fecha || p.date || '',
      amount: Number(p.monto || p.amount || 0),
      concept: p.concepto || p.concept || 'Cuota Mensual',
      medioPago: p.medioPago || 'Transferencia',
      metodo: p.metodo || 'pasarela',
      referencia: p.referencia || '',
      confirmed: p.confirmado ?? true,
    }))

    return NextResponse.json(
      {
        success: true,
        clienteId,
        estadoPago,
        payments: formattedPayments,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Error en /api/payments/client-history:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}
