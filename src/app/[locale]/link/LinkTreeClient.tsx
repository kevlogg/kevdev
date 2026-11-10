'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type LinkCategory = 'all' | 'web' | 'proyectos' | 'instagram' | 'wsp' | 'eventos'

interface LinkItem {
  id: string
  title: string
  subtitle: string
  url: string
  category: LinkCategory
  badge?: string
  isExternal: boolean
  accentColor: string
  icon: React.ReactNode
}

const LINK_ITEMS: LinkItem[] = [
  {
    id: 'web',
    title: 'Sitio Web Oficial',
    subtitle: 'Servicios de software a medida y cotizaciones online.',
    url: 'https://kevdev.net.ar',
    category: 'web',
    isExternal: true,
    accentColor: '#00e5ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'eventos',
    title: 'Servicios para fiestas/eventos',
    subtitle: 'Invitaciones interactivas, turnos y dinámicas en vivo.',
    url: 'https://kronitt.com.ar',
    category: 'eventos',
    isExternal: true,
    accentColor: '#f59e0b',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    ),
  },
  {
    id: 'proyectos',
    title: 'Portafolio de Proyectos',
    subtitle: 'Casos de éxito, tiendas online y aplicaciones web.',
    url: '/proyectos',
    category: 'proyectos',
    isExternal: false,
    accentColor: '#3b82f6',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.6 1.1-2.5 0-.9-.39-1.79-1.1-2.5" />
        <path d="M12 10l-2 2" />
        <path d="M15 7l-2 2" />
        <path d="M18 4l-2 2" />
        <path d="M14 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7z" />
        <path d="M12.5 12.5L2 23" />
        <path d="M15 15l6 6" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    title: 'Instagram Oficial',
    subtitle: '@kevdev_software · Desarrollos, demos y novedades.',
    url: 'https://www.instagram.com/kevdev_software/',
    category: 'instagram',
    isExternal: true,
    accentColor: '#e1306c',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'wsp',
    title: 'WhatsApp Directo',
    subtitle: 'Chatea directo con nosotros para cotizar tu proyecto.',
    url: 'https://wa.me/5492235851419?text=Hola%20KevDev!%20Vengo%20desde%20tu%20pagina%20de%20links',
    category: 'wsp',
    isExternal: true,
    accentColor: '#25d366',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
]

