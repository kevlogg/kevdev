'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getVisitorId(): string {
  try {
    let vId = localStorage.getItem('kevdev_visitor_id')
    if (!vId) {
      vId = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      localStorage.setItem('kevdev_visitor_id', vId)
    }
    return vId
  } catch {
    return 'v_anon'
  }
}

// Enviar evento a Google Analytics 4 si está disponible
function trackGA4(eventName: string, params: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', eventName, params)
    }
  } catch {}
}

export default function AnalyticsTracker() {
  const pathname = usePathname()

  // Track pageview en cada cambio de ruta
  useEffect(() => {
    try {
      const visitorId = getVisitorId()
      const path = pathname || window.location.pathname

      // GA4
      trackGA4('page_view', { page_path: path, visitor_id: visitorId })

      // Servidor
      fetch('/api/analytics/track', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'kevdev',
          eventType: 'pageview',
          path,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          source: document.referrer.includes('instagram') ? 'instagram' : 'directo',
          metadata: { visitorId },
        }),
      }).catch(() => {})
    } catch {}
  }, [pathname])

  // Capturar clics globales en botones y enlaces importantes
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      try {
        const target = (e.target as HTMLElement).closest('a, button') as HTMLElement | null
        if (!target) return

        const href = target.getAttribute('href') || ''
        const text = target.innerText?.trim() || 'Boton'

        let buttonId = ''
        let label = ''

        if (href.includes('wa.me') || href.includes('whatsapp.com')) {
          buttonId = 'wsp_contact'
          label = 'Boton WhatsApp Directo'
        } else if (href.includes('instagram.com')) {
          buttonId = 'instagram_link'
          label = 'Perfil de Instagram'
        } else if (href.includes('linkedin.com')) {
          buttonId = 'linkedin_link'
          label = 'Perfil de LinkedIn'
        } else if (href.includes('diagnostico')) {
          buttonId = 'demo_request'
          label = 'Solicitar Demo / Diagnostico'
        } else if (href.includes('presupuesto')) {
          buttonId = 'quote_calc'
          label = 'Calculadora de Presupuesto'
        } else if (href.includes('proyectos')) {
          buttonId = 'portfolio_view'
          label = 'Ver Casos de Exito'
        } else if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
          buttonId = text.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) || 'btn_generic'
          label = text.slice(0, 40)
        }

        if (buttonId) {
          const visitorId = getVisitorId()

          // GA4
          trackGA4('select_content', { content_type: 'button', item_id: buttonId, label })

          // Servidor
          fetch('/api/analytics/track', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              site: 'kevdev',
              eventType: 'button_click',
              buttonId,
              path: window.location.pathname,
              device: window.innerWidth < 768 ? 'mobile' : 'desktop',
              metadata: { label, visitorId },
            }),
          }).catch(() => {})
        }
      } catch {}
    }

    window.addEventListener('click', handleGlobalClick, { capture: true })
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true })
  }, [])

  return null
}
