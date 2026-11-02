import { NextRequest, NextResponse } from 'next/server'
import { saveTarjetaActivation } from '@/lib/qr-tarjetas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, targetUrl, clientName } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Código de tarjeta requerido' }, { status: 400 })
    }

    if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
      return NextResponse.json({ error: 'Debes ingresar un enlace válido' }, { status: 400 })
    }

    const updatedCard = await saveTarjetaActivation(code, targetUrl, clientName)

    return NextResponse.json({
      success: true,
      card: updatedCard,
      message: `Tarjeta #${code} activada con éxito`,
    })
  } catch (err: any) {
    console.error('[API /api/qr/activate] Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Error al guardar la tarjeta' },
      { status: 500 }
    )
  }
}
