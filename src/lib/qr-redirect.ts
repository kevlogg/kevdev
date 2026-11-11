import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

interface CacheEntry {
  targetUrl: string
  expires: number
}

// Memoria rápida en Edge (0ms para accesos frecuentes)
const qrMemoryCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15_000 // 15 segundos de cache en el worker Edge

const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kevdev-1234'
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAcoTvuqhnDegDQc49z4iH4GL3X0OHB5po'

/**
 * Incrementa el contador de escaneos y fecha de último escaneo usando
 * la REST API de Firestore (commit con transform) en segundo plano.
 * Se ejecuta mediante event.waitUntil() para no retrasar la redirección ni un milisegundo.
 */
export async function recordQrScan(code: string): Promise<void> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:commit?key=${FIREBASE_API_KEY}`

  const body = {
    writes: [
      {
        transform: {
          document: `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/qr_tarjetas/${cleanCode}`,
          fieldTransforms: [
            {
              fieldPath: 'scanCount',
              increment: { integerValue: '1' },
            },
            {
              fieldPath: 'lastScannedAt',
              setToServerValue: 'REQUEST_TIME',
            },
            {
              fieldPath: 'serverLastScannedAt',
              setToServerValue: 'REQUEST_TIME',
            },
          ],
        },
      },
    ],
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    })
  } catch (err) {
    // Registro defensivo en segundo plano
    console.warn(`[recordQrScan] Error actualizando escaneo de tarjeta #${cleanCode}:`, err)
  }
}

/**
 * Consulta la URL de destino de la tarjeta directamente a través de la REST API de Firestore (~80ms).
 */
export async function fetchQrTargetUrl(code: string): Promise<{ targetUrl: string; status: string } | null> {
  const cleanCode = (code || '').trim()
  if (!cleanCode) return null

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/qr_tarjetas/${cleanCode}?key=${FIREBASE_API_KEY}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1800),
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const fields = data?.fields || {}

    const targetUrl = (fields?.targetUrl?.stringValue || '').trim()
    const status = (fields?.status?.stringValue || (targetUrl ? 'active' : 'unassigned')).trim()

    return { targetUrl, status }
  } catch (err) {
    console.warn(`[fetchQrTargetUrl] Error consultando tarjeta #${cleanCode}:`, err)
    return null
  }
}

/**
 * Normaliza y valida la URL de destino para redirección inmediata.
 */
function normalizeTargetUrl(url: string): string {
  const clean = url.trim()
  if (!clean) return ''
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`
}

/**
 * Manejador principal en el Edge para interceptar y resolver redirecciones de QR dinámicos
 * a velocidad récord sin cargar Next.js React ni descargar bundles en el teléfono.
 */
export async function handleQrRedirect(req: NextRequest, event: NextFetchEvent): Promise<NextResponse> {
  const { pathname, searchParams } = req.nextUrl

  // Extraer el código: "/r/101" -> "101"
  const segments = pathname.split('/').filter(Boolean)
  const code = (segments[1] || '').trim()

  // Si no hay código (por ejemplo "/r" o "/r/"), continuar a la ruta normal
  if (!code) {
    return NextResponse.next()
  }

  // Si el usuario o admin especificó modo configuración o edición manual, continuar a React
  const isEditMode = searchParams.get('setup') === 'true' || searchParams.get('edit') === 'true'
  if (isEditMode) {
    return NextResponse.next()
  }

  // 1. Verificar cache en memoria rápida Edge (0ms de latencia)
  const cached = qrMemoryCache.get(code)
  if (cached && cached.expires > Date.now() && cached.targetUrl) {
    // Incrementar en segundo plano (asíncrono, no bloquea al usuario)
    event.waitUntil(recordQrScan(code))

    const res = NextResponse.redirect(cached.targetUrl, 307)
    res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  // 2. Consultar directamente a la REST API de Firestore (~80ms)
  const result = await fetchQrTargetUrl(code)

  if (result && result.status === 'active' && result.targetUrl) {
    const finalUrl = normalizeTargetUrl(result.targetUrl)

    // Guardar en cache corta de Edge
    qrMemoryCache.set(code, {
      targetUrl: finalUrl,
      expires: Date.now() + CACHE_TTL_MS,
    })

    // Registrar el escaneo en segundo plano sin esperar a que termine la base de datos
    event.waitUntil(recordQrScan(code))

    // Redirección HTTP 307 instantánea
    const res = NextResponse.redirect(finalUrl, 307)
    res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return res
  }

  // 3. Tarjeta sin asignar o sin enlace activo: pasar a Next.js para mostrar activador/configurador
  return NextResponse.next()
}

