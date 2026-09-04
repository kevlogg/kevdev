import { NextResponse } from 'next/server'
import { getHistorialPagos } from '@/lib/firestore'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-kevdev-secret',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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

    const pagos = await getHistorialPagos(clienteId)

    let estadoPago = 'AL_DIA'
    try {
      const snap = await getDocs(collection(db, 'clientes'))
      const normId = clienteId.toLowerCase().trim()
      const DULCE_HOGAR_IDS = ['dulcehogar', 'dulce-hogar', 'dulce_hogar', 'gz3g7r0ld4z3g3k5m7n9', 'q6h68vtjro2cd2qwtslj']
      const CALVOS_IDS = ['calvoscompresores', 'calvos-compresores', 'fx25djbynqynowq361jv', 'o5su65lqkz2k6ujl7o08']
      const PAJAROS_IDS = ['pajarosenlacabeza', 'pajaros-en-la-cabeza', 'pajaros_en_la_cabeza', 'pajaros', 'pajaro']

      const match = snap.docs.find(d => {
        const dId = d.id.toLowerCase().trim()
        const dData = d.data()
        const dNombre = (dData.nombre || '').toLowerCase().trim()
        const dUrl = (dData.url || '').toLowerCase().trim()

        if (dId === normId) return true
        if (DULCE_HOGAR_IDS.includes(normId) && (DULCE_HOGAR_IDS.includes(dId) || dNombre.includes('dulce'))) return true
        if (CALVOS_IDS.includes(normId) && (CALVOS_IDS.includes(dId) || dNombre.includes('calvo'))) return true
        if ((PAJAROS_IDS.includes(normId) || normId.includes('pajaro')) && (PAJAROS_IDS.includes(dId) || dNombre.includes('pajaro') || dUrl.includes('pajaro'))) return true
        return false
      })

      if (match) {
        estadoPago = match.data().estadoPago || 'AL_DIA'
      }
    } catch (e) {}

    const formattedPayments = pagos.map(p => ({
      id: p.id || '',
      date: p.fecha || '',
      amount: p.monto || 0,
      concept: p.concepto || 'Cuota Mensual',
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
    console.error('Error al consultar historial de pagos para cliente:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}
