'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type IntroPhase = 'INTRO_PLAYING' | 'INTRO_ENDED' | 'SCROLLING'

interface IntroContextType {
  phase: IntroPhase
  setPhase: (phase: IntroPhase) => void
  isHero1Ended: boolean
  hasUserScrolled: boolean
}

const IntroContext = createContext<IntroContextType>({
  phase: 'INTRO_PLAYING',
  setPhase: () => {},
  isHero1Ended: false,
  hasUserScrolled: false,
})

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we are on the main landing page (e.g. /, /es, /en, /pt)
  const isHomePage = !pathname || pathname === '/' || pathname === '/es' || pathname === '/en' || pathname === '/pt'
  
  const [phase, setPhase] = useState<IntroPhase>(isHomePage ? 'INTRO_PLAYING' : 'SCROLLING')

  // Listen for user scroll when in INTRO_ENDED phase
  useEffect(() => {
    if (phase === 'INTRO_ENDED') {
      const handleScroll = () => {
        if (window.scrollY > 5) {
          setPhase('SCROLLING')
        }
      }

      // Also listen to wheel / touchmove events so scroll triggers instantly on interaction
      const handleWheelOrTouch = () => {
        setPhase('SCROLLING')
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('wheel', handleWheelOrTouch, { passive: true, once: true })
      window.addEventListener('touchmove', handleWheelOrTouch, { passive: true, once: true })

      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('wheel', handleWheelOrTouch)
        window.removeEventListener('touchmove', handleWheelOrTouch)
      }
    }
  }, [phase])

  return (
    <IntroContext.Provider
      value={{
        phase,
        setPhase,
        isHero1Ended: phase === 'INTRO_ENDED' || phase === 'SCROLLING',
        hasUserScrolled: phase === 'SCROLLING',
      }}
    >
      {children}
    </IntroContext.Provider>
  )
}

export const useIntro = () => useContext(IntroContext)
