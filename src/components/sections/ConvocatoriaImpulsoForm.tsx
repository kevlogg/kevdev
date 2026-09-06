'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConvocatoriaImpulsoForm() {
  // Form Fields State
  const [nombre, setNombre] = useState('')
  const [negocio, setNegocio] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')

  const [dedicacion, setDedicacion] = useState('')
  const [antiguedad, setAntiguedad] = useState<'Menos de 6 meses' | 'Entre 6 meses y 2 años' | 'Más de 2 años' | ''>('')
  const [canalVentas, setCanalVentas] = useState<'Mensajes de WhatsApp' | 'Mensajes directos de Instagram' | 'Local a la calle / presencial' | 'Otro' | ''>('')

  const [trabaPrincipal, setTrabaPrincipal] = useState('')
  const [porQueSeleccionado, setPorQueSeleccionado] = useState('')
  const [materialesListos, setMaterialesListos] = useState<'Sí, tengo todo listo para arrancar' | 'Tengo bastante, me faltan pulir detalles' | 'Tengo que armarlo desde cero' | ''>('')

  // UI State
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Options arrays
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!nombre.trim() || !negocio.trim() || !whatsapp.trim() || !instagram.trim()) {
      setErrorMsg('Por favor completá todos los datos de contacto.')
      return
    }
    if (!dedicacion.trim() || !antiguedad || !canalVentas) {
      setErrorMsg('Por favor completá los datos sobre el estado de tu negocio.')
      return
    }
    if (!trabaPrincipal.trim() || !porQueSeleccionado.trim() || !materialesListos) {
      setErrorMsg('Por favor completá los campos de necesidad y compromiso.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const response = await fetch('/api/convocatoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          negocio: negocio.trim(),
          whatsapp: whatsapp.trim(),
          instagram: instagram.trim(),
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
    fontSize: '0.75rem',
    color: 'var(--color-star)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: '0.85rem 1rem',
    color: '#ffffff',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 var(--gutter)' }}>
      {/* ── ENCABEZADO ────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 3.5rem' }}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: '#00e5ff',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '0.4rem 1.1rem',
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }} />
          CONVOCATORIA ABIERTA • HASTA EL 30 DE SEPTIEMBRE
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '0 0 1.25rem',
          }}
        >
          Convocatoria Impulso Digital{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            KevDev
          </span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
            lineHeight: 1.4,
            color: '#00e5ff',
            margin: '0 0 1.25rem',
          }}
        >
          Postulá tu negocio para obtener el diseño de tu sitio web bonificado y 3 meses de suscripción sin costo.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
            lineHeight: 1.75,
            color: 'var(--color-muted)',
            margin: 0,
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
              background: 'linear-gradient(145deg, rgba(0, 229, 255, 0.08), rgba(18, 18, 18, 0.9))',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: 24,
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 229, 255, 0.2)',
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(168, 85, 247, 0.2))',
                border: '2px solid #00e5ff',
                color: '#00e5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.25rem',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 25px rgba(0, 229, 255, 0.4)',
              }}
            >
              🚀
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 1rem',
              }}
            >
              ¡Postulación recibida con éxito! 🚀
            </h3>

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1.0625rem',
                lineHeight: 1.75,
                color: 'var(--color-star)',
                margin: '0 0 2rem',
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
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
                setAntiguedad('')
                setCanalVentas('')
                setTrabaPrincipal('')
                setPorQueSeleccionado('')
                setMaterialesListos('')
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                padding: '0.85rem 1.75rem',
                borderRadius: 12,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
            >
              Enviar otra postulación
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(18, 18, 18, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
            }}
          >
            {/* ── BLOQUE 1: DATOS DE CONTACTO ──────────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  1
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Datos de contacto
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Nombre y apellido */}
                <div>
                  <label htmlFor="nombre" style={labelStyle}>
                    Nombre y apellido *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* Nombre de negocio o marca */}
                <div>
                  <label htmlFor="negocio" style={labelStyle}>
                    Nombre de tu negocio o marca *
                  </label>
                  <input
                    id="negocio"
                    type="text"
                    required
                    value={negocio}
                    onChange={(e) => setNegocio(e.target.value)}
                    placeholder="Ej: Dulce Hogar Deco"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="whatsapp" style={labelStyle}>
                    Número de WhatsApp con código de área *
                  </label>
                  <input
                    id="whatsapp"
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: +54 9 11 1234 5678"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label htmlFor="instagram" style={labelStyle}>
                    Usuario de Instagram del negocio *
                  </label>
                  <input
                    id="instagram"
                    type="text"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@tunegocio"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
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
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  2
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Estado del negocio
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Dedicación y propuesta */}
                <div>
                  <label htmlFor="dedicacion" style={labelStyle}>
                    ¿A qué se dedica tu negocio y qué ofrecés? *
                  </label>
                  <textarea
                    id="dedicacion"
                    rows={3}
                    required
                    value={dedicacion}
                    onChange={(e) => setDedicacion(e.target.value)}
                    placeholder="Contanos brevemente qué vendés o qué servicio prestás"
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* Antigüedad del negocio */}
                <div>
                  <label style={labelStyle}>
                    ¿Hace cuánto tiempo está funcionando tu negocio? *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {antiguedadOptions.map((opt) => {
                      const active = antiguedad === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAntiguedad(opt)}
                          style={{
                            flex: '1 1 200px',
                            padding: '0.85rem 1rem',
                            borderRadius: 12,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            color: active ? '#ffffff' : 'var(--color-muted)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: active ? '5px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.3)',
                              boxSizing: 'border-box',
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Canal principal de ventas */}
                <div>
                  <label style={labelStyle}>
                    ¿Por qué canal concretás la mayoría de tus ventas hoy? *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {canalVentasOptions.map((opt) => {
                      const active = canalVentas === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCanalVentas(opt)}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 12,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            color: active ? '#ffffff' : 'var(--color-muted)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: active ? '5px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.3)',
                              boxSizing: 'border-box',
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BLOQUE 3: NECESIDAD Y COMPROMISO ─────────────────── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.75rem',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.15)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: '#00e5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  3
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Necesidad y compromiso
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Principal traba por no tener web */}
                <div>
                  <label htmlFor="trabaPrincipal" style={labelStyle}>
                    ¿Cuál es la principal traba que tenés hoy por no contar con una página web? *
                  </label>
                  <textarea
                    id="trabaPrincipal"
                    rows={3}
                    required
                    value={trabaPrincipal}
                    onChange={(e) => setTrabaPrincipal(e.target.value)}
                    placeholder="Ej: pierdo tiempo pasando precios uno a uno, me cuesta mostrar el catálogo completo, etc."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* Por qué debería ser seleccionado */}
                <div>
                  <label htmlFor="porQueSeleccionado" style={labelStyle}>
                    ¿Por qué considerás que tu negocio debería ser el seleccionado para este impulso? *
                  </label>
                  <textarea
                    id="porQueSeleccionado"
                    rows={3}
                    required
                    value={porQueSeleccionado}
                    onChange={(e) => setPorQueSeleccionado(e.target.value)}
                    placeholder="Contanos tu motivación, proyección o cómo esto impactaría en la historia de tu marca"
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                  />
                </div>

                {/* Material básico disponible */}
                <div>
                  <label style={labelStyle}>
                    Si tu negocio queda seleccionado, ¿contás con el material básico para empezar? (Logo, fotos reales, lista de precios) *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {materialesOptions.map((opt) => {
                      const active = materialesListos === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setMaterialesListos(opt)}
                          style={{
                            padding: '0.9rem 1.1rem',
                            borderRadius: 12,
                            border: active ? '1px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.12)',
                            background: active ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            color: active ? '#ffffff' : 'var(--color-muted)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: active ? '5px solid #00e5ff' : '2px solid rgba(255, 255, 255, 0.3)',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                          />
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Error feedback */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  padding: '0.85rem 1.25rem',
                  color: '#f87171',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-ui)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⚠️</span> {errorMsg}
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
                  fontSize: '1.0625rem',
                  padding: '1.15rem 2rem',
                  borderRadius: 16,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 12px 30px -5px rgba(0, 229, 255, 0.4)',
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
                    e.currentTarget.style.boxShadow = '0 18px 38px -5px rgba(0, 229, 255, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(0, 229, 255, 0.4)'
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: '2px solid #07090e',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    <span>Procesando postulación...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar postulación</span>
                    <span style={{ fontSize: '1.2rem' }}>🚀</span>
                  </>
                )}
              </button>
            </div>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
