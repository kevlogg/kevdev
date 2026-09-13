'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConvocatoriaImpulsoForm() {
  // Form Fields State
  const [nombre, setNombre] = useState('')
  const [negocio, setNegocio] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [redSocial, setRedSocial] = useState<'Instagram' | 'Facebook' | 'TikTok' | 'Web'>('Instagram')

  const [dedicacion, setDedicacion] = useState('')
  const [antiguedad, setAntiguedad] = useState<'Menos de 6 meses' | 'Entre 6 meses y 2 años' | 'Más de 2 años' | ''>('')
  const [canalVentas, setCanalVentas] = useState<'Mensajes de WhatsApp' | 'Mensajes directos de Instagram' | 'Local a la calle / presencial' | 'Otro' | ''>('')

  const [trabaPrincipal, setTrabaPrincipal] = useState('')
  const [trabaOpt, setTrabaOpt] = useState('')
  const [trabaCustom, setTrabaCustom] = useState('')

  const [porQueSeleccionado, setPorQueSeleccionado] = useState('')
  const [porQueOpt, setPorQueOpt] = useState('')
  const [porQueCustom, setPorQueCustom] = useState('')

  const [dedicacionOpt, setDedicacionOpt] = useState('')
  const [dedicacionCustom, setDedicacionCustom] = useState('')

  const [materialesListos, setMaterialesListos] = useState<'Sí, tengo todo listo para arrancar' | 'Tengo bastante, me faltan pulir detalles' | 'Tengo que armarlo desde cero' | ''>('')

  // UI State
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Countdown Timer State (Hasta el 30 de Septiembre 23:59:59)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      let targetYear = currentYear
      if (now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() > 30)) {
        targetYear = currentYear + 1
      }
      const targetDate = new Date(targetYear, 8, 30, 23, 59, 59) // Mes 8 = Septiembre
      const diff = targetDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  // Options arrays
  const dedicacionOptions = [
    'Venta de productos / Comercio (Indumentaria, Deco, Calzado, etc.)',
    'Servicios profesionales / Asesoría / Cursos',
    'Gastronomía / Alimentos / Repostería',
    'Salud, Belleza y Estética',
    'Otro',
  ] as const

  const trabaOptions = [
    'Pierdo mucho tiempo pasando precios y fotos una por una por WhatsApp',
    'Me cuesta mostrar el catálogo completo en Instagram o redes',
    'Mi negocio no transmite la imagen profesional que merece',
    'Presupuestos inalcanzables en agencias de diseño web',
    'Otro',
  ] as const

  const porQueSeleccionadoOptions = [
    'Tengo un negocio en marcha y quiero dar el salto profesional',
    'Me comprometo a aprovechar la web al 100% para multiplicar ventas',
    'Tengo un producto/servicio excelente pero me falta presencia en Google',
    'Tengo todo el material e información lista para arrancar ya',
    'Otro',
  ] as const

  const antiguedadOptions = [
    'Menos de 6 meses',
    'Entre 6 meses y 2 años',
    'Más de 2 años',
  ] as const

  const canalVentasOptions = [
    'Mensajes de WhatsApp',
    'Mensajes directos de Instagram',
    'Local a la calle / presencial',
    'Otro',
  ] as const

  const materialesOptions = [
    'Sí, tengo todo listo para arrancar',
    'Tengo bastante, me faltan pulir detalles',
    'Tengo que armarlo desde cero',
  ] as const

  // Security & Format Validation (Optimizado para Máxima Conversión)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // 1. Contacto (Solo nombre y WhatsApp obligatorios)
    if (!nombre.trim() || nombre.trim().length < 2) {
      errors.nombre = 'Ingresá tu nombre.'
    }

    const waClean = whatsapp.replace(/[^\d+]/g, '')
    if (!whatsapp.trim() || waClean.length < 7) {
      errors.whatsapp = 'Ingresá un número de WhatsApp válido.'
    }

    // 2. Estado del negocio
    if (!dedicacion.trim() || dedicacion.trim().length < 2) {
      errors.dedicacion = 'Contanos a qué se dedica tu negocio.'
    }

    if (!antiguedad) {
      errors.antiguedad = 'Seleccioná el tiempo de funcionamiento.'
    }

    if (!canalVentas) {
      errors.canalVentas = 'Seleccioná tu canal principal de ventas.'
    }

    // 3. Necesidad y compromiso
    if (!trabaPrincipal.trim() || trabaPrincipal.trim().length < 2) {
      errors.trabaPrincipal = 'Contanos qué te traba por no tener web.'
    }

    if (!porQueSeleccionado.trim() || porQueSeleccionado.trim().length < 2) {
      errors.porQueSeleccionado = 'Indicanos por qué deberías ser seleccionado.'
    }

    if (!materialesListos) {
      errors.materialesListos = 'Indicanos si contás con material básico.'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setErrorMsg('Por favor completá los campos obligatorios indicados antes de enviar.')
      return false
    }

    setErrorMsg('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const formattedSocial = instagram.trim()
      ? `${redSocial}: ${instagram.trim()}`
      : 'No especificado'

    try {
      const response = await fetch('/api/convocatoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          negocio: negocio.trim() || 'No especificado',
          whatsapp: whatsapp.trim(),
          instagram: formattedSocial,
          dedicacion: dedicacion.trim(),
          antiguedad,
          canalVentas,
          trabaPrincipal: trabaPrincipal.trim(),
          porQueSeleccionado: porQueSeleccionado.trim(),
          materialesListos,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || 'Ocurrió un error al enviar tu postulación. Por favor reintentá.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error('[Form Submit Error]:', err)
      setErrorMsg('Error de conexión. Verificá tu red e intentalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78125rem',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    display: 'block',
    marginBottom: '0.55rem',
    fontWeight: 700,
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(12, 12, 12, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: '0.9rem 1.1rem',
    color: '#ffffff',
    fontFamily: 'var(--font-ui)',
    fontSize: '1rem',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '0 var(--gutter)' }}>
      {/* ── ENCABEZADO CON ESTILO DEL HOME ────────────────────────── */}
      <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 3.5rem' }}>
        
        {/* ⏳ CONTADOR EN RETROCESO HASTA LA FECHA LÍMITE (30 DE SEPTIEMBRE) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            marginBottom: '1.25rem',
            background: 'rgba(10, 10, 10, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 229, 255, 0.45)',
            borderRadius: 20,
            padding: '0.65rem 1.35rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 229, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.35rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              CIERRA EN:
            </span>
          </div>

          {[
            { label: 'DÍAS', val: timeLeft.days },
            { label: 'HORAS', val: timeLeft.hours },
            { label: 'MIN', val: timeLeft.minutes },
            { label: 'SEG', val: timeLeft.seconds },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: '#00e5ff',
                    lineHeight: 1,
                    textShadow: '0 0 16px rgba(0, 229, 255, 0.8)',
                  }}
                >
                  {String(item.val).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.08em',
                    marginTop: '0.2rem',
                  }}
                >
                  {item.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <span style={{ color: 'rgba(0, 229, 255, 0.5)', fontWeight: 800, fontSize: '1rem', marginTop: '-0.5rem' }}>
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

        <br />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: '#33ebff',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'rgba(10, 10, 10, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 229, 255, 0.65)',
            padding: '0.55rem 1.45rem',
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 229, 255, 0.35)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 10px rgba(0, 229, 255, 0.6)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }} />
          CONVOCATORIA ABIERTA • HASTA EL 30 DE SEPTIEMBRE
        </motion.span>

        {/* Título Principal (2 Líneas: Celeste arriba, Blanco en contraste abajo) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            margin: '0 0 1.25rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              lineHeight: 1.15,
              color: '#00e5ff',
              textShadow: '0 0 28px rgba(0, 229, 255, 0.6), 0 2px 14px rgba(0,0,0,0.95)',
              marginBottom: '0.2rem',
            }}
          >
            Conseguí tu
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(2.6rem, 6.2vw, 4.6rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textShadow: '0 4px 32px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,1)',
            }}
          >
            Sitio Web Gratis
          </span>
        </motion.h1>

        {/* Subtítulo Destacado */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 'clamp(1.15rem, 2.3vw, 1.45rem)',
            lineHeight: 1.45,
            color: '#00e5ff',
            margin: '0 0 1.25rem',
            textShadow: '0 2px 14px rgba(0,0,0,0.9)',
          }}
        >
          100% bonificado por 3 meses.
        </motion.h2>

        {/* Texto descriptivo de alto contraste */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
            lineHeight: 1.75,
            color: '#e8e8e8',
            maxWidth: '72ch',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            borderRadius: 16,
            background: 'rgba(18, 18, 18, 0.75)',
            backdropFilter: 'blur(16px)',
            borderLeft: '3px solid #00e5ff',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          Buscamos un negocio en marcha que quiera ordenar sus ventas y dar un salto profesional en internet. Completá los siguientes datos para postular tu proyecto. La convocatoria cierra el 30 de septiembre.
        </motion.p>
      </div>

      {/* ── FORMULARIO O MENSAJE DE ÉXITO ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(145deg, rgba(0, 229, 255, 0.12), rgba(18, 18, 18, 0.95))',
              border: '1px solid rgba(0, 229, 255, 0.5)',
              borderRadius: 24,
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 229, 255, 0.25)',
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(168, 85, 247, 0.25))',
                border: '2px solid #00e5ff',
                color: '#00e5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
              }}
            >
              🚀
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 1rem',
                textShadow: '0 2px 14px rgba(0,0,0,0.9)',
              }}
            >
              ¡Postulación recibida con éxito! 🚀
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: '#ffffff',
                margin: '0 0 2rem',
                maxWidth: 620,
                marginLeft: 'auto',
                marginRight: 'auto',
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              }}
            >
              Muchas gracias por compartirnos la historia de tu negocio. Vamos a revisar cada caso detalladamente y a principios de octubre nos pondremos en contacto vía WhatsApp con los seleccionados. ¡Éxitos en la convocatoria!
            </p>

            <button
              onClick={() => {
                setSubmitted(false)
                setNombre('')
                setNegocio('')
                setWhatsapp('')
                setInstagram('')
                setDedicacion('')
                setDedicacionOpt('')
                setDedicacionCustom('')
                setAntiguedad('')
                setCanalVentas('')
                setTrabaPrincipal('')
                setTrabaOpt('')
                setTrabaCustom('')
                setPorQueSeleccionado('')
                setPorQueOpt('')
                setPorQueCustom('')
                setMaterialesListos('')
                setFieldErrors({})
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                padding: '0.9rem 2rem',
                borderRadius: 12,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              Enviar otra postulación
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Canal Directo WhatsApp para captura rápida de leads */}
            <motion.a
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              href="https://wa.me/5492235851419?text=Hola%20KevDev!%20Quiero%20postular%20mi%20negocio%20a%20la%20Convocatoria%20Impulso%20Digital%20para%20el%20Sitio%20Web%20Gratis."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.18), rgba(15, 23, 42, 0.8))',
                border: '1px solid rgba(37, 211, 102, 0.45)',
                borderRadius: 18,
                padding: '1.1rem 1.5rem',
                color: '#25d366',
                fontFamily: 'var(--font-ui)',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.15)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.35rem' }}>💬</span>
              <span>¿Preferís postularte en 1 clic por WhatsApp? Tocá acá para chatear ↗</span>
            </motion.a>

            <motion.form
              key="form-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              onSubmit={handleSubmit}
              style={{
                background: 'rgba(14, 14, 14, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: 24,
                padding: 'clamp(1.75rem, 4.5vw, 3.25rem)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.75rem',
              }}
            >
            {/* ── BLOQUE 1: DATOS DE CONTACTO ──────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                  borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
                  paddingBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.2)',
                    border: '1px solid #00e5ff',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                  }}
                >
                  1
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#00e5ff',
                    margin: 0,
                    textShadow: '0 0 16px rgba(0, 229, 255, 0.3)',
                  }}
                >
                  Datos de contacto
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" style={labelStyle}>
                    Tu nombre <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value)
                      if (fieldErrors.nombre) setFieldErrors((prev) => ({ ...prev, nombre: '' }))
                    }}
                    placeholder="Ej: Juan"
                    style={{
                      ...inputStyle,
                      borderColor: fieldErrors.nombre ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.nombre ? '#ef4444' : 'rgba(255, 255, 255, 0.2)')}
                  />
                  {fieldErrors.nombre && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.nombre}
                    </span>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="whatsapp" style={labelStyle}>
                    Número de WhatsApp <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value)
                      if (fieldErrors.whatsapp) setFieldErrors((prev) => ({ ...prev, whatsapp: '' }))
                    }}
                    placeholder="Ej: +54 9 11 1234 5678"
                    style={{
                      ...inputStyle,
                      borderColor: fieldErrors.whatsapp ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.whatsapp ? '#ef4444' : 'rgba(255, 255, 255, 0.2)')}
                  />
                  {fieldErrors.whatsapp && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.whatsapp}
                    </span>
                  )}
                </div>

                {/* Nombre de negocio o marca (Opcional) */}
                <div>
                  <label htmlFor="negocio" style={labelStyle}>
                    Nombre de tu negocio <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500, fontSize: '0.7rem' }}>(Opcional)</span>
                  </label>
                  <input
                    id="negocio"
                    type="text"
                    value={negocio}
                    onChange={(e) => setNegocio(e.target.value)}
                    placeholder="Ej: Dulce Hogar Deco"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                  />
                </div>

                {/* Red social o Web (Opcional con selector interactivo por ícono) */}
                <div>
                  <label htmlFor="instagram" style={labelStyle}>
                    Red Social o Web <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500, fontSize: '0.7rem' }}>(Opcional)</span>
                  </label>
                  
                  {/* Selector interactivo de plataforma */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    {[
                      { key: 'Instagram', label: 'Instagram', icon: '📸' },
                      { key: 'Facebook', label: 'Facebook', icon: '📘' },
                      { key: 'TikTok', label: 'TikTok', icon: '🎵' },
                      { key: 'Web', label: 'Web / Otro', icon: '🌐' },
                    ].map((item) => {
                      const active = redSocial === item.key
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setRedSocial(item.key as any)}
                          style={{
                            flex: 1,
                            padding: '0.45rem 0.5rem',
                            borderRadius: 10,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.15)',
                            background: active ? 'rgba(0, 229, 255, 0.2)' : 'rgba(12, 12, 12, 0.7)',
                            color: active ? '#ffffff' : '#a3a3a3',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-ui)',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.2s',
                            boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none',
                          }}
                        >
                          <span>{item.icon}</span>
                          <span style={{ fontSize: '0.7rem' }}>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <input
                    id="instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder={
                      redSocial === 'Instagram'
                        ? '@tunegocio'
                        : redSocial === 'Facebook'
                        ? 'facebook.com/tunegocio'
                        : redSocial === 'TikTok'
                        ? '@tunegocio'
                        : 'www.tunegocio.com'
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                  />
                </div>
              </div>
            </div>

            {/* ── BLOQUE 2: ESTADO DEL NEGOCIO ──────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                  borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
                  paddingBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.2)',
                    border: '1px solid #00e5ff',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                  }}
                >
                  2
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#00e5ff',
                    margin: 0,
                    textShadow: '0 0 16px rgba(0, 229, 255, 0.3)',
                  }}
                >
                  Estado del negocio
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Dedicación y propuesta */}
                <div>
                  <label style={labelStyle}>
                    ¿A qué se dedica tu negocio y qué ofrecés? <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {dedicacionOptions.map((opt) => {
                      const active = dedicacionOpt === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setDedicacionOpt(opt)
                            if (opt !== 'Otro') {
                              setDedicacion(opt)
                              setDedicacionCustom('')
                            } else {
                              setDedicacion(dedicacionCustom)
                            }
                            if (fieldErrors.dedicacion) setFieldErrors((prev) => ({ ...prev, dedicacion: '' }))
                          }}
                          style={{
                            padding: '0.95rem 1.1rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {dedicacionOpt === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Especificá a qué se dedica tu negocio..."
                      value={dedicacionCustom}
                      onChange={(e) => {
                        setDedicacionCustom(e.target.value)
                        setDedicacion(e.target.value)
                        if (fieldErrors.dedicacion) setFieldErrors((prev) => ({ ...prev, dedicacion: '' }))
                      }}
                      style={{
                        ...inputStyle,
                        marginTop: '0.75rem',
                        borderColor: fieldErrors.dedicacion ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  )}
                  {fieldErrors.dedicacion && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.dedicacion}
                    </span>
                  )}
                </div>

                {/* Antigüedad del negocio */}
                <div>
                  <label style={labelStyle}>
                    ¿Hace cuánto tiempo está funcionando tu negocio? <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {antiguedadOptions.map((opt) => {
                      const active = antiguedad === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setAntiguedad(opt)
                            if (fieldErrors.antiguedad) setFieldErrors((prev) => ({ ...prev, antiguedad: '' }))
                          }}
                          style={{
                            flex: '1 1 200px',
                            padding: '0.95rem 1.1rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {fieldErrors.antiguedad && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.antiguedad}
                    </span>
                  )}
                </div>

                {/* Canal principal de ventas */}
                <div>
                  <label style={labelStyle}>
                    ¿Por qué canal concretás la mayoría de tus ventas hoy? <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {canalVentasOptions.map((opt) => {
                      const active = canalVentas === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setCanalVentas(opt)
                            if (fieldErrors.canalVentas) setFieldErrors((prev) => ({ ...prev, canalVentas: '' }))
                          }}
                          style={{
                            padding: '0.95rem 1.1rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {fieldErrors.canalVentas && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.canalVentas}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── BLOQUE 3: NECESIDAD Y COMPROMISO ─────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                  borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
                  paddingBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.2)',
                    border: '1px solid #00e5ff',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                  }}
                >
                  3
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#00e5ff',
                    margin: 0,
                    textShadow: '0 0 16px rgba(0, 229, 255, 0.3)',
                  }}
                >
                  Necesidad y compromiso
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Principal traba por no tener web */}
                <div>
                  <label style={labelStyle}>
                    ¿Cuál es la principal traba que tenés hoy por no contar con una página web? <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {trabaOptions.map((opt) => {
                      const active = trabaOpt === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setTrabaOpt(opt)
                            if (opt !== 'Otro') {
                              setTrabaPrincipal(opt)
                              setTrabaCustom('')
                            } else {
                              setTrabaPrincipal(trabaCustom)
                            }
                            if (fieldErrors.trabaPrincipal) setFieldErrors((prev) => ({ ...prev, trabaPrincipal: '' }))
                          }}
                          style={{
                            padding: '0.95rem 1.1rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {trabaOpt === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Especificá cuál es tu principal traba..."
                      value={trabaCustom}
                      onChange={(e) => {
                        setTrabaCustom(e.target.value)
                        setTrabaPrincipal(e.target.value)
                        if (fieldErrors.trabaPrincipal) setFieldErrors((prev) => ({ ...prev, trabaPrincipal: '' }))
                      }}
                      style={{
                        ...inputStyle,
                        marginTop: '0.75rem',
                        borderColor: fieldErrors.trabaPrincipal ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  )}
                  {fieldErrors.trabaPrincipal && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.trabaPrincipal}
                    </span>
                  )}
                </div>

                {/* Por qué debería ser seleccionado */}
                <div>
                  <label style={labelStyle}>
                    ¿Por qué considerás que tu negocio debería ser el seleccionado para este impulso? <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {porQueSeleccionadoOptions.map((opt) => {
                      const active = porQueOpt === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setPorQueOpt(opt)
                            if (opt !== 'Otro') {
                              setPorQueSeleccionado(opt)
                              setPorQueCustom('')
                            } else {
                              setPorQueSeleccionado(porQueCustom)
                            }
                            if (fieldErrors.porQueSeleccionado) setFieldErrors((prev) => ({ ...prev, porQueSeleccionado: '' }))
                          }}
                          style={{
                            padding: '0.95rem 1.1rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {porQueOpt === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Contanos tu motivo o motivación..."
                      value={porQueCustom}
                      onChange={(e) => {
                        setPorQueCustom(e.target.value)
                        setPorQueSeleccionado(e.target.value)
                        if (fieldErrors.porQueSeleccionado) setFieldErrors((prev) => ({ ...prev, porQueSeleccionado: '' }))
                      }}
                      style={{
                        ...inputStyle,
                        marginTop: '0.75rem',
                        borderColor: fieldErrors.porQueSeleccionado ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  )}
                  {fieldErrors.porQueSeleccionado && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.porQueSeleccionado}
                    </span>
                  )}
                </div>

                {/* Material básico disponible */}
                <div>
                  <label style={labelStyle}>
                    Si tu negocio queda seleccionado, ¿contás con el material básico para empezar? (Logo, fotos reales, lista de precios) <span style={{ color: '#00e5ff' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.6rem' }}>
                    {materialesOptions.map((opt) => {
                      const active = materialesListos === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setMaterialesListos(opt)
                            if (fieldErrors.materialesListos) setFieldErrors((prev) => ({ ...prev, materialesListos: '' }))
                          }}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: 14,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.18)',
                            background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(12, 12, 12, 0.8)',
                            color: active ? '#ffffff' : '#e8e8e8',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.25)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: active ? '6px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.4)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {fieldErrors.materialesListos && (
                    <span style={{ fontSize: '0.78125rem', color: '#f87171', marginTop: '0.35rem', display: 'block' }}>
                      ⚠️ {fieldErrors.materialesListos}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error feedback general */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 12,
                  padding: '1rem 1.25rem',
                  color: '#f87171',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Botón de acción */}
            <div style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)',
                  border: 'none',
                  color: '#07090e',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  padding: '1.2rem 2rem',
                  borderRadius: 16,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 12px 35px -5px rgba(0, 229, 255, 0.5)',
                  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                  opacity: submitting ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 18px 40px -5px rgba(0, 229, 255, 0.7)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 12px 35px -5px rgba(0, 229, 255, 0.5)'
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        border: '2px solid #07090e',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    <span>Verificando y enviando postulación...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar postulación</span>
                    <span style={{ fontSize: '1.25rem' }}>🚀</span>
                  </>
                )}
              </button>
            </div>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </motion.form>
        </div>
        )}
      </AnimatePresence>
    </div>
  )
}
