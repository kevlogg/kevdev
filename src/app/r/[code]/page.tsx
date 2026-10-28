import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { adminDb, FieldValue } from '@/lib/firebase-admin'

interface Props {
  params: Promise<{ code: string }>
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

export default async function RedirectCardPage({ params }: Props) {
  const { code } = await params
  const cleanCode = (code || '').trim()

  if (!cleanCode) {
    return <CardNotFound code="desconocido" />
  }

  // Consultar la tarjeta en Firestore con adminDb
  let cardData: any = null
  try {
    const docSnap = await adminDb.collection('qr_tarjetas').doc(cleanCode).get()
    if (docSnap.exists) {
      cardData = docSnap.data()
    }
  } catch (err) {
    console.error(`[QR Redirection] Error fetching card #${cleanCode}:`, err)
  }

  // 1. Tarjeta no encontrada
  if (!cardData) {
    return <CardNotFound code={cleanCode} />
  }

  const targetUrl = (cardData.targetUrl || '').trim()
  const isActive = cardData.status === 'active' && Boolean(targetUrl)

  // 2. Tarjeta activa con URL de Google Reseñas -> REDIRECCIÓN INMEDIATA
  if (isActive) {
    // Registrar el escaneo en segundo plano
    adminDb
      .collection('qr_tarjetas')
      .doc(cleanCode)
      .update({
        scanCount: FieldValue.increment(1),
        lastScannedAt: new Date().toISOString(),
      })
      .catch((err) => {
        console.warn(`[QR Scan Tracker] Error updating scanCount for #${cleanCode}:`, err)
      })

    // Asegurarse de que comience con http:// o https://
    const finalUrl = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`
    redirect(finalUrl)
  }

  // 3. Tarjeta registrada pero SIN ASIGNAR (Lista para activarse)
  return <CardUnassigned code={cleanCode} clientName={cardData.clientName} />
}

/* ─── Pantalla de Tarjeta Lista para Activar ────────────────────────── */
function CardUnassigned({ code, clientName }: { code: string; clientName?: string }) {
  const whatsappMsg = encodeURIComponent(
    `Hola Kevin! Tengo la tarjeta #${code} lista para activar. Te paso el enlace de Google Reseñas:`
  )
  const whatsappUrl = `https://wa.me/5492235851419?text=${whatsappMsg}`

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        color: '#e8e8e8',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background cyber grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '460px',
          width: '100%',
          background: 'rgba(24, 24, 24, 0.92)',
          border: '1px solid rgba(0, 229, 255, 0.28)',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 229, 255, 0.12)',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#00e5ff',
            background: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '5px 14px',
            borderRadius: '99px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00e5ff',
              boxShadow: '0 0 10px #00e5ff',
              display: 'inline-block',
            }}
          />
          TARJETA #{code}
        </div>

        {/* Card Mockup Graphic */}
        <div
          style={{
            margin: '0 auto 24px',
            width: '120px',
            height: '76px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #181818 0%, #0d0d0d 100%)',
            border: '1px solid rgba(0, 229, 255, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 18px rgba(0, 229, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '18px' }}>⭐</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.06em',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              KEVDEV
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(232, 232, 232, 0.5)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            Google Reseñas
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            marginBottom: '10px',
          }}
        >
          Tarjeta lista para activarse
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(232, 232, 232, 0.75)',
            lineHeight: 1.6,
            marginBottom: '26px',
          }}
        >
          {clientName ? (
            <>
              Esta tarjeta está asignada a <strong>{clientName}</strong> pero aún no tiene configurado el enlace de Google Reseñas.
            </>
          ) : (
            <>
              Esta tarjeta inteligente física de Google Reseñas está registrada y lista para ser entregada a tu comercio.
            </>
          )}
        </p>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#00e5ff',
            color: '#0c0c0c',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            padding: '13px 20px',
            borderRadius: '99px',
            textDecoration: 'none',
            boxShadow: '0 4px 18px rgba(0, 229, 255, 0.4)',
            transition: 'all 0.2s ease',
            marginBottom: '12px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.072-2.144-.541-1.859-.785-3.056-2.673-3.149-2.798-.093-.125-.758-.999-.758-1.921 0-.922.482-1.376.654-1.564.172-.188.375-.235.5-.235.125 0 .25.002.359.007.114.005.267-.043.418.321.156.375.532 1.297.579 1.391.047.094.078.204.016.329-.063.125-.094.203-.188.313-.094.109-.198.245-.282.329-.094.094-.193.196-.083.385.11.189.489.807 1.05 1.306.722.642 1.331.841 1.52.935.189.094.3.079.412-.047.112-.125.48-.559.608-.75.128-.191.256-.159.43-.095.174.063 1.109.522 1.301.617.192.094.321.141.368.223.047.082.047.476-.097.881z" />
          </svg>
          ACTIVAR TARJETA POR WHATSAPP
        </a>

        {/* Website link */}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            fontSize: '12px',
            color: 'rgba(232, 232, 232, 0.45)',
            textDecoration: 'none',
            fontFamily: 'ui-monospace, monospace',
            marginTop: '8px',
          }}
        >
          Desarrollado por KevDev · kevdev.net.ar
        </Link>
      </div>
    </div>
  )
}

/* ─── Pantalla de Código No Encontrado ───────────────────────────────── */
function CardNotFound({ code }: { code: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        color: '#e8e8e8',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: '#181818',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '36px 24px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        <span style={{ fontSize: '36px', display: 'block', marginBottom: '16px' }}>⚠️</span>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
          Código de tarjeta no encontrado
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(232, 232, 232, 0.65)',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          El código <strong>#{code}</strong> no corresponde a una tarjeta registrada en el sistema.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '99px',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ir a KevDev
        </Link>
      </div>
    </div>
  )
}
