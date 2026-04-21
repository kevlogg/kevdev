'use client'

import { useState, useEffect } from 'react'
import { useMouseParallax } from '@/hooks/useMouseParallax'

function generateStars(count: number, spread = 3200): string {
  return Array.from({ length: count }, () => {
    const x    = Math.floor(Math.random() * spread) - spread / 4
    const y    = Math.floor(Math.random() * spread) - spread / 4
    const size = Math.random() < 0.15 ? 1.5 : 1
    const warm = Math.random()
    const r = Math.floor(237 + warm * 14)
    const g = Math.floor(232 - warm * 10)
    const b = Math.floor(223 - warm * 42)
    const a = (Math.random() * 0.5 + 0.22).toFixed(2)
    return `${x}px ${y}px 0 ${size}px rgba(${r},${g},${b},${a})`
  }).join(',')
}

export default function CosmicAtmosphere() {
  // Stars generadas solo en cliente — evita hydration mismatch con Math.random()
  const [starsFar,  setStarsFar]  = useState('')
  const [starsNear, setStarsNear] = useState('')

  useEffect(() => {
    setStarsFar(generateStars(300, 3800))
    setStarsNear(generateStars(160, 2600))
  }, [])

  const nebulaSlowRef = useMouseParallax({ strength: 14, lerpFactor: 0.04 })
  const nebulaMedRef  = useMouseParallax({ strength: 24, lerpFactor: 0.055 })
  const starsSlowRef  = useMouseParallax({ strength: 8,  lerpFactor: 0.035 })
  const starsMedRef   = useMouseParallax({ strength: 20, lerpFactor: 0.06 })
  const ambientRef    = useMouseParallax({ strength: 12, lerpFactor: 0.04, invert: true })

  return (
    <div
      aria-hidden
      style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden',
               backgroundColor:'#09090e', pointerEvents:'none' }}
    >
      {/* Base gradient */}
      <div style={{ position:'absolute', inset:0, background:`
        radial-gradient(ellipse 130% 80% at 50% -10%, rgba(14,12,28,0.95) 0%, transparent 65%),
        radial-gradient(ellipse 80% 60% at 85% 100%, rgba(12,10,22,0.6) 0%, transparent 55%),
        linear-gradient(175deg, #09090e 0%, #0b0912 60%, #09090e 100%)
      `}} />

      {/* Nebulosas */}
      <div ref={nebulaSlowRef} style={{ position:'absolute', inset:'-12%', willChange:'transform' }}>
        <div style={{ position:'absolute', top:'8%', left:'-8%', width:'70%', height:'75%',
          background:'radial-gradient(ellipse at 40% 50%, rgba(72,50,148,0.12) 0%, transparent 60%)',
          filter:'blur(72px)' }} />
        <div style={{ position:'absolute', bottom:'0%', right:'-5%', width:'60%', height:'65%',
          background:'radial-gradient(ellipse at 60% 50%, rgba(45,28,100,0.08) 0%, transparent 60%)',
          filter:'blur(90px)' }} />
      </div>
      <div ref={nebulaMedRef} style={{ position:'absolute', inset:'-12%', willChange:'transform' }}>
        <div style={{ position:'absolute', top:'-5%', left:'28%', width:'55%', height:'60%',
          background:'radial-gradient(ellipse at 50% 40%, rgba(55,35,108,0.07) 0%, transparent 55%)',
          filter:'blur(110px)' }} />
      </div>

      {/* Stars — solo se renderizan en cliente */}
      {starsFar && (
        <div ref={starsSlowRef} style={{ position:'absolute', top:'50%', left:'50%',
          width:'1px', height:'1px', willChange:'transform', boxShadow: starsFar }} />
      )}
      {starsNear && (
        <div ref={starsMedRef} style={{ position:'absolute', top:'50%', left:'50%',
          width:'1px', height:'1px', willChange:'transform', boxShadow: starsNear }} />
      )}

      {/* Luz ámbar ambiente */}
      <div ref={ambientRef} style={{ position:'absolute', inset:'-15%', willChange:'transform' }}>
        <div style={{ position:'absolute', top:'15%', right:'8%', width:'42%', height:'42%',
          background:'radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.045) 0%, transparent 65%)',
          filter:'blur(100px)' }} />
      </div>
    </div>
  )
}
