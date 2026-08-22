import { NextResponse } from 'next/server'
import { recordAnalyticsEvent } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { site, eventType, buttonId, path, device, source, metadata } = body

    if (!site || !eventType) {
      return NextResponse.json({ error: 'Faltan campos requeridos (site, eventType)' }, { status: 400 })
    }

    const eventId = await recordAnalyticsEvent({
      site,
      eventType,
      buttonId: buttonId || '',
      path: path || '/',
      device: device || 'mobile',
      source: source || 'direct',
      metadata: metadata || {},
    })

    return NextResponse.json({ success: true, eventId })
  } catch (error) {
    console.error('Error en /api/analytics/track:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
