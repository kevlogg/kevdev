'use client'

import React from 'react'
import { useIntro } from '@/context/IntroContext'

export default function PageContent({ children }: { children: React.ReactNode }) {
  const { isContentVisible } = useIntro()

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        opacity: isContentVisible ? 1 : 0,
        pointerEvents: isContentVisible ? 'auto' : 'none',
        transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  )
}
