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

  // Lock scroll during hero1 playback
  useEffect(() => {
    if (phase === 'INTRO_PLAYING') {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [phase])

  // When INTRO_ENDED, listen for first scroll → SCROLLING
  useEffect(() => {
    if (phase !== 'INTRO_ENDED') return

    const onScroll = () => {
      if (window.scrollY > 5) setPhase('SCROLLING')
    }
    const onWheel = () => {
      // Even a tiny wheel event means user tried to scroll
      setPhase('SCROLLING')
    }
    const onTouch = () => {
      if (window.scrollY > 2) setPhase('SCROLLING')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
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
