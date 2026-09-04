import { NextResponse } from 'next/server'
import { recordPaymentInStore, deletePaymentFromStore } from '@/lib/payments-store'

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

    if (!paymentData) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    if (action === 'delete') {
      deletePaymentFromStore(
        paymentData.date || paymentData.fecha || '',
        Number(paymentData.amount || paymentData.monto || 0),
        paymentData.clienteId || paymentData.clientId || ''
      )
    } else {
      recordPaymentInStore({
        id: paymentData.id || `PAGO-${Date.now()}`,
        clienteId: paymentData.clienteId || paymentData.clientId || 'qrKvonUCFeUOJZW32bee',
        date: paymentData.date || paymentData.fecha || new Date().toISOString().split('T')[0],
        amount: Number(paymentData.amount || paymentData.monto || 0),
        concept: paymentData.concept || paymentData.concepto || 'Cuota Mensual',
        medioPago: paymentData.medioPago || 'Transferencia',
        confirmed: paymentData.confirmed ?? true,
      })
    }

    if (!clientUrl) {
      return NextResponse.json({ success: true, synced: true, message: 'Pago registrado en KevDev Payments Store' })
    }

    const targetUrl = getCanonicalApiUrl(clientUrl)
    const secret = process.env.KEVDEV_PAYMENTS_SECRET || 'kevdev_payments_sec_2026_key'

    let res
    try {
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
        const errorText = await res.text().catch(() => '')
        console.warn(`[PushPayment] Client API status ${res.status}:`, errorText)
        return NextResponse.json({ 
          success: true, 
          synced: false, 
          message: `Pago guardado en KevDev. (La web del cliente responde ${res.status} o consulta la API dinámicamente)` 
        })
      }

      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ success: true, synced: true, data })
    } catch (pushErr: any) {
      console.warn(`[PushPayment] Could not push to ${targetUrl}:`, pushErr?.message)
      return NextResponse.json({ 
        success: true, 
        synced: false, 
        message: 'Pago guardado en KevDev. La web del cliente consulta los pagos dinámicamente.' 
      })
    }
  } catch (error: any) {
    console.error('[PushPayment] General error:', error)
    return NextResponse.json({ success: true, synced: false, error: error?.message || 'Error de servidor' })
  }
}
