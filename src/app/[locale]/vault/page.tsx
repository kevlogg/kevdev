'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function VaultRootPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        
        {/* HEADER */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
            KEVDEV VAULT // PRODUCTOS DIGITALES &amp; AUTOMATIZACIÓN
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sistemas Listos para Producción
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Arquitecturas en n8n, workflows probados y herramientas de Inteligencia Artificial para acelerar tu negocio.
          </p>
        </div>

        {/* VAULT CATALOG GRID */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* PRODUCT 1: WHATSAPP AI CLOSER */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                  ● DISPONIBLE AHORA
                </span>
                <span className="text-xs font-mono text-cyan-400">$18.500 ARS</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white">
                WhatsApp AI Closer: Sistema Autónomo con n8n
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                Sistema completo de cualificación y cierre automático de ventas en WhatsApp mediante agentes de Inteligencia Artificial en n8n y Firebase.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Blueprint JSON inyectable en n8n
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Prompts comerciales de alta conversión
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Tutor Privado IA en NotebookLM
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Order Bump: Pack de 15 Blueprints JSON
                </li>
              </ul>
            </div>

            <Link
              href="/vault/whatsapp-closer"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 mt-4"
            >
              <span>VER LANDING &amp; CHECKOUT</span>
              <span>→</span>
            </Link>
          </div>

          {/* PRODUCT 2: COMING SOON / CUSTOM INTEGRATIONS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between opacity-80 hover:opacity-100 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold">
                  PRÓXIMAMENTE
                </span>
                <span className="text-xs font-mono text-slate-500">KEVDEV LABS</span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-300">
                Sistemas de Automatización a Medida
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed">
                ¿Necesitás una integración personalizada con tu CRM, sistema contable o base de datos propia? Pudiendo adaptar cualquier flujo en n8n.
              </p>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <div>// Servicios de integración</div>
                <div>● Setup completo de servidor n8n en VPS</div>
                <div>● Integraciones con WhatsApp API oficial</div>
                <div>● Desarrollo de agentes IA personalizados</div>
              </div>
            </div>

            <a
              href="https://wa.me/5491136932467?text=Hola%20Kevin,%20quiero%20consultar%20por%20una%20automatización%20a%20medida"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wide transition-all text-center flex items-center justify-center gap-2"
            >
              <span>CONSULTAR POR WHATSAPP</span>
              <span>↗</span>
            </a>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  )
}
