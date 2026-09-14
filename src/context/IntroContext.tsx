'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type IntroPhase = 'INTRO_PLAYING' | 'INTRO_ENDED' | 'SCROLLING'

interface IntroContextType {
  phase: IntroPhase
  setPhase: (phase: IntroPhase) => void
  isHero1Ended: boolean
  isContentVisible: boolean
}

const IntroContext = createContext<IntroContextType>({
  phase: 'INTRO_PLAYING',
  setPhase: () => {},
  isHero1Ended: false,
  isContentVisible: false,
})

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage =
    !pathname || pathname === '/' || /^\/(es|en|pt)\/?$/.test(pathname)

  const [phase, setPhase] = useState<IntroPhase>(isHomePage ? 'INTRO_PLAYING' : 'SCROLLING')

  // Lock/unlock scroll during hero1
  useEffect(() => {
    if (phase === 'INTRO_PLAYING') {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      // Also stop Lenis if it's running
      const lenis = (window as any).__lenis
      if (lenis) lenis.stop()
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      // Resume Lenis
      const lenis = (window as any).__lenis
      if (lenis) lenis.start()
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [phase])

  // INTRO_ENDED → wait for any scroll attempt → SCROLLING
  useEffect(() => {
    if (phase !== 'INTRO_ENDED') return

    const goScrolling = () => setPhase('SCROLLING')

    // Listen to Lenis scroll events (fires even before scrollY updates)
    let lenisUnsub: (() => void) | null = null
    const tryHookLenis = () => {
      const lenis = (window as any).__lenis
      if (lenis && typeof lenis.on === 'function') {
        lenis.on('scroll', goScrolling)
        lenisUnsub = () => lenis.off('scroll', goScrolling)
        return true
      }
      return false
    }

    // Also listen to native wheel/touch as fallback
    const onWheel = () => goScrolling()
    const onTouch = () => { if (window.scrollY > 2) goScrolling() }
    const onScroll = () => { if (window.scrollY > 5) goScrolling() }

    window.addEventListener('wheel', onWheel, { passive: true, once: true })
    window.addEventListener('touchmove', onTouch, { passive: true, once: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    if (!tryHookLenis()) {
      // Lenis might not be ready yet
      let attempts = 0
      const retry = setInterval(() => {
        if (tryHookLenis() || ++attempts > 15) clearInterval(retry)
      }, 200)
    }

    return () => {
      lenisUnsub?.()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('scroll', onScroll)
    }
  }, [phase])

  return (
    <IntroContext.Provider
      value={{
        phase,
        setPhase,
        isHero1Ended: phase === 'INTRO_ENDED' || phase === 'SCROLLING',
        isContentVisible: phase === 'INTRO_ENDED' || phase === 'SCROLLING',
      }}
    >
      {children}
    </IntroContext.Provider>
  )
}

export const useIntro = () => useContext(IntroContext)
