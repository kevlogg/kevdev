import { NextRequest, NextFetchEvent } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { handleQrRedirect } from './lib/qr-redirect'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl

  // 1. Redirección ultrarrápida de códigos QR y tarjetas NFC en el Edge (/r/:code)
  if (pathname === '/r' || pathname.startsWith('/r/')) {
    return handleQrRedirect(req, event)
  }

  // 2. Rutas con internacionalización (es, en, pt, fr, de)
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Captura de códigos QR dinámicos
    '/r/:path*',
    // Rutas multi-idioma (excluyendo api, admin, _next y archivos con extensión)
    '/((?!api|admin|_next|.*\\..*).*)',
  ],
}
