import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import crypto from 'crypto'

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN ||
  'APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000'

export const mpConfig = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  options: { timeout: 10000 },
})

export const preferenceClient = new Preference(mpConfig)
export const paymentClient = new Payment(mpConfig)

export const PRODUCT_PRICES = {
  BASE_VAULT: 18500,
  ORDER_BUMP_BLUEPRINTS: 8500,
} as const

export interface CreatePreferenceOptions {
  email: string
  includeBump: boolean
  baseUrl: string
}

export async function createVaultPreference(options: CreatePreferenceOptions) {
  const { email, includeBump, baseUrl } = options

  const items: Array<{
    id: string
    title: string
    description: string
    quantity: number
    unit_price: number
    currency_id: string
  }> = [
    {
      id: 'vault-whatsapp-closer',
      title: 'WhatsApp AI Closer: Sistema Autónomo con n8n',
      description: 'Sistema autónomo de prospección y cierre en WhatsApp con n8n e Inteligencia Artificial.',
      quantity: 1,
      unit_price: PRODUCT_PRICES.BASE_VAULT,
      currency_id: 'ARS',
    },
  ]

  if (includeBump) {
    items.push({
      id: 'bump-15-blueprints-json',
      title: 'Pack de 15 Blueprints JSON Adicionales',
      description: 'Colección avanzada de 15 blueprints JSON de n8n para automatización empresarial.',
      quantity: 1,
      unit_price: PRODUCT_PRICES.ORDER_BUMP_BLUEPRINTS,
      currency_id: 'ARS',
    })
  }

  const notificationUrl =
    process.env.MP_NOTIFICATION_URL || `${baseUrl}/api/webhooks/mercadopago`

  const preferenceData = {
    items,
    payer: {
      email,
    },
    back_urls: {
      success: `${baseUrl}/vault/whatsapp-closer/access?status=approved`,
      failure: `${baseUrl}/vault/whatsapp-closer?status=failure`,
      pending: `${baseUrl}/vault/whatsapp-closer?status=pending`,
    },
    auto_return: 'approved',
    notification_url: notificationUrl,
    external_reference: `VAULT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    metadata: {
      customer_email: email,
      include_bump: includeBump,
      product: 'whatsapp-ai-closer',
    },
  }

  const response = await preferenceClient.create({ body: preferenceData })
  return response
}

/**
 * Validates cryptographic HMAC-SHA256 signature sent by Mercado Pago Webhooks.
 */
export function verifyMercadoPagoSignature(options: {
  signatureHeader: string | null
  requestIdHeader: string | null
  dataId: string
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    // If webhook secret is not configured in environment, log warning and allow for dev testing
    console.warn('[MercadoPago Webhook] MP_WEBHOOK_SECRET is not set. Skipping HMAC verification.')
    return true
  }

  const { signatureHeader, requestIdHeader, dataId } = options
  if (!signatureHeader) {
    console.warn('[MercadoPago Webhook] Missing x-signature header')
    return false
  }

  // Parse ts and v1 from header e.g. "ts=1700000000,v1=95a4..." or "ts=1700000000;v1=95a4..."
  const parts = signatureHeader.split(/[,;]/)
  let ts: string | undefined
  let hash: string | undefined

  for (const part of parts) {
    const [key, val] = part.split('=').map(s => s.trim())
    if (key === 'ts') ts = val
    if (key === 'v1') hash = val
  }

  if (!ts || !hash) {
    console.warn('[MercadoPago Webhook] Invalid x-signature header format:', signatureHeader)
    return false
  }

  // Build manifest
  const manifest = `id:${dataId};request-id:${requestIdHeader || ''};ts:${ts};`

  const computedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))
}
