import { NextResponse } from 'next/server'
import { addAnalyticsEvent } from '@/lib/analyticsStore'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { site, eventType, buttonId, path, device, source, metadata } = body

    if (!site || !eventType) {
      return NextResponse.json({ error: 'Faltan campos requeridos (site, eventType)' }, { status: 400, headers: corsHeaders })
    }

    const eventId = await addAnalyticsEvent({
      site,
      eventType,
      buttonId: buttonId || '',
      path: path || '/',
      device: device || 'mobile',
      source: source || 'direct',
      metadata: metadata || {},
    })

    return NextResponse.json({ success: true, eventId }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error en /api/analytics/track:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}
