'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VaultRootPage() {
  return (
    <div style={{ background: 'var(--color-void)', color: 'var(--color-star)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: 'calc(76px + clamp(3rem, 6vw, 5rem))', paddingBottom: 'clamp(5rem, 10vw, 8rem)' }}>
        <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 5rem)' }}>
          
          {/* HEADER */}
          <section style={{ textAlign: 'center', maxWidth: 760, marginInline: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="type-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', boxShadow: '0 0 10px var(--color-accent)' }} />
                Vault ⚡ productos digitales
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
              Sistemas listos para{' '}
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--color-accent)',
                textShadow: '0 0 32px rgba(0,229,255,0.4), 0 2px 16px rgba(0,0,0,0.95)',
              }}>
                producción.
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
                maxWidth: 580,
                margin: 0,
                opacity: 0.85,
                textShadow: '0 2px 16px rgba(0,0,0,0.95)',
              }}
            >
              Arquitecturas en n8n, workflows probados y herramientas de Inteligencia Artificial para acelerar tu negocio.
            </motion.p>
          </section>

          {/* VAULT CATALOG GRID */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            alignItems: 'stretch',
            maxWidth: 1100,
            marginInline: 'auto',
            width: '100%',
          }}>
            
            {/* PRODUCT 1: WHATSAPP AI CLOSER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
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
                justifyContent: 'space-between',
                gap: '2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-accent)',
                    border: '1px solid rgba(0,229,255,0.3)',
                    borderRadius: 99,
                    padding: '0.35rem 0.85rem',
                    background: 'rgba(0,229,255,0.07)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
                    DISPONIBLE AHORA
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-star)' }}>
                    $9.999 ARS
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.125rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  color: 'var(--color-star)',
                  margin: 0,
                }}>
                  WhatsApp AI Closer:{' '}
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-accent)' }}>
                    Sistema Autónomo
                  </span>
                </h2>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  Sistema completo de cualificación y cierre automático de ventas en WhatsApp mediante agentes de Inteligencia Artificial en n8n y Firebase.
                </p>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0.25rem 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Blueprint JSON inyectable en n8n',
                    'Prompts comerciales de alta conversión',
                    'Tutor Privado IA en NotebookLM',
                    'Order Bump: Pack de 15 Blueprints JSON',
                  ].map((feat, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/vault/whatsapp-closer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  height: '3.25rem',
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-accent, #0c0c0c)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  boxShadow: '0 6px 28px rgba(0,229,255,0.32)',
                  transition: 'background 0.22s var(--ease-expo), transform 0.22s var(--ease-expo)',
                }}
              >
                <span>VER LANDING &amp; CHECKOUT</span>
                <span>→</span>
              </Link>
            </motion.div>

            {/* PRODUCT 2: COMING SOON / KEVDEV LABS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                padding: 'clamp(2rem, 3.5vw, 3rem)',
                background: 'rgba(18, 18, 18, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-card)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '2rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--color-faint)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 99,
                    padding: '0.35rem 0.85rem',
                  }}>
                    PRÓXIMAMENTE
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-faint)' }}>
                    KEVDEV LABS
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.125rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  color: 'var(--color-star)',
                  margin: 0,
                  opacity: 0.9,
                }}>
                  Automatización a Medida
                </h2>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
                  ¿Necesitás una integración personalizada con tu CRM, sistema contable o base de datos propia? Pudiendo adaptar cualquier flujo en n8n.
                </p>

                <div style={{
                  padding: '1.25rem',
                  borderRadius: 16,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-muted)',
                }}>
                  <div style={{ color: 'var(--color-accent)', fontWeight: 700 }}>// Servicios de integración</div>
                  <div>● Setup completo de servidor n8n en VPS</div>
                  <div>● Integraciones con WhatsApp API oficial</div>
                  <div>● Desarrollo de agentes IA personalizados</div>
                </div>
              </div>

              <a
                href="https://wa.me/5491136932467?text=Hola%20Kevin,%20quiero%20consultar%20por%20una%20automatización%20a%20medida"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  height: '3.25rem',
                  borderRadius: 99,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(18,18,18,0.72)',
                  backdropFilter: 'blur(16px)',
                  color: 'var(--color-star)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.25s var(--ease-expo)',
                }}
              >
                <span>CONSULTAR POR WHATSAPP</span>
                <span>↗</span>
              </a>
            </motion.div>

          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
