import { NextResponse } from 'next/server'
import { paymentClient, verifyMercadoPagoSignature } from '@/lib/mercadopago'
import { adminDb, FieldValue } from '@/lib/firebase-admin'
import { sendVaultAccessEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await req.json().catch(() => ({}))

    // 1. Extract data ID from body or query param
    const dataId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get('data.id') ||
      url.searchParams.get('id')

    if (!dataId) {
      // Mercado Pago sends generic test pings without data.id
      return NextResponse.json({ status: 'ignored', reason: 'No data.id present in webhook payload' }, { status: 200 })
    }

    // 2. Validate HMAC Cryptographic Signature
    const signatureHeader = req.headers.get('x-signature')
    const requestIdHeader = req.headers.get('x-request-id')

    const isValidSignature = verifyMercadoPagoSignature({
      signatureHeader,
      requestIdHeader,
      dataId: String(dataId),
    })

    if (!isValidSignature) {
      console.warn(`[MercadoPago Webhook] Invalid signature for data.id: ${dataId}`)
      return NextResponse.json({ error: 'Firma criptográfica x-signature inválida.' }, { status: 401 })
    }

    // Filter event type (we process payment events)
    const eventType = body.type || body.action
    if (eventType && !eventType.includes('payment')) {
      return NextResponse.json({ status: 'ignored', reason: `Event type ${eventType} ignored` }, { status: 200 })
    }

    // 3. Query real payment status from Mercado Pago API
    const paymentId = String(dataId)
    let payment: any

    try {
      payment = await paymentClient.get({ id: paymentId })
    } catch (err: any) {
      console.error(`[MercadoPago Webhook] Error fetching payment ID ${paymentId}:`, err)
      return NextResponse.json({ error: `No se pudo obtener el pago de Mercado Pago: ${err?.message}` }, { status: 500 })
    }

    if (!payment || payment.status !== 'approved') {
      console.log(`[MercadoPago Webhook] Payment ${paymentId} status is '${payment?.status}'. No action required.`)
      return NextResponse.json({ status: 'received', paymentStatus: payment?.status }, { status: 200 })
    }

    // 4. Idempotency Check using Firebase Firestore (firebase-admin)
    const orderDocRef = adminDb.collection('orders').doc(paymentId)
    const existingOrder = await orderDocRef.get()

    if (existingOrder.exists) {
      console.log(`[MercadoPago Webhook] Order ${paymentId} already processed (idempotency hit).`)
      return NextResponse.json({ status: 'already_processed', message: 'Orden ya fue registrada previamente.' }, { status: 200 })
    }

    // 5. Extract payment details & order bump info
    const customerEmail = (
      payment.metadata?.customer_email ||
      payment.payer?.email ||
      ''
    ).trim().toLowerCase()

    const hasOrderBump = Boolean(
      payment.metadata?.include_bump ||
      (payment.additional_info?.items &&
        payment.additional_info.items.some((it: any) => it.id === 'bump-15-blueprints-json'))
    )

    const amountPaid = payment.transaction_amount || 0

    // Determine Base URL
    const hostHeader = req.headers.get('host')
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https'
    const fallbackBase = process.env.NEXT_PUBLIC_BASE_URL || 'https://kevdev.com'
    let baseUrl = fallbackBase
    if (hostHeader) {
      const scheme = hostHeader.includes('localhost') ? 'http' : protoHeader
      baseUrl = `${scheme}://${hostHeader}`
    }

    const accessUrl = `${baseUrl}/vault/whatsapp-closer/access`
    const notebookUrl =
      process.env.NOTEBOOKLM_PUBLIC_URL ||
      'https://notebooklm.google.com/notebook/whatsapp-closer-tutor-demo'

    // 6. Save Order to Firestore `orders` collection
    await orderDocRef.set({
      transactionId: paymentId,
      email: customerEmail,
      amount: amountPaid,
      hasOrderBump,
      product: 'whatsapp-ai-closer',
      status: 'approved',
      paymentMethod: payment.payment_method_id || 'mercadopago',
      externalReference: payment.external_reference || '',
      createdAt: FieldValue.serverTimestamp(),
    })

    // 7. Register/Update User in Firestore `users` collection
    if (customerEmail) {
      const userDocRef = adminDb.collection('users').doc(customerEmail)
      await userDocRef.set(
        {
          email: customerEmail,
          updatedAt: FieldValue.serverTimestamp(),
          purchases: FieldValue.arrayUnion({
            product: 'whatsapp-ai-closer',
            hasOrderBump,
            transactionId: paymentId,
            amount: amountPaid,
            purchasedAt: new Date().toISOString(),
          }),
        },
        { merge: true }
      )
    }

    // 8. Trigger Transactional Email via Resend
    if (customerEmail) {
      await sendVaultAccessEmail({
        email: customerEmail,
        amountPaid,
        hasOrderBump,
        accessUrl,
        notebookUrl,
        transactionId: paymentId,
      })
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Orden registrada y correo de acceso enviado con éxito.',
        transactionId: paymentId,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API /api/webhooks/mercadopago Error]:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar el webhook.' },
      { status: 500 }
    )
  }
}
