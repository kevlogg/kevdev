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
  
  // Check if home page
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

      const handleTouch = () => {
        if (window.scrollY > 2) {
          setPhase('SCROLLING')
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('touchmove', handleTouch, { passive: true })

      return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('touchmove', handleTouch)
      }
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
