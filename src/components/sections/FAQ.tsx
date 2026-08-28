'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ_ITEMS = [
  {
    id: 'tiempo',
    question: '¿Cuánto demora el desarrollo de una web?',
    answer: 'Los tiempos de entrega varían según el alcance: una Landing Page se entrega entre 5 y 7 días hábiles, un sitio web institucional entre 10 y 15 días, una Tienda Online entre 2 y 3 semanas, y un Sistema Web a Medida entre 3 y 5 semanas.',
    detail: [
      'Landing Pages & One-Page: 5 a 7 días hábiles.',
      'Sitios Institucionales Corporativos: 10 a 15 días hábiles.',
      'Tiendas Online (E-Commerce): 2 a 3 semanas.',
      'Sistemas Web a Medida / SaaS: 3 a 5 semanas.',
    ],
  },
  {
    id: 'pagos',
    question: '¿Qué medios de pago integran en e-commerce?',
    answer: 'Integramos pasarelas líderes en Argentina y el exterior: Mercado Pago (tarjetas en cuotas, dinero en cuenta), Mobbex, Stripe y PayU. Además, configuramos opciones de transferencia bancaria directa con descuento automático.',
    detail: [
      'Mercado Pago: Cobro con tarjetas de crédito/débito, cuotas y dinero en cuenta.',
      'Mobbex & Stripe: Procesamiento en moneda local o dólares para ventas internacionales.',
      'Transferencia Bancaria: Descuento automático configurado en el checkout.',
    ],
  },
  {
    id: 'hosting',
    question: '¿Incluye hosting y dominio?',
    answer: '¡Sí, totalmente! Todos nuestros proyectos incluyen 1 año completo de hosting optimizado de alta velocidad (servidores SSD con SSL/HTTPS) y la gestión o registro de tu dominio personalizado (.com.ar o .com).',
    detail: [
      '1 año gratis de Hosting SSD de alta velocidad.',
      'Gestión y registro de tu dominio personalizado (.com.ar o .com).',
      'Certificado de Seguridad SSL (HTTPS) activado permanente.',
    ],
  },
  {
    id: 'seo',
    question: '¿El sitio estará optimizado para Google (SEO)?',
    answer: 'Absolutamente. Aplicamos SEO Técnico On-Page desde el código: estructura semántica HTML5, metadatos enriquecidos (Title, Description, OpenGraph), velocidad de carga prioritaria (95+ Google PageSpeed) y esquemas JSON-LD (LocalBusiness, Service, FAQPage) listos para Google AI (Gemini).',
    detail: [
      'Estructura de metadatos (Title, Meta Description, OpenGraph).',
      'Etiquetado semántico HTML5 (H1, H2, H3).',
      'Datos estructurados Schema.org para Google Search & Google AI Snippets.',
    ],
  },
  {
    id: 'mobile',
    question: '¿Mi sitio web se verá bien en celulares y tablets?',
    answer: 'Sí, diseñamos bajo la filosofía Mobile-First. Garantizamos que tu interfaz responderá con fluidez en smartphones iPhone/Android, tablets, notebooks y pantallas 4K.',
    detail: [
      'Diseño 100% Mobile Responsive.',
      'Optimización de gestos táctiles y tiempos de respuesta.',
    ],
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section
      id="faq"
      style={{
        position: 'relative',
        zIndex: 10,
        padding: 'clamp(4rem, 8vw, 7rem) 0',
        background: 'rgba(12, 12, 12, 0.75)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="site-container" style={{ maxWidth: 880 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
          <span
            className="type-label"
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: 99,
              background: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              color: '#22d3ee',
              marginBottom: '1rem',
            }}
          >
            Google AI Snippets Ready
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--color-star)',
              margin: '0 0 1rem',
            }}
          >
            Preguntas Frecuentes <span style={{ color: '#22d3ee' }}>(FAQ)</span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
              color: 'var(--color-muted)',
              maxWidth: '54ch',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Respuestas transparentes sobre nuestros procesos de desarrollo, pasarelas de pago y soporte técnico.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.id}
                style={{
                  background: isOpen ? 'rgba(22, 27, 38, 0.85)' : 'rgba(18, 18, 18, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${isOpen ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  boxShadow: isOpen ? '0 12px 30px -10px rgba(34, 211, 238, 0.15)' : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isOpen ? '#38bdf8' : 'var(--color-star)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <span>{item.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isOpen ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: isOpen ? '#38bdf8' : 'var(--color-muted)',
                      flexShrink: 0,
                    }}
                  >
                    ↓
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 1.5rem 1.5rem 1.5rem',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.9375rem',
                          lineHeight: 1.7,
                          color: 'var(--color-muted)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          marginTop: '0.25rem',
                          paddingTop: '1rem',
                        }}
                      >
                        <p style={{ margin: '0 0 0.75rem' }}>{item.answer}</p>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                            fontSize: '0.875rem',
                            color: 'rgba(221, 232, 255, 0.8)',
                          }}
                        >
                          {item.detail.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
