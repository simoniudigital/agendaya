'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import { businessSettingsSchema, type BusinessSettingsInput } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/client'
import type { BusinessSettings, BusinessHours } from '@/types/database'

const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface Props {
  settings: BusinessSettings | null
  hours: BusinessHours[]
}

export default function BusinessSettingsForm({ settings, hours: initialHours }: Props) {
  const [hours, setHours] = useState<BusinessHours[]>(initialHours)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slotDuration, setSlotDuration] = useState<number>(settings?.slot_duration ?? 30)

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessSettingsInput>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      name: settings?.name ?? '',
      slug: settings?.slug ?? '',
      slot_duration: settings?.slot_duration ?? 30,
    },
  })

  const updateHour = (weekday: number, field: string, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) => h.weekday === weekday ? { ...h, [field]: value } : h)
    )
  }

  const onSubmit = async (data: BusinessSettingsInput) => {
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()

    // Update settings
    const settingsPayload = { ...data, slot_duration: slotDuration }
    if (settings?.id) {
      const { error: err } = await supabase
        .from('business_settings')
        .update(settingsPayload)
        .eq('id', settings.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('business_settings')
        .insert(settingsPayload)
      if (err) { setError(err.message); setSaving(false); return }
    }

    // Update hours
    for (const h of hours) {
      await supabase
        .from('business_hours')
        .update({
          open_time: h.is_open ? h.open_time : null,
          close_time: h.is_open ? h.close_time : null,
          is_open: h.is_open,
        })
        .eq('weekday', h.weekday)
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-heading font-black text-2xl uppercase text-white mb-1">
        DETALLES DEL NEGOCIO
      </h1>
      <p className="font-body text-white/40 text-sm mb-8">
        Configure la identidad visual y operativa de su plataforma para clientes.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Info */}
        <section>
          <p className="flex items-center gap-2 font-heading font-bold text-sm uppercase tracking-wider text-white mb-4">
            <span className="text-[#A855F7] text-xs">info</span>
            INFORMACIÓN GENERAL
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#A855F7] block mb-1.5">
                NOMBRE DEL NEGOCIO
              </label>
              <Input
                placeholder="Ej. Lado Creative Studio"
                dark
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-[#A855F7] block mb-1.5">
                URL PÚBLICA
              </label>
              <div className="flex border border-[#A855F7]/30">
                <span className="bg-[#0F0A14] text-white/30 px-3 flex items-center text-xs font-body border-r border-[#A855F7]/30">
                  agendaya.com/
                </span>
                <input
                  className="flex-1 bg-[#1a1225] text-white px-3 py-3 text-sm font-body focus:outline-none"
                  placeholder="mi-negocio"
                  {...register('slug')}
                />
              </div>
              {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section>
          <p className="flex items-center gap-2 font-heading font-bold text-sm uppercase tracking-wider text-white mb-4">
            <span className="text-[#A855F7] text-xs">schedule</span>
            HORARIO DE ATENCIÓN
          </p>

          <div className="space-y-2">
            {hours.map((h) => (
              <div key={h.weekday} className="grid grid-cols-12 items-center gap-3 bg-[#1a1225] border border-white/5 px-4 py-3">
                <div className="col-span-2">
                  <span className="font-heading font-bold text-xs uppercase text-white">
                    {WEEKDAY_NAMES[h.weekday].toUpperCase()}
                  </span>
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="time"
                    value={h.open_time ?? ''}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(h.weekday, 'open_time', e.target.value)}
                    className="bg-[#0F0A14] text-white border border-[#A855F7]/30 px-3 py-2 text-sm font-body focus:outline-none disabled:opacity-30 w-28"
                  />
                  <span className="text-white/30">—</span>
                  <input
                    type="time"
                    value={h.close_time ?? ''}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(h.weekday, 'close_time', e.target.value)}
                    className="bg-[#0F0A14] text-white border border-[#A855F7]/30 px-3 py-2 text-sm font-body focus:outline-none disabled:opacity-30 w-28"
                  />
                </div>
                <div className="col-span-6 flex items-center justify-end gap-3">
                  <Toggle
                    checked={h.is_open}
                    onChange={(checked) => updateHour(h.weekday, 'is_open', checked)}
                  />
                  <span className={`text-xs font-heading uppercase tracking-wider ${h.is_open ? 'text-emerald-400' : 'text-white/30'}`}>
                    {h.is_open ? 'ABIERTO' : 'CERRADO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Slot Duration */}
        <section>
          <p className="flex items-center gap-2 font-heading font-bold text-sm uppercase tracking-wider text-white mb-3">
            <span className="text-[#A855F7] text-xs">timer</span>
            CONFIGURACIÓN DE TURNOS
          </p>
          <p className="text-xs font-heading uppercase tracking-wider text-[#A855F7] mb-3">
            DURACIÓN POR DEFECTO DEL BLOQUE
          </p>
          <div className="flex gap-3">
            {[15, 30, 60].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setSlotDuration(min)}
                className={[
                  'flex-1 flex flex-col items-center py-5 border-2 transition-colors',
                  slotDuration === min
                    ? 'border-[#A855F7] bg-[#6B21A8]/20'
                    : 'border-white/10 bg-[#1a1225] hover:border-white/30',
                ].join(' ')}
              >
                <span className={`font-heading font-black text-3xl ${slotDuration === min ? 'text-white' : 'text-white/40'}`}>
                  {min}
                </span>
                <span className="text-xs font-heading text-white/30 uppercase tracking-wider">MINUTOS</span>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="border border-red-500/30 bg-red-950/20 p-3 text-red-400 text-sm font-body">
            {error}
          </div>
        )}

        <Button type="submit" variant="dark" size="lg" disabled={saving}>
          {saving ? 'GUARDANDO...' : saved ? '✓ CAMBIOS GUARDADOS' : 'GUARDAR CAMBIOS'}
        </Button>
      </form>
    </div>
  )
}
