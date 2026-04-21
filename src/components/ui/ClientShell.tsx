'use client'

import dynamic from 'next/dynamic'

// Componentes que usan Math.random() o APIs de browser — no pueden hacer SSR
const CosmicAtmosphere = dynamic(() => import('./CosmicAtmosphere'), { ssr: false })
const LenisProvider    = dynamic(() => import('./LenisProvider'),    { ssr: false })

export default function ClientShell() {
  return (
    <>
      <LenisProvider />
      <CosmicAtmosphere />
    </>
  )
}
