'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const WA_NUM = "542235851419"

const questions = [
  { cat:"Situación actual", icon:"🏢", area:"general",
    q:"¿En qué etapa está tu negocio hoy?",
    opts:[
      {t:"Recién arrancando, buscando mis primeros clientes", s:0},
      {t:"Ya tengo clientes pero quiero crecer y ordenarme", s:1},
      {t:"Tengo un negocio establecido y quiero profesionalizarlo", s:2}
    ]},
  { cat:"Presencia digital", icon:"🌐", area:"presencia",
    q:"¿Tenés sitio web propio?",
    opts:[
      {t:"Sí, activo y actualizado", s:2},
      {t:"Tengo uno pero desactualizado o incompleto", s:1},
      {t:"No tengo sitio web", s:0}
    ]},
  { cat:"Presencia digital", icon:"📍", area:"presencia",
    q:"¿Tu negocio aparece en Google Maps / Google Mi Negocio?",
    opts:[
      {t:"Sí, con ficha completa, fotos y reseñas activas", s:2},
      {t:"Aparezco pero no gestiono la ficha", s:1},
      {t:"No estoy registrado en Google", s:0}
    ]},
  { cat:"Redes sociales", icon:"📲", area:"presencia",
    q:"¿Cómo manejás las redes del negocio?",
    opts:[
      {t:"Publicamos con frecuencia y estrategia", s:2},
      {t:"Publicamos cuando podemos, sin plan", s:1},
      {t:"Sin presencia activa en redes", s:0}
    ]},
  { cat:"Imagen de marca", icon:"🎨", area:"identidad",
    q:"¿Tenés logo e identidad visual definida?",
    opts:[
      {t:"Sí: logo, colores y tipografía coherentes", s:2},
      {t:"Tengo logo pero sin identidad visual completa", s:1},
      {t:"Sin identidad visual profesional", s:0}
    ]},
  { cat:"Comunicación", icon:"💬", area:"presencia",
    q:"¿Cómo recibís consultas de clientes?",
    opts:[
      {t:"Múltiples canales organizados (WA Business, email, web)", s:2},
      {t:"Solo WhatsApp personal o Instagram", s:1},
      {t:"Solo presencial o por llamada", s:0}
    ]},
  { cat:"Comunicación", icon:"📧", area:"identidad",
    q:"¿Usás email profesional con tu dominio?",
    opts:[
      {t:"Sí, email con mi propio dominio (hola@minegocio.com)", s:2},
      {t:"Uso Gmail o Hotmail personal para el negocio", s:1},
      {t:"Sin email dedicado para el negocio", s:0}
    ]},
  { cat:"Gestión", icon:"📊", area:"integral",
    q:"¿Cómo organizás clientes, pedidos o ventas?",
    opts:[
      {t:"Uso CRM o software de gestión", s:2},
      {t:"Uso planillas de Excel o Google Sheets", s:1},
      {t:"De memoria o con anotaciones sueltas", s:0}
    ]},
  { cat:"Ventas", icon:"📋", area:"presencia",
    q:"¿Tenés catálogo o lista de precios digital?",
    opts:[
      {t:"Sí, online y siempre actualizado", s:2},
      {t:"Tengo algo pero desactualizado", s:1},
      {t:"Sin catálogo o precios digitales", s:0}
    ]},
  { cat:"Marketing", icon:"📣", area:"integral",
    q:"¿Invertís en publicidad digital?",
    opts:[
      {t:"Sí, con presupuesto y estrategia definida", s:2},
      {t:"Lo hice alguna vez, sin continuidad", s:1},
      {t:"No, nunca invertí en publicidad digital", s:0}
    ]},
  { cat:"Reputación", icon:"⭐", area:"integral",
    q:"¿Gestionás reseñas o testimonios de clientes?",
    opts:[
      {t:"Sí, pedimos reseñas y las respondemos", s:2},
      {t:"Tengo algunas pero no las gestiono", s:1},
      {t:"No tengo reseñas activas", s:0}
    ]},
  { cat:"Administración", icon:"🧾", area:"identidad",
    q:"¿Emitís facturas o comprobantes digitales?",
    opts:[
      {t:"Sí, siempre de forma digital y organizada", s:2},
      {t:"A veces o solo cuando me lo piden", s:1},
      {t:"Sin comprobantes formales actualmente", s:0}
    ]}
]

