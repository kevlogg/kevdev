'use client'

import dynamic from 'next/dynamic'

// Componentes que usan APIs de browser — no pueden hacer SSR
const VideoBackground = dynamic(() => import('./VideoBackground'), { ssr: false })
const LenisProvider   = dynamic(() => import('./LenisProvider'),   { ssr: false })

export default function ClientShell() {
  return (
    <>
      <LenisProvider />
      <VideoBackground />
    </>
  )
}
