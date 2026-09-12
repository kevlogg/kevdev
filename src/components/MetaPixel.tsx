'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { generateEventId } from '@/lib/metaPixel'

interface MetaPixelProps {
  pixelId?: string
}

function MetaPixelTracker({ pixelId }: MetaPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  const activePixelId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || '1629627702097924'

  useEffect(() => {
    if (!activePixelId) return

    // Evitamos duplicar la vista inicial que ya se dispara en el script base en <head>
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const eventId = generateEventId('pv')
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView', {}, { eventID: eventId })
      console.log(`[Meta Pixel] PageView disparado en navegación SPA (${pathname}):`, {
        path: pathname,
        eventID: eventId,
      })
    }
  }, [pathname, searchParams, activePixelId])

  return null
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || '1629627702097924'

  if (!activePixelId) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <MetaPixelTracker pixelId={activePixelId} />
    </Suspense>
  )
}
