'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function VideoBackground() {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollY } = useScroll()
  // Parallax movement on scroll (soft float depth)
  const parallaxY = useTransform(scrollY, [0, 2000], [0, -180])
  const parallaxScale = useTransform(scrollY, [0, 2000], [1.05, 1.15])

  return (
    <>
      {/* ── Continuous 60FPS Ambient Video Background ───────────────────────── */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: -30,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: '#0c0f17',
          pointerEvents: 'none',
          y: parallaxY,
          scale: parallaxScale,
        }}
      >
        <video
          ref={videoRef}
          src="/videohero.mp4"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoReady(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </motion.div>

      {/* ── Soft vignette & top gradient for maximum text readability ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 95% 95% at 50% 50%, rgba(12,15,23,0.25) 0%, rgba(12,15,23,0.75) 100%)'
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, rgba(12,15,23,0.7) 0%, transparent 100%)'
        }} />
      </div>

      {/* ── Initial curtain that fades out smoothly once video is ready ───── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: videoReady ? 0 : 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2,
          background: '#0c0f17', pointerEvents: 'none',
        }}
      />
    </>
  )
}
