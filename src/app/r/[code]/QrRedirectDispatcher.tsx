'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import CardActivationClient from './CardActivationClient'

interface QrRedirectDispatcherProps {
  code: string
  serverCardData?: {
    targetUrl: string
    clientName: string
    status: string
  } | null
  isEditMode?: boolean
}

export default function QrRedirectDispatcher({
  code,
  serverCardData,
  isEditMode = false,
}: QrRedirectDispatcherProps) {
  const [loading, setLoading] = useState(!serverCardData && !isEditMode)
  const [cardData, setCardData] = useState(serverCardData || null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    // Si ya teníamos datos del servidor y hay URL activa (y no es modo edición), redirigir
    if (serverCardData?.targetUrl && !isEditMode) {
      const finalUrl = serverCardData.targetUrl.match(/^https?:\/\//i)
        ? serverCardData.targetUrl
        : `https://${serverCardData.targetUrl}`
      window.location.replace(finalUrl)
      return
    }

    // Si ya vino del servidor marcado como sin enlace o es modo edición, no hace falta buscar de nuevo
    if (serverCardData !== undefined && serverCardData !== null) {
      setLoading(false)
      return
    }

    // Si el servidor tuvo timeout o vino vacío, consultar directamente desde el navegador móvil
    let isMounted = true

    async function checkInBrowser() {
      try {
        const docRef = doc(db, 'qr_tarjetas', code)
        const snap = await getDoc(docRef)

        if (!isMounted) return

        if (snap.exists()) {
          const data = snap.data()
          const targetUrl = (data.targetUrl || '').trim()
          const clientName = (data.clientName || '').trim()

          if (targetUrl && !isEditMode) {
            // Incrementar contador en segundo plano
            updateDoc(docRef, {
              scanCount: increment(1),
              lastScannedAt: new Date().toISOString(),
            }).catch(() => {})

            const finalUrl = targetUrl.match(/^https?:\/\//i) ? targetUrl : `https://${targetUrl}`
            window.location.replace(finalUrl)
            return
          }

          setCardData({
            targetUrl,
            clientName,
            status: data.status || 'unassigned',
          })
        } else {
          // Tarjeta no registrada en base
          setCardData({
            targetUrl: '',
            clientName: '',
            status: 'unassigned',
          })
        }
      } catch (err: any) {
        console.warn('Error consultando tarjeta en cliente:', err)
        setErrorMsg('No se pudo verificar la tarjeta en línea.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkInBrowser()

    return () => {
      isMounted = false
    }
  }, [code, isEditMode, serverCardData])

  // Mientras verifica en el cliente si no vino del servidor
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#e8e8e8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(0, 229, 255, 0.15)',
            borderTopColor: '#00e5ff',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '20px',
          }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#00e5ff',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          KevDev • NFC / QR System
        </span>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 8px 0',
          }}
        >
          Cargando Tarjeta #{code}
        </h2>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
          Conectando con el servidor...
        </p>
      </div>
    )
  }

  // Si falló y no tenemos datos
  if (errorMsg && !cardData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#e8e8e8',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '28px',
            maxWidth: '380px',
            width: '100%',
            backgroundColor: '#121216',
            borderRadius: '16px',
            border: '1px solid #ff4444',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px' }}>
            No pudimos cargar la tarjeta #{code}
          </h3>
          <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '20px' }}>
            {errorMsg}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#00e5ff',
              color: '#0a0a0c',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Tarjeta sin destino configurado o en modo edición manual: mostrar activador
  return (
    <CardActivationClient
      code={code}
      initialClientName={cardData?.clientName || ''}
      initialTargetUrl={cardData?.targetUrl || ''}
      isEditMode={isEditMode}
    />
  )
}
