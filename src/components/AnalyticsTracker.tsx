'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/* ── Persistent visitor ID ──────────────────────────────────────────── */
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

/* ── GA4 helper ─────────────────────────────────────────────────────── */
function trackGA4(eventName: string, params: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', eventName, params)
    }
  } catch {}
}

/* ── Traffic source detection ───────────────────────────────────────── */
function detectTrafficSource(): string {
  if (typeof window === 'undefined') return 'directo'
  try {
    // UTM params always win
    const utm = new URLSearchParams(window.location.search).get('utm_source')
    if (utm) {
      const norm: Record<string, string> = {
        ig: 'instagram', instagram: 'instagram',
        fb: 'facebook',  facebook:  'facebook',
        google: 'google_organico', cpc: 'google_organico',
        linkedin: 'linkedin', twitter: 'twitter', tiktok: 'tiktok',
        whatsapp: 'whatsapp',
      }
      return norm[utm.toLowerCase()] || utm.toLowerCase()
    }

    const ref = document.referrer.toLowerCase()
    if (!ref) return 'directo'
    if (ref.includes('google.'))     return 'google_organico'
    if (ref.includes('bing.')  || ref.includes('duckduckgo.') || ref.includes('yahoo.')) return 'buscador_organico'
    if (ref.includes('instagram.'))  return 'instagram'
    if (ref.includes('whatsapp.')  || ref.includes('wa.me'))   return 'whatsapp'
    if (ref.includes('facebook.')  || ref.includes('fb.com'))   return 'facebook'
    if (ref.includes('linkedin.'))   return 'linkedin'
    if (ref.includes('t.co')       || ref.includes('twitter.') || ref.includes('x.com')) return 'twitter'
    if (ref.includes('tiktok.'))     return 'tiktok'
    try {
      const host = new URL(ref).hostname
      if (host && !host.includes('kevdev')) return `referral`
    } catch {}
  } catch {}
  return 'directo'
}

/* ── CTA classifier ─────────────────────────────────────────────────── */
interface CtaInfo {
  buttonId: string
  label: string
}

