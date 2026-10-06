'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type LinkCategory = 'all' | 'web' | 'proyectos' | 'instagram' | 'wsp'

interface LinkItem {
  id: string
  title: string
  subtitle: string
  url: string
  category: LinkCategory
  badge: string
  isExternal: boolean
  accentColor: string
  icon: React.ReactNode
}

const LINK_ITEMS: LinkItem[] = [
  {
    id: 'web',
    title: 'Sitio Web Oficial',
    subtitle: 'Conoce nuestros servicios, software a medida y cotizaciones.',
    url: 'https://kevdev.net.ar',
    category: 'web',
    badge: 'Oficial & Servicios',
    isExternal: true,
    accentColor: '#00e5ff',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'proyectos',
    title: 'Portafolio de Proyectos',
    subtitle: 'Explora nuestros casos de éxito, landing pages de alta conversión y demos.',
    url: '/proyectos',
    category: 'proyectos',
    badge: 'Casos de Éxito',
    isExternal: false,
    accentColor: '#3b82f6',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    subtitle: '@kevdev_software — Novedades, desarrollos 60FPS y detrás de escena.',
    url: 'https://www.instagram.com/kevdev_software/',
    category: 'instagram',
    badge: '@kevdev_software',
    isExternal: true,
    accentColor: '#e1306c',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'wsp',
    title: 'WhatsApp Directo',
    subtitle: 'Chatea directamente con nuestro equipo técnico para iniciar tu proyecto.',
    url: 'https://wa.me/5492235851419?text=Hola%20KevDev!%20Vengo%20desde%20tu%20pagina%20de%20links',
    category: 'wsp',
    badge: 'Atención Directa 24/7',
    isExternal: true,
    accentColor: '#25d366',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
]

export default function LinkTreeClient() {
  const [activeCategory, setActiveCategory] = useState<LinkCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const filteredItems = LINK_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
        maxWidth: 640,
        margin: '0 auto',
        padding: '40px 20px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}>
        {/* Top Navbar Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              transition: 'color 0.2s',
            }}
          >
            ← Ir a KevDev.net.ar
          </Link>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowQrModal(true)}
              title="Mostrar Código QR"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: 99,
                padding: '6px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              📱 QR
            </button>

            <button
              onClick={handleCopyShareLink}
              title="Copiar Enlace"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: 99,
                padding: '6px 12px',
                color: 'var(--color-star)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              🔗 Compartir
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
        }}>
          {/* Avatar frame */}
          <div style={{
            position: 'relative',
            width: 96,
            height: 96,
            borderRadius: '50%',
            padding: 3,
            background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 50%, #8b5cf6 100%)',
            boxShadow: '0 0 30px rgba(0,229,255,0.3)',
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
                width={90}
                height={90}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

          {/* Name & Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-star)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '-0.02em',
            }}>
              KevDev
              <span
                title="Cuenta Oficial Verificada"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: '#0c0c0c',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Desarrollador Web & Software Studio
            </p>
          </div>

          {/* Bio text */}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.9375rem',
            color: 'var(--color-muted)',
            margin: 0,
            maxWidth: 480,
            lineHeight: 1.5,
          }}>
            Creamos experiencias digitales a 60 FPS, sitios web de alta conversión y software a medida en Argentina.
          </p>

          {/* Status Indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,229,255,0.06)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 99,
            padding: '6px 16px',
            fontSize: '0.75rem',
            color: 'var(--color-star)',
            fontFamily: 'var(--font-ui)',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }} />
            <span>Disponible para nuevos proyectos</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'web', label: '🌐 Sitio Web' },
            { id: 'proyectos', label: '💼 Proyectos' },
            { id: 'instagram', label: '📸 Instagram' },
            { id: 'wsp', label: '💬 WhatsApp' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as LinkCategory)}
              style={{
                padding: '8px 16px',
                borderRadius: 99,
                border: activeCategory === cat.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: activeCategory === cat.id ? 'var(--color-accent-dim)' : 'rgba(255,255,255,0.03)',
                color: activeCategory === cat.id ? 'var(--color-star)' : 'var(--color-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                fontWeight: activeCategory === cat.id ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input filter */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Filtrar o buscar enlace..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '12px 16px',
              color: 'var(--color-star)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border 0.2s',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Links Stack List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px dashed var(--color-border)',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
            }}>
              No se encontraron enlaces con esa búsqueda.
            </div>
          ) : (
            filteredItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.isExternal ? '_blank' : '_self'}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  background: 'rgba(24, 24, 24, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid rgba(255, 255, 255, 0.08)`,
                  borderRadius: 16,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.accentColor
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${item.accentColor}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Left Glowing Icon Box */}
                <div style={{
                  width: 48,
                  height: 48,
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
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-star)',
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: item.accentColor,
                      background: `${item.accentColor}15`,
                      border: `1px solid ${item.accentColor}30`,
                      padding: '2px 8px',
                      borderRadius: 99,
                      whiteSpace: 'nowrap',
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-muted)',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.subtitle}
                  </span>
                </div>

                {/* Right Arrow */}
                <div style={{
                  color: 'var(--color-muted)',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                }}>
                  ↗
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer info */}
        <footer style={{
          textAlign: 'center',
          marginTop: 20,
          paddingTop: 24,
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-faint)',
            margin: 0,
          }}>
            © {new Date().getFullYear()} KevDev Software Studio · Todos los derechos reservados.
          </p>

          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
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
