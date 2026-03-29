'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addMinutes } from 'date-fns'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Toast, { type ToastData } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

const manualSchema = z.object({
  clientMode: z.enum(['existing', 'new']),
  clientId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  employeeId: z.string().optional(),
  date: z.string().min(1, 'Selecciona una fecha'),
  time: z.string().min(1, 'Selecciona una hora'),
  notes: z.string().optional(),
})

type ManualFormInput = z.infer<typeof manualSchema>

interface Service { id: string; name: string; duration_min: number; price: number }
interface Employee { id: string; full_name: string }
interface Client { id: string; full_name: string; phone: string | null; email: string | null }

interface Props {
  services: Service[]
  employees: Employee[]
  existingClients: Client[]
}

export default function ManualAppointmentForm({ services, employees, existingClients }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ManualFormInput>({
    resolver: zodResolver(manualSchema),
    defaultValues: { clientMode: 'existing' },
  })

  const clientMode = watch('clientMode')
  const serviceId = watch('serviceId')
  const selectedService = services.find((s) => s.id === serviceId)

  const filteredClients = existingClients.filter(
    (c) =>
      c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const onValidationError = useCallback((errs: FieldErrors<ManualFormInput>) => {
    const fieldMessages: Partial<Record<keyof ManualFormInput, string>> = {
      serviceId: 'Selecciona un servicio.',
      date: 'Selecciona una fecha.',
      time: 'Selecciona una hora.',
    }
    const first = (Object.keys(errs) as (keyof ManualFormInput)[]).find((k) => fieldMessages[k])
    addToast(first ? fieldMessages[first]! : 'Completa todos los campos requeridos.', 'error')
  }, [addToast])

  const onSubmit = async (data: ManualFormInput) => {
    // Validate client selection
    if (data.clientMode === 'existing' && !data.clientId) {
      addToast('Selecciona un cliente de la lista o cambia a "Nuevo Cliente".', 'error')
      return
    }
    if (data.clientMode === 'new' && !data.fullName) {
      addToast('Ingresa el nombre del nuevo cliente.', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      let clientId: string

      if (data.clientMode === 'existing' && data.clientId) {
        clientId = data.clientId
      } else {
        const { data: newClient, error: clientErr } = await supabase
          .from('clients')
          .insert({
            full_name: data.fullName!,
            phone: data.phone || null,
            email: data.email || null,
          })
          .select('id')
          .single()

        if (clientErr || !newClient) {
          addToast('Error al crear el cliente. Intenta de nuevo.', 'error')
          setLoading(false)
          return
        }
        clientId = newClient.id
      }

      const startsAt = new Date(`${data.date}T${data.time}:00`)
      const endsAt = addMinutes(startsAt, selectedService?.duration_min ?? 30)

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientData: { full_name: '', phone: null, email: null },
          serviceId: data.serviceId,
          employeeId: data.employeeId || null,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          notes: data.notes || null,
          sendReminder: false,
          _clientIdOverride: clientId,
        }),
      })

      if (res.status === 409) {
        addToast('El horario seleccionado ya está ocupado. Elige otro.', 'error')
        setLoading(false)
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        addToast(body?.error ? JSON.stringify(body.error) : 'Error al crear la cita.', 'error')
        setLoading(false)
        return
      }

      addToast('¡Cita creada correctamente!', 'success')
      setTimeout(() => {
        router.push('/admin/citas')
        router.refresh()
      }, 1000)
    } catch {
      addToast('Error de conexión. Intenta de nuevo.', 'error')
      setLoading(false)
    }
  }

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6">
        {/* Client Selection */}
        <div className="bg-[#1a1225] border border-white/5 p-5">
          <h2 className="font-heading font-bold text-sm uppercase tracking-wide text-white mb-4">
            CLIENTE
          </h2>

          <div className="flex gap-3 mb-4">
            {(['existing', 'new'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setValue('clientMode', mode)}
                className={[
                  'flex-1 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-2 transition-colors',
                  clientMode === mode
                    ? 'bg-[#6B21A8] text-white border-[#6B21A8]'
                    : 'bg-transparent text-white/40 border-white/10 hover:text-white',
                ].join(' ')}
              >
                {mode === 'existing' ? 'CLIENTE EXISTENTE' : 'NUEVO CLIENTE'}
              </button>
            ))}
          </div>

          {clientMode === 'existing' ? (
            <div>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-[#0F0A14] text-white border border-[#A855F7]/30 px-4 py-2.5 text-sm font-body placeholder:text-white/30 focus:outline-none focus:border-[#A855F7] mb-2"
              />
              {existingClients.length === 0 ? (
                <p className="text-white/30 text-xs font-body py-2">
                  No hay clientes registrados aún. Cambia a &quot;Nuevo Cliente&quot;.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredClients.slice(0, 20).map((c) => (
                    <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer">
                      <input
                        type="radio"
                        value={c.id}
                        {...register('clientId')}
                        className="accent-[#A855F7]"
                      />
                      <div>
                        <p className="text-white text-sm font-body">{c.full_name}</p>
                        {c.email && <p className="text-white/40 text-xs">{c.email}</p>}
                      </div>
                    </label>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-white/30 text-xs font-body py-2">Sin resultados.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input label="Nombre completo" dark error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Teléfono" dark {...register('phone')} />
              <Input label="Email" type="email" dark {...register('email')} />
            </div>
          )}
        </div>

        {/* Service & Employee */}
        <div className="bg-[#1a1225] border border-white/5 p-5 space-y-4">
          <h2 className="font-heading font-bold text-sm uppercase tracking-wide text-white">
            SERVICIO Y PROFESIONAL
          </h2>

          <div>
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-white/60 block mb-1.5">
              SERVICIO
            </label>
            <select
              {...register('serviceId')}
              className="w-full bg-[#0F0A14] text-white border border-[#A855F7]/30 px-4 py-3 text-sm font-body focus:outline-none focus:border-[#A855F7]"
            >
              <option value="">Selecciona un servicio...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.duration_min}min · ${s.price}
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="text-red-400 text-xs mt-1">{errors.serviceId.message}</p>}
          </div>

          <div>
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-white/60 block mb-1.5">
              PROFESIONAL (OPCIONAL)
            </label>
            <select
              {...register('employeeId')}
              className="w-full bg-[#0F0A14] text-white border border-[#A855F7]/30 px-4 py-3 text-sm font-body focus:outline-none focus:border-[#A855F7]"
            >
              <option value="">Sin asignar</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-[#1a1225] border border-white/5 p-5 space-y-4">
          <h2 className="font-heading font-bold text-sm uppercase tracking-wide text-white">
            FECHA Y HORA
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              dark
              error={errors.date?.message}
              {...register('date')}
            />
            <Input
              label="Hora"
              type="time"
              dark
              error={errors.time?.message}
              {...register('time')}
            />
          </div>
          <Input label="Notas (opcional)" dark {...register('notes')} />
        </div>

        <Button type="submit" variant="dark" size="lg" className="w-full" disabled={loading}>
          {loading ? 'CREANDO CITA...' : 'CREAR CITA'}
        </Button>
      </form>
    </>
  )
}
