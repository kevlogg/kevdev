'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'

// Presets de accesos rápidos de KevDev
const PRESETS = [
  { label: '🌐 Sitio Principal', url: 'https://kevdev.app' },
  { label: '🚀 Convocatoria Impulso', url: 'https://kevdev.app/impulso' },
  { label: '💬 WhatsApp KevDev', url: 'https://wa.me/5491100000000?text=Hola%20KevDev!%20Quiero%20consultar%20por%20un%20proyecto' },
  { label: '📄 Solicitud Presupuesto', url: 'https://kevdev.app/admin/presupuesto' },
]

// Logotipos disponibles
const LOGO_OPTIONS = [
  { label: 'Logo Isotipo HQ', src: '/favicon-512x512.png' },
  { label: 'Logo Transparente', src: '/logo1-transparent.png' },
  { label: 'Apple Touch Icon', src: '/apple-touch-icon.png' },
]

// Presets de colores
const COLOR_PALETTES = [
  { label: 'Clásico Oscuro', fg: '#090d16', bg: '#ffffff' },
  { label: 'Azul KevDev', fg: '#3b82f6', bg: '#ffffff' },
  { label: 'Modo Neón', fg: '#00f2fe', bg: '#0b0f19' },
  { label: 'Púrpura Deep', fg: '#8b5cf6', bg: '#ffffff' },
  { label: 'Esmeralda', fg: '#10b981', bg: '#ffffff' },
  { label: 'Invertido', fg: '#ffffff', bg: '#0b0f19' },
]

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
  } else {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
}

