import { z } from 'zod'

export const bookingSchema = z.object({
  clientData: z.object({
    full_name: z.string(),
    phone: z.string().optional().or(z.literal('')).nullable(),
    email: z.string().optional().or(z.literal('')).nullable(),
  }),
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  notes: z.string().nullish(),
  sendReminder: z.boolean(),
})

export const clientFormSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(7, 'Ingresa un teléfono válido').optional().or(z.literal('')),
  email: z.string().email('Ingresa un email válido').optional().or(z.literal('')),
  sendReminder: z.boolean(),
})

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional(),
  duration_min: z.number().min(5).max(480),
  price: z.number().min(0),
  is_active: z.boolean(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña de al menos 6 caracteres'),
})

export const businessSettingsSchema = z.object({
  name: z.string().min(2, 'El nombre del negocio es requerido'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  slot_duration: z.number().refine((v) => [15, 30, 60].includes(v)),
})

export const businessHoursSchema = z.array(
  z.object({
    weekday: z.number().min(0).max(6),
    open_time: z.string().nullable(),
    close_time: z.string().nullable(),
    is_open: z.boolean(),
  })
)

export type BookingInput = z.infer<typeof bookingSchema>
export type ClientFormInput = z.infer<typeof clientFormSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>
