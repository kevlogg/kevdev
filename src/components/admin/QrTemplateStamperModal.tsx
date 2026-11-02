'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import { QrTarjeta } from '@/lib/qr-tarjetas'

export interface QrTemplateStamperModalProps {
  isOpen: boolean
  onClose: () => void
  tarjetas: QrTarjeta[]
  batchNames: string[]
  getCardRedirectUrl: (code: string) => string
}

interface TemplatePreset {
  id: string
  name: string
  icon: string
  src: string
  defaultQr: {
    xPercent: number
    yPercent: number
    sizePercent: number
    qrColor: string
    qrBg: string
    qrMargin: number
    showLabel: boolean
    labelPrefix: string
    labelColor: string
    labelFontSize: number
  }
}

const PRESETS: TemplatePreset[] = [
  {
    id: 'tarjeta-kevdev-dorso',
    name: 'Tarjeta NFC KevDev (Dorso)',
    icon: '🪪',
    src: '/mockups/tarjeta-nfc-dorso.png',
    defaultQr: {
      xPercent: 12.5,
      yPercent: 24,
      sizePercent: 36,
      qrColor: '#000000',
      qrBg: '#ffffff',
      qrMargin: 1,
      showLabel: true,
      labelPrefix: '#',
      labelColor: '#00e5ff',
      labelFontSize: 18,
    },
  },
  {
    id: 'stand-mostrador',
    name: 'Stand de Mesa A6 (Acrílico)',
    icon: '🏆',
    src: '/mockups/stand-mostrador-a6.svg',
    defaultQr: {
      xPercent: 27,
      yPercent: 38.5,
      sizePercent: 46,
      qrColor: '#000000',
      qrBg: '#ffffff',
      qrMargin: 1,
      showLabel: true,
      labelPrefix: 'CÓDIGO: #',
      labelColor: '#94a3b8',
      labelFontSize: 16,
    },
  },
  {
    id: 'sticker-cuadrado',
    name: 'Sticker Cuadrado Reseñas',
    icon: '🏷️',
    src: '/mockups/sticker-cuadrado.svg',
    defaultQr: {
      xPercent: 25,
      yPercent: 27,
      sizePercent: 50,
      qrColor: '#000000',
      qrBg: '#ffffff',
      qrMargin: 1,
      showLabel: false,
      labelPrefix: '#',
      labelColor: '#ffffff',
      labelFontSize: 16,
    },
  },
]

