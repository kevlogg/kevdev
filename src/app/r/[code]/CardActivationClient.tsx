'use client'

import { useState } from 'react'
import Link from 'next/link'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface CardActivationClientProps {
  code: string
  initialClientName?: string
  initialTargetUrl?: string
  isEditMode?: boolean
}

export default function CardActivationClient({
  code,
  initialClientName = '',
  initialTargetUrl = '',
  isEditMode = false,
}: CardActivationClientProps) {
  const [targetUrl, setTargetUrl] = useState(initialTargetUrl)
  const [clientName, setClientName] = useState(initialClientName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ targetUrl: string; clientName: string } | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Intentar pegar desde el portapapeles
  const handlePasteClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          setTargetUrl(text.trim())
          setError(null)
        }
      }
    } catch {
      // Ignorar si el usuario deniega permiso
    }
  }

  // Guardar y activar
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanUrl = targetUrl.trim()
    if (!cleanUrl) {
      setError('Por favor pegá el enlace de Google Reseñas o destino.')
      return
    }

    setLoading(true)

    try {
      let saved = false
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)
        const res = await fetch('/api/qr/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            targetUrl: cleanUrl,
            clientName: clientName.trim(),
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        if (res.ok) {
          saved = true
        }
      } catch (apiErr) {
        console.warn('API /api/qr/activate timed out or failed, using client fallback:', apiErr)
      }

      if (!saved) {
        // Fallback directo a Firestore
        const docRef = doc(db, 'qr_tarjetas', code)
        await setDoc(
          docRef,
          {
            code,
            targetUrl: cleanUrl,
            clientName: clientName.trim(),
            status: 'active',
            updatedAt: new Date().toISOString(),
            serverUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }

      const finalUrl = cleanUrl.match(/^https?:\/\//i) ? cleanUrl : `https://${cleanUrl}`
      setSuccessData({
        targetUrl: finalUrl,
        clientName: clientName.trim(),
      })

      // Iniciar cuenta regresiva para redirección automática de prueba
      let count = 3
      setCountdown(count)
      const timer = setInterval(() => {
        count -= 1
        if (count <= 0) {
          clearInterval(timer)
          window.location.href = finalUrl
        } else {
          setCountdown(count)
        }
      }, 1000)
    } catch (err: any) {
      console.error('Error al activar tarjeta:', err)
      setError(err?.message || 'Ocurrió un error al guardar. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        color: '#e8e8e8',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Cyber Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(24, 24, 24, 0.94)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '24px',
          padding: '36px 26px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 255, 0.15)',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Badge superior */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#00e5ff',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            padding: '6px 16px',
            borderRadius: '99px',
            marginBottom: '18px',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: successData ? '#10b981' : '#00e5ff',
              boxShadow: successData ? '0 0 10px #10b981' : '0 0 10px #00e5ff',
              display: 'inline-block',
            }}
          />
          TARJETA QR #{code}
        </div>

        {/* ─── ESTADO: ÉXITO TRAS ACTIVAR ─── */}
        {successData ? (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
              }}
            >
              ✅
            </div>

            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              ¡Tarjeta configurada con éxito!
            </h1>

            <p
              style={{
                fontSize: '13px',
                color: 'rgba(232, 232, 232, 0.75)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              El enlace ya quedó guardado en la base central de <strong>KevDev</strong>. Cada escaneo futuro de este QR redirigirá automáticamente a:
            </p>

            {/* Recuadro de resumen */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: '14px',
                padding: '14px 16px',
                textAlign: 'left',
                marginBottom: '24px',
              }}
            >
              {successData.clientName && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(232, 232, 232, 0.5)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    Comercio / Cliente:
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {successData.clientName}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(232, 232, 232, 0.5)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Enlace de destino:
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#00e5ff',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    marginTop: '2px',
                  }}
                >
                  {successData.targetUrl}
                </div>
              </div>
            </div>

            {/* Botón de redirección inmediata */}
            <a
              href={successData.targetUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#00e5ff',
                color: '#0c0c0c',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '14px 20px',
                borderRadius: '99px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
                marginBottom: '12px',
              }}
            >
              PROBAR ENLACE AHORA {countdown !== null && `(${countdown}s)`} →
            </a>

            <button
              type="button"
              onClick={() => setSuccessData(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(232, 232, 232, 0.6)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                padding: '8px',
              }}
            >
              Modificar enlace o nombre
            </button>
          </div>
        ) : (
          /* ─── ESTADO: FORMULARIO DE ACTIVACIÓN ─── */
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              {isEditMode ? 'Editar enlace de la tarjeta' : 'Este QR todavía no tiene enlace'}
            </h1>

            <p
              style={{
                fontSize: '13px',
                color: 'rgba(232, 232, 232, 0.7)',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              Pegá el enlace de <strong>Google Reseñas</strong> (o de tu web) para activarlo en este QR y sincronizarlo con tu panel KevDev:
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {/* Input Enlace */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    htmlFor="targetUrl"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#00e5ff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: 'ui-monospace, monospace',
                    }}
                  >
                    🔗 Enlace de Google Reseñas *
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    style={{
                      background: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: '#00e5ff',
                      fontSize: '10px',
                      fontFamily: 'ui-monospace, monospace',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    📋 Pegar
                  </button>
                </div>
                <input
                  id="targetUrl"
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => {
                    setTargetUrl(e.target.value)
                    setError(null)
                  }}
                  placeholder="https://g.page/r/... o maps.app.goo.gl/..."
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(0, 229, 255, 0.35)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'ui-monospace, monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00e5ff'
                    e.target.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.3)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 229, 255, 0.35)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Input Nombre del Comercio */}
              <div>
                <label
                  htmlFor="clientName"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(232, 232, 232, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: 'ui-monospace, monospace',
                    marginBottom: '6px',
                  }}
                >
                  🏢 Comercio / Cliente (Opcional)
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Panadería Don Lorenzo"
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                  }}
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  background: '#00e5ff',
                  color: '#0c0c0c',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '14px 20px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
                  transition: 'all 0.2s ease',
                  marginTop: '8px',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid #0c0c0c',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    GUARDANDO EN BASE KEVDEV...
                  </>
                ) : (
                  <>
                    <span>⚡</span> GUARDAR Y ACTIVAR TARJETA
                  </>
                )}
              </button>
            </form>

            {/* Enlace footer */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <Link
                href="/admin/resenas-qr"
                style={{
                  fontSize: '11px',
                  color: 'rgba(232, 232, 232, 0.45)',
                  textDecoration: 'none',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                Panel de Control KevDev · /admin/resenas-qr
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
