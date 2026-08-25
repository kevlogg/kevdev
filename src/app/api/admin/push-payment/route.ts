import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action, clientUrl, paymentData } = body

    if (!clientUrl || !action || !paymentData) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const targetUrl = `${clientUrl.replace(/\/$/, '')}/api/admin/billing/payments`
    const secret = process.env.KEVDEV_PAYMENTS_SECRET || 'kevdev_payments_sec_2026_key'

    let res
    if (action === 'delete') {
      res = await fetch(targetUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-kevdev-secret': secret,
        },
        body: JSON.stringify({
          date: paymentData.date || paymentData.fecha || '',
          amount: paymentData.amount || paymentData.monto || 0,
        }),
      })
    } else {
      res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-kevdev-secret': secret,
        },
        body: JSON.stringify({
          amount: paymentData.amount || paymentData.monto || 0,
          date: paymentData.date || paymentData.fecha || '',
          concept: paymentData.concept || paymentData.concepto || 'Cuota Mensual',
          medioPago: paymentData.medioPago || 'Transferencia',
          confirmed: paymentData.confirmed ?? true,
        }),
      })
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[PushPayment] Error response from client API:`, res.status, errorText)
      return NextResponse.json({ error: 'El proyecto del cliente rechazó la petición', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('[PushPayment] Error pushing payment to client:', error)
    return NextResponse.json({ error: error?.message || 'Error de servidor' }, { status: 500 })
  }
}
