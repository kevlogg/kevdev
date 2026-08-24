/**
 * ============================================================================
 * KEVDEV - PLANTILLA DE INTEGRACIÓN DE PAGOS PARA CLIENTES
 * ============================================================================
 * Copia este archivo o helper en el backend o API de cualquier proyecto de cliente
 * (Next.js, Node.js, Express, etc.) para notificar automáticamente los cobros a KevDev.
 */

export interface KevDevPaymentNotification {
  clienteId: string         // ID de cliente en KevDev, URL o Nombre (ej: "dulce-hogar" o "dulcehogar.com.ar")
  monto: number             // Monto cobrado (ej: 25000)
  concepto?: string         // Detalle o concepto del pago (ej: "Suscripción Mensual", "Orden #1042")
  fecha?: string            // Formato ISO 'YYYY-MM-DD' (opcional, por defecto fecha actual)
  medioPago?: string        // 'MercadoPago', 'Stripe', 'Transferencia', etc.
  metodo?: string           // 'pasarela' o 'manual'
  referencia?: string       // ID de transacción de la pasarela (ej: "MP-987654321")
  confirmado?: boolean      // true si el pago está aprobado
  secret?: string           // Clave secreta (opcional si se pasa por header)
}

/**
 * Envía una notificación de pago al endpoint webhook de KevDev.
 * 
 * @param data Datos del pago del cliente
 * @param kevdevUrl URL del panel KevDev (por defecto https://www.kevdev.net.ar o tu dominio Vercel)
 * @param secret Clave de seguridad compartida (KEVDEV_PAYMENTS_SECRET)
 */
export async function sendPaymentToKevDev(
  data: KevDevPaymentNotification,
  kevdevUrl: string = process.env.KEVDEV_API_URL || 'https://www.kevdev.net.ar',
  secret: string = process.env.KEVDEV_PAYMENTS_SECRET || 'kevdev_payments_sec_2026_key'
): Promise<{ success: boolean; pagoId?: string; message?: string }> {
  try {
    const endpoint = `${kevdevUrl.replace(/\/$/, '')}/api/payments/receive`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kevdev-secret': secret,
      },
      body: JSON.stringify({
        ...data,
        secret,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[KevDev Webhook Error]:', result.error || 'Error de autenticación')
      return { success: false, message: result.error }
    }

    console.log('[KevDev Webhook OK]: Pago registrado exitosamente con ID:', result.pagoId)
    return { success: true, pagoId: result.pagoId, message: result.message }
  } catch (error: any) {
    console.error('[KevDev Webhook Failure]: Error de red al notificar pago:', error.message)
    return { success: false, message: error.message }
  }
}

/* 
============================================================================
EJEMPLO DE USO RÁPIDO EN UN WEBHOOK DE MERCADOPAGO O NEXT.JS API ROUTE:
============================================================================

import { sendPaymentToKevDev } from './client-payment-webhook'

export async function POST(req) {
  // 1. Procesar el pago localmente en el sitio del cliente...
  const paymentData = await req.json()
  
  if (paymentData.status === 'approved') {
    // 2. Notificar automáticamente a KevDev
    await sendPaymentToKevDev({
      clienteId: 'dulcehogar.com.ar',
      monto: paymentData.transaction_amount,
      concepto: 'Pago de Orden #' + paymentData.id,
      medioPago: 'MercadoPago',
      metodo: 'pasarela',
      referencia: String(paymentData.id),
      confirmado: true,
    })
  }

  return Response.json({ received: true })
}
*/
