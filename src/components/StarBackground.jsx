import { useMemo } from 'react'
import ShootingStars from './ShootingStars'

function generateBoxShadows(n) {
  const parts = []
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * 2000)
    const y = Math.floor(Math.random() * 2000)
    parts.push(`${x}px ${y}px #FFF`)
  }
  return parts.join(', ')
}

export default function StarBackground() {
  const [shadowsSmall, shadowsMedium, shadowsBig] = useMemo(() => [
    generateBoxShadows(700),
    generateBoxShadows(200),
    generateBoxShadows(100),
  ], [])

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        overflow: 'visible',
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #0a0e1a 70%, #050810 100%)',
      }}
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden">
      <div
        className="star-layer"
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '2000px',
          animation: 'starAnim 50s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: '1px',
            background: 'transparent',
            boxShadow: shadowsSmall,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '2000px',
            left: 0,
            width: '1px',
            height: '1px',
            background: 'transparent',
            boxShadow: shadowsSmall,
          }}
        />
      </div>
      <div
        className="star-layer"
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '2000px',
          animation: 'starAnim 100s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '2px',
            height: '2px',
            background: 'transparent',
            boxShadow: shadowsMedium,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '2000px',
            left: 0,
            width: '2px',
            height: '2px',
            background: 'transparent',
            boxShadow: shadowsMedium,
          }}
        />
      </div>
      <div
        className="star-layer"
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: '2000px',
          animation: 'starAnim 150s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '3px',
            background: 'transparent',
            boxShadow: shadowsBig,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '2000px',
            left: 0,
            width: '3px',
            height: '3px',
            background: 'transparent',
            boxShadow: shadowsBig,
          }}
        />
      </div>
      </div>
      <ShootingStars />
      <style>{`
        @keyframes starAnim {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  )
}
