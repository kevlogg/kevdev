import { z } from 'zod'

export const mercadopagoWebhookPayloadSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  action: z.string().optional(),
  type: z.string().optional(),
  date_created: z.string().optional(),
  user_id: z.union([z.string(), z.number()]).optional(),
  api_version: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
})

export type MercadopagoWebhookPayload = z.infer<typeof mercadopagoWebhookPayloadSchema>
