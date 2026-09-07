import { Resend } from 'resend'
import { generateVaultAccessEmailHtml, VaultAccessEmailParams, generateImpulsoNotificationEmailHtml } from './email-templates'

const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key_for_dev'
export const resendClient = new Resend(resendApiKey)

export async function sendVaultAccessEmail(params: VaultAccessEmailParams) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'KevDev <onboarding@resend.dev>'
  const html = generateVaultAccessEmailHtml(params)

  const subject = params.hasOrderBump
    ? '🚀 Acceso Confirmado: WhatsApp AI Closer + 15 Blueprints (KevDev Vault)'
    : '🚀 Acceso Confirmado: WhatsApp AI Closer (KevDev Vault)'

  try {
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: [params.email],
      subject,
      html,
    })

    if (response.error) {
      console.error('[Resend Email Error]:', response.error)
      return { success: false, error: response.error }
    }

    console.log('[Resend Email Success] Email dispatched to:', params.email, 'ID:', response.data?.id)
    return { success: true, id: response.data?.id }
  } catch (error: any) {
    console.error('[Resend Exception]:', error)
    return { success: false, error: error?.message || 'Unknown Resend error' }
  }
}

export async function sendImpulsoNotificationEmail(params: {
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
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'KevDev <onboarding@resend.dev>'
  const primaryEmail = process.env.RESEND_TO_EMAIL || 'loggia1996@gmail.com'
  const adminEmail = process.env.FIREBASE_ADMIN_EMAIL || 'kevdev.info@gmail.com'
  const html = generateImpulsoNotificationEmailHtml(params)
  const subject = `🚀 Nueva Postulación Impulso Digital: ${params.negocio} (${params.nombre})`

  let primaryRes = { success: false, id: undefined as string | undefined }

  // 1. Primary Dispatch (loggia1996@gmail.com - guaranteed for Resend test mode)
  try {
    const response = await resendClient.emails.send({
      from: fromEmail,
      to: [primaryEmail],
      subject,
      html,
    })
    if (!response.error) {
      console.log('[Resend Impulso Primary Success] Dispatched ID:', response.data?.id)
      primaryRes = { success: true, id: response.data?.id }
    } else {
      console.error('[Resend Impulso Primary Error]:', response.error)
    }
  } catch (err: any) {
    console.error('[Resend Impulso Primary Exception]:', err)
  }

  // 2. Secondary Dispatch (admin email - if different and custom domain verified)
  if (adminEmail && adminEmail !== primaryEmail) {
    try {
      await resendClient.emails.send({
        from: fromEmail,
        to: [adminEmail],
        subject,
        html,
      })
    } catch (adminErr) {
      console.warn('[Resend Impulso Secondary Note]: Resend test-mode restricted secondary email:', adminErr)
    }
  }

  return primaryRes
}

