'use client'

import { useState } from 'react'

interface Variante {
  label: string
  tono: string
  texto: (nombre: string, demo: string) => string
}

interface GrupoPlantilla {
  titulo: string
  variantes: Variante[]
}

const GRUPOS: GrupoPlantilla[] = [
  {
    titulo: 'Envío de demo',
    variantes: [
      {
        label: 'A',
        tono: 'Tono cercano',
        texto: (_nombre, demo) =>
          `¡Hola! Te comparto la demo de tu sitio web 👇\n\n🔗 ${demo || '[LINK]'}\n\nTe recomiendo verlo desde la computadora para la mejor experiencia, aunque desde el celu se ve bien también.\n\nTené en cuenta que es una demo: colores, imágenes, textos y precios se pueden modificar a gusto — está armado así para mostrarte cómo quedaría.\n\n¿Qué te parece? ¡Contame! 👀`,
      },
      {
        label: 'B',
        tono: 'Tono profesional',
        texto: (_nombre, demo) =>
          `Hola, te comparto la demo de tu sitio web:\n\n🔗 ${demo || '[LINK]'}\n\nLo ideal es verlo desde una computadora, aunque desde el celular también funciona correctamente.\n\nEs una demo de concepto: colores, imágenes, textos y precios son completamente personalizables. Están elegidos para mostrar cómo quedaría el resultado final.\n\nCualquier feedback que tengas, quedo a disposición.`,
      },
    ],
  },
  {
    titulo: 'Seguimiento 48hs',
    variantes: [
      {
        label: 'A',
        tono: 'Tono cercano',
        texto: (nombre, demo) =>
          `¡Hola ${nombre || '[nombre]'}! Te escribo por la demo que te mandé hace un par de días 👀\n\n🔗 ${demo || '[LINK]'}\n\n¿Pudiste verla? Quería saber si te generó alguna duda o si te interesa que hablemos.`,
      },
      {
        label: 'B',
        tono: 'Tono profesional',
        texto: (nombre, demo) =>
          `Hola ${nombre || '[nombre]'}, te escribo para hacer seguimiento de la demo que te compartí:\n\n🔗 ${demo || '[LINK]'}\n\n¿Tuviste oportunidad de revisarla? Quedo disponible para cualquier consulta o para avanzar cuando lo consideres.`,
      },
    ],
  },
  {
    titulo: 'Envío de presupuesto',
    variantes: [
      {
        label: 'A',
        tono: 'Template',
        texto: (_nombre, _demo) =>
          `🔹 PAGO UNICO - USO DE POR VIDA\n\n- $250.000\n- Renovación anual $45.000\n\n🔹 PAGO MENSUAL - USO MIENTRAS SE ABONE\n\n- $39.000\n- Sin renovación anual\n- Podés optar más adelante por pago único\n\n🔸 Ambos planes tienen un ajuste cada 6 meses ajustado a la inflación.\n\n🔸 Ambos incluyen dominio y hosting\n\n🔸 Ambos vienen con herramientas para potenciar el sitio web y tu marca`,
      },
    ],
  },
  {
    titulo: 'Pedido de referido',
    variantes: [
      {
        label: 'A',
        tono: 'Tono cercano',
        texto: (nombre, _demo) =>
          `¡Hola ${nombre || '[nombre]'}! Espero que estés disfrutando el sitio 🙌\n\nSi conocés a alguien que pueda necesitar algo similar, te agradecería mucho que me recomiendes. ¡Un abrazo!`,
      },
      {
        label: 'B',
        tono: 'Tono profesional',
        texto: (nombre, _demo) =>
          `Hola ${nombre || '[nombre]'}, espero que el sitio esté funcionando bien.\n\nSi en algún momento conocés a alguien que pueda necesitar un sitio web, te agradecería que me tengas en cuenta. Quedo a disposición.`,
      },
    ],
  },
]

function GrupoCard({ grupo, nombre, demo }: { grupo: GrupoPlantilla; nombre: string; demo: string }) {
  const [tab, setTab]       = useState(0)
  const [copied, setCopied] = useState(false)
  const variante = grupo.variantes[tab]
  const texto = variante.texto(nombre, demo)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  function handleAbrir() {
    const encoded = encodeURIComponent(texto)
    window.open(`sms:&body=${encoded}`, '_blank')
  }

  return (
    <div style={{
      background: 'var(--color-depth)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {grupo.variantes.map((v, i) => (
          <button
            key={v.label}
            onClick={() => setTab(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: tab === i ? 'var(--color-accent-dim)' : 'transparent',
              border: 'none',
              borderBottom: tab === i ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: tab === i ? 'var(--color-accent)' : 'var(--color-muted)',
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: tab === i ? 'var(--color-accent)' : 'var(--color-border)',
              color: tab === i ? 'var(--color-on-accent)' : 'var(--color-muted)',
              fontSize: '0.625rem',
              fontWeight: 700,
            }}>
              {v.label}
            </span>
            {v.tono}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.9375rem',
          color: 'var(--color-star)',
          lineHeight: 1.65,
          margin: '0 0 20px',
          whiteSpace: 'pre-wrap',
        }}>
          {texto}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={handleCopy}
            title="Copiar texto"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: copied ? '#4ade8020' : 'transparent',
              border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
              borderRadius: 8,
              color: copied ? '#4ade80' : 'var(--color-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓' : '⧉'}
          </button>
          <button
            onClick={handleAbrir}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 16px',
              height: 36,
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 8,
              color: 'var(--color-on-accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hi)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)' }}
          >
            💬 Abrir en Mensajes
          </button>
        </div>
      </div>
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

      {/* Grupos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GRUPOS.map(g => (
          <div key={g.titulo}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px 4px',
            }}>
              {g.titulo}
            </p>
            <GrupoCard grupo={g} nombre={nombre} demo={demo} />
          </div>
        ))}
      </div>
    </div>
  )
}
