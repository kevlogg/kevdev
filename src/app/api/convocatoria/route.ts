import { NextResponse } from 'next/server'
import { addPostulacionImpulso } from '@/lib/firestore'
import { sendImpulsoNotificationEmail } from '@/lib/resend'

// Helper function to sanitize text input and prevent XSS script injection
function sanitizeText(str: string, maxLength = 1000): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>'"]/g, '') // Remove potential script injection characters
    .trim()
    .slice(0, maxLength)
}

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

    // Sanitize all text fields
    const sNombre = sanitizeText(nombre, 100)
    const sNegocio = sanitizeText(negocio, 100)
    const sWhatsapp = sanitizeText(whatsapp, 50)
    let sInstagram = sanitizeText(instagram, 50)
    const sDedicacion = sanitizeText(dedicacion, 2000)
    const sAntiguedad = sanitizeText(antiguedad, 100)
    const sCanalVentas = sanitizeText(canalVentas, 100)
    const sTrabaPrincipal = sanitizeText(trabaPrincipal, 2000)
    const sPorQueSeleccionado = sanitizeText(porQueSeleccionado, 2000)
    const sMaterialesListos = sanitizeText(materialesListos, 100)

    // Validation checks
    if (!sNombre || sNombre.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Nombre y apellido requerido (mínimo 3 caracteres).' },
        { status: 400 }
      )
    }

    if (!sNegocio || sNegocio.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nombre de negocio requerido (mínimo 2 caracteres).' },
        { status: 400 }
      )
    }

    const waClean = sWhatsapp.replace(/[^\d+]/g, '')
    if (!sWhatsapp || waClean.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Número de WhatsApp inválido (mínimo 8 dígitos).' },
        { status: 400 }
      )
    }

    if (!sInstagram.startsWith('@')) {
      sInstagram = `@${sInstagram}`
    }
    const igRegex = /^@[a-zA-Z0-9._]{2,30}$/
    if (!igRegex.test(sInstagram)) {
      return NextResponse.json(
        { success: false, error: 'Usuario de Instagram inválido.' },
        { status: 400 }
      )
    }

    if (!sDedicacion || sDedicacion.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Por favor completá a qué se dedica tu negocio (mínimo 10 caracteres).' },
        { status: 400 }
      )
    }

    const allowedAntiguedad = ['Menos de 6 meses', 'Entre 6 meses y 2 años', 'Más de 2 años']
    if (!allowedAntiguedad.includes(sAntiguedad)) {
      return NextResponse.json(
        { success: false, error: 'Opción de antigüedad del negocio no válida.' },
        { status: 400 }
      )
    }

    const allowedCanales = ['Mensajes de WhatsApp', 'Mensajes directos de Instagram', 'Local a la calle / presencial', 'Otro']
    if (!allowedCanales.includes(sCanalVentas)) {
      return NextResponse.json(
        { success: false, error: 'Opción de canal de ventas no válida.' },
        { status: 400 }
      )
    }

    if (!sTrabaPrincipal || sTrabaPrincipal.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Por favor completá la traba principal por no contar con web.' },
        { status: 400 }
      )
    }

    if (!sPorQueSeleccionado || sPorQueSeleccionado.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Por favor completá por qué tu negocio debería ser seleccionado.' },
        { status: 400 }
      )
    }

    const allowedMateriales = [
      'Sí, tengo todo listo para arrancar',
      'Tengo bastante, me faltan pulir detalles',
      'Tengo que armarlo desde cero',
    ]
    if (!allowedMateriales.includes(sMaterialesListos)) {
      return NextResponse.json(
        { success: false, error: 'Opción de disponibilidad de material no válida.' },
        { status: 400 }
      )
    }

    const payload = {
      nombre: sNombre,
      negocio: sNegocio,
      whatsapp: sWhatsapp,
      instagram: sInstagram,
      dedicacion: sDedicacion,
      antiguedad: sAntiguedad,
      canalVentas: sCanalVentas,
      trabaPrincipal: sTrabaPrincipal,
      porQueSeleccionado: sPorQueSeleccionado,
      materialesListos: sMaterialesListos,
      estado: 'pendiente' as const,
      notasAdmin: '',
    }

    // Save to Firestore
    const docId = await addPostulacionImpulso(payload)

    // Dispatch email notification
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
