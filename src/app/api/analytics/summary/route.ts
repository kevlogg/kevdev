import { NextResponse } from 'next/server'
import { getStoreAnalyticsSummary } from '@/lib/analyticsStore'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = parseInt(searchParams.get('period') || '30', 10)

    const summary = await getStoreAnalyticsSummary(period)

    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error en /api/analytics/summary:', error)
    return NextResponse.json({ error: 'Error obteniendo analítica' }, { status: 500 })
  }
}
