'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactForm() {
  const t = useTranslations('contactoPage')

  // Form State
  const [name, setName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [selectedService, setSelectedService] = useState('Sitios web & Landing pages')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const servicesList: string[] = (t.raw('fields.services') as string[]) || [
    'Sitios web & Landing pages',
    'Tiendas online (E-commerce)',
    'Software a medida & Integraciones API',
    'Optimización SEO & Rendimiento',
  ]

  const WA_HREF = `https://wa.me/5492235851419?text=${encodeURIComponent(t('whatsappMessage'))}`

  // GA4 Tracker helper
  const trackEvent = (eventName: string, params: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', eventName, params)
      }
    } catch {}
  }

  // Handle WhatsApp Click Event
  const handleWhatsAppClick = () => {
    trackEvent('click_whatsapp', {
      event_category: 'lead_conversion',
      event_label: 'Fast Track WhatsApp Button',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    })
  }

  // Handle Form Submit Event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !contactInfo.trim()) {
      setErrorMsg('Por favor completá tu nombre y método de contacto.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      // Send Lead Event to GA4
      trackEvent('generate_lead', {
        event_category: 'form_submission',
        event_label: selectedService,
        lead_type: 'quote_request',
        value: 1,
      })

      // Send Lead Data to Server Analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'kevdev',
          eventType: 'lead_form_submit',
          path: typeof window !== 'undefined' ? window.location.pathname : '/contacto',
          device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
          metadata: {
            name,
            contactInfo,
            service: selectedService,
            description,
          },
        }),
      })

      setSubmitted(true)
    } catch {
      setSubmitted(true) // Always present positive UX
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--gutter)' }}>
      {/* ── HEADER / HERO TITLE ────────────────────────────────────── */}
      <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 4rem' }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: '#22d3ee',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            padding: '0.4rem 1rem',
            borderRadius: 99,
            display: 'inline-block',
            marginBottom: '1.5rem',
          }}
        >
          {t('badge')}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--color-star)',
            margin: '0 0 1.5rem',
          }}
        >
          Hablemos de tu proyecto.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #22d3ee, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Enfoque directo y tiempos claros.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(1rem, 1.8vw, 1.1875rem)',
            lineHeight: 1.75,
            color: 'var(--color-muted)',
            margin: 0,
          }}
        >
          {t('subtext')}
        </motion.p>
      </div>

      {/* ── DUAL CONVERSION SECTION ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT COLUMN: WHATSAPP FAST TRACK & NAP TRUST ──────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {/* Fast-Track Card */}
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.75))',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: 24,
              padding: '2.25rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(6, 182, 212, 0.15)',
            }}
          >
            <div
              style={{
                position: 'absolute', top: 0, right: 0, width: 120, height: 120,
                background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#22d3ee',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                display: 'block',
              }}
            >
              ⚡ {t('fastTrackTitle')}
            </span>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#ffffff',
                margin: '0 0 1rem',
              }}
            >
              ¿Preferís coordinar sin esperas?
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9375rem',
                color: 'var(--color-muted)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}
            >
              Escribime directamente por WhatsApp para mandarme audios, referencias de diseño o coordinar una breve llamada.
            </p>

            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '1rem 1.75rem',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #00e9ff, #06b6d4)',
                color: '#07090e',
                fontFamily: 'var(--font-ui)',
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 10px 30px -5px rgba(6, 182, 212, 0.5)',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(6, 182, 212, 0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(6, 182, 212, 0.5)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t('whatsappBtn')}</span>
            </a>

            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: '#34d399',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#34d399',
                  boxShadow: '0 0 10px #34d399', display: 'inline-block',
                }}
              />
              <span>{t('statusIndicator')}</span>
            </div>
          </div>

          {/* NAP Trust / Local SEO Card */}
          <div
            style={{
              background: 'rgba(18, 18, 18, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24,
              padding: '2rem',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.125rem',
                color: '#ffffff',
                margin: '0 0 1.25rem',
              }}
            >
              📍 {t('nap.title')}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('nap.hoursLabel')}
                </span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--color-star)', fontWeight: 600 }}>
                  {t('nap.hoursValue')}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  {t('nap.locationLabel')}
                </span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--color-star)', fontWeight: 600 }}>
                  {t('nap.locationValue')}
                </span>
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <a
                  href="https://share.google/Vmv20uo1V4pSFQY8h"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#22d3ee',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>{t('nap.googleMapsBtn')}</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN: LEAD QUALIFICATION FORM ────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            background: 'rgba(18, 18, 18, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#ffffff',
              margin: '0 0 1.75rem',
            }}
          >
            📋 {t('formTitle')}
          </h3>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 16,
                  padding: '2.5rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', margin: '0 auto 1.25rem',
                  }}
                >
                  ✓
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#ffffff', margin: '0 0 0.5rem' }}>
                  {t('fields.successMsg')}
                </h4>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', margin: '0 0 1.5rem' }}>
                  Me pondré en contacto en un plazo máximo de 24 horas hábiles.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setName('')
                    setContactInfo('')
                    setDescription('')
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 10,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Enviar otra consulta
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Service Pills Selection */}
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {t('fields.serviceLabel')} *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {servicesList.map((service) => {
                      const active = selectedService === service
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            padding: '0.5rem 0.85rem',
                            borderRadius: 12,
                            border: active ? '1px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: active ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            color: active ? '#22d3ee' : 'var(--color-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {service}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label
                    htmlFor="contact-name"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('fields.nameLabel')} *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('fields.namePlaceholder')}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      color: '#ffffff',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Contact Info Field */}
                <div>
                  <label
                    htmlFor="contact-info"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('fields.contactLabel')} *
                  </label>
                  <input
                    id="contact-info"
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder={t('fields.contactPlaceholder')}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      color: '#ffffff',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label
                    htmlFor="contact-desc"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('fields.descLabel')}
                  </label>
                  <textarea
                    id="contact-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('fields.descPlaceholder')}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      color: '#ffffff',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {errorMsg && (
                  <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontFamily: 'var(--font-ui)' }}>
                    {errorMsg}
                  </span>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    border: 'none',
                    color: '#ffffff',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '1rem 1.75rem',
                    borderRadius: 14,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.25s',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? t('fields.submitting') : t('fields.submitBtn')}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
