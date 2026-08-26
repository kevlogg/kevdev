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

  const basePrice = 18500
  const bumpPrice = 8500
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        
        {/* ── HEADER BADGE & TITLES ────────────────────────────────────── */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            KEVDEV VAULT // SISTEMA N8N + IA EN PRODUCCIÓN
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            WhatsApp AI Closer:<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              Sistema Autónomo con n8n
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Convierte prospectos fríos en clientes calificados 24/7 en WhatsApp sin intervención humana.
            Infraestructura lista para desplegar en n8n con agentes conversacionales, prompts optimizados y registro en base de datos.
          </motion.p>
        </section>

        {/* ── MAIN GRID: CHECKOUT FORM + INTERACTIVE SYSTEM DEMO ────── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: TERMINAL & SYSTEM PREVIEW (7 COLS) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* TAB SELECTOR */}
            <div className="flex gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'terminal'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                &gt;_ Terminal Stream
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙ Arquitectura n8n
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'features'
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📦 Contenido Incluido
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
              
              {activeTab === 'terminal' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                      <span className="text-slate-400 text-[11px] ml-2">n8n-live-webhook.log</span>
                    </div>
                    <span className="text-emerald-400 text-[11px]">● ACTIVE (200 OK)</span>
                  </div>

                  <div className="space-y-2.5 text-slate-300">
                    <p className="text-slate-500">[14:26:01] <span className="text-cyan-400">WEBHOOK_INBOUND</span>: Incoming WhatsApp Message from +54911****4892</p>
                    <p className="text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500">USER:</span> "Hola, vi el anuncio en Meta Ads. ¿De qué se trata el sistema y cuánto cuesta?"
                    </p>
                    <p className="text-slate-500">[14:26:02] <span className="text-purple-400">EXEC_AI_AGENT</span>: Analyzing intent &amp; context memory...</p>
                    <p className="text-slate-500">[14:26:03] <span className="text-indigo-400">QUALIFIER_NODE</span>: Intent identified: Lead busca automatizar ventas. Lead Score: 95/100</p>
                    <p className="text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-500/20">
                      <span className="text-emerald-300 font-bold">AI CLOSER:</span> "¡Hola! Excelente. El WhatsApp AI Closer es una arquitectura en n8n que responde, califica y cierra ventas de forma autónoma 24/7. Te muestro la demo en tiempo real y el enlace directo..."
                    </p>
                    <p className="text-slate-500">[14:26:04] <span className="text-cyan-400">FIRESTORE_SYNC</span>: Saved lead + status='QUALIFIED' to database.</p>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">Flujo de Arquitectura del Workflow</h3>
                  
                  <div className="grid gap-3 font-mono text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-cyan-500/10 text-cyan-400 font-bold">01</span>
                        <div>
                          <div className="text-white font-bold">Meta Ads / Lead Inbound</div>
                          <div className="text-slate-400 text-[11px]">Mensaje entrante a WhatsApp Business via Webhook</div>
                        </div>
                      </div>
                      <span className="text-cyan-400 text-[10px] bg-cyan-950 px-2 py-1 rounded">HTTPS</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-indigo-500/10 text-indigo-400 font-bold">02</span>
                        <div>
                          <div className="text-white font-bold">Motor n8n Core Workflow</div>
                          <div className="text-slate-400 text-[11px]">Procesamiento con IA + Memoria Conversacional</div>
                        </div>
                      </div>
                      <span className="text-indigo-400 text-[10px] bg-indigo-950 px-2 py-1 rounded">JSON</span>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-purple-500/10 text-purple-400 font-bold">03</span>
                        <div>
                          <div className="text-white font-bold">Cierre &amp; Base de Datos</div>
                          <div className="text-slate-400 text-[11px]">Envío de link de checkout MP + Sync en Firestore</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-1 rounded">AUTO</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">¿Qué vas a recibir exactamente?</h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                      <span><strong>Blueprint JSON n8n Completo:</strong> Workflow probado e inyectable en tu instancia de n8n en 1 clic.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                      <span><strong>Prompts de IA de Alta Conversión:</strong> Instrucciones de sistema diseñadas para persuasión y calificación rápida.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                      <span><strong>Acceso al Tutor Privado NotebookLM:</strong> Asistente de IA entrenado exclusivamente para guiarte en el setup.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                      <span><strong>Guía de Despliegue Paso a Paso:</strong> Documentación clara para conectar n8n con WhatsApp API y Firebase.</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* BOTTOM FOOTER OF CARD */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>KEVDEV VAULT PRODUCT #01</span>
                <span className="text-cyan-400">GARANTÍA DE DESPLIEGUE</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: CHECKOUT CARD & MERCADO PAGO FORM (5 COLS) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative backdrop-blur-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
                    OFERTA LIMITADA METAS ADS
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-2">Acceso Inmediato al Vault</h2>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400 line-through">$35.000 ARS</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{formattedTotal} <span className="text-xs font-normal text-slate-400">ARS</span></div>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5">
                
                {/* EMAIL INPUT */}
                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Tu Correo Electrónico (Donde recibirás el acceso)
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-email@dominio.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    🔒 Cero spam. Solo recibirás tus accesos y claves de descarga.
                  </p>
                </div>

                {/* ORDER BUMP CHECKBOX */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/50 border border-indigo-500/30 space-y-2 hover:border-indigo-500/50 transition-all cursor-pointer"
                     onClick={() => setIncludeBump(!includeBump)}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="order-bump"
                      checked={includeBump}
                      onChange={(e) => setIncludeBump(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500"
                    />
                    <label htmlFor="order-bump" className="text-xs text-slate-200 cursor-pointer space-y-1">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>⚡ ORDER BUMP OPCIONAL (+ $8.500 ARS)</span>
                      </div>
                      <p className="text-slate-400 leading-snug">
                        <strong>Pack de 15 Blueprints JSON Adicionales:</strong> Colección lista para importar de workflows de n8n (Atención al cliente, Agendamiento, Scraping y Notificaciones).
                      </p>
                    </label>
                  </div>
                </div>

                {/* ERROR ALERT */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-mono"
                    >
                      ⚠️ {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-base tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Generando Checkout Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <span>PAGAR CON MERCADO PAGO ({formattedTotal})</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">🛡️ Mercado Pago SSL</span>
                  <span>●</span>
                  <span className="flex items-center gap-1">⚡ Entrega Inmediata</span>
                </div>

              </form>

            </div>
          </motion.div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
