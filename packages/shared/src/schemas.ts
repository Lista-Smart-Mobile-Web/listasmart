import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
})

export const createListSchema = z.object({
  name: z.string().min(1, 'Nome da lista obrigatório'),
})

export const addListItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
})

export const updateListItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  isChecked: z.boolean().optional(),
})

export const contributionSchema = z.object({
  type: z.enum(['qr_code', 'manual', 'confirm']),
  productId: z.string().uuid(),
  marketId: z.string().uuid(),
  price: z.number().positive('Preço deve ser maior que zero'),
})

export const promotionSchema = z.object({
  productId: z.string().uuid(),
  price: z.number().positive(),
  validUntil: z.string().datetime(),
})

export const leadSchema = z.object({
  storeName: z.string().min(1),
  city: z.string().min(1),
  contactName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  storeCount: z.enum(['1 loja', '2 a 5 lojas', '6 a 20 lojas', 'Mais de 20 lojas']),
  message: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateListInput = z.infer<typeof createListSchema>
export type AddListItemInput = z.infer<typeof addListItemSchema>
export type ContributionInput = z.infer<typeof contributionSchema>
export type LeadInput = z.infer<typeof leadSchema>
