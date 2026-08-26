'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function WhatsAppCloserPage() {
  const [email, setEmail] = useState('')
  const [includeBump, setIncludeBump] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'architecture' | 'terminal' | 'features'>('terminal')

  const basePrice = 9999
  const bumpPrice = 4999
  const totalPrice = includeBump ? basePrice + bumpPrice : basePrice

  const formattedTotal = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(totalPrice)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Por favor, ingresá un correo electrónico válido.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          includeBump,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || !data.init_point) {
        throw new Error(data.error || 'No se pudo iniciar el proceso de checkout.')
      }

      // Redirect to Mercado Pago Checkout Pro
      window.location.href = data.init_point
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMessage(err?.message || 'Ocurrió un error inesperado. Por favor reintentá.')
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--color-void)', color: 'var(--color-star)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: 'calc(76px + clamp(3rem, 6vw, 5rem))', paddingBottom: 'clamp(5rem, 10vw, 8rem)' }}>
        <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 5rem)' }}>
          
          {/* ── HEADER BADGE & TITLES ────────────────────────────────────── */}
          <section style={{ textAlign: 'center', maxWidth: 820, marginInline: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="type-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', boxShadow: '0 0 10px var(--color-accent)' }} />
                Vault ⚡ Sistema n8n + IA en producción
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: 0.96,
                letterSpacing: '-0.03em',
                color: 'var(--color-star)',
                margin: 0,
                textShadow: '0 4px 28px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)',
              }}
            >
              WhatsApp AI Closer:<br />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--color-accent)',
                textShadow: '0 0 32px rgba(0,229,255,0.4), 0 2px 16px rgba(0,0,0,0.95)',
              }}>
                Sistema Autónomo con n8n
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.9375rem, 1.3vw, 1.125rem)',
                color: 'var(--color-star)',
                lineHeight: 1.65,
                maxWidth: 680,
                margin: 0,
                opacity: 0.85,
                textShadow: '0 2px 16px rgba(0,0,0,0.95)',
              }}
            >
              Convierte prospectos fríos en clientes calificados 24/7 en WhatsApp sin intervención humana.
              Infraestructura lista para desplegar en n8n con agentes conversacionales, prompts optimizados y registro en base de datos.
            </motion.p>
          </section>

          {/* ── MAIN GRID: DEMO STREAM + CHECKOUT FORM ────────────────────── */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'start',
            maxWidth: 1200,
            marginInline: 'auto',
            width: '100%',
          }}>
            
            {/* LEFT COLUMN: DEMO TABS & LOG STREAM */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              {/* TAB BUTTONS */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.4rem',
                background: 'rgba(18,18,18,0.72)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 99,
              }}>
                {[
                  { id: 'terminal', label: '>_ Terminal Stream' },
                  { id: 'architecture', label: '⚙ Arquitectura' },
                  { id: 'features', label: '📦 Contenido' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.85rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      borderRadius: 99,
                      border: activeTab === tab.id ? '1px solid var(--color-accent)' : '1px solid transparent',
                      background: activeTab === tab.id ? 'rgba(0,229,255,0.12)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.25s var(--ease-expo)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB PANEL CONTAINER */}
              <div style={{
                padding: 'clamp(2rem, 3.5vw, 3rem)',
                background: 'rgba(18, 18, 18, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2px solid var(--color-accent)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.75rem',
              }}>
                
                {activeTab === 'terminal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        <span style={{ color: 'var(--color-faint)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>n8n-live-webhook.log</span>
                      </div>
                      <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 700 }}>● ACTIVE (200 OK)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ color: 'var(--color-faint)' }}>
                        [14:26:01] <span style={{ color: 'var(--color-accent)' }}>WEBHOOK_INBOUND</span>: Incoming WhatsApp Message from +54911****4892
                      </div>
                      <div style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 12,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'var(--color-star)',
                      }}>
                        <span style={{ color: 'var(--color-faint)' }}>USER:</span> "Hola, vi el anuncio en Meta Ads. ¿De qué se trata el sistema y cuánto cuesta?"
                      </div>
                      <div style={{ color: 'var(--color-faint)' }}>
                        [14:26:02] <span style={{ color: '#c084fc' }}>EXEC_AI_AGENT</span>: Analyzing intent &amp; context memory...
                      </div>
                      <div style={{ color: 'var(--color-faint)' }}>
                        [14:26:03] <span style={{ color: '#818cf8' }}>QUALIFIER_NODE</span>: Intent identified: Lead busca automatizar ventas. Lead Score: 95/100
                      </div>
                      <div style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 12,
                        background: 'rgba(0,229,255,0.06)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        color: 'var(--color-accent)',
                      }}>
                        <span style={{ fontWeight: 800 }}>AI CLOSER:</span> "¡Hola! Excelente. El WhatsApp AI Closer es una arquitectura en n8n que responde, califica y cierra ventas de forma autónoma 24/7. Te muestro la demo en tiempo real y el enlace directo..."
                      </div>
                      <div style={{ color: 'var(--color-faint)' }}>
                        [14:26:04] <span style={{ color: 'var(--color-accent)' }}>FIRESTORE_SYNC</span>: Saved lead + status='QUALIFIED' to database.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'architecture' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <span className="type-label" style={{ color: 'var(--color-accent)' }}>
                      Flujo de Arquitectura del Workflow
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {[
                        { step: '01', title: 'Meta Ads / Lead Inbound', sub: 'Mensaje entrante a WhatsApp Business via Webhook', tag: 'HTTPS' },
                        { step: '02', title: 'Motor n8n Core Workflow', sub: 'Procesamiento con IA + Memoria Conversacional', tag: 'JSON' },
                        { step: '03', title: 'Cierre & Base de Datos', sub: 'Envío de link de checkout MP + Sync en Firestore', tag: 'AUTO' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          padding: '1rem 1.25rem',
                          borderRadius: 14,
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                              padding: '0.35rem 0.6rem',
                              borderRadius: 8,
                              background: 'rgba(0,229,255,0.1)',
                              color: 'var(--color-accent)',
                              fontWeight: 800,
                            }}>{item.step}</span>
                            <div>
                              <div style={{ color: 'var(--color-star)', fontWeight: 700 }}>{item.title}</div>
                              <div style={{ color: 'var(--color-faint)', fontSize: '0.75rem', marginTop: 2 }}>{item.sub}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.6875rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.6rem', borderRadius: 99, color: 'var(--color-accent)', border: '1px solid rgba(0,229,255,0.2)' }}>
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <span className="type-label" style={{ color: 'var(--color-accent)' }}>
                      ¿Qué vas a recibir exactamente?
                    </span>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)' }}>
                      {[
                        { title: 'Blueprint JSON n8n Completo', desc: 'Workflow probado e inyectable en tu instancia de n8n en 1 clic.' },
                        { title: 'Prompts de IA de Alta Conversión', desc: 'Instrucciones de sistema diseñadas para persuasión y calificación rápida.' },
                        { title: 'Acceso al Tutor Privado NotebookLM', desc: 'Asistente de IA entrenado exclusivamente para guiarte en el setup.' },
                        { title: 'Guía de Despliegue Paso a Paso', desc: 'Documentación clara para conectar n8n con WhatsApp API y Firebase.' },
                      ].map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 800, marginTop: 2 }}>✓</span>
                          <div>
                            <strong style={{ color: 'var(--color-star)' }}>{f.title}:</strong> {f.desc}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-faint)',
                }}>
                  <span>KEVDEV VAULT PRODUCT #01</span>
                  <span style={{ color: 'var(--color-accent)' }}>GARANTÍA DE DESPLIEGUE</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: CHECKOUT FORM & MERCADO PAGO */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div style={{
                padding: 'clamp(2rem, 3.5vw, 3rem)',
                background: 'rgba(18, 18, 18, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2px solid var(--color-accent)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem',
              }}>
                
                {/* CARD HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', gap: '1rem' }}>
                  <div>
                    <span className="type-label" style={{ color: 'var(--color-accent)', fontSize: '0.625rem' }}>
                      OFERTA METAS ADS
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--color-star)', margin: '0.4rem 0 0', letterSpacing: '-0.02em' }}>
                      Acceso Inmediato
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-faint)', textDecoration: 'line-through' }}>$20.000 ARS</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                      {formattedTotal} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-faint)' }}>ARS</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* EMAIL INPUT */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label htmlFor="checkout-email" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-star)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Tu Correo Electrónico (Donde recibirás el acceso)
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-email@dominio.com"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1.25rem',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 14,
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-faint)', fontFamily: 'var(--font-ui)' }}>
                      🔒 Cero spam. Solo recibirás tus accesos y claves de descarga.
                    </span>
                  </div>

                  {/* ORDER BUMP CHECKBOX */}
                  <div
                    onClick={() => setIncludeBump(!includeBump)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 16,
                      background: includeBump ? 'rgba(0,229,255,0.08)' : 'rgba(0,0,0,0.3)',
                      border: includeBump ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s var(--ease-expo)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="order-bump"
                      checked={includeBump}
                      onChange={(e) => setIncludeBump(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                    />
                    <label htmlFor="order-bump" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                        ⚡ ORDER BUMP OPCIONAL (+ $4.999 ARS)
                      </div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--color-star)' }}>Pack de 15 Blueprints JSON Adicionales:</strong> Colección lista para importar de workflows de n8n (Atención al cliente, Agendamiento, Scraping y Notificaciones).
                      </div>
                    </label>
                  </div>

                  {/* ERROR ALERT */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          padding: '0.85rem 1rem',
                          background: 'rgba(244,63,94,0.1)',
                          border: '1px solid rgba(244,63,94,0.3)',
                          borderRadius: 12,
                          color: '#f43f5e',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        ⚠️ {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '3.5rem',
                      borderRadius: 99,
                      background: 'var(--color-accent)',
                      color: 'var(--color-on-accent, #0c0c0c)',
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      fontFamily: 'var(--font-ui)',
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 6px 28px rgba(0,229,255,0.36)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.22s var(--ease-expo)',
                    }}
                  >
                    {loading ? (
                      <span>Generando Checkout Mercado Pago...</span>
                    ) : (
                      <>
                        <span>PAGAR CON MERCADO PAGO ({formattedTotal})</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-faint)',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span>🛡️ Mercado Pago SSL</span>
                    <span>●</span>
                    <span>⚡ Entrega Inmediata</span>
                  </div>

                </form>

              </div>
            </motion.div>

          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
