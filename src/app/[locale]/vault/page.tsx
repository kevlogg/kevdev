'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function VaultRootPage() {
  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-star)] font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="site-container pt-36 sm:pt-44 pb-24 space-y-16">
        
        {/* HEADER */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            KEVDEV VAULT // PRODUCTOS DIGITALES &amp; AUTOMATIZACIÓN
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            Sistemas Listos para Producción
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Arquitecturas en n8n, workflows probados y herramientas de Inteligencia Artificial para acelerar tu negocio.
          </motion.p>
        </section>

        {/* VAULT CATALOG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* PRODUCT 1: WHATSAPP AI CLOSER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/80 border-2 border-cyan-500/40 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-[0_0_40px_rgba(0,229,255,0.12)] relative overflow-hidden backdrop-blur-xl"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                  ● DISPONIBLE AHORA
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">$18.500 ARS</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white leading-snug">
                WhatsApp AI Closer: Sistema Autónomo con n8n
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Sistema completo de cualificación y cierre automático de ventas en WhatsApp mediante agentes de Inteligencia Artificial en n8n y Firebase.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 font-mono pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span> Blueprint JSON inyectable en n8n
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span> Prompts comerciales de alta conversión
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span> Tutor Privado IA en NotebookLM
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span> Order Bump: Pack de 15 Blueprints JSON
                </li>
              </ul>
            </div>

            <Link
              href="/vault/whatsapp-closer"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm tracking-wide transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 mt-6 group"
            >
              <span>VER LANDING &amp; CHECKOUT</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>

          {/* PRODUCT 2: COMING SOON / CUSTOM INTEGRATIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between backdrop-blur-xl"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs font-mono font-bold border border-slate-700">
                  PRÓXIMAMENTE
                </span>
                <span className="text-xs font-mono text-slate-500">KEVDEV LABS</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-200 leading-snug">
                Sistemas de Automatización a Medida
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                ¿Necesitás una integración personalizada con tu CRM, sistema contable o base de datos propia? Pudiendo adaptar cualquier flujo en n8n.
              </p>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
                <div className="text-cyan-400 font-bold">// Servicios de integración</div>
                <div>● Setup completo de servidor n8n en VPS</div>
                <div>● Integraciones con WhatsApp API oficial</div>
                <div>● Desarrollo de agentes IA personalizados</div>
              </div>
            </div>

            <a
              href="https://wa.me/5491136932467?text=Hola%20Kevin,%20quiero%20consultar%20por%20una%20automatización%20a%20medida"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wide transition-all text-center flex items-center justify-center gap-2 border border-slate-700 mt-6"
            >
              <span>CONSULTAR POR WHATSAPP</span>
              <span>↗</span>
            </a>
          </motion.div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