const PLANES = {
  presencia: {
    nombre: "Plan Presencia",
    tag: "Poné tu negocio en el mapa digital",
    items: [
      "Google Mi Negocio configurado y optimizado",
      "Perfiles profesionales en redes sociales",
      "Catálogo o menú digital compartible",
      "WhatsApp Business con respuestas automáticas",
      "Bio y links unificados profesionalmente"
    ],
    msg: "Hola! Hice el diagnóstico de profesionalismo de kevdev y me interesa el Plan Presencia. ¿Me podés dar más info y armar un presupuesto?"
  },
  identidad: {
    nombre: "Plan Identidad",
    tag: "Una marca que genera confianza y diferencia",
    items: [
      "Diseño de logo profesional",
      "Manual de marca: colores, tipografías y usos",
      "Pack de plantillas para redes sociales",
      "Fotos de perfil y portadas profesionales",
      "Guía de comunicación visual"
    ],
    msg: "Hola! Hice el diagnóstico de profesionalismo de kevdev y me interesa el Plan Identidad. ¿Me podés dar más info y armar un presupuesto?"
  },
  integral: {
    nombre: "Plan Integral",
    tag: "De informal a profesional, todo en uno",
    items: [
      "Todo Plan Presencia + Plan Identidad",
      "Landing page / sitio web profesional",
      "Email corporativo con tu dominio",
      "Estrategia de contenido para el primer mes",
      "Configuración inicial de publicidad digital"
    ],
    msg: "Hola! Hice el diagnóstico de profesionalismo de kevdev y me interesa el Plan Integral. ¿Me podés dar más info y armar un presupuesto?"
  }
}

