import { z } from 'zod'

export const cartItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  qty: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
})

export const consultationSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().nullable(),
  message: z.string().min(1).max(2000),
  cart: z.array(cartItemSchema).optional(),
  orderTotal: z.number().nonnegative().optional(),
  gRecaptchaToken: z.string().optional(),
})

export type Consultation = z.infer<typeof consultationSchema>
