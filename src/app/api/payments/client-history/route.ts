import { NextResponse } from 'next/server'
import { getHistorialPagos, getClientes } from '@/lib/firestore'
import { getPaymentsFromStore } from '@/lib/payments-store'

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

    let estadoPago = 'AL_DIA'
    try {
      const clientes = await getClientes()
      const normId = clienteId.toLowerCase().trim()
      const isPajarosQuery = normId.includes('pajaro') || normId.includes('cabeza') || normId.includes('qrkvon')
      const isCalvosQuery = normId.includes('calvo')
      const isDulceHogarQuery = normId.includes('dulce')

      const matchedCli = clientes.find(c => {
        const cId = String(c.id || '').toLowerCase()
        const cNom = String(c.nombre || '').toLowerCase()
        const cUrl = String(c.url || '').toLowerCase()
        if (cId === normId || cNom.includes(normId) || cUrl.includes(normId)) return true
        if (isPajarosQuery && (cNom.includes('pajaro') || cNom.includes('cabeza') || cUrl.includes('pajaro') || cId.includes('qrkvon'))) return true
        if (isCalvosQuery && (cNom.includes('calvo') || cUrl.includes('calvo'))) return true
        if (isDulceHogarQuery && (cNom.includes('dulce') || cUrl.includes('dulce'))) return true
        return false
      })

      if (matchedCli && matchedCli.estadoPago) {
        estadoPago = matchedCli.estadoPago
      }
    } catch (cliErr) {
      console.warn('[client-history] Warning consultando estadoPago:', cliErr)
    }

    const rawPagos = await getHistorialPagos(clienteId).catch(() => [])
    const storePagos = getPaymentsFromStore(clienteId)

    const allMap = new Map<string, any>()
    
    // Add payments from Firestore
    rawPagos.forEach((p: any) => {
      const key = `${p.fecha || p.date || ''}_${p.monto || p.amount || 0}`
      allMap.set(key, {
        id: p.id || '',
        date: p.fecha || p.date || '',
        amount: Number(p.monto || p.amount || 0),
        concept: p.concepto || p.concept || 'Cuota Mensual',
        medioPago: p.medioPago || 'Transferencia',
        metodo: p.metodo || 'pasarela',
        referencia: p.referencia || '',
        confirmed: p.confirmado ?? true,
      })
    })

    // Add/merge payments from PaymentsStore
    storePagos.forEach((sp: any) => {
      const key = `${sp.date}_${sp.amount}`
      if (!allMap.has(key)) {
        allMap.set(key, {
          id: sp.id,
          date: sp.date,
          amount: Number(sp.amount),
          concept: sp.concept,
          medioPago: sp.medioPago,
          metodo: 'pasarela',
          referencia: '',
          confirmed: sp.confirmed ?? true,
        })
      }
    })

    const formattedPayments = Array.from(allMap.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''))

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

