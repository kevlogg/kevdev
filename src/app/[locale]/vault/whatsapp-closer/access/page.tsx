'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const SAMPLE_N8N_JSON = `{
  "name": "KevDev - WhatsApp AI Closer (Production)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-inbound-webhook",
        "options": {}
      },
      "name": "Webhook Inbound",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "model": "gpt-4o-mini",
        "options": {
          "systemMessage": "Sos el Agente Comercial de KevDev. Tu objetivo es calificar al prospecto y ofrecer la solución adecuada..."
        }
      },
      "name": "AI Commercial Agent",
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1.4,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "collection": "leads"
      },
      "name": "Firestore Sync",
      "type": "n8n-nodes-base.firestore",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook Inbound": {
      "main": [[{ "node": "AI Commercial Agent", "type": "main", "index": 0 }]]
    },
    "AI Commercial Agent": {
      "main": [[{ "node": "Firestore Sync", "type": "main", "index": 0 }]]
    }
  }
}`

export default function AccessDashboardPage() {
  const [copied, setCopied] = useState(false)

  const notebookUrl =
    process.env.NOTEBOOKLM_PUBLIC_URL ||
    'https://notebook.google.com/notebook/cd4b90b8-96b6-41b2-9ad8-da574a0dcbff?authuser=3'

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_N8N_JSON)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([SAMPLE_N8N_JSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kevdev-whatsapp-ai-closer-n8n.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ background: 'var(--color-void)', color: 'var(--color-star)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: 'calc(76px + clamp(3rem, 6vw, 5rem))', paddingBottom: 'clamp(5rem, 10vw, 8rem)' }}>
        <div className="site-container" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 4vw, 3.5rem)', maxWidth: 1100, marginInline: 'auto' }}>
          
          {/* SUCCESS BANNER */}
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
            gap: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', boxShadow: '0 0 10px var(--color-accent)' }} />
              <span className="type-label" style={{ color: 'var(--color-accent)' }}>
                ACCESO AUTORIZADO // KEVDEV VAULT
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  color: 'var(--color-star)',
                  margin: 0,
                }}>
                  ¡Felicitaciones! Tu acceso a WhatsApp AI Closer está{' '}
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--color-accent)' }}>
                    activo.
                  </span>
                </h1>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-muted)', margin: '0.5rem 0 0' }}>
                  Descargá los recursos oficiales e iniciá tu setup en 5 minutos.
                </p>
              </div>

              <a
                href={notebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: '3.25rem',
                  padding: '0 1.75rem',
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--color-accent)',
                  color: 'var(--color-on-accent, #0c0c0c)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 28px rgba(0,229,255,0.32)',
                }}
              >
                <span>ABRIR TUTOR IA (NOTEBOOKLM)</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* ACCESS DASHBOARD CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          }}>
            
            {/* RECURSO 1: WORKFLOW CORE JSON */}
            <div style={{
              padding: 'clamp(2rem, 3.5vw, 3rem)',
              background: 'rgba(18, 18, 18, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ padding: '0.35rem 0.65rem', borderRadius: 99, background: 'rgba(0,229,255,0.1)', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800 }}>JSON #01</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-star)', margin: 0 }}>Workflow n8n Principal</h2>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 700 }}>READY TO IMPORT</span>
                </div>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                  Workflow completo con receptor de webhooks, motor comercial GPT-4o, gestión de memoria conversacional y sync en Firestore.
                </p>

                <div style={{
                  padding: '1rem',
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  maxHeight: 180,
                  overflowY: 'auto',
                }}>
                  <pre style={{ margin: 0, color: 'var(--color-accent)' }}>{SAMPLE_N8N_JSON}</pre>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  style={{
                    flex: 1,
                    height: '2.75rem',
                    borderRadius: 99,
                    background: 'var(--color-accent)',
                    border: 'none',
                    color: 'var(--color-on-accent, #0c0c0c)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  📥 Descargar JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    height: '2.75rem',
                    padding: '0 1.25rem',
                    borderRadius: 99,
                    background: 'rgba(18,18,18,0.72)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'var(--color-star)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>

            {/* RECURSO 2: TUTOR PRIVADO Y BLUEPRINTS */}
            <div style={{
              padding: 'clamp(2rem, 3.5vw, 3rem)',
              background: 'rgba(18, 18, 18, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ padding: '0.35rem 0.65rem', borderRadius: 99, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 800 }}>AI TUTOR</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-star)', margin: 0 }}>NotebookLM Tutor Privado</h2>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#a5b4fc', fontWeight: 700 }}>GOOGLE AI</span>
                </div>

                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                  Tutor interactivo de Inteligencia Artificial entrenado con la documentación técnica del WhatsApp AI Closer. Podés hacerle cualquier pregunta sobre la configuración en tiempo real.
                </p>

                <div style={{
                  padding: '1rem',
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{ color: '#a5b4fc', fontWeight: 700 }}>💡 Consultas sugeridas para tu Tutor:</div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li>"¿Cómo configuro el webhook en Evolution API para WhatsApp?"</li>
                    <li>"¿Dónde coloco mi API Key de OpenAI en el nodo de n8n?"</li>
                    <li>"¿Cómo ajusto el tono del prompt para mi industria?"</li>
                  </ul>
                </div>
              </div>

              <a
                href={notebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  width: '100%',
                  height: '2.75rem',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'var(--color-star)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  marginTop: '0.5rem',
                }}
              >
                <span>ABRIR CUADERNO EN NOTEBOOKLM ↗</span>
              </a>
            </div>

          </div>

          {/* STEP-BY-STEP IMPLEMENTATION GUIDE */}
          <div style={{
            padding: 'clamp(2rem, 3.5vw, 3rem)',
            background: 'rgba(18, 18, 18, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <span className="type-label" style={{ color: 'var(--color-accent)' }}>
                GUÍA DE DESPLIEGUE PASO A PASO
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-star)', margin: '0.5rem 0 0', letterSpacing: '-0.02em' }}>
                Cómo desplegar en tu propio servidor n8n
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}>
              <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ color: 'var(--color-accent)', fontWeight: 800 }}>PASO 1: Importar JSON</div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', lineHeight: 1.6, margin: 0 }}>
                  Abrí tu panel de n8n, hacé clic en "Workflows" &gt; "Import from File" y selecciona el archivo JSON descargado.
                </p>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ color: '#a5b4fc', fontWeight: 800 }}>PASO 2: Claves de API</div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', lineHeight: 1.6, margin: 0 }}>
                  Configurá tus credenciales en n8n: OpenAI (o Anthropic Claude) y tu instancia de WhatsApp API (Evolution API o Meta).
                </p>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ color: '#c084fc', fontWeight: 800 }}>PASO 3: Activar Webhook</div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', lineHeight: 1.6, margin: 0 }}>
                  Copiá la URL del Webhook Inbound de n8n y pegala en los eventos de mensajes entrantes de tu API de WhatsApp.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
