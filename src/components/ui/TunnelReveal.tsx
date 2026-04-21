'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
  className?: string
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Escala el contenido de 0 → 1 cuando el elemento cruza el centro del viewport.
 * Simula que el texto emerge del punto de fuga del túnel.
 */
export default function TunnelReveal({ children, delay = 0, style, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // "-42% 0px -42% 0px" → se activa solo en la banda central del 16% del viewport
  const isInView = useInView(ref, {
    once: true,
    margin: '-42% 0px -42% 0px',
  })

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : undefined}
      transition={{
        scale:   { duration: 0.75, ease: EASE, delay },
        opacity: { duration: 0.5,  ease: EASE, delay },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}
