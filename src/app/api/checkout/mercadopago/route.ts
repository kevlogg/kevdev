import { NextResponse } from 'next/server'
import { createVaultPreference } from '@/lib/mercadopago'

export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, includeBump } = body

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresá un correo electrónico válido.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const isBumpIncluded = Boolean(includeBump)

    // Determine absolute base URL for callbacks & webhooks
    const hostHeader = req.headers.get('host')
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https'
    const fallbackBase = process.env.NEXT_PUBLIC_BASE_URL || 'https://kevdev.com'

    let baseUrl = fallbackBase
    if (hostHeader) {
      const scheme = hostHeader.includes('localhost') ? 'http' : protoHeader
      baseUrl = `${scheme}://${hostHeader}`
    }

    const preference = await createVaultPreference({
      email: cleanEmail,
      includeBump: isBumpIncluded,
      baseUrl,
    })

    const initPoint = preference.init_point || preference.sandbox_init_point

    if (!initPoint) {
      throw new Error('No se pudo obtener el init_point de la preferencia de Mercado Pago.')
    }

    return NextResponse.json(
      {
        success: true,
        init_point: initPoint,
        preferenceId: preference.id,
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('[API /api/checkout/mercadopago Error]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error interno al procesar el checkout.',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
