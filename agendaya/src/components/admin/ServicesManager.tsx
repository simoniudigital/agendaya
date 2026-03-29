'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, MoreVertical, Plus, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import { serviceSchema, type ServiceInput } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database'

interface ServicesManagerProps {
  services: Service[]
}

export default function ServicesManager({ services: initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { is_active: true, name: '', description: '', duration_min: 30, price: 0 },
  })

  const activeCount = services.filter((s) => s.is_active).length
  const avgPrice = services.length > 0
    ? services.reduce((sum, s) => sum + s.price, 0) / services.length
    : 0

  const openCreate = () => {
    setEditingService(null)
    reset({ is_active: true })
    setShowForm(true)
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    setValue('name', service.name)
    setValue('description', service.description ?? '')
    setValue('duration_min', service.duration_min)
    setValue('price', service.price)
    setValue('is_active', service.is_active)
    setShowForm(true)
  }

  const onSubmit = async (data: ServiceInput) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (editingService) {
      const { data: updated, error: err } = await supabase
        .from('services')
        .update(data)
        .eq('id', editingService.id)
        .select()
        .single()

      if (err) { setError('Error al actualizar.'); setLoading(false); return }
      setServices((prev) => prev.map((s) => s.id === editingService.id ? updated : s))
    } else {
      const { data: created, error: err } = await supabase
        .from('services')
        .insert(data)
        .select()
        .single()

      if (err) { setError('Error al crear el servicio.'); setLoading(false); return }
      setServices((prev) => [...prev, created])
    }

    setShowForm(false)
    reset()
    setLoading(false)
  }

  const toggleActive = async (service: Service) => {
    const supabase = createClient()
    const { data: updated } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)
      .select()
      .single()

    if (updated) {
      setServices((prev) => prev.map((s) => s.id === service.id ? updated : s))
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-heading font-black text-2xl uppercase text-white mb-1">
        GESTIÓN DE SERVICIOS
      </h1>
      <p className="font-body text-white/40 text-sm mb-8">
        Administra el catálogo completo de tratamientos y precios de tu establecimiento.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'TOTAL SERVICIOS', value: services.length, accent: false },
          { label: 'PRECIO PROMEDIO', value: `$${avgPrice.toFixed(2)}`, accent: false },
          { label: 'SERVICIOS ACTIVOS', value: activeCount, accent: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1225] border border-white/5 p-4">
            <p className="text-xs font-heading uppercase tracking-wider text-white/30 mb-2">{stat.label}</p>
            <p className={`font-heading font-bold text-3xl ${stat.accent ? 'text-emerald-400' : 'text-white'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Create Button */}
      <Button variant="dark" size="md" className="mb-6" onClick={openCreate}>
        <Plus size={16} />
        CREAR NUEVO SERVICIO
      </Button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-[#1a1225] border border-[#A855F7]/30 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
                {editingService ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nombre" dark error={errors.name?.message} {...register('name')} />
              <Input label="Descripción" dark {...register('description')} />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Duración (min)"
                  type="number"
                  dark
                  error={errors.duration_min?.message}
                  {...register('duration_min', { valueAsNumber: true })}
                />
                <Input
                  label="Precio ($)"
                  type="number"
                  step="0.01"
                  dark
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="dark" size="md" disabled={loading} className="flex-1">
                  {loading ? 'GUARDANDO...' : 'GUARDAR'}
                </Button>
                <Button type="button" variant="ghost" size="md" onClick={() => setShowForm(false)} className="text-white/40 border-white/20">
                  CANCELAR
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Table */}
      {services.length > 0 && (
        <div className="border border-white/5">
          <div className="grid grid-cols-12 px-4 py-3 bg-[#1a1225] border-b border-white/5">
            {['SERVICIO', 'PRECIO', 'DURACIÓN', 'ESTADO', 'ACCIONES'].map((h, i) => (
              <div key={h} className={`text-xs font-heading uppercase tracking-wider text-white/30 ${
                i === 0 ? 'col-span-5' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : 'col-span-1'
              }`}>{h}</div>
            ))}
          </div>

          {services.map((service) => (
            <div key={service.id} className="grid grid-cols-12 px-4 py-4 border-b border-white/5 hover:bg-white/3 transition-colors items-center">
              {/* Service name */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-7 h-7 bg-[#6B21A8]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-heading text-[#A855F7] font-bold">
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-body font-semibold text-white text-sm truncate">{service.name}</span>
              </div>
              {/* Price */}
              <div className="col-span-2">
                <span className="font-heading font-bold text-sm text-white">${service.price.toFixed(2)}</span>
              </div>
              {/* Duration */}
              <div className="col-span-2 flex items-center gap-1 text-white/40">
                <Clock size={12} />
                <span className="text-xs font-body">{service.duration_min} min</span>
              </div>
              {/* Toggle */}
              <div className="col-span-2 flex items-center gap-2">
                <Toggle checked={service.is_active} onChange={() => toggleActive(service)} />
                <span className={`text-xs font-heading uppercase ${service.is_active ? 'text-emerald-400' : 'text-white/30'}`}>
                  {service.is_active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => openEdit(service)}
                  className="text-white/30 hover:text-white transition-colors"
                  title="Editar"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
