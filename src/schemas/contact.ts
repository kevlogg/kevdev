import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Debe ingresar un correo electrónico válido.'),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().min(1, 'Selecciona un servicio.'),
  message: z.string().min(10, 'El mensaje debe contener al menos 10 caracteres.'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
