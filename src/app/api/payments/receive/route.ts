import { NextResponse } from 'next/server'
import { collection, addDoc, getDocs, query, where, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { signInAnonymously } from 'firebase/auth'

export const dynamic = 'force-dynamic'

const DEFAULT_SECRET = 'kevdev_payments_sec_2026_key'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-kevdev-secret',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const secretHeader = req.headers.get('x-kevdev-secret') || ''
    const body = await req.json().catch(() => ({}))

    const providedSecret =
      secretHeader ||
      (authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader) ||
      body.secret ||
      ''

    const expectedSecret = process.env.KEVDEV_PAYMENTS_SECRET || DEFAULT_SECRET

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'No autorizado. Clave de seguridad (x-kevdev-secret) inválida o ausente.' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Autenticar en Firebase antes de escribir (requerido por reglas de Firestore)
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {})
    }

    const { clienteId, monto, concepto, fecha, medioPago, metodo, referencia, confirmado } = body

    if (!clienteId || !monto || isNaN(Number(monto))) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: clienteId (string) y monto (número).' },
        { status: 400, headers: corsHeaders }
      )
    }

    let targetClienteId = String(clienteId).trim()
    let clienteNombre = 'Cliente Remoto'

    // 1. Buscar coincidencia directa por ID de documento
    try {
      const snap = await getDoc(doc(db, 'clientes', targetClienteId))
      if (snap.exists()) {
        clienteNombre = snap.data().nombre || targetClienteId
      } else {
        // 2. Buscar por URL o nombre si el ID pasado es un dominio o slug
        const qUrl = query(collection(db, 'clientes'))
        const allClisSnap = await getDocs(qUrl)
        const matched = allClisSnap.docs.find(d => {
          const data = d.data()
          const urlStr = (data.url || '').toLowerCase()
          const nameStr = (data.nombre || '').toLowerCase()
          const searchStr = targetClienteId.toLowerCase()
          return urlStr.includes(searchStr) || nameStr.includes(searchStr) || d.id === targetClienteId
        })

        if (matched) {
          targetClienteId = matched.id
          clienteNombre = matched.data().nombre
        }
      }
    } catch (err) {
      console.warn('Advertencia buscando cliente por ID en Webhook:', err)
    }

    const fechaFinal = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? fecha
      : new Date().toISOString().split('T')[0]

    // 3. Registrar el pago en Firestore
    const newPagoData = {
      clienteId: targetClienteId,
      monto: Number(monto),
      fecha: fechaFinal,
      concepto: concepto || 'Pago por Pasarela / Webhook',
      medioPago: medioPago || 'MercadoPago',
      metodo: metodo || 'pasarela',
      referencia: referencia || `TX-${Date.now()}`,
      confirmado: confirmado !== false,
      origen: 'WEBHOOK',
      creadoEn: serverTimestamp(),
    }

    const pagoRef = await addDoc(collection(db, 'historialPagos'), newPagoData)

    return NextResponse.json(
      {
        success: true,
        pagoId: pagoRef.id,
        clienteId: targetClienteId,
        clienteNombre,
        monto: Number(monto),
        message: 'Pago recibido y registrado exitosamente en KevDev',
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Error procesando webhook de pago en KevDev:', error)
    return NextResponse.json(
      { error: 'Error interno al registrar el pago: ' + (error?.message || 'Desconocido') },
      { status: 500, headers: corsHeaders }
    )
  }
}
