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
    'https://notebooklm.google.com/notebook/whatsapp-closer-tutor-demo'

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        
        {/* SUCCESS BANNER */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ACCESO AUTORIZADO // KEVDEV VAULT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¡Felicitaciones! Tu acceso a WhatsApp AI Closer está activo.
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-mono">
              Descargá los recursos oficiales e iniciá tu setup en 5 minutos.
            </p>
          </div>

          <a
            href={notebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs font-mono tracking-wide shadow-lg shadow-indigo-500/25 transition-all text-center flex items-center justify-center gap-2 shrink-0"
          >
            <span>ABRIR TUTOR IA (NOTEBOOKLM)</span>
            <span>↗</span>
          </a>
        </div>

        {/* ACCESS DASHBOARD CARDS */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* RECURSO 1: WORKFLOW CORE JSON */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold">JSON #01</span>
                <h2 className="text-lg font-bold text-white">Workflow n8n Principal</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">READY TO IMPORT</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Workflow completo con receptor de webhooks, motor comercial GPT-4o, gestión de memoria conversacional y sync en Firestore.
            </p>

            <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
              <pre className="text-[11px] text-cyan-300">{SAMPLE_N8N_JSON}</pre>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>📥 Descargar JSON</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all"
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>

          {/* RECURSO 2: TUTOR PRIVADO Y BLUEPRINTS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold">AI TUTOR</span>
                  <h2 className="text-lg font-bold text-white">NotebookLM Tutor Privado</h2>
                </div>
                <span className="text-[11px] font-mono text-indigo-400">GOOGLE AI</span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                Tutor interactivo de Inteligencia Artificial entrenado con la documentación técnica del WhatsApp AI Closer. Podés hacerle cualquier pregunta sobre la configuración en tiempo real.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 text-xs font-mono space-y-2">
                <div className="text-indigo-300 font-bold">💡 Consultas sugeridas para tu Tutor:</div>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
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
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold tracking-wide transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <span>ABRIR CUADERNO EN NOTEBOOKLM ↗</span>
            </a>
          </div>

        </div>

        {/* STEP-BY-STEP IMPLEMENTATION GUIDE */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
              GUÍA DE DESPLIEGUE PASO A PASO
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-3">
              Cómo desplegar en tu propio servidor n8n
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold text-sm">PASO 1: Importar JSON</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Abrí tu panel de n8n, hacé clic en "Workflows" &gt; "Import from File" y selecciona el archivo JSON descargado.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-bold text-sm">PASO 2: Claves de API</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Configurá tus credenciales en n8n: OpenAI (o Anthropic Claude) y tu instancia de WhatsApp API (Evolution API o Meta).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-purple-400 font-bold text-sm">PASO 3: Activar Webhook</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Copiá la URL del Webhook Inbound de n8n y pegala en los eventos de mensajes entrantes de tu API de WhatsApp.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
