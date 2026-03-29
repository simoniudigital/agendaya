'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { clientFormSchema, type ClientFormInput } from '@/lib/schemas'
import type { Service } from '@/types/database'

interface ClientDataFormProps {
  service: Service
  startsAt: string
  endsAt: string
  slug: string
}

export default function ClientDataForm({ service, startsAt, endsAt, slug }: ClientDataFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { sendReminder: false, full_name: '', phone: '', email: '' },
  })

  const onSubmit = async (data: ClientFormInput) => {
    setSubmitting(true)
    setServerError(null)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientData: {
            full_name: data.full_name,
            phone: data.phone || undefined,
            email: data.email || undefined,
          },
          serviceId: service.id,
          employeeId: null,
          startsAt,
          endsAt,
          sendReminder: data.sendReminder,
        }),
      })

      const result = await res.json()

      if (res.status === 409) {
        setServerError('Este horario ya fue reservado. Por favor elige otro.')
        return
      }

      if (!res.ok) {
        setServerError('Ocurrió un error. Intenta de nuevo.')
        return
      }

      router.push(`/${slug}/confirmacion/${result.appointment.id}`)
    } catch {
      setServerError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-white border-2 border-black p-6">
        <h2 className="font-heading font-bold text-base uppercase tracking-wide mb-5 text-gray-900">
          Información Personal
        </h2>

        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Juan Pérez"
            error={errors.full_name?.message}
            icon={<User size={14} />}
            {...register('full_name')}
          />
          <Input
            label="Teléfono"
            placeholder="+57 300 000 0000"
            error={errors.phone?.message}
            icon={<Phone size={14} />}
            {...register('phone')}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juan@ejemplo.com"
            error={errors.email?.message}
            icon={<Mail size={14} />}
            {...register('email')}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#6B21A8]"
              {...register('sendReminder')}
            />
            <span className="font-body text-sm text-gray-600">
              Deseo recibir una confirmación de la cita por email
            </span>
          </label>
        </div>
      </div>

      {serverError && (
        <div className="border-2 border-red-500 bg-red-50 p-3 text-red-700 text-sm font-body">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        variant="brutal"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? 'CONFIRMANDO...' : 'CONFIRMAR CITA'}
      </Button>
    </form>
  )
}
