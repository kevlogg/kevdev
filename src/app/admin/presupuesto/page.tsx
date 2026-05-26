'use client'

import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function PresupuestoPage() {
  const [plan,          setPlan]          = useState<'mensual' | 'unico'>('unico')
  const [precioMensual, setPrecioMensual] = useState(39000)
  const [precioUnico,   setPrecioUnico]   = useState(250000)
  const [renovacion,    setRenovacion]    = useState(45000)
  const [ajusteMeses,   setAjusteMeses]   = useState<6 | 12>(6)
  const [ajustePct,     setAjustePct]     = useState(30)
  const [copied,        setCopied]        = useState(false)

  const costoAnioMensual = precioMensual * 12
  const costoAnioUnico   = precioUnico + renovacion
  const ahorro           = costoAnioMensual - costoAnioUnico

  function buildTexto() {
    const lines: string[] = []

    if (plan === 'unico') {
      lines.push(
        `🔹 PAGO UNICO - USO DE POR VIDA`,
        ``,
        `- ${fmt(precioUnico)}`,
        `- Renovación anual ${fmt(renovacion)}`,
        ``,
        `🔹 PAGO MENSUAL - USO MIENTRAS SE ABONE`,
        ``,
        `- ${fmt(precioMensual)}/mes`,
        `- Sin renovación anual`,
        `- Podés optar más adelante por pago único`,
        ``,
        `🔸 Ambos planes tienen un ajuste cada ${ajusteMeses} meses ajustado a la inflación.`,
        ``,
        `🔸 Ambos incluyen dominio y hosting`,
        ``,
        `🔸 Ambos vienen con herramientas para potenciar el sitio web y tu marca`,
      )
    } else {
      lines.push(
        `🔹 PAGO MENSUAL - USO MIENTRAS SE ABONE`,
        ``,
        `- ${fmt(precioMensual)}/mes`,
        `- Sin renovación anual`,
        `- Podés optar más adelante por pago único`,
        ``,
        `🔸 Ajuste cada ${ajusteMeses} meses ajustado a la inflación.`,
        ``,
        `🔸 Incluye dominio y hosting`,
        ``,
        `🔸 Viene con herramientas para potenciar el sitio web y tu marca`,
      )
    }

    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildTexto())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const card = {
    background: 'var(--color-depth)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 24,
  }

  const label = {
    fontFamily: 'var(--font-ui)',
    fontSize: '0.6875rem' as const,
    color: 'var(--color-faint)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 6,
    display: 'block' as const,
  }

  const numInput = (value: number, onChange: (n: number) => void) => ({
    background: 'rgba(221,232,255,0.04)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9375rem',
    color: 'var(--color-star)',
    outline: 'none',
    width: '100%',
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value) || 0),
    type: 'number' as const,
    min: 0,
  })

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Plan */}
      <div style={card}>
        <span style={label}>Plan</span>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
          {(['unico', 'mensual'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)} style={{
              flex: 1, padding: '9px 0',
              background: plan === p ? 'var(--color-accent-dim)' : 'transparent',
              border: 'none',
              borderRight: p === 'unico' ? '1px solid var(--color-border)' : 'none',
              color: plan === p ? 'var(--color-accent)' : 'var(--color-muted)',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {p === 'unico' ? 'Pago único' : 'Mensual'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: plan === 'unico' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 16 }}>
          <label>
            <span style={label}>Precio mensual (ARS)</span>
            <input {...numInput(precioMensual, setPrecioMensual)} />
          </label>
          {plan === 'unico' && (
            <label>
              <span style={label}>Pago único (ARS)</span>
              <input {...numInput(precioUnico, setPrecioUnico)} />
            </label>
          )}
          {plan === 'unico' && (
            <label>
              <span style={label}>Renovación anual (ARS)</span>
              <input {...numInput(renovacion, setRenovacion)} />
            </label>
          )}
        </div>
      </div>

      {/* Ajuste inflación */}
      <div style={card}>
        <span style={label}>Ajuste por inflación</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
            {([6, 12] as const).map(m => (
              <button key={m} onClick={() => setAjusteMeses(m)} style={{
                padding: '8px 20px',
                background: ajusteMeses === m ? 'var(--color-accent-dim)' : 'transparent',
                border: 'none',
                borderRight: m === 6 ? '1px solid var(--color-border)' : 'none',
                color: ajusteMeses === m ? 'var(--color-accent)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Cada {m} meses
              </button>
            ))}
          </div>
          <label style={{ flex: 1, minWidth: 140 }}>
            <span style={label}>% estimado</span>
            <div style={{ position: 'relative' }}>
              <input {...numInput(ajustePct, setAjustePct)} style={{ background: 'rgba(221,232,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 32px 8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', color: 'var(--color-star)', outline: 'none', width: '100%' }} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-muted)', pointerEvents: 'none' }}>%</span>
            </div>
          </label>
        </div>
      </div>

      {/* Comparativa — solo si pago único */}
      {plan === 'unico' && (
        <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ padding: '4px 0 4px 0', borderRight: '1px solid var(--color-border)' }}>
            <span style={{ ...label, marginBottom: 4 }}>Costo primer año — Pago único</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
              {fmt(costoAnioUnico)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              {fmt(precioUnico)} + {fmt(renovacion)} renovación
            </p>
          </div>
          <div style={{ padding: '4px 0 4px 20px' }}>
            <span style={{ ...label, marginBottom: 4 }}>Costo primer año — Mensual</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: '#fb923c', margin: 0 }}>
              {fmt(costoAnioMensual)}
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-faint)', margin: '4px 0 0' }}>
              {fmt(precioMensual)}/mes × 12
            </p>
          </div>
          {ahorro > 0 && (
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12 }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                El pago único ahorra <span style={{ color: '#4ade80', fontWeight: 600 }}>{fmt(ahorro)}</span> en el primer año.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview del texto */}
      <div style={card}>
        <span style={label}>Vista previa del mensaje</span>
        <pre style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          color: 'var(--color-star)',
          lineHeight: 1.7,
          margin: '0 0 20px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {buildTexto()}
        </pre>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? '#4ade8020' : 'transparent',
              border: `1px solid ${copied ? '#4ade80' : 'var(--color-border)'}`,
              color: copied ? '#4ade80' : 'var(--color-muted)',
              borderRadius: 8, padding: '8px 20px',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={() => window.open(`sms:&body=${encodeURIComponent(buildTexto())}`, '_blank')}
            style={{
              background: 'var(--color-accent)', color: 'var(--color-on-accent)',
              border: 'none', borderRadius: 8, padding: '8px 20px',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💬 Abrir en Mensajes
          </button>
        </div>
      </div>

    </div>
  )
}
