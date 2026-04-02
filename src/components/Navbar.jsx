import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import BrandLogo from './BrandLogo'
import { setNavBeamInnerHTML } from '../utils/navBeamSvg'
import '../styles/navBeam.css'

const NAV_ITEMS = [
  { href: '#que-hago', label: 'Qué hago' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#contacto', label: 'Contacto' },
]

function hashToIndex() {
  const h = window.location.hash
  if (h === '#proyectos') return 1
  if (h === '#contacto') return 2
  return 0
}

function getOffsetLeft(element, navElement, beamElement) {
  const elementRect = element.getBoundingClientRect()
  const navRect = navElement.getBoundingClientRect()
  return (
    elementRect.left -
    navRect.left +
    (elementRect.width - beamElement.offsetWidth) / 2
  )
}

function scrollToHash(href) {
  const id = href.replace('#', '')
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  window.history.pushState(null, '', href)
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    typeof window !== 'undefined' ? hashToIndex() : 0
  )

  const navRef = useRef(null)
  const beamRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    const navEl = navRef.current
    const beamEl = beamRef.current
    if (!navEl || !beamEl) return undefined

    const init = () => {
      if (cancelled) return
      const idx = hashToIndex()
      const links = navEl.querySelectorAll('ul li .kevdev-nav-link')
      const link = links[idx]
      if (!link) return
      gsap.set(beamEl, { x: getOffsetLeft(link, navEl, beamEl) })
      gsap.to(beamEl, { '--active-element-show': 1, duration: 0.2 })
    }

    document.fonts.ready.then(init)
    return () => {
      cancelled = true
      gsap.killTweensOf(beamEl)
    }
  }, [])

  useEffect(() => {
    const onResize = () => {
      const navEl = navRef.current
      const beamEl = beamRef.current
      if (!navEl || !beamEl) return
      const links = navEl.querySelectorAll('ul li .kevdev-nav-link')
      const link = links[activeIndex]
      if (!link) return
      gsap.killTweensOf(beamEl)
      gsap.set(beamEl, {
        x: getOffsetLeft(link, navEl, beamEl),
        '--active-element-show': 1,
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex])

  const handleItemClick = useCallback(
    (e, index) => {
      e.preventDefault()
      const navEl = navRef.current
      const beamEl = beamRef.current
      if (!navEl || !beamEl) return

      const oldIndex = activeIndex
      if (
        index === oldIndex ||
        navEl.classList.contains('before') ||
        navEl.classList.contains('after')
      ) {
        scrollToHash(NAV_ITEMS[index].href)
        return
      }

      const links = [...navEl.querySelectorAll('ul li .kevdev-nav-link')]
      const oldLink = links[oldIndex]
      const newLink = links[index]
      if (!oldLink || !newLink) return

      setActiveIndex(index)

      const x = getOffsetLeft(newLink, navEl, beamEl)
      const direction = index > oldIndex ? 'after' : 'before'
      const spacing = Math.abs(x - getOffsetLeft(oldLink, navEl, beamEl))

      navEl.classList.add(direction)

      gsap.set(beamEl, {
        rotateY: direction === 'before' ? '180deg' : '0deg',
      })

      gsap.to(beamEl, {
        keyframes: [
          {
            '--active-element-width': `${
              spacing > navEl.offsetWidth - 60
                ? navEl.offsetWidth - 60
                : spacing
            }px`,
            duration: 0.3,
            ease: 'none',
            onStart: () => {
              setNavBeamInnerHTML(beamEl)
              gsap.to(beamEl, {
                '--active-element-opacity': 1,
                duration: 0.1,
              })
            },
          },
          {
            '--active-element-scale-x': 0,
            '--active-element-scale-y': 0.25,
            '--active-element-width': '0px',
            duration: 0.3,
            onStart: () => {
              gsap.to(beamEl, {
                '--active-element-mask-position': '40%',
                duration: 0.5,
              })
              gsap.to(beamEl, {
                '--active-element-opacity': 0,
                delay: 0.45,
                duration: 0.25,
              })
            },
            onComplete: () => {
              beamEl.innerHTML = ''
              navEl.classList.remove('before', 'after')
              beamEl.removeAttribute('style')
              gsap.set(beamEl, {
                x: getOffsetLeft(newLink, navEl, beamEl),
                '--active-element-show': 1,
              })
              scrollToHash(NAV_ITEMS[index].href)
            },
          },
        ],
      })

      gsap.to(beamEl, {
        x,
        '--active-element-strike-x': '-50%',
        duration: 0.6,
        ease: 'none',
      })
    },
    [activeIndex]
  )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-kev-bg/80 backdrop-blur-md border-b border-kev-border' : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          aria-label="kevdev — inicio"
        >
          <BrandLogo className="h-14 w-auto sm:h-16 object-contain object-left" />
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-4 sm:hidden">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-xs font-semibold transition-colors ${
                  i === activeIndex
                    ? 'text-kev-white'
                    : 'text-kev-muted hover:text-kev-white'
                }`}
                onClick={() => {
                  setActiveIndex(i)
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <nav
            ref={navRef}
            className="kevdev-nav-beam hidden sm:block"
            aria-label="Secciones principales"
          >
            <ul>
              {NAV_ITEMS.map((item, i) => (
                <li key={item.href} className={i === activeIndex ? 'active' : ''}>
                  <a
                    href={item.href}
                    className="kevdev-nav-link"
                    onClick={(e) => handleItemClick(e, i)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div ref={beamRef} className="active-element" aria-hidden />
          </nav>
        </div>
      </nav>
    </header>
  )
}