function classifyClick(target: HTMLElement): CtaInfo | null {
  // Walk up max 4 levels to find a, button, or [role=button]
  let el: HTMLElement | null = target
  for (let i = 0; i < 4; i++) {
    if (!el) break
    const tag = el.tagName.toLowerCase()
    if (tag === 'a' || tag === 'button' || el.getAttribute('role') === 'button') break
    el = el.parentElement
  }
  if (!el) return null

  const tag  = el.tagName.toLowerCase()
  const href = el.getAttribute('href') || ''
  const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50)
  const type = (el as HTMLInputElement).type || ''

  // Skip non-interactive or internal admin/anchor clicks
  if (tag === 'a' && (href.startsWith('#') || href.includes('/admin'))) return null
  if (tag === 'button' && type === 'button' && el.closest('select, [role=listbox]')) return null

  // ── Explicit pattern matching for all known CTAs ──────────────────
  if (href.includes('wa.me') || href.includes('whatsapp.com')) {
    return { buttonId: 'cta_whatsapp', label: 'Botón WhatsApp' }
  }
  if (href.includes('instagram.com')) {
    return { buttonId: 'cta_instagram', label: 'Perfil de Instagram' }
  }
  if (href.includes('linkedin.com')) {
    return { buttonId: 'cta_linkedin', label: 'Perfil de LinkedIn' }
  }
  if (href.includes('share.google') || href.includes('maps.google') || href.includes('maps.app.goo')) {
    return { buttonId: 'cta_google_maps', label: 'Ver en Google Maps' }
  }
  if (href.includes('/diagnostico') || el.closest('[href*="diagnostico"]')) {
    return { buttonId: 'cta_diagnostico', label: 'Solicitar Diagnóstico' }
  }
  if (href.includes('/presupuesto')) {
    return { buttonId: 'cta_presupuesto', label: 'Calculadora de Presupuesto' }
  }
  if (href.includes('/proyectos') || href === '/proyectos') {
    return { buttonId: 'cta_proyectos', label: 'Ver Proyectos / Portfolio' }
  }
  if (href.includes('/contacto') || href === '/contacto' || href.includes('/#contacto')) {
    return { buttonId: 'cta_contacto', label: 'Ir a Contacto' }
  }
  if (href.includes('/impulso-digital') || href.includes('/convocatoria')) {
    return { buttonId: 'cta_impulso_digital', label: 'Impulso Digital / Convocatoria' }
  }
  if (href.includes('/diseno-web')) {
    return { buttonId: 'cta_diseno_web', label: 'Servicios Diseño Web' }
  }
  if (href.includes('/tiendas-online')) {
    return { buttonId: 'cta_tiendas_online', label: 'Servicios Tiendas Online' }
  }
  if (href.includes('/desarrollo-a-medida')) {
    return { buttonId: 'cta_desarrollo_medida', label: 'Servicios Desarrollo a Medida' }
  }
  if (href.includes('/vault')) {
    return { buttonId: 'cta_vault', label: 'KevDev Vault' }
  }

  // ── Form submit buttons ───────────────────────────────────────────
  if (tag === 'button' && (type === 'submit' || type === '')) {
    const form = el.closest('form')
    if (form) {
      const formId = form.id || form.getAttribute('data-form') || 'form_generic'
      return {
        buttonId: `cta_form_submit_${formId}`,
        label: `Enviar Formulario: ${text || formId}`,
      }
    }
  }

  // ── Generic: capture button with meaningful text (min 3 chars) ───
  if (tag === 'button' && text.length >= 3) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)
    // Skip generic UI buttons (filters, toggles, etc.)
    const skipPatterns = ['7d', '30d', '90d', 'actualizar', 'cerrar', 'ok', 'cancel']
    if (skipPatterns.some(p => normalized.includes(p))) return null
    return { buttonId: `btn_${normalized}`, label: text }
  }

  // ── External link that isn't social ─────────────────────────────
  if (tag === 'a' && href.startsWith('http') && !href.includes('kevdev.net.ar')) {
    try {
      const host = new URL(href).hostname.replace('www.', '')
      return { buttonId: `ext_${host.replace(/\./g, '_')}`, label: `Enlace externo: ${host}` }
    } catch {}
  }

  return null
}

/* ── Fire analytics event to server ────────────────────────────────── */
function fireEvent(payload: Record<string, any>) {
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})
  } catch {}
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function AnalyticsTracker() {
  const pathname = usePathname()

  // ── Pageview on every route change ──────────────────────────────
  useEffect(() => {
    try {
      const visitorId = getVisitorId()
      const path      = pathname || window.location.pathname
      const source    = detectTrafficSource()
      const device    = window.innerWidth < 768 ? 'mobile' : 'desktop'

      trackGA4('page_view', { page_path: path, visitor_id: visitorId, traffic_source: source })

      fireEvent({
        site: 'kevdev',
        eventType: 'pageview',
        path,
        device,
        source,
        metadata: { visitorId, referrer: document.referrer.slice(0, 200) },
      })
    } catch {}
  }, [pathname])

  // ── Global click capture ─────────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      try {
        const cta = classifyClick(e.target as HTMLElement)
        if (!cta) return

        const visitorId = getVisitorId()
        const source    = detectTrafficSource()
        const device    = window.innerWidth < 768 ? 'mobile' : 'desktop'

        trackGA4('select_content', { content_type: 'button', item_id: cta.buttonId, label: cta.label })

        fireEvent({
          site:      'kevdev',
          eventType: 'button_click',
          buttonId:  cta.buttonId,
          path:      window.location.pathname,
          device,
          source,
          metadata:  { label: cta.label, visitorId },
        })
      } catch {}
    }

    window.addEventListener('click', handleClick, { capture: true, passive: true })
    return () => window.removeEventListener('click', handleClick, { capture: true })
  }, [])

  return null
}
