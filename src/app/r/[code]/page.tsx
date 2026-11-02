import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTarjeta, incrementTarjetaScan } from '@/lib/qr-tarjetas'
import CardActivationClient from './CardActivationClient'

interface Props {
  params: Promise<{ code: string }>
  searchParams?: Promise<{ setup?: string; edit?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `Tarjeta QR #${code} | KevDev Reseñas`,
    description: `Tarjeta física de Google Reseñas KevDev #${code}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function RedirectCardPage({ params, searchParams }: Props) {
  const { code } = await params
  const search = searchParams ? await searchParams : {}
  const cleanCode = (code || '').trim()

  if (!cleanCode) {
    return <CardActivationClient code="001" />
  }

  const isEditMode = search.setup === 'true' || search.edit === 'true'

  // Consultar la tarjeta en Firestore con autenticación garantizada
  const cardData = await getTarjeta(cleanCode)

  const targetUrl = (cardData?.targetUrl || '').trim()
  const isActive = cardData?.status === 'active' && Boolean(targetUrl)

  // 1. Tarjeta activa con URL y no está en modo edición manual -> REDIRECCIÓN INMEDIATA
  if (isActive && !isEditMode) {
    // Registrar el escaneo en segundo plano
    incrementTarjetaScan(cleanCode).catch((err) => {
      console.warn(`[QR Scan Tracker] Error updating scanCount for #${cleanCode}:`, err)
    })

    // Asegurarse de que comience con http:// o https://
    const finalUrl = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`
    redirect(finalUrl)
  }

  // 2. Tarjeta vacía, sin enlace guardado o en modo edición -> PANTALLA DE CONFIGURACIÓN DIRECTA
  return (
    <CardActivationClient
      code={cleanCode}
      initialClientName={cardData?.clientName || ''}
      initialTargetUrl={targetUrl}
      isEditMode={isEditMode}
    />
  )
}