export default function QrTemplateStamperModal({
  isOpen,
  onClose,
  tarjetas,
  batchNames,
  getCardRedirectUrl,
}: QrTemplateStamperModalProps) {
  // Plantilla seleccionada o personalizada
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tarjeta-kevdev-dorso')
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null)
  const [customImageName, setCustomImageName] = useState<string>('Mi Diseño de Canva')
  
  // Posicionamiento del QR (en porcentaje respecto a las dimensiones originales)
  const [xPercent, setXPercent] = useState<number>(12.5)
  const [yPercent, setYPercent] = useState<number>(24)
  const [sizePercent, setSizePercent] = useState<number>(36)

  // Estilo del QR
  const [qrColor, setQrColor] = useState<string>('#000000')
  const [qrBg, setQrBg] = useState<string>('#ffffff')
  const [transparentBg, setTransparentBg] = useState<boolean>(false)
  const [qrMargin, setQrMargin] = useState<number>(1)
  const [bgPadding, setBgPadding] = useState<number>(0)
  const [bgRounded, setBgRounded] = useState<number>(8)

  // Etiqueta del código (ej: #001)
  const [showLabel, setShowLabel] = useState<boolean>(true)
  const [labelPrefix, setLabelPrefix] = useState<string>('#')
  const [labelColor, setLabelColor] = useState<string>('#00e5ff')
  const [labelFontSize, setLabelFontSize] = useState<number>(18)
  const [labelPosition, setLabelPosition] = useState<'below' | 'above'>('below')

  // Filtros de Lote para exportación
  const [selectedBatch, setSelectedBatch] = useState<string>('all')
  const [previewCardCode, setPreviewCardCode] = useState<string>('')

  // Estado de generación
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false)
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null)
  const [templateNaturalSize, setTemplateNaturalSize] = useState<{ width: number; height: number }>({ width: 992, height: 620 })

  // Referencias a elementos
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  })

  // Lista de tarjetas a procesar
  const activeTarjetas = useMemo(() => {
    if (selectedBatch === 'all') return tarjetas
    return tarjetas.filter((t) => t.batchName === selectedBatch)
  }, [tarjetas, selectedBatch])

  // Establecer tarjeta de previsualización por defecto
  useEffect(() => {
    if (activeTarjetas.length > 0 && (!previewCardCode || !activeTarjetas.some((t) => t.code === previewCardCode))) {
      setPreviewCardCode(activeTarjetas[0].code)
    }
  }, [activeTarjetas, previewCardCode])

  // Aplicar valores predeterminados al cambiar preset
  const handleSelectPreset = (preset: TemplatePreset) => {
    setSelectedPresetId(preset.id)
    setCustomImageSrc(null)
    setXPercent(preset.defaultQr.xPercent)
    setYPercent(preset.defaultQr.yPercent)
    setSizePercent(preset.defaultQr.sizePercent)
    setQrColor(preset.defaultQr.qrColor)
    setQrBg(preset.defaultQr.qrBg)
    setTransparentBg(preset.defaultQr.qrBg === 'transparent')
    setQrMargin(preset.defaultQr.qrMargin)
    setShowLabel(preset.defaultQr.showLabel)
    setLabelPrefix(preset.defaultQr.labelPrefix)
    setLabelColor(preset.defaultQr.labelColor)
    setLabelFontSize(preset.defaultQr.labelFontSize)
  }

  // Manejar subida de archivo de Canva
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setCustomImageSrc(dataUrl)
      setCustomImageName(file.name.replace(/\.[^/.]+$/, ''))
      setSelectedPresetId('custom')

      // Detectar dimensiones de la imagen subida
      const img = new Image()
      img.onload = () => {
        setTemplateNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  // Obtener la URL de la imagen actual
  const currentImageSrc = useMemo(() => {
    if (selectedPresetId === 'custom' && customImageSrc) {
      return customImageSrc
    }
    const found = PRESETS.find((p) => p.id === selectedPresetId)
    return found ? found.src : PRESETS[0].src
  }, [selectedPresetId, customImageSrc])

  // Cargar imagen de la plantilla
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setTemplateImage(img)
      setTemplateNaturalSize({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 })
    }
    img.onerror = () => {
      console.error('Error al cargar la imagen de plantilla:', currentImageSrc)
    }
    img.src = currentImageSrc
  }, [currentImageSrc, isOpen])

  // Dibujar previsualización en el Canvas interactivo
  const drawPreview = useCallback(async () => {
    const canvas = previewCanvasRef.current
    if (!canvas || !templateImage) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = templateImage.naturalWidth || 800
    const h = templateImage.naturalHeight || 600

    canvas.width = w
    canvas.height = h

    // 1. Dibujar imagen de plantilla
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(templateImage, 0, 0, w, h)

    // 2. Generar el QR de la tarjeta de prueba
    const cardCode = previewCardCode || '001'
    const redirectUrl = getCardRedirectUrl(cardCode)

    const qrSize = Math.round((Math.min(w, h) * sizePercent) / 100)
    const qrX = Math.round((w * xPercent) / 100)
    const qrY = Math.round((h * yPercent) / 100)

    try {
      const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
        width: qrSize * 2, // renderizar con el doble de densidad para nitidez
        margin: qrMargin,
        errorCorrectionLevel: 'H',
        color: {
          dark: qrColor,
          light: transparentBg ? '#00000000' : qrBg,
        },
      })

      const qrImg = new Image()
      await new Promise((resolve) => {
        qrImg.onload = resolve
        qrImg.src = qrDataUrl
      })

      // Si hay fondo personalizado con padding o bordes redondeados
      if (!transparentBg && (bgPadding > 0 || bgRounded > 0)) {
        ctx.save()
        ctx.fillStyle = qrBg
        const pad = Math.round((qrSize * bgPadding) / 100)
        const rx = qrX - pad
        const ry = qrY - pad
        const rw = qrSize + pad * 2
        const rh = qrSize + pad * 2
        const rad = Math.round((qrSize * bgRounded) / 100)

        ctx.beginPath()
        ctx.roundRect(rx, ry, rw, rh, rad)
        ctx.fill()
        ctx.restore()
      }

      // Dibujar QR
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      // 3. Dibujar etiqueta de texto (ej: #001) si está activada
      if (showLabel) {
        ctx.save()
        const text = `${labelPrefix}${cardCode}`
        const fontSizePx = Math.round((w / 800) * labelFontSize)
        ctx.font = `800 ${fontSizePx}px "JetBrains Mono", monospace, sans-serif`
        ctx.fillStyle = labelColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textX = qrX + qrSize / 2
        const textY =
          labelPosition === 'below'
            ? qrY + qrSize + fontSizePx * 1.2
            : qrY - fontSizePx * 1.1

        // Sombra de lectura
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 6
        ctx.fillText(text, textX, textY)
        ctx.restore()
      }

      // 4. Dibujar guía de selección sutil cuando no estamos exportando
      ctx.save()
      ctx.strokeStyle = '#00e5ff'
      ctx.lineWidth = Math.max(2, Math.round(w / 400))
      ctx.setLineDash([8, 6])
      ctx.strokeRect(qrX, qrY, qrSize, qrSize)
      ctx.restore()
    } catch (err) {
      console.error('Error dibujando preview:', err)
    }
  }, [
    templateImage,
    previewCardCode,
    getCardRedirectUrl,
    xPercent,
    yPercent,
    sizePercent,
    qrColor,
    qrBg,
    transparentBg,
    qrMargin,
    bgPadding,
    bgRounded,
    showLabel,
    labelPrefix,
    labelColor,
    labelFontSize,
    labelPosition,
  ])

  // Redibujar cada vez que cambien los parámetros
  useEffect(() => {
    if (isOpen) {
      drawPreview()
    }
  }, [isOpen, drawPreview])

  // Drag & drop interactivo con el mouse sobre el lienzo
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clickX = (e.clientX - rect.left) * scaleX
    const clickY = (e.clientY - rect.top) * scaleY

    const qrSize = Math.round((Math.min(canvas.width, canvas.height) * sizePercent) / 100)
    const qrX = Math.round((canvas.width * xPercent) / 100)
    const qrY = Math.round((canvas.height * yPercent) / 100)

    // Verificar si el clic fue dentro o cerca del área del QR
    const margin = 40
    if (
      clickX >= qrX - margin &&
      clickX <= qrX + qrSize + margin &&
      clickY >= qrY - margin &&
      clickY <= qrY + qrSize + margin
    ) {
      isDraggingRef.current = true
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: xPercent,
        initialY: yPercent,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    const canvas = previewCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const deltaXPixels = e.clientX - dragStartRef.current.mouseX
    const deltaYPixels = e.clientY - dragStartRef.current.mouseY

    const deltaXPercent = (deltaXPixels / rect.width) * 100
    const deltaYPercent = (deltaYPixels / rect.height) * 100

    const newX = Math.max(0, Math.min(100 - sizePercent, dragStartRef.current.initialX + deltaXPercent))
    const newY = Math.max(0, Math.min(100 - sizePercent, dragStartRef.current.initialY + deltaYPercent))

    setXPercent(Math.round(newX * 10) / 10)
    setYPercent(Math.round(newY * 10) / 10)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // Descargar una muestra individual en PNG
  const handleDownloadSingle = async () => {
    const canvas = previewCanvasRef.current
    if (!canvas || !templateImage) return

    // Renderizar una versión limpia sin líneas punteadas en un canvas temporal
    const offscreen = document.createElement('canvas')
    offscreen.width = templateImage.naturalWidth
    offscreen.height = templateImage.naturalHeight
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    const w = offscreen.width
    const h = offscreen.height

    // 1. Dibujar plantilla
    ctx.drawImage(templateImage, 0, 0, w, h)

    // 2. Dibujar QR
    const cardCode = previewCardCode || '001'
    const redirectUrl = getCardRedirectUrl(cardCode)
    const qrSize = Math.round((Math.min(w, h) * sizePercent) / 100)
    const qrX = Math.round((w * xPercent) / 100)
    const qrY = Math.round((h * yPercent) / 100)

    const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: qrSize * 2,
      margin: qrMargin,
      errorCorrectionLevel: 'H',
      color: {
        dark: qrColor,
        light: transparentBg ? '#00000000' : qrBg,
      },
    })

    const qrImg = new Image()
    await new Promise((resolve) => {
      qrImg.onload = resolve
      qrImg.src = qrDataUrl
    })

    if (!transparentBg && (bgPadding > 0 || bgRounded > 0)) {
      ctx.save()
      ctx.fillStyle = qrBg
      const pad = Math.round((qrSize * bgPadding) / 100)
      const rad = Math.round((qrSize * bgRounded) / 100)
      ctx.beginPath()
      ctx.roundRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, rad)
      ctx.fill()
      ctx.restore()
    }

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // 3. Etiqueta
    if (showLabel) {
      ctx.save()
      const text = `${labelPrefix}${cardCode}`
      const fontSizePx = Math.round((w / 800) * labelFontSize)
      ctx.font = `800 ${fontSizePx}px "JetBrains Mono", monospace, sans-serif`
      ctx.fillStyle = labelColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const textX = qrX + qrSize / 2
      const textY = labelPosition === 'below' ? qrY + qrSize + fontSizePx * 1.2 : qrY - fontSizePx * 1.1
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 6
      ctx.fillText(text, textX, textY)
      ctx.restore()
    }

    // Descargar
    const link = document.createElement('a')
    link.download = `muestra-diseno-tarjeta-${cardCode}.png`
    link.href = offscreen.toDataURL('image/png', 1.0)
    link.click()
  }

  // Generar y descargar el lote completo empaquetado en un archivo ZIP
  const handleGenerateBatchZip = async () => {
    if (!templateImage || activeTarjetas.length === 0) return

    setIsProcessingBatch(true)
    const total = activeTarjetas.length
    setBatchProgress({ current: 0, total })

    try {
      const zip = new JSZip()
      const folder = zip.folder('disenos-terminados-canva') || zip

      const w = templateImage.naturalWidth
      const h = templateImage.naturalHeight
      const qrSize = Math.round((Math.min(w, h) * sizePercent) / 100)
      const qrX = Math.round((w * xPercent) / 100)
      const qrY = Math.round((h * yPercent) / 100)
      const fontSizePx = Math.round((w / 800) * labelFontSize)

      // Canvas fuera de pantalla de ultra alta resolución
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const ctx = offscreen.getContext('2d')
      if (!ctx) throw new Error('No se pudo crear contexto 2D')

      for (let i = 0; i < total; i++) {
        const card = activeTarjetas[i]
        const redirectUrl = getCardRedirectUrl(card.code)

        // Limpiar y dibujar fondo
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(templateImage, 0, 0, w, h)

        // Generar QR
        const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
          width: qrSize * 2,
          margin: qrMargin,
          errorCorrectionLevel: 'H',
          color: {
            dark: qrColor,
            light: transparentBg ? '#00000000' : qrBg,
          },
        })

        const qrImg = new Image()
        await new Promise((resolve) => {
          qrImg.onload = resolve
          qrImg.src = qrDataUrl
        })

        if (!transparentBg && (bgPadding > 0 || bgRounded > 0)) {
          ctx.save()
          ctx.fillStyle = qrBg
          const pad = Math.round((qrSize * bgPadding) / 100)
          const rad = Math.round((qrSize * bgRounded) / 100)
          ctx.beginPath()
          ctx.roundRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, rad)
          ctx.fill()
          ctx.restore()
        }

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // Etiqueta
        if (showLabel) {
          ctx.save()
          const text = `${labelPrefix}${card.code}`
          ctx.font = `800 ${fontSizePx}px "JetBrains Mono", monospace, sans-serif`
          ctx.fillStyle = labelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const textX = qrX + qrSize / 2
          const textY = labelPosition === 'below' ? qrY + qrSize + fontSizePx * 1.2 : qrY - fontSizePx * 1.1
          ctx.shadowColor = 'rgba(0,0,0,0.8)'
          ctx.shadowBlur = 6
          ctx.fillText(text, textX, textY)
          ctx.restore()
        }

        // Obtener Base64 sin cabecera
        const dataUrl = offscreen.toDataURL('image/png', 1.0)
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
        folder.file(`diseno-tarjeta-${card.code}.png`, base64Data, { base64: true })

        setBatchProgress({ current: i + 1, total })

        // Pequeña pausa para permitir que la UI respire y actualice el porcentaje
        if (i % 5 === 0) {
          await new Promise((r) => setTimeout(r, 10))
        }
      }

      // Archivo informativo dentro del ZIP
      const infoText = [
        '=== LOTE DE DISEÑOS TERMINADOS — KEVDEV X CANVA ===',
        `Fecha de generación: ${new Date().toLocaleString('es-AR')}`,
        `Total de archivos generados: ${total}`,
        `Resolución de cada diseño: ${w} x ${h} píxeles (300 DPI recomendados)`,
        `Plantilla base: ${selectedPresetId === 'custom' ? customImageName : selectedPresetId}`,
        '',
        'Listado de archivos y enlaces dinámicos:',
        ...activeTarjetas.map((c) => `diseno-tarjeta-${c.code}.png -> ${getCardRedirectUrl(c.code)}`),
      ].join('\n')

      folder.file('detalle-lote-imprenta.txt', infoText)

      // Empaquetar y descargar
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `disenos-canva-lote-${total}-tarjetas.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Error al generar lote ZIP:', err)
      alert('Ocurrió un error al generar las tarjetas del lote.')
    } finally {
      setIsProcessingBatch(false)
      setBatchProgress(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 5, 8, 0.92)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f1f5f9',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          background: 'rgba(15, 15, 22, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
            }}
          >
            🎨
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Estampador de Plantillas de Canva en Lote
              </h2>
              <span
                style={{
                  background: 'rgba(0, 229, 255, 0.12)',
                  color: '#00e5ff',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                PRO BATCH ENGINE
              </span>
            </div>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.8125rem' }}>
              Coloca automáticamente los QRs y números correlativos sobre tu diseño terminado de Canva y exporta las tarjetas listas para imprimir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isProcessingBatch}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: '99px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isProcessingBatch ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '420px 1fr',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar: Controls */}
        <div
          style={{
            background: 'rgba(10, 10, 16, 0.85)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            overflowY: 'auto',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {/* Section 1: Template selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Plantilla de Diseño (Canva)
              </label>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {templateNaturalSize.width} × {templateNaturalSize.height} px
              </span>
            </div>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              {PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{p.icon}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                      {p.name}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Upload Custom Canva Design */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: selectedPresetId === 'custom' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedPresetId === 'custom' ? '1px solid #a855f7' : '1px dashed rgba(255, 255, 255, 0.2)',
                color: selectedPresetId === 'custom' ? '#c084fc' : '#cbd5e1',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <span>📁</span>
              {selectedPresetId === 'custom'
                ? `Usando: ${customImageName}`
                : 'Subir nuevo diseño de Canva (PNG / JPG)'}
            </button>
          </div>

          {/* Section 2: QR Position & Size */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Posición y Tamaño del QR
              </label>
              <span style={{ fontSize: '0.7rem', color: '#00e5ff' }}>💡 Arrastrable en el lienzo</span>
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Posición Horizontal (X)</span>
                  <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{xPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="0.5"
                  value={xPercent}
                  onChange={(e) => setXPercent(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00e5ff' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Posición Vertical (Y)</span>
                  <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{yPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="0.5"
                  value={yPercent}
                  onChange={(e) => setYPercent(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00e5ff' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Tamaño del QR</span>
                  <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{sizePercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="0.5"
                  value={sizePercent}
                  onChange={(e) => setSizePercent(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00e5ff' }}
                />
              </div>

              {/* Quick align buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setXPercent(Math.round(((100 - sizePercent) / 2) * 10) / 10)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  Centrar H
                </button>
                <button
                  type="button"
                  onClick={() => setYPercent(Math.round(((100 - sizePercent) / 2) * 10) / 10)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  Centrar V
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setXPercent(12.5)
                    setYPercent(24)
                    setSizePercent(36)
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    padding: '6px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: QR Colors & Background */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              3. Color y Fondo del QR
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Color del QR</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
                  />
                  <input
                    type="text"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    style={{
                      width: '74px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Fondo del QR</span>
                {transparentBg ? (
                  <button
                    type="button"
                    onClick={() => setTransparentBg(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      height: '34px',
                    }}
                  >
                    Transparente ✓
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={qrBg}
                      onChange={(e) => setQrBg(e.target.value)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setTransparentBg(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94a3b8',
                        borderRadius: '6px',
                        padding: '4px 6px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                      }}
                    >
                      Hacer Transp.
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Card Code Label */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. Estampar Código Correlativo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', color: '#e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={showLabel}
                  onChange={(e) => setShowLabel(e.target.checked)}
                  style={{ accentColor: '#00e5ff' }}
                />
                Activar
              </label>
            </div>

            {showLabel && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Prefijo</span>
                    <input
                      type="text"
                      value={labelPrefix}
                      onChange={(e) => setLabelPrefix(e.target.value)}
                      placeholder="#"
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Color Texto</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={labelColor}
                        onChange={(e) => setLabelColor(e.target.value)}
                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#cbd5e1' }}>{labelColor}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setLabelPosition('below')}
                    style={{
                      flex: 1,
                      background: labelPosition === 'below' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: labelPosition === 'below' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: labelPosition === 'below' ? '#ffffff' : '#94a3b8',
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    Abajo del QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelPosition('above')}
                    style={{
                      flex: 1,
                      background: labelPosition === 'above' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: labelPosition === 'above' ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: labelPosition === 'above' ? '#ffffff' : '#94a3b8',
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    Arriba del QR
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Batch selection */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              5. Lote a Procesar
            </label>

            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                outline: 'none',
                marginBottom: '10px',
              }}
            >
              <option value="all" style={{ background: '#121218' }}>
                Todos los QRs activos ({tarjetas.length} tarjetas)
              </option>
              {batchNames.map((b) => (
                <option key={b} value={b} style={{ background: '#121218' }}>
                  Lote: {b}
                </option>
              ))}
            </select>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total a estampar:</span>
              <strong style={{ color: '#00e5ff' }}>{activeTarjetas.length} tarjetas</strong>
            </div>
          </div>
        </div>

        {/* Right Preview & Action Area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'radial-gradient(circle at 50% 50%, #151522 0%, #09090e 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Preview Toolbar */}
          <div
            style={{
              padding: '12px 24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vista previa con tarjeta:</span>
              <select
                value={previewCardCode}
                onChange={(e) => setPreviewCardCode(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                {activeTarjetas.map((t) => (
                  <option key={t.code} value={t.code} style={{ background: '#121218' }}>
                    #{t.code} — {t.clientName || 'Sin asignar'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleDownloadSingle}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🖼️</span> Descargar Muestra Individual (.PNG)
            </button>
          </div>

          {/* Interactive Live Canvas Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              overflow: 'hidden',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                maxWidth: '92%',
                maxHeight: '92%',
                display: 'flex',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 229, 255, 0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                position: 'relative',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  maxWidth: '100%',
                  maxHeight: '62vh',
                  display: 'block',
                  cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                }}
              />
            </div>
          </div>

          {/* Bottom Action Footer with Massive Batch Trigger */}
          <div
            style={{
              padding: '18px 28px',
              background: 'rgba(12, 12, 18, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                ¿Listo para imprimir?
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Se generará cada tarjeta en máxima resolución 300 DPI y se descargará un archivo .ZIP listo para la imprenta.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {isProcessingBatch && batchProgress && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: '#00e5ff', fontWeight: 700, fontFamily: 'monospace' }}>
                    Generando {batchProgress.current} de {batchProgress.total} ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
                  </div>
                  <div
                    style={{
                      width: '180px',
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '99px',
                      overflow: 'hidden',
                      marginTop: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                        height: '100%',
                        background: '#00e5ff',
                        transition: 'width 0.1s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateBatchZip}
                disabled={isProcessingBatch || activeTarjetas.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isProcessingBatch
                    ? '#334155'
                    : 'linear-gradient(135deg, #00e5ff 0%, #0284c7 100%)',
                  color: isProcessingBatch ? '#94a3b8' : '#041018',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.875rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  padding: '14px 26px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: isProcessingBatch ? 'not-allowed' : 'pointer',
                  boxShadow: isProcessingBatch ? 'none' : '0 8px 30px rgba(0, 229, 255, 0.45)',
                  transition: 'all 0.2s',
                }}
              >
                <span>{isProcessingBatch ? '⏳' : '🚀'}</span>
                {isProcessingBatch
                  ? 'EMPAQUETANDO DISEÑOS...'
                  : `GENERAR Y DESCARGAR LOTE (${activeTarjetas.length} TARJETAS EN .ZIP)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
