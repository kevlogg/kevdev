import { Resend } from 'resend'
import { generateVaultAccessEmailHtml, VaultAccessEmailParams } from './email-templates'

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
