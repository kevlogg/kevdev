'use client'

import { useState } from 'react'

interface Plantilla {
  titulo: string
  texto: (nombre: string, demo: string) => string
}

const PLANTILLAS: Plantilla[] = [
  {
    titulo: 'Demo cercana',
    texto: (nombre, demo) =>
      `Hola ${nombre}! Te comparto la demo que armé para tu negocio: ${demo}\n\nEs completamente personalizada para vos. Cualquier duda o cambio que quieras hacerle, avisame.`,
  },
  {
    titulo: 'Demo profesional',
    texto: (nombre, demo) =>
      `Hola ${nombre}, soy Kevin. Armé esta demo especialmente para tu negocio: ${demo}\n\nEl objetivo es que puedas ver concretamente cómo quedaría tu sitio. Si querés avanzar o tenés preguntas, estoy disponible.`,
  },
  {
    titulo: 'Seguimiento 48hs',
    texto: (nombre, demo) =>
      `Hola ${nombre}! Te escribo por la demo que te envié hace un par de días: ${demo}\n\n¿Pudiste verla? Quería saber si te generó alguna duda o si te interesa que hablemos.`,
  },
  {
    titulo: 'Pedido de referido',
    texto: (nombre, _demo) =>
      `Hola ${nombre}! Espero que estés disfrutando el sitio. Si conocés a alguien que pueda necesitar algo similar, te agradecería mucho que me recomiendes. Un saludo!`,
  },
]

function PlantillaCard({ plantilla, nombre, demo }: { plantilla: Plantilla; nombre: string; demo: string }) {
  const [copied, setCopied] = useState(false)
  const texto = plantilla.texto(nombre || '[nombre]', demo || '[link demo]')

  async function handleCopy() {
    await navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {plantilla.titulo}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#4ade8020' : 'transparent',
            border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
            color: copied ? '#4ade80' : 'var(--color-muted)',
            borderRadius: 6,
            padding: '4px 12px',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-star)',
        lineHeight: 1.65,
        margin: 0,
        whiteSpace: 'pre-wrap',
        opacity: nombre ? 1 : 0.5,
      }}>
        {texto}
      </p>
    </div>
  )
}

export default function MensajesPage() {
  const [nombre, setNombre] = useState('')
  const [demo,   setDemo]   = useState('')

  const inputStyle = {
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    color: 'var(--color-star)',
    outline: 'none',
    flex: 1,
  }

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Inputs */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
      }}>
        <label style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nombre del cliente
          </span>
          <input
            placeholder="Ej: María"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={inputStyle}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
        </label>
        <label style={{ flex: 2, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.6875rem', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Link de la demo
          </span>
          <input
            placeholder="https://mi-demo.vercel.app"
            value={demo}
            onChange={e => setDemo(e.target.value)}
            style={inputStyle}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          />
        </label>
      </div>

      {/* Templates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PLANTILLAS.map(p => (
          <PlantillaCard key={p.titulo} plantilla={p} nombre={nombre} demo={demo} />
        ))}
      </div>
    </div>
  )
}
