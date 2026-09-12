/**
 * Meta Pixel & Conversions API (CAPI) deduplication helpers
 * KevDev — 2026
 */

declare global {
  interface Window {
    fbq?: any
    _fbq?: any
  }
}

/**
 * Genera un event_id único para deduplicación entre Meta Pixel (cliente) y Conversiones API (servidor CAPI).
 * Formato: kevdev_{prefix}_{timestamp}_{random}
 */
export function generateEventId(prefix: string = 'ev'): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `kevdev_${prefix}_${timestamp}_${randomStr}`
}

/**
 * Rastrear un evento estándar o personalizado de Meta Pixel con soporte para event_id (deduplicación CAPI).
 * @param eventName Nombre del evento (ej: 'PageView', 'Lead', 'Contact', 'ViewContent')
 * @param options Parámetros adicionales del evento
 * @param customEventId ID de evento opcional (si no se especifica, se genera uno automáticamente)
 * @returns El event_id utilizado para que pueda ser enviado a CAPI desde el servidor
 */
export function trackMetaEvent(
  eventName: string,
  options: Record<string, any> = {},
  customEventId?: string
): string {
  const eventId = customEventId || generateEventId(eventName.toLowerCase())

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, options, { eventID: eventId })
    console.log(`[Meta Pixel] Evento '${eventName}' disparado correctamente:`, {
      eventName,
      options,
      eventID: eventId,
    })
  } else {
    console.log(`[Meta Pixel Log] Evento '${eventName}' (SDK no disponible aún):`, {
      eventName,
      options,
      eventID: eventId,
    })
  }

  return eventId
}
