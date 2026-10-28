'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already installed / standalone mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
      return isStandaloneMedia || isIOSStandalone
    }

    if (checkStandalone()) {
      setIsStandalone(true)
      return
    }

    // Detect iOS
    const ua = window.navigator.userAgent
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    setIsIOS(isIosDevice)

    // Check localStorage dismissal
    const dismissedUntil = localStorage.getItem('kevdev_pwa_dismissed')
    const now = Date.now()
    const isDismissed = dismissedUntil && Number(dismissedUntil) > now

    // Listen to beforeinstallprompt (Chromium / Android / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      if (!isDismissed) {
        // Show after a brief delay for a polished entrance
        const timer = setTimeout(() => {
          setShowBanner(true)
        }, 3500)
        return () => clearTimeout(timer)
      }
    }

    // Listen to app installed
    const handleAppInstalled = () => {
      setInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
      console.log('[PWA] KevDev App instalada con éxito.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen to custom event to open installation from external buttons (e.g. Navbar or Footer)
    const handleCustomOpen = () => {
      if (checkStandalone()) {
        alert('KevDev ya está instalada en tu dispositivo.')
        return
      }
      if (isIosDevice) {
        setShowIOSModal(true)
      } else if (deferredPrompt) {
        deferredPrompt.prompt().then(() => deferredPrompt.userChoice).then((choice) => {
          if (choice.outcome === 'accepted') {
            setShowBanner(false)
          }
        })
      } else {
        setShowBanner(true)
      }
    }

    window.addEventListener('open-pwa-install', handleCustomOpen)

    // If iOS and not dismissed, show banner after 4 seconds
    if (isIosDevice && !isDismissed && !checkStandalone()) {
      const iosTimer = setTimeout(() => {
        setShowBanner(true)
      }, 4000)
      return () => {
        clearTimeout(iosTimer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
        window.removeEventListener('open-pwa-install', handleCustomOpen)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('open-pwa-install', handleCustomOpen)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowBanner(false)
      setShowIOSModal(true)
      return
    }

    if (!deferredPrompt) {
      // Fallback instructions if browser doesn't support automatic prompt
      alert('Para instalar KevDev: abrí el menú de tu navegador (⋮) y seleccioná "Instalar aplicación" o "Agregar a la pantalla principal".')
      setShowBanner(false)
      return
    }

    await deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Don't show again for 7 days
    try {
      localStorage.setItem('kevdev_pwa_dismissed', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString())
    } catch {}
  }

  if (isStandalone || installed) return null

  return (
    <>
      {/* Floating PWA Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.aside
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label="Descargar aplicación web"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              maxWidth: '380px',
              width: 'calc(100vw - 32px)',
              background: 'rgba(18, 18, 18, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              borderRadius: '20px',
              padding: '18px 20px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(0, 229, 255, 0.2)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#0c0c0c',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  flexShrink: 0,
                  boxShadow: '0 0 12px rgba(0, 229, 255, 0.25)',
                }}
              >
                <Image
                  src="/favicon-192x192.png"
                  alt="KevDev Icon"
                  width={46}
                  height={46}
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#00e5ff',
                      background: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '99px',
                    }}
                  >
                    PWA App
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  Descargar KevDev
                </h2>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(232, 232, 232, 0.7)',
                    marginTop: '4px',
                    marginBottom: '14px',
                    lineHeight: 1.45,
                  }}
                >
                  Instalá la app para acceder con 1 toque, cargar más rápido y navegar sin conexión.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#00e5ff',
                      color: '#0c0c0c',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      padding: '8px 14px',
                      borderRadius: '99px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    INSTALAR
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    style={{
                      background: 'transparent',
                      color: 'rgba(232, 232, 232, 0.6)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      padding: '8px 12px',
                      borderRadius: '99px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Luego
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Cerrar aviso"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(232, 232, 232, 0.4)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* iOS Safari Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#181818',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: '24px',
                padding: '28px 24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#00e5ff',
                  }}
                >
                  Instalar en iOS / Safari
                </span>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(232, 232, 232, 0.6)',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ✕
                </button>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff' }}>
                Cómo descargar KevDev en tu iPhone
              </h3>

              <ol style={{ paddingLeft: '20px', fontSize: '0.88rem', lineHeight: '1.7', color: 'rgba(232, 232, 232, 0.85)', marginBottom: '24px' }}>
                <li style={{ marginBottom: '10px' }}>
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari{' '}
                  <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </span>.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  Desplázate hacia abajo y selecciona <strong>&ldquo;Agregar a pantalla de inicio&rdquo;</strong>.
                </li>
                <li>
                  Presiona <strong>&ldquo;Agregar&rdquo;</strong> en la esquina superior derecha.
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                style={{
                  width: '100%',
                  background: '#00e5ff',
                  color: '#0c0c0c',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '12px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ENTENDIDO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
