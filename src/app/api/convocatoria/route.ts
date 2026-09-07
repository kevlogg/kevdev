import { NextResponse } from 'next/server'
import {
  savePostulacionServer,
  getPostulacionesServer,
  updatePostulacionServer,
  deletePostulacionServer,
} from '@/lib/convocatoria-server'
import { sendImpulsoNotificationEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

function sanitizeText(str: string, maxLength = 1000): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>'"]/g, '')
    .trim()
    .slice(0, maxLength)
}

export async function GET() {
  try {
    const list = await getPostulacionesServer()
    return NextResponse.json({ success: true, postulantes: list })
  } catch (err: any) {
    console.error('[Convocatoria API GET Error]:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Error al obtener postulantes' }, { status: 500 })
  }
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

    if (!sNombre || sNombre.length < 3) {
      return NextResponse.json({ success: false, error: 'Nombre y apellido requerido (mínimo 3 caracteres).' }, { status: 400 })
    }
    if (!sNegocio || sNegocio.length < 2) {
      return NextResponse.json({ success: false, error: 'Nombre de negocio requerido (mínimo 2 caracteres).' }, { status: 400 })
    }
    const waClean = sWhatsapp.replace(/[^\d+]/g, '')
    if (!sWhatsapp || waClean.length < 8) {
      return NextResponse.json({ success: false, error: 'Número de WhatsApp inválido (mínimo 8 dígitos).' }, { status: 400 })
    }
    if (!sInstagram.startsWith('@')) {
      sInstagram = `@${sInstagram}`
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

    // Save to Server Store / Firestore
    const docId = await savePostulacionServer(payload)

    // Dispatch email notification via Resend
    try {
      await sendImpulsoNotificationEmail(payload)
    } catch (emailErr) {
      console.error('[Convocatoria API] Email notification warning:', emailErr)
    }

    return NextResponse.json({
      success: true,
      id: docId,
      message: 'Postulación registrada con éxito',
    })
  } catch (error: any) {
    console.error('[Convocatoria API POST Error]:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Error interno al procesar la postulación.' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, estado, notasAdmin } = body || {}

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de postulación requerido.' }, { status: 400 })
    }

    const updates: any = {}
    if (estado !== undefined) updates.estado = estado
    if (notasAdmin !== undefined) updates.notasAdmin = sanitizeText(notasAdmin, 2000)

    await updatePostulacionServer(id, updates)
    return NextResponse.json({ success: true, message: 'Postulación actualizada.' })
  } catch (err: any) {
    console.error('[Convocatoria API PUT Error]:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Error al actualizar postulación.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido.' }, { status: 400 })
    }

    await deletePostulacionServer(id)
    return NextResponse.json({ success: true, message: 'Postulación eliminada.' })
  } catch (err: any) {
    console.error('[Convocatoria API DELETE Error]:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Error al eliminar postulación.' }, { status: 500 })
  }
}
