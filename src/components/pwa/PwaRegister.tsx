'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            // Check for updates periodically
            registration.onupdatefound = () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New content is available; can be used upon reload
                      console.log('[PWA] Nueva versión disponible.')
                    } else {
                      console.log('[PWA] Contenido disponible offline.')
                    }
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.warn('[PWA] Error al registrar Service Worker:', error)
          })
      }

      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  return null
}
