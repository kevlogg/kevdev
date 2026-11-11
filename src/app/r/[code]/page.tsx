import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTarjetaFast, incrementTarjetaScan, type QrTarjeta } from '@/lib/qr-tarjetas'
import QrRedirectDispatcher from './QrRedirectDispatcher'

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
    return <QrRedirectDispatcher code="001" isEditMode={false} />
  }

  const isEditMode = search.setup === 'true' || search.edit === 'true'

  // Consulta rápida mediante REST API (~80ms)
  let cardData: QrTarjeta | null = null
  try {
    cardData = await getTarjetaFast(cleanCode)
  } catch (err) {
    console.warn('[RedirectCardPage] Fast fetch fallback:', err)
  }

  const targetUrl = (cardData?.targetUrl || '').trim()
  const isActive = cardData?.status === 'active' && Boolean(targetUrl)

  // 1. Si en el servidor se obtuvo URL activa y no es modo edición -> REDIRECCIÓN INMEDIATA
  if (isActive && !isEditMode) {
    incrementTarjetaScan(cleanCode).catch(() => {})
    const finalUrl = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`
    redirect(finalUrl)
  }

  // 2. Si vino del servidor sin enlace o es modo edición, mostrar activador
  return (
    <QrRedirectDispatcher
      code={cleanCode}
      serverCardData={
        cardData
          ? {
              targetUrl,
              clientName: cardData.clientName || '',
              status: cardData.status || 'unassigned',
            }
          : null
      }
      isEditMode={isEditMode}
    />
  )
}
