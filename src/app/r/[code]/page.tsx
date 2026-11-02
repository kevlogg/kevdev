import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getTarjeta, incrementTarjetaScan } from '@/lib/qr-tarjetas'
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

  // Timeout ultra defensivo de 1200ms para evitar que Vercel se cuelgue si la conexión serverless demora
  let cardData: any = null
  try {
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1200))
    const fetchPromise = getTarjeta(cleanCode)
    cardData = await Promise.race([fetchPromise, timeoutPromise])
  } catch (err) {
    console.warn('[RedirectCardPage] Server fetch fallback:', err)
  }

  const targetUrl = (cardData?.targetUrl || '').trim()
  const isActive = cardData?.status === 'active' && Boolean(targetUrl)

  // 1. Si en el servidor se obtuvo URL activa y no es modo edición -> REDIRECCIÓN INMEDIATA
  if (isActive && !isEditMode) {
    incrementTarjetaScan(cleanCode).catch(() => {})
    const finalUrl = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`
    redirect(finalUrl)
  }

  // 2. Si vino del servidor sin enlace o si hubo timeout, delegar al cliente (cero cuelgues)
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
