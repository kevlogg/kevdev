import { NextResponse } from 'next/server'
import { getHistorialPagos } from '@/lib/firestore'

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
        payments: formattedPayments,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Error al consultar historial de pagos para cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}
