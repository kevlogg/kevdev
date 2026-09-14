'use client'

import React from 'react'

export default function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      {children}
    </div>
  )
}
