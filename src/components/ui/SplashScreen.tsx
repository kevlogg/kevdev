'use client'

import { useEffect, useRef, useState } from 'react'

export default function SplashScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(true)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let done = false
    const dismiss = () => {
      if (done) return
      done = true
      setFading(true)
      // Remove from DOM after transition completes
      setTimeout(() => setVisible(false), 900)
    }

    // Safety net — si el video tarda más de 30s igual desaparece
    const safety = setTimeout(dismiss, 30_000)

    video.muted = true
    video.volume = 0
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')

    const tryPlay = () => {
      video.play()
        .then(() => {
          video.addEventListener('ended', dismiss, { once: true })
        })
        .catch(() => {
          // Autoplay bloqueado: mostrar poster 1.5s y salir
          setTimeout(dismiss, 1500)
        })
    }

    if (video.readyState >= 2) {
      tryPlay()
    } else {
      video.load()
      video.addEventListener('canplay', tryPlay, { once: true })
      // Si no carga en 5s, salir igual
      setTimeout(dismiss, 5000)
    }

    return () => {
      clearTimeout(safety)
      video.removeEventListener('ended', dismiss)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position:   'fixed',
        inset:       0,
        zIndex:      99999,
        backgroundColor: '#0c0f17',
        opacity:     fading ? 0 : 1,
        transition:  fading ? 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <video
        ref={videoRef}
        src="/hero1.mp4"
        poster="/frames/frame-0001.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          display:    'block',
        }}
      />
    </div>
  )
}
