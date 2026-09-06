export interface VaultAccessEmailParams {
  email: string
  amountPaid: number
  hasOrderBump: boolean
  accessUrl: string
  notebookUrl: string
  transactionId: string
}

export function generateVaultAccessEmailHtml(params: VaultAccessEmailParams): string {
  const { amountPaid, hasOrderBump, accessUrl, notebookUrl, transactionId } = params

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amountPaid)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Confirmado: WhatsApp AI Closer</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f172a; border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- HEADER WITH BRANDING -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: 'Courier New', Courier, monospace; font-weight: 800; font-size: 24px; color: #ffffff; letter-spacing: -0.5px;">
                      Kev<span style="color: #06b6d4;">Dev</span> <span style="font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px; background-color: rgba(6,182,212,0.15); color: #22d3ee; border: 1px solid rgba(34,211,238,0.3); margin-left: 8px;">VAULT</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 12px; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 10px; border-radius: 99px; border: 1px solid rgba(16,185,129,0.2);">
                      ● PAGO APROBADO
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO CONTENT -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                ¡Pago confirmado! Ya tenés acceso completo a <span style="color: #38bdf8;">WhatsApp AI Closer</span>.
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #94a3b8; line-height: 1.6;">
                Gracias por sumarte al Vault de Kevdev. Tu pago de <strong style="color: #22d3ee;">${formattedAmount}</strong> fue procesado exitosamente. A continuación tenés tus accesos directos e instrucciones.
              </p>

              <!-- ORDER SUMMARY BOX -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 28px; padding: 20px;">
                <tr>
                  <td>
                    <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Detalle de Transacción</span>
                    <div style="font-size: 13px; color: #cbd5e1; margin-top: 6px;">ID Transacción: <code style="font-family: monospace; color: #38bdf8;">${transactionId}</code></div>
                    <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Producto: <strong>WhatsApp AI Closer (Sistema n8n)</strong></div>
                    <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Monto Total Abonado: <strong style="color: #10b981;">${formattedAmount} ARS</strong></div>
                  </td>
                </tr>
              </table>

              ${
                hasOrderBump
                  ? `
              <!-- ORDER BUMP CONFIRMATION BADGE -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(90deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15)); border: 1px solid rgba(6,182,212,0.4); border-radius: 12px; margin-bottom: 28px; padding: 16px 20px;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 18px;">⚡</span>
                      <strong style="color: #22d3ee; font-size: 14px;">ORDER BUMP INCLUIDO: Pack de 15 Blueprints JSON Adicionales</strong>
                    </div>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                      Confirmado: Tenés desbloqueada la colección completa de 15 workflows JSON listos para importar directamente en n8n.
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }

              <!-- ACTION LINKS SECTION -->
              <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
                🔑 Tus 2 Enlaces de Acceso Inmediato:
              </h2>

              <!-- BUTTON 1: ACCESS TO BLUEPRINTS / PLATFORM -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td>
                    <a href="${accessUrl}" target="_blank" style="display: block; padding: 16px 24px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 10px; text-align: center; box-shadow: 0 4px 14px rgba(6,182,212,0.4);">
                      1. Acceder al Panel de Blueprints y Documentación 🚀
                    </a>
                    <div style="font-size: 12px; color: #64748b; margin-top: 6px; text-align: center;">
                      Enlace directo: <a href="${accessUrl}" style="color: #38bdf8; text-decoration: none;">${accessUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- BUTTON 2: NOTEBOOKLM PRIVATE TUTOR -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td>
                    <a href="${notebookUrl}" target="_blank" style="display: block; padding: 16px 24px; background-color: #1e293b; border: 1px solid rgba(99,102,241,0.5); color: #818cf8; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 10px; text-align: center;">
                      2. Abrir Tutor Privado de Inteligencia Artificial (NotebookLM) 🤖
                    </a>
                    <div style="font-size: 12px; color: #64748b; margin-top: 6px; text-align: center;">
                      Tutor IA con toda la base de conocimiento cargada para resolver tus dudas de setup en tiempo real.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- NEXT STEPS / HELP -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
                  💡 <strong>¿Necesitás soporte con la implementación?</strong> Podés responder directamente a este correo o contactarme en <a href="mailto:kevdev.info@gmail.com" style="color: #38bdf8; text-decoration: none;">kevdev.info@gmail.com</a>.
                </p>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 32px; background-color: #07090e; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <p style="margin: 0; font-family: monospace; font-size: 12px; color: #475569;">
                KevDev © ${new Date().getFullYear()} — Digital Product Builder
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function generateImpulsoNotificationEmailHtml(p: {
  nombre: string
  negocio: string
  whatsapp: string
  instagram: string
  dedicacion: string
  antiguedad: string
  canalVentas: string
  trabaPrincipal: string
  porQueSeleccionado: string
  materialesListos: string
}): string {
  const waClean = p.whatsapp.replace(/[^\d+]/g, '')
  const waUrl = `https://wa.me/${waClean}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Postulación Impulso Digital</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="650" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #121212; border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 28px; background: linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(147, 51, 234, 0.12)); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span style="font-family: monospace; font-weight: 800; font-size: 22px; color: #ffffff;">
                Kev<span style="color: #00e5ff;">Dev</span> <span style="font-size: 11px; padding: 4px 10px; border-radius: 99px; background: rgba(0, 229, 255, 0.15); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.3); margin-left: 8px;">IMPULSO DIGITAL</span>
              </span>
              <h1 style="margin: 14px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                🚀 Nueva Postulación Recibida
              </h1>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 28px;">
              <!-- CANDIDATE HEADER CARD -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 24px; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 700; color: #00e5ff;">${p.negocio}</div>
                    <div style="font-size: 14px; color: #e8e8e8; margin-top: 4px;">👤 <strong>${p.nombre}</strong></div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">
                      📱 WhatsApp: <a href="${waUrl}" style="color: #22d3ee; text-decoration: none;">${p.whatsapp}</a> | 📸 IG: <strong style="color: #c084fc;">${p.instagram}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- SECTIONS -->
              <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #00e5ff; margin: 0 0 12px 0;">1. Estado del Negocio</h2>
              <div style="background-color: #181818; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
                <div style="margin-bottom: 10px;"><strong>¿A qué se dedica y qué ofrece?</strong><br/><span style="color: #cbd5e1;">${p.dedicacion}</span></div>
                <div style="margin-bottom: 10px;"><strong>Antigüedad:</strong> <span style="color: #38bdf8;">${p.antiguedad}</span></div>
                <div><strong>Canal principal de ventas:</strong> <span style="color: #38bdf8;">${p.canalVentas}</span></div>
              </div>

              <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #00e5ff; margin: 0 0 12px 0;">2. Necesidad y Compromiso</h2>
              <div style="background-color: #181818; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">
                <div style="margin-bottom: 12px;"><strong>Principal traba por no tener web:</strong><br/><span style="color: #cbd5e1;">${p.trabaPrincipal}</span></div>
                <div style="margin-bottom: 12px;"><strong>¿Por qué debería ser el seleccionado?</strong><br/><span style="color: #cbd5e1;">${p.porQueSeleccionado}</span></div>
                <div><strong>Material básico disponible:</strong> <span style="color: #4ade80;">${p.materialesListos}</span></div>
              </div>

              <!-- BUTTON -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${waUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #25D366, #128C7E); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37,211,102,0.3);">
                      💬 Abrir WhatsApp con ${p.nombre}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px; background-color: #07090e; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-family: monospace; font-size: 12px; color: #64748b;">
              KevDev Convocatoria Impulso Digital • Notificación Automática
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