export default function Diagnostico() {
  const [state, setState] = useState<'intro' | 'pregunta' | 'loading' | 'resultados'>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1))
  const [resultado, setResultado] = useState<any>(null)
  const [loadMsg, setLoadMsg] = useState(0)

  const msgs = [
    "Analizando tu presencia digital...",
    "Evaluando tu imagen de marca...",
    "Calculando tus oportunidades de mejora...",
    "Preparando tu plan personalizado..."
  ]

  useEffect(() => {
    if (state !== 'loading') return
    const interval = setInterval(() => setLoadMsg(m => (m + 1) % msgs.length), 1800)
    return () => clearInterval(interval)
  }, [state])

  function calcRec(ans: number[]) {
    const areas: any = { presencia:0, identidad:0, integral:0, presenciaM:0, identidadM:0, integralM:0 }
    questions.forEach((q, i) => {
      if (q.area !== 'general') {
        areas[q.area] += q.opts[ans[i]]?.s || 0
        areas[q.area + 'M'] += 2
      }
    })
    const total = questions.reduce((s, q, i) => s + (q.opts[ans[i]]?.s || 0), 0)
    const pct = Math.round((total / (questions.length * 2)) * 100)
    const pP = areas.presenciaM ? Math.round(areas.presencia / areas.presenciaM * 100) : 0
    const iP = areas.identidadM ? Math.round(areas.identidad / areas.identidadM * 100) : 0

    let rec = 'presencia'
    if (pct < 35) rec = 'integral'
    else if (pP < 50 && iP >= 60) rec = 'presencia'
    else if (iP < 50 && pP >= 60) rec = 'identidad'
    else if (pP < 60 && iP < 60) rec = 'integral'
    else if (pP >= 70 && iP >= 70) rec = 'integral'
    else if (iP < pP) rec = 'identidad'

    return { total, pct, rec, pP, iP }
  }

  async function finish() {
    setState('loading')
    const { total, pct, rec, pP, iP } = calcRec(answers)

    const resumen = questions.map((q, i) => `${q.q}\nRespuesta: ${q.opts[answers[i]]?.t}`).join('\n\n')

    const prompt = `Sos un consultor de negocios digitales. Un dueño respondió este diagnóstico:
${resumen}
Puntaje: ${total}/${questions.length * 2} (${pct}%)

Generá diagnóstico en JSON puro (sin markdown, sin backticks):
{
  "nivel": "Negocio en Construcción | En Crecimiento | En Desarrollo | Profesional",
  "descripcion": "2 oraciones: reconocé algo positivo, señalá qué le falta. Tono directo, argentino, tuteo.",
  "pitch": "1-2 oraciones que generen urgencia real de actuar. Sin mencionar los planes.",
  "cierre": "1 oración final motivadora corta."
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const json = JSON.parse(text)
      setResultado({ ...json, pct, rec, pP, iP, total })
      setState('resultados')
    } catch (e) {
      console.error(e)
      setResultado({ nivel: 'En Desarrollo', descripcion: 'Necesitás profesionalizar tu negocio.', pitch: 'Hablemos de cómo hacerlo.', cierre: 'Te espero.', pct, rec, pP, iP, total })
      setState('resultados')
    }
  }

  return (
    <main style={{ background: 'var(--bg-page)', color: 'var(--white)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(79,195,247,.12) 1.2px, transparent 1.2px)', backgroundSize: '16px 16px', zIndex: 0, opacity: 0.18 }} aria-hidden />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '0.875rem', color: 'var(--cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← Volver
          </Link>
          {state !== 'intro' && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {state === 'pregunta' && `${current + 1} / ${questions.length}`}
          </div>}
        </div>

        <AnimatePresence mode="wait">
          {state === 'intro' && <Intro onStart={() => setState('pregunta')} />}
          {state === 'pregunta' && <Pregunta
            q={questions[current]}
            idx={current}
            selected={answers[current]}
            onSelect={(i: number) => setAnswers(a => [...a.slice(0, current), i, ...a.slice(current + 1)])}
            onNext={() => current < questions.length - 1 ? setCurrent(c => c + 1) : finish()}
            onPrev={() => setCurrent(c => Math.max(0, c - 1))}
            isLast={current === questions.length - 1}
          />}
          {state === 'loading' && <Loading msg={msgs[loadMsg]} />}
          {state === 'resultados' && <Resultados data={resultado} />}
        </AnimatePresence>
      </div>
    </main>
  )
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Diagnóstico gratuito</div>
        <div style={{ width: '36px', height: '2px', background: 'var(--cyan)', margin: '1rem auto 2rem' }} />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>¿Qué tan profesional es tu negocio?</h1>
        <p style={{ fontSize: '1rem', color: 'var(--dim)', maxWidth: '48ch', margin: '0 auto 2rem', lineHeight: 1.6 }}>Respondé 12 preguntas rápidas y descubrí qué necesitás para llevar tu negocio al siguiente nivel.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
        <span>12 preguntas</span>
        <span>•</span>
        <span>3 minutos</span>
        <span>•</span>
        <span>100% gratis</span>
      </div>

      <button onClick={onStart} style={{
        padding: '1rem 2.5rem', background: 'var(--cyan)', color: 'var(--bg-page)', border: 'none', borderRadius: 3, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', letterSpacing: '0.05em', transition: 'all 0.22s',
      }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)', e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,195,247,0.32)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)', e.currentTarget.style.boxShadow = 'none')}>
        Empezar diagnóstico →
      </button>
    </motion.div>
  )
}

function Pregunta({ q, idx, selected, onSelect, onNext, onPrev, isLast }: any) {
  return (
    <motion.div key={`q-${idx}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600, marginBottom: '0.5rem' }}>{q.icon} {q.cat}</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '2rem' }}>{q.q}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {q.opts.map((opt: any, i: number) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            padding: '1.25rem', textAlign: 'left', border: `1px solid ${selected === i ? 'rgba(79,195,247,0.4)' : 'rgba(79,195,247,0.1)'}`, background: selected === i ? 'rgba(79,195,247,0.08)' : 'transparent', borderRadius: 3, color: 'var(--white)', cursor: 'pointer', transition: 'all 0.25s', fontSize: '0.95rem', lineHeight: 1.5,
          }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(79,195,247,0.3)', e.currentTarget.style.background = 'rgba(79,195,247,0.04)')} onMouseLeave={e => (selected !== i && (e.currentTarget.style.borderColor = 'rgba(79,195,247,0.1)', e.currentTarget.style.background = 'transparent'))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid', borderColor: selected === i ? 'var(--cyan)' : 'rgba(79,195,247,0.3)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected === i && <div style={{ width: '8px', height: '8px', background: 'var(--cyan)', borderRadius: 1 }} />}
              </div>
              {opt.t}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button onClick={onPrev} style={{
          padding: '0.875rem 1.75rem', border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.25s',
        }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,195,247,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          ← Anterior
        </button>
        <button onClick={onNext} disabled={selected === -1} style={{
          padding: '0.875rem 1.75rem', border: '1px solid var(--cyan)', background: selected === -1 ? 'transparent' : 'var(--cyan)', color: selected === -1 ? 'rgba(79,195,247,0.4)' : 'var(--bg-page)', borderRadius: 99, cursor: selected === -1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: selected === -1 ? 0.5 : 1, transition: 'all 0.25s',
        }} onMouseEnter={e => !selected === -1 && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,195,247,0.24)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
          {isLast ? 'Ver mi plan →' : 'Siguiente →'}
        </button>
      </div>
    </motion.div>
  )
}

