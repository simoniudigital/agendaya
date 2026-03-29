import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Scissors, CalendarDays, Clock, User, ArrowLeft, Phone, Mail } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import AppointmentActions from '@/components/admin/AppointmentActions'

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: apt } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      service:services(*),
      employee:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (!apt) notFound()

  const client = apt.client as { full_name: string; phone: string | null; email: string | null }
  const service = apt.service as { name: string; duration_min: number; price: number }
  const employee = apt.employee as { full_name: string } | null
  const start = parseISO(apt.starts_at)
  const end = parseISO(apt.ends_at)

  const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'purple' | 'default'> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'error',
    completed: 'purple',
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Back */}
      <Link href="/admin/citas" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-heading text-xs uppercase tracking-wider mb-6 transition-colors">
        <ArrowLeft size={14} />
        VOLVER A AGENDA
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="font-heading font-black text-2xl uppercase text-white">DETALLE DE CITA</h1>
        <Badge variant={statusVariants[apt.status] ?? 'default'}>
          {apt.status.toUpperCase()}
        </Badge>
      </div>

      {/* Details Card */}
      <div className="bg-[#1a1225] border border-white/5 p-6 mb-4 space-y-5">
        <div className="flex items-start gap-3">
          <Scissors size={16} className="mt-0.5 text-[#A855F7]" />
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white/40">Servicio</p>
            <p className="font-body font-semibold text-white">{service.name}</p>
            <p className="font-body text-sm text-white/40">{service.duration_min} min · ${service.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User size={16} className="mt-0.5 text-[#A855F7]" />
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white/40">Cliente</p>
            <p className="font-body font-semibold text-white">{client.full_name}</p>
            {client.phone && (
              <p className="font-body text-sm text-white/40 flex items-center gap-1">
                <Phone size={11} />{client.phone}
              </p>
            )}
            {client.email && (
              <p className="font-body text-sm text-white/40 flex items-center gap-1">
                <Mail size={11} />{client.email}
              </p>
            )}
          </div>
        </div>

        {employee && (
          <div className="flex items-start gap-3">
            <User size={16} className="mt-0.5 text-[#A855F7]" />
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-white/40">Profesional</p>
              <p className="font-body font-semibold text-white">{employee.full_name}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <CalendarDays size={16} className="mt-0.5 text-[#A855F7]" />
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white/40">Fecha</p>
            <p className="font-body font-semibold text-white capitalize">
              {format(start, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={16} className="mt-0.5 text-[#A855F7]" />
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white/40">Horario</p>
            <p className="font-body font-semibold text-white">
              {format(start, 'hh:mm a').toUpperCase()} — {format(end, 'hh:mm a').toUpperCase()}
            </p>
          </div>
        </div>

        {apt.notes && (
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-white/40 mb-1">Notas</p>
            <p className="font-body text-sm text-white/70">{apt.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
        <AppointmentActions appointmentId={apt.id} currentStatus={apt.status} />
      )}
    </div>
  )
}
