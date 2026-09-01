import { mercadopagoWebhookPayloadSchema } from './mercadopago'
import { contactFormSchema } from './contact'

// Basic assertion check for schemas
function runSchemaTests() {
  const validWebhookPayload = {
    id: 123456789,
    action: 'payment.created',
    data: { id: '987654321' },
  }

  const result = mercadopagoWebhookPayloadSchema.safeParse(validWebhookPayload)
  if (!result.success) {
    throw new Error('Mercadopago webhook schema test failed for valid payload')
  }

  const validContactData = {
    name: 'Kevin Loggia',
    email: 'test@kevdev.com',
    service: 'diseno-web',
    message: 'Hola, quisiera información sobre el desarrollo de una landing page.',
  }

  const contactResult = contactFormSchema.safeParse(validContactData)
  if (!contactResult.success) {
    throw new Error('Contact form schema test failed for valid contact data')
  }

  console.log('[Schema Tests Passed Successfully!]')
}

runSchemaTests()
