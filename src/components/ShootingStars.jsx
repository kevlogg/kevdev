import '../styles/shooting-stars.css'

const SHOOTING_STARS = [
  { left: '2%', top: '3%', delay: 0 },
  { left: '11%', top: '1%', delay: 280 },
  { left: '22%', top: '4%', delay: 560 },
  { left: '33%', top: '2%', delay: 840 },
  { left: '55%', top: '1%', delay: 1400 },
  { left: '66%', top: '4%', delay: 1680 },
  { left: '77%', top: '2%', delay: 1960 },
  { left: '88%', top: '5%', delay: 2240 },
  { left: '97%', top: '3%', delay: 2520 },
  { left: '4%', top: '96%', delay: 120 },
  { left: '18%', top: '98%', delay: 400 },
  { left: '32%', top: '94%', delay: 720 },
  { left: '50%', top: '97%', delay: 1040 },
  { left: '68%', top: '95%', delay: 1360 },
  { left: '82%', top: '98%', delay: 1760 },
  { left: '1%', top: '22%', delay: 400 },
  { left: '0%', top: '48%', delay: 1280 },
  { left: '99%', top: '30%', delay: 640 },
  { left: '100%', top: '62%', delay: 1600 },
  { left: '98%', top: '78%', delay: 880 },
]

/** Capa de cometas: debe montarse dentro de StarBackground (hermano de overflow:hidden de las estrellas). */
export default function ShootingStars() {
  return (
    <div className="ss-comets-layer" aria-hidden>
      <div className="ss-night">
        {SHOOTING_STARS.map((s, i) => (
          <div
            key={i}
            className="ss-star"
            style={{
              left: s.left,
              top: s.top,
              '--ss-delay': `${s.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
