import { NextResponse } from 'next/server'
import { addPostulacionImpulso } from '@/lib/firestore'
import { sendImpulsoNotificationEmail } from '@/lib/resend'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nombre,
      negocio,
      whatsapp,
      instagram,
      dedicacion,
      antiguedad,
      canalVentas,
      trabaPrincipal,
      porQueSeleccionado,
      materialesListos,
    } = body || {}

    // Validation
    if (
      !nombre?.trim() ||
      !negocio?.trim() ||
      !whatsapp?.trim() ||
      !instagram?.trim() ||
      !dedicacion?.trim() ||
      !antiguedad?.trim() ||
      !canalVentas?.trim() ||
      !trabaPrincipal?.trim() ||
      !porQueSeleccionado?.trim() ||
      !materialesListos?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Por favor completá todos los campos obligatorios.' },
        { status: 400 }
      )
    }

    const payload = {
      nombre: nombre.trim(),
      negocio: negocio.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim().startsWith('@') ? instagram.trim() : `@${instagram.trim()}`,
      dedicacion: dedicacion.trim(),
      antiguedad: antiguedad.trim(),
      canalVentas: canalVentas.trim(),
      trabaPrincipal: trabaPrincipal.trim(),
      porQueSeleccionado: porQueSeleccionado.trim(),
      materialesListos: materialesListos.trim(),
      estado: 'pendiente' as const,
      notasAdmin: '',
    }

    // Save to Firestore
    const docId = await addPostulacionImpulso(payload)

    // Dispatch email notification (async non-blocking for quick UX, but logged)
    sendImpulsoNotificationEmail(payload).catch((emailErr) => {
      console.error('[Convocatoria API] Error en notificación por email:', emailErr)
    })

    return NextResponse.json({
      success: true,
      id: docId,
      message: 'Postulación registrada con éxito',
    })
  } catch (error: any) {
    console.error('[Convocatoria API Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno al procesar la postulación.' },
      { status: 500 }
    )
  }
}
