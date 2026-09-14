'use client'

import React, { createContext, useContext } from 'react'

export type IntroPhase = 'SCROLLING'

interface IntroContextType {
  phase: IntroPhase
  isHero1Ended: boolean
  isContentVisible: boolean
}

const IntroContext = createContext<IntroContextType>({
  phase: 'INTRO_PLAYING' as any,
  isHero1Ended: true,
  isContentVisible: true,
})

export function IntroProvider({ children }: { children: React.ReactNode }) {
  return (
    <IntroContext.Provider value={{ phase: 'SCROLLING', isHero1Ended: true, isContentVisible: true }}>
      {children}
    </IntroContext.Provider>
  )
}

export const useIntro = () => useContext(IntroContext)
