import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getCanonicalApiUrl(clientUrl: string): string {
  let url = clientUrl.trim().replace(/\/$/, '')

  // Ensure it starts with https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  // 1. Dulce Hogar redirects to www canonical domain on Vercel
  if (url.includes('dulcehogar.com.ar') && !url.includes('www.')) {
    url = url.replace('dulcehogar.com.ar', 'www.dulcehogar.com.ar')
  }
  if (url.includes('dulcehogardye.com.ar') && !url.includes('www.')) {
    url = url.replace('dulcehogardye.com.ar', 'www.dulcehogardye.com.ar')
  }

  let apiUrl = `${url}/api/admin/billing/payments`

  // 2. Calvos Compresores uses strict trailing slash
  if (url.includes('loscalvoscompresores') || url.includes('calvos-compresores')) {
    apiUrl += '/'
  }

  return apiUrl
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action, clientUrl, paymentData } = body

    if (!clientUrl || !action || !paymentData) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    const targetUrl = getCanonicalApiUrl(clientUrl)
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
