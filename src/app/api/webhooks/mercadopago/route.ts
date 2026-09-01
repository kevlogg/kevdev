import { NextResponse } from 'next/server'
import { paymentClient, verifyMercadoPagoSignature } from '@/lib/mercadopago'
import { sendVaultAccessEmail } from '@/lib/resend'
import { mercadopagoWebhookPayloadSchema } from '@/schemas/mercadopago'
import { checkOrderExists, createOrderRecord } from '@/lib/dal/orders'
import { updateUserPurchaseHistory } from '@/lib/dal/users'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const rawBody = await req.json().catch(() => ({}))
    const parsedPayload = mercadopagoWebhookPayloadSchema.safeParse(rawBody)

    const body = parsedPayload.success ? parsedPayload.data : {}

    // 1. Extract data ID from body or query param
    const dataId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get('data.id') ||
      url.searchParams.get('id')

    if (!dataId) {
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

    // Filter event type
    const eventType = body.type || body.action
    if (eventType && !eventType.includes('payment')) {
      return NextResponse.json({ status: 'ignored', reason: `Event type ${eventType} ignored` }, { status: 200 })
    }

    // 3. Query real payment status from Mercado Pago API
    const paymentId = String(dataId)
    let payment: Record<string, unknown> | null = null

    try {
      payment = (await paymentClient.get({ id: paymentId })) as unknown as Record<string, unknown>
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`[MercadoPago Webhook] Error fetching payment ID ${paymentId}:`, err)
      return NextResponse.json({ error: `No se pudo obtener el pago de Mercado Pago: ${errorMessage}` }, { status: 500 })
    }

    if (!payment || payment.status !== 'approved') {
      console.log(`[MercadoPago Webhook] Payment ${paymentId} status is '${payment?.status}'. No action required.`)
      return NextResponse.json({ status: 'received', paymentStatus: payment?.status }, { status: 200 })
    }

    // 4. Idempotency Check using DAL
    const isAlreadyProcessed = await checkOrderExists(paymentId)
    if (isAlreadyProcessed) {
      console.log(`[MercadoPago Webhook] Order ${paymentId} already processed (idempotency hit).`)
      return NextResponse.json({ status: 'already_processed', message: 'Orden ya fue registrada previamente.' }, { status: 200 })
    }

    // 5. Extract payment details & order bump info
    const metadata = (payment.metadata || {}) as Record<string, unknown>
    const payer = (payment.payer || {}) as Record<string, unknown>
    const additionalInfo = (payment.additional_info || {}) as Record<string, unknown>
    const items = (additionalInfo.items || []) as Array<Record<string, unknown>>

    const customerEmail = String(
      metadata.customer_email ||
      payer.email ||
      ''
    ).trim().toLowerCase()

    const hasOrderBump = Boolean(
      metadata.include_bump ||
      items.some((it) => it.id === 'bump-15-blueprints-json')
    )

    const amountPaid = Number(payment.transaction_amount || 0)

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

    // 6. Save Order to Firestore via DAL
    await createOrderRecord({
      paymentId,
      customerEmail,
      amountPaid,
      hasOrderBump,
      product: 'whatsapp-ai-closer',
      paymentMethod: String(payment.payment_method_id || 'mercadopago'),
      externalReference: String(payment.external_reference || ''),
    })

    // 7. Register/Update User in Firestore via DAL
    if (customerEmail) {
      await updateUserPurchaseHistory({
        email: customerEmail,
        product: 'whatsapp-ai-closer',
        hasOrderBump,
        transactionId: paymentId,
        amount: amountPaid,
      })
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno al procesar el webhook.'
    console.error('[API /api/webhooks/mercadopago Error]:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