export default function LinkTreeClient() {
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % LINK_ITEMS.length)
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleCopyShareLink = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://kevdev.net.ar/link'
    navigator.clipboard.writeText(pageUrl)
    showToast('✨ Enlace de KevDev copiado al portapapeles')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-void)',
      color: 'var(--color-star)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Background Ambience & Noise */}
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      {/* Glow Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, rgba(18,18,18,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid var(--color-accent)',
          borderRadius: 99,
          padding: '10px 24px',
          color: 'var(--color-star)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,229,255,0.2)',
          backdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
        }}>
          {toastMsg}
        </div>
      )}

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#181818',
              border: '1px solid rgba(0,229,255,0.3)',
              borderRadius: 24,
              padding: 32,
              maxWidth: 380,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,229,255,0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--color-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-star)',
              margin: 0,
              textAlign: 'center',
            }}>
              Código QR KevDev
            </h3>

            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-muted)',
              margin: 0,
              textAlign: 'center',
            }}>
              Escanea para abrir este hub de enlaces en tu dispositivo móvil.
            </p>

            <div style={{
              background: '#ffffff',
              padding: 16,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="/api/qr?url=https://kevdev.net.ar/link&fg=0c0c0c&bg=ffffff&logo=true"
                alt="QR KevDev Link"
                style={{ width: 220, height: 220, display: 'block' }}
              />
            </div>

            <button
              onClick={() => {
                const a = document.createElement('a')
                a.href = '/api/qr?url=https://kevdev.net.ar/link&fg=0c0c0c&bg=ffffff&logo=true'
                a.download = 'kevdev-qr-links.svg'
                a.click()
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 12,
                border: '1px solid var(--color-accent)',
                background: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📥 Descargar QR
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 580,
        width: '100%',
        margin: '0 auto',
        minHeight: '100dvh',
        padding: 'clamp(16px, 2.5vh, 28px) clamp(16px, 4vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'clamp(12px, 2vh, 20px)',
        boxSizing: 'border-box',
      }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'clamp(6px, 1.1vh, 12px)',
        }}>
          {/* Avatar frame */}
          <div style={{
            position: 'relative',
            width: 'clamp(60px, 8.2vh, 84px)',
            height: 'clamp(60px, 8.2vh, 84px)',
            borderRadius: '50%',
            padding: 2.5,
            background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 50%, #8b5cf6 100%)',
            boxShadow: '0 0 24px rgba(0,229,255,0.25)',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#121212',
              position: 'relative',
            }}>
              <Image
                src="/favicon-512x512.png"
                alt="KevDev Studio"
                width={84}
                height={84}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

          {/* Name & Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.3rem, 2.5vh, 1.65rem)',
              fontWeight: 800,
              color: 'var(--color-star)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '-0.02em',
            }}>
              KevDev
              <span
                title="Cuenta Oficial Verificada"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(16px, 2vh, 19px)',
                  height: 'clamp(16px, 2vh, 19px)',
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: '#0c0c0c',
                  fontSize: '0.6875rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.6875rem, 1.15vh, 0.78rem)',
              color: 'var(--color-accent)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Desarrollador web & software a medida
            </p>
          </div>

          {/* Bio text */}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.78rem, 1.35vh, 0.875rem)',
            color: 'var(--color-muted)',
            margin: 0,
            maxWidth: 440,
            lineHeight: 1.35,
          }}>
            Experiencias digitales para potenciar tu marca
          </p>
        </div>

        {/* Links Stack List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.6vh, 16px)',
          flex: 1,
          justifyContent: 'center',
        }}>
          {LINK_ITEMS.map((item, index) => {
            const isActive = index === activeCardIndex
            return (
              <a
                key={item.id}
                href={item.url}
                target={item.isExternal ? '_blank' : '_self'}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(12px, 3vw, 16px)',
                  padding: 'clamp(12px, 1.8vh, 18px) clamp(14px, 3.5vw, 20px)',
                  background: 'rgba(24, 24, 24, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: `1.5px solid ${isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 16,
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'border-color 0.8s ease-in-out, box-shadow 0.8s ease-in-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive
                    ? '0 0 20px rgba(0, 229, 255, 0.3), 0 6px 20px rgba(0,0,0,0.6)'
                    : 'none',
                  transform: isActive ? 'scale(1.012)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.accentColor
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.012)'
                  e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${item.accentColor}35`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = isActive ? 'scale(1.012)' : 'scale(1)'
                  e.currentTarget.style.boxShadow = isActive
                    ? '0 0 20px rgba(0, 229, 255, 0.3), 0 6px 20px rgba(0,0,0,0.6)'
                    : 'none'
                }}
              >
                {/* SVG Border Light Beam Traveling along the card edges with 0.8s crossfade */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    borderRadius: 16,
                    zIndex: 3,
                  }}
                >
                  <defs>
                    <linearGradient id={`beam-grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
                      <stop offset="50%" stopColor="#33ebff" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id={`beam-glow-${item.id}`} x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Active Light Segment with smooth crossfade transition */}
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="15"
                    fill="none"
                    stroke={`url(#beam-grad-${item.id})`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter={`url(#beam-glow-${item.id})`}
                    pathLength="100"
                    strokeDasharray="24 76"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out',
                      animation: 'edge-beam-trace 2s linear infinite',
                    }}
                  />
                </svg>

                <style>{`
                  @keyframes edge-beam-trace {
                    0% {
                      stroke-dashoffset: 0;
                    }
                    100% {
                      stroke-dashoffset: -100;
                    }
                  }
                `}</style>

                {/* Card Inner Content Container */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(12px, 3vw, 16px)',
                  width: '100%',
                  position: 'relative',
                  zIndex: 2,
                }}>
                {/* Left Glowing Icon Box */}
                <div style={{
                  width: 'clamp(40px, 5.2vh, 48px)',
                  height: 'clamp(40px, 5.2vh, 48px)',
                  borderRadius: 12,
                  background: `${item.accentColor}18`,
                  border: `1px solid ${item.accentColor}40`,
                  color: item.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>

                {/* Content info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(0.9rem, 1.8vh, 1.02rem)',
                    fontWeight: 700,
                    color: 'var(--color-star)',
                    letterSpacing: '-0.01em',
                  }}>
                    {item.title}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'clamp(0.72rem, 1.35vh, 0.8125rem)',
                    color: 'var(--color-muted)',
                    lineHeight: 1.35,
                  }}>
                    {item.subtitle}
                  </span>
                </div>

                {/* Right Arrow */}
                <div style={{
                  color: isActive ? '#00e5ff' : 'var(--color-muted)',
                  fontSize: 'clamp(1.05rem, 2vh, 1.25rem)',
                  flexShrink: 0,
                  transition: 'transform 0.2s, color 0.2s',
                  transform: isActive ? 'translateX(2px)' : 'none',
                }}>
                  ↗
                </div>
              </div>
            </a>
          )
        })}
        </div>

        {/* Footer info */}
        <footer style={{
          textAlign: 'center',
          paddingTop: 'clamp(10px, 1.5vh, 18px)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.6875rem, 1.2vh, 0.75rem)',
            color: 'var(--color-faint)',
            margin: 0,
          }}>
            © {new Date().getFullYear()} KevDev Studio
          </p>
          <span style={{ color: 'var(--color-faint)', fontSize: '0.6875rem' }}>·</span>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(0.72rem, 1.2vh, 0.8125rem)',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            kevdev.net.ar
          </Link>
        </footer>
      </div>
    </div>
  )
}
