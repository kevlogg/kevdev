'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { generateEventId } from '@/lib/metaPixel'

interface MetaPixelProps {
  pixelId?: string
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  const activePixelId = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID

  // Escuchar cambios de ruta en la SPA (Single Page Application)
  useEffect(() => {
    if (!activePixelId) return

    // Evitamos duplicar la vista inicial que ya se dispara en el script base (fbq init)
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

  if (!activePixelId) {
    return null
  }

  return (
    <>
      {/* Script base oficial de Meta Pixel con deduplicación event_id */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            var initialEventId = 'kevdev_pv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView', {}, { eventID: initialEventId });

            console.log('%c[Meta Pixel] Cargado e Inicializado con Éxito %c', 'background: #1877F2; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;', '', {
              pixelId: '${activePixelId}',
              evento: 'PageView',
              eventID: initialEventId,
              deduplicacionCAPI: 'Estructura lista'
            });
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  )
}