export default function AdminQRPage() {
  const [qrText, setQrText] = useState('https://kevdev.app')
  const [fgColor, setFgColor] = useState('#090d16')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showLogo, setShowLogo] = useState(true)
  const [selectedLogo, setSelectedLogo] = useState('/favicon-512x512.png')
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)
  const [logoScale, setLogoScale] = useState(22) // porcentaje del ancho
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H')
  const [badgeStyle, setBadgeStyle] = useState<'rounded' | 'circle'>('rounded')
  const [badgeBg, setBadgeBg] = useState<'light' | 'dark' | 'transparent'>('light')
  const [badgeBorder, setBadgeBorder] = useState(true)
  const [exportSize, setExportSize] = useState(1024)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'generator' | 'api'>('generator')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const activeLogoUrl = customLogoUrl || selectedLogo

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const size = 512 // Render preview size

    canvas.width = size
    canvas.height = size

    try {
      await QRCode.toCanvas(canvas, qrText || 'https://kevdev.app', {
        errorCorrectionLevel: errorLevel,
        margin: 2,
        width: size,
        color: {
          dark: fgColor,
          light: bgColor === 'transparent' ? '#ffffff00' : bgColor,
        },
      })

      if (!showLogo || !activeLogoUrl) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = activeLogoUrl
      img.onload = () => {
        const logoSize = Math.round(size * (logoScale / 100))
        const centerX = (size - logoSize) / 2
        const centerY = (size - logoSize) / 2

        const badgePadding = Math.max(8, Math.round(logoSize * 0.15))
        const badgeSize = logoSize + badgePadding * 2
        const badgeX = (size - badgeSize) / 2
        const badgeY = (size - badgeSize) / 2

        ctx.save()

        const badgeFill = badgeBg === 'dark' ? '#0b0f19' : badgeBg === 'transparent' ? 'transparent' : '#ffffff'

        if (badgeStyle === 'circle') {
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, badgeSize / 2, 0, Math.PI * 2)
          if (badgeBg !== 'transparent') {
            ctx.fillStyle = badgeFill
            ctx.fill()
          }
          if (badgeBorder) {
            ctx.strokeStyle = fgColor
            ctx.lineWidth = Math.max(2, Math.round(logoSize * 0.04))
            ctx.stroke()
          }
        } else {
          const radius = Math.round(badgeSize * 0.22)
          drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, radius)
          if (badgeBg !== 'transparent') {
            ctx.fillStyle = badgeFill
            ctx.fill()
          }
          if (badgeBorder) {
            ctx.strokeStyle = fgColor
            ctx.lineWidth = Math.max(2, Math.round(logoSize * 0.04))
            ctx.stroke()
          }
        }

        ctx.drawImage(img, centerX, centerY, logoSize, logoSize)
        ctx.restore()
      }
    } catch (err) {
      console.error('Error al generar código QR:', err)
    }
  }, [qrText, fgColor, bgColor, showLogo, activeLogoUrl, logoScale, errorLevel, badgeStyle, badgeBg, badgeBorder])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Custom logo uploader handler
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomLogoUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate high-resolution canvas for download
  const generateExportCanvas = async (): Promise<HTMLCanvasElement> => {
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = exportSize
    exportCanvas.height = exportSize

    await QRCode.toCanvas(exportCanvas, qrText || 'https://kevdev.app', {
      errorCorrectionLevel: errorLevel,
      margin: 2,
      width: exportSize,
      color: {
        dark: fgColor,
        light: bgColor === 'transparent' ? '#ffffff00' : bgColor,
      },
    })

    if (showLogo && activeLogoUrl) {
      const ctx = exportCanvas.getContext('2d')
      if (ctx) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = activeLogoUrl
          img.onload = () => {
            const logoSize = Math.round(exportSize * (logoScale / 100))
            const centerX = (exportSize - logoSize) / 2
            const centerY = (exportSize - logoSize) / 2

            const badgePadding = Math.max(16, Math.round(logoSize * 0.15))
            const badgeSize = logoSize + badgePadding * 2
            const badgeX = (exportSize - badgeSize) / 2
            const badgeY = (exportSize - badgeSize) / 2

            ctx.save()
            const badgeFill = badgeBg === 'dark' ? '#0b0f19' : badgeBg === 'transparent' ? 'transparent' : '#ffffff'

            if (badgeStyle === 'circle') {
              ctx.beginPath()
              ctx.arc(exportSize / 2, exportSize / 2, badgeSize / 2, 0, Math.PI * 2)
              if (badgeBg !== 'transparent') {
                ctx.fillStyle = badgeFill
                ctx.fill()
              }
              if (badgeBorder) {
                ctx.strokeStyle = fgColor
                ctx.lineWidth = Math.max(3, Math.round(logoSize * 0.04))
                ctx.stroke()
              }
            } else {
              const radius = Math.round(badgeSize * 0.22)
              drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, radius)
              if (badgeBg !== 'transparent') {
                ctx.fillStyle = badgeFill
                ctx.fill()
              }
              if (badgeBorder) {
                ctx.strokeStyle = fgColor
                ctx.lineWidth = Math.max(3, Math.round(logoSize * 0.04))
                ctx.stroke()
              }
            }

            ctx.drawImage(img, centerX, centerY, logoSize, logoSize)
            ctx.restore()
            resolve()
          }
          img.onerror = () => resolve()
        })
      }
    }

    return exportCanvas
  }

  // Actions
  const handleDownloadPNG = async () => {
    const canvas = await generateExportCanvas()
    const link = document.createElement('a')
    link.download = `kevdev-qr-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    showToast('✨ Código QR descargado en alta resolución (PNG)')
  }

  const handleCopyClipboard = async () => {
    try {
      const canvas = await generateExportCanvas()
      canvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        showToast('📋 ¡Imagen QR copiada al portapapeles!')
      })
    } catch (err) {
      console.error(err)
      showToast('⚠️ No se pudo copiar al portapapeles en este navegador')
    }
  }

  const apiEndpointUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/qr?url=${encodeURIComponent(qrText)}&fg=${fgColor.replace('#', '')}&bg=${bgColor.replace('#', '')}&logo=${showLogo}`
    : `/api/qr?url=${encodeURIComponent(qrText)}`

  const handleCopyApiUrl = () => {
    navigator.clipboard.writeText(apiEndpointUrl)
    showToast('🔗 URL de API copiada al portapapeles')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Toast floating notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: 'var(--color-depth)',
          color: 'var(--color-star)',
          border: '1px solid var(--color-accent)',
          borderRadius: 10,
          padding: '12px 20px',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Title & Navigation tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-star)',
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>📱</span> Generador de Códigos QR
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            color: 'var(--color-muted)',
            margin: 0,
          }}>
            Crea códigos QR personalizados con el isotipo de KevDev en el centro y alta resistencia de escaneo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, background: 'var(--color-depth)', padding: 4, borderRadius: 10, border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('generator')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'generator' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'generator' ? '#ffffff' : 'var(--color-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🎨 Generador Interactivo
          </button>
          <button
            onClick={() => setActiveTab('api')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'api' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'api' ? '#ffffff' : 'var(--color-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⚡ API Integración REST
          </button>
        </div>
      </div>

      {/* Presets bar */}
      <div style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>
          Accesos Rápidos:
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setQrText(preset.url)}
              style={{
                background: qrText === preset.url ? 'var(--color-accent-dim)' : 'rgba(221,232,255,0.03)',
                border: qrText === preset.url ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                color: qrText === preset.url ? 'var(--color-star)' : 'var(--color-muted)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'generator' ? (
        /* Main Interactive Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Left Column: Form & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Input URL/Text */}
            <div style={{
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
            }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-star)',
                marginBottom: 8,
              }}>
                Enlace o Contenido del QR
              </label>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="https://kevdev.app..."
                style={{
                  width: '100%',
                  background: 'var(--color-void)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: 'var(--color-star)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Logo Options */}
            <div style={{
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-star)',
                }}>
                  Isotipo KevDev Central
                </label>
                <button
                  onClick={() => setShowLogo(!showLogo)}
                  style={{
                    background: showLogo ? 'var(--color-accent-dim)' : 'transparent',
                    border: '1px solid var(--color-border)',
                    color: showLogo ? 'var(--color-accent)' : 'var(--color-muted)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-ui)',
                    cursor: 'pointer',
                  }}
                >
                  {showLogo ? '✓ Con Logo' : 'Sin Logo'}
                </button>
              </div>

              {showLogo && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {LOGO_OPTIONS.map((logo) => (
                      <button
                        key={logo.src}
                        onClick={() => {
                          setSelectedLogo(logo.src)
                          setCustomLogoUrl(null)
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          padding: 10,
                          borderRadius: 8,
                          background: selectedLogo === logo.src && !customLogoUrl ? 'var(--color-accent-dim)' : 'rgba(255,255,255,0.02)',
                          border: selectedLogo === logo.src && !customLogoUrl ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <img src={logo.src} alt={logo.label} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                          {logo.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Upload custom logo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <label style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: customLogoUrl ? 'var(--color-accent-dim)' : 'rgba(221,232,255,0.03)',
                      border: customLogoUrl ? '1px dashed var(--color-accent)' : '1px dashed var(--color-border)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: customLogoUrl ? 'var(--color-star)' : 'var(--color-muted)',
                      fontFamily: 'var(--font-ui)',
                    }}>
                      <span>{customLogoUrl ? '📷 Logo Personalizado Activo' : '📁 Subir Otro Logo PNG/SVG...'}</span>
                      <input type="file" accept="image/*" onChange={handleCustomLogoUpload} style={{ display: 'none' }} />
                    </label>
                    {customLogoUrl && (
                      <button
                        onClick={() => setCustomLogoUrl(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Colors & Preset Palettes */}
            <div style={{
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <label style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-star)',
              }}>
                Paleta de Colores
              </label>

              {/* Color Preset Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.label}
                    onClick={() => {
                      setFgColor(pal.fg)
                      setBgColor(pal.bg)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: fgColor === pal.fg && bgColor === pal.bg ? 'var(--color-accent-dim)' : 'rgba(255,255,255,0.02)',
                      border: fgColor === pal.fg && bgColor === pal.bg ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: 10, height: 14, background: pal.fg }} />
                      <div style={{ width: 10, height: 14, background: pal.bg }} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                      {pal.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                    Color QR (Módulos)
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={fgColor.startsWith('#') ? fgColor : '#090d16'}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'var(--color-void)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                    Fondo
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'var(--color-void)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Adjustments */}
            <div style={{
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <label style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-star)',
              }}>
                Ajustes de Escaneo y Badge
              </label>

              {/* Logo Scale Slider */}
              {showLogo && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 6, fontFamily: 'var(--font-ui)' }}>
                    <span>Tamaño del Isotipo</span>
                    <span>{logoScale}%</span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={28}
                    value={logoScale}
                    onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                  />
                </div>
              )}

              {/* Badge shape & style */}
              {showLogo && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                      Forma de Fondo
                    </span>
                    <select
                      value={badgeStyle}
                      onChange={(e) => setBadgeStyle(e.target.value as any)}
                      style={{
                        width: '100%',
                        background: 'var(--color-void)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <option value="rounded">Cuadrado Redondeado</option>
                      <option value="circle">Círculo Perfecto</option>
                    </select>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                      Fondo del Logo
                    </span>
                    <select
                      value={badgeBg}
                      onChange={(e) => setBadgeBg(e.target.value as any)}
                      style={{
                        width: '100%',
                        background: 'var(--color-void)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: 'var(--color-star)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <option value="light">Blanco Puro</option>
                      <option value="dark">Fondo Oscuro</option>
                      <option value="transparent">Transparente</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Error Correction Level */}
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
                  Corrección de Errores (Resiliencia)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setErrorLevel(lvl)}
                      style={{
                        padding: '6px 0',
                        borderRadius: 6,
                        border: errorLevel === lvl ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                        background: errorLevel === lvl ? 'var(--color-accent-dim)' : 'transparent',
                        color: errorLevel === lvl ? 'var(--color-star)' : 'var(--color-muted)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      {lvl} {lvl === 'H' ? '(30%)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Canvas Live Preview & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <div style={{
              width: '100%',
              background: 'var(--color-depth)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              boxSizing: 'border-box',
            }}>
              {/* Scan Ready Indicator Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                padding: '4px 12px',
                borderRadius: 99,
                fontSize: '0.75rem',
                color: '#10b981',
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                <span>QR Activo & Listo para Escanear</span>
              </div>

              {/* Canvas Box */}
              <div style={{
                background: bgColor === 'transparent' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%231e293b\' d=\'0 0h8v8H0zM8 8h8v8H8z\'/%3E%3C/svg%3E")' : bgColor,
                padding: 24,
                borderRadius: 16,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: 280,
                    height: 280,
                    display: 'block',
                    borderRadius: 8,
                  }}
                />
              </div>

              {/* Resolution selector for export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
                  Resolución de exportación:
                </span>
                <select
                  value={exportSize}
                  onChange={(e) => setExportSize(parseInt(e.target.value, 10))}
                  style={{
                    background: 'var(--color-void)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    color: 'var(--color-star)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value={512}>512 x 512 px</option>
                  <option value={1024}>1024 x 1024 px (HD)</option>
                  <option value={2048}>2048 x 2048 px (Ultra HD)</option>
                </select>
              </div>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                <button
                  onClick={handleDownloadPNG}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--color-accent)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    transition: 'transform 0.15s',
                  }}
                >
                  📥 Descargar Imagen PNG ({exportSize}px)
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    onClick={handleCopyClipboard}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'rgba(221,232,255,0.03)',
                      color: 'var(--color-star)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    📋 Copiar Imagen
                  </button>
                  <button
                    onClick={handleCopyApiUrl}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'rgba(221,232,255,0.03)',
                      color: 'var(--color-star)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    🔗 Copiar Link API
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REST API Integration Tab */
        <div style={{
          background: 'var(--color-depth)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              margin: '0 0 8px',
            }}>
              ⚡ API Rest de Generación Directa de QR
            </h2>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              color: 'var(--color-muted)',
              margin: 0,
            }}>
              Puedes solicitar dinámicamente un código QR vectorizado SVG con el isotipo de KevDev en cualquier cliente, PDF de presupuesto o flyer.
            </p>
          </div>

          {/* Endpoint Box */}
          <div style={{
            background: 'var(--color-void)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <code style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent)',
              wordBreak: 'break-all',
            }}>
              GET {apiEndpointUrl}
            </code>
            <button
              onClick={handleCopyApiUrl}
              style={{
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-star)',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Copiar URL
            </button>
          </div>

          {/* Parameters documentation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-star)',
              margin: 0,
            }}>
              Parámetros de Query Aceptados:
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-muted)',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', color: 'var(--color-star)' }}>Parámetro</th>
                  <th style={{ padding: '8px 0', color: 'var(--color-star)' }}>Tipo</th>
                  <th style={{ padding: '8px 0', color: 'var(--color-star)' }}>Por Defecto</th>
                  <th style={{ padding: '8px 0', color: 'var(--color-star)' }}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(221,232,255,0.05)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>url / text</td>
                  <td>string</td>
                  <td>https://kevdev.app</td>
                  <td>Texto o enlace a codificar en el código QR.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(221,232,255,0.05)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>fg / color</td>
                  <td>hex string</td>
                  <td>0f172a</td>
                  <td>Color del código QR (sin necesidad del signo #).</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(221,232,255,0.05)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>bg</td>
                  <td>hex string</td>
                  <td>ffffff</td>
                  <td>Color de fondo (o <code>transparent</code>).</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(221,232,255,0.05)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>logo</td>
                  <td>boolean</td>
                  <td>true</td>
                  <td>Incluye o excluye el isotipo KevDev del centro.</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>size</td>
                  <td>number</td>
                  <td>512</td>
                  <td>Ancho/Alto del SVG generado en píxeles.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* HTML Snippet example */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-star)',
              margin: '0 0 8px',
            }}>
              Ejemplo de Uso en HTML / React:
            </h3>
            <pre style={{
              background: 'var(--color-void)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: 14,
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              overflowX: 'auto',
              margin: 0,
            }}>
              {`<img src="${apiEndpointUrl}" alt="KevDev QR" width="300" height="300" />`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
