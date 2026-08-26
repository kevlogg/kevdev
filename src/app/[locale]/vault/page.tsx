'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VaultRootPage() {
  return (
    <div style={{ background: 'var(--color-void)', color: 'var(--color-star)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: 'calc(76px + clamp(2rem, 5vw, 4rem))', paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
        <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 5vw, 4rem)' }}>
          
          {/* HEADER */}
          <section style={{ textAlign: 'center', maxWidth: 780, marginInline: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                background: 'rgba(0,229,255,0.08)',
                border: '1px solid rgba(0,229,255,0.25)',
                padding: '0.4rem 1.125rem',
                borderRadius: 99,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 24px rgba(0,229,255,0.15)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', boxShadow: '0 0 10px var(--color-accent)' }} />
              KEVDEV VAULT // PRODUCTOS DIGITALES &amp; AUTOMATIZACIÓN
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--color-star)',
                margin: 0,
              }}
            >
              Sistemas Listos para Producción
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
                color: 'var(--color-muted)',
                lineHeight: 1.7,
                maxWidth: 620,
                margin: 0,
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
                padding: 'clamp(2rem, 3vw, 2.75rem)',
                background: 'rgba(18,18,18,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,229,255,0.3)',
                borderTop: '2px solid var(--color-accent)',
                borderRadius: 20,
                boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 32px rgba(0,229,255,0.12)',
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
                    letterSpacing: '0.06em',
                    color: '#34d399',
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 99,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                    DISPONIBLE AHORA
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                    $18.500 ARS
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.375rem, 2.2vw, 1.875rem)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-star)',
                  margin: 0,
                }}>
                  WhatsApp AI Closer: Sistema Autónomo con n8n
                </h2>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.65, margin: 0 }}>
                  Sistema completo de cualificación y cierre automático de ventas en WhatsApp mediante agentes de Inteligencia Artificial en n8n y Firebase.
                </p>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Blueprint JSON inyectable en n8n',
                    'Prompts comerciales de alta conversión',
                    'Tutor Privado IA en NotebookLM',
                    'Order Bump: Pack de 15 Blueprints JSON',
                  ].map((feat, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'rgba(232,232,232,0.85)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 800 }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/vault/whatsapp-closer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  width: '100%',
                  padding: '1rem 1.5rem',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00e5ff 0%, #6366f1 100%)',
                  color: '#0c0c0c',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(0,229,255,0.3)',
                  transition: 'transform 0.25s var(--ease-expo), boxShadow 0.25s',
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
                padding: 'clamp(2rem, 3vw, 2.75rem)',
                background: 'rgba(18,18,18,0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
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
                    letterSpacing: '0.06em',
                    color: 'rgba(232,232,232,0.5)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 99,
                  }}>
                    PRÓXIMAMENTE
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(232,232,232,0.4)' }}>
                    KEVDEV LABS
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.375rem, 2.2vw, 1.875rem)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: 'rgba(232,232,232,0.9)',
                  margin: 0,
                }}>
                  Sistemas de Automatización a Medida
                </h2>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.65, margin: 0 }}>
                  ¿Necesitás una integración personalizada con tu CRM, sistema contable o base de datos propia? Pudiendo adaptar cualquier flujo en n8n.
                </p>

                <div style={{
                  padding: '1.25rem',
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.4)',
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  width: '100%',
                  padding: '1rem 1.5rem',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'var(--color-star)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
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