function Loading({ msg }: { msg: string }) {
  return (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '2rem' }}>
      <div style={{ width: '48px', height: '48px', border: '1.5px solid transparent', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 1.5s linear infinite' }} />
      <p style={{ color: 'var(--dim)', fontSize: '0.95rem' }}>{msg}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}

function Resultados({ data }: { data: any }) {
  const plan = PLANES[data.rec as keyof typeof PLANES]
  const otros = Object.entries(PLANES).filter(([k]) => k !== data.rec)

  return (
    <motion.div key="resultados" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} style={{ maxWidth: '960px', margin: '2rem auto' }}>
      {/* Score */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.6 }} style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', position: 'relative' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(79,195,247,0.1)" strokeWidth="3" />
            <motion.circle cx="60" cy="60" r="54" fill="none" stroke="var(--cyan)" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 54}`} initial={{ strokeDashoffset: 2 * Math.PI * 54 }} animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - data.pct / 100) }} transition={{ delay: 0.3, duration: 1.4 }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--cyan)' }}>{data.pct}%</div>
        </motion.div>

        <div style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{data.nivel}</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Tu diagnóstico está listo.</h1>
        <p style={{ color: 'var(--dim)', lineHeight: 1.6, maxWidth: '56ch', margin: '0 auto' }}>{data.descripcion}</p>
      </div>

      {/* Pitch */}
      <div style={{ background: 'rgba(79,195,247,0.04)', border: '1px solid rgba(79,195,247,0.2)', borderLeft: '3px solid var(--cyan)', padding: '1.5rem', marginBottom: '2rem', borderRadius: 3 }}>
        <p style={{ margin: 0, color: 'var(--white)', fontSize: '0.95rem', lineHeight: 1.6 }}>{data.pitch}</p>
      </div>

      {/* Plan recomendado */}
      <div style={{ background: 'rgba(79,195,247,0.04)', border: '2px solid var(--cyan)', padding: '2rem', marginBottom: '2rem', borderRadius: 3, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '16px', fontSize: '0.75rem', background: 'var(--bg-page)', padding: '0.25rem 0.75rem', color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>⭐ Recomendado para vos</div>
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{plan.nombre}</h3>
          <p style={{ color: 'var(--dim)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{plan.tag}</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {plan.items.map((item: string) => (
              <li key={item} style={{ color: 'var(--white)', fontSize: '0.95rem', display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>→</span> {item}
              </li>
            ))}
          </ul>
          <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(plan.msg)}`} target="_blank" rel="noreferrer" style={{
            display: 'inline-block', padding: '0.875rem 1.75rem', background: 'var(--cyan)', color: 'var(--bg-page)', border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.22s',
          }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)', e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,195,247,0.32)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)', e.currentTarget.style.boxShadow = 'none')}>
            Quiero este plan — Consultar precio
          </a>
        </div>
      </div>

      {/* Otros planes */}
      <div>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>// también disponibles</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {otros.map(([key, p]: any) => (
            <div key={key} style={{ border: '1px solid rgba(79,195,247,0.1)', padding: '1.5rem', borderRadius: 3, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h5 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.25rem' }}>{p.nombre}</h5>
                <p style={{ color: 'var(--dim)', fontSize: '0.85rem', margin: 0 }}>{p.tag}</p>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {p.items.slice(0, 3).map((item: string) => (
                  <li key={item} style={{ color: 'var(--white)', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--cyan)', flexShrink: 0, fontSize: '0.75rem' }}>→</span> {item}
                  </li>
                ))}
              </ul>
              <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(p.msg)}`} target="_blank" rel="noreferrer" style={{
                padding: '0.75rem 1.5rem', border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)', borderRadius: 99, fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.22s', textAlign: 'center',
              }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,195,247,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                Más info
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(79,195,247,0.1)' }}>
        <p style={{ color: 'var(--dim)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{data.cierre}</p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>— <span style={{ color: 'var(--cyan)' }}>kevdev</span></p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={() => window.location.reload()} style={{
          padding: '0.75rem 1.5rem', border: '1px solid var(--cyan)', background: 'transparent', color: 'var(--cyan)', borderRadius: 99, fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.22s',
        }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,195,247,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          ↺ Reiniciar
        </button>
      </div>
    </motion.div>
  )
}
