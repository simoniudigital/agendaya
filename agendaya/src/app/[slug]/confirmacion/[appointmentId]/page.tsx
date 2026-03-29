import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Scissors, CalendarDays, Clock, User, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; appointmentId: string }>
}) {
  const { appointmentId } = await params
  const supabase = createServiceRoleClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      service:services(*),
      employee:profiles(*)
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) notFound()

  const service = appointment.service as { name: string; price: number }
  const employee = appointment.employee as { full_name: string } | null
  const start = parseISO(appointment.starts_at)
  const end = parseISO(appointment.ends_at)

  // Short code: first 8 chars of token, grouped
  const tokenShort = `CONF-${appointment.cancel_token.substring(0, 4).toUpperCase()}-${appointment.cancel_token.substring(4, 8).toUpperCase()}`
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${appointment.cancel_token}`

  // Google Calendar URL
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name)}&dates=${format(start, "yyyyMMdd'T'HHmmss")}/${format(end, "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent(`Reservado en AGENDAYA`)}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Icon */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-[#6B21A8] flex items-center justify-center bg-[#F8F5FF] mb-4">
          <CheckCircle size={40} className="text-[#6B21A8]" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-gray-900">
          ¡CITA CONFIRMADA!
        </h1>
      </div>

      {/* Appointment Summary Card */}
      <div className="border-2 border-black bg-white shadow-[6px_6px_0px_#000] p-6 mb-4">
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#6B21A8]">
            RESUMEN DE TU CITA
          </p>
          <span className="text-xs font-body bg-gray-900 text-white px-2 py-1">
            ID: #{appointment.id.substring(0, 4).toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex items-start gap-2">
            <Scissors size={14} className="mt-0.5 text-[#6B21A8]" />
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Servicio</p>
              <p className="font-body font-semibold text-sm text-gray-900">{service.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarDays size={14} className="mt-0.5 text-[#6B21A8]" />
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Fecha</p>
              <p className="font-body font-semibold text-sm text-gray-900 capitalize">
                {format(start, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {employee && (
            <div className="flex items-start gap-2">
              <User size={14} className="mt-0.5 text-[#6B21A8]" />
              <div>
                <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Profesional</p>
                <p className="font-body font-semibold text-sm text-gray-900">{employee.full_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Clock size={14} className="mt-0.5 text-[#6B21A8]" />
            <div>
              <p className="text-xs font-heading uppercase tracking-wider text-gray-400">Hora</p>
              <p className="font-body font-semibold text-sm text-gray-900">
                {format(start, 'hh:mm a').toUpperCase()} — {format(end, 'hh:mm a').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button className="w-full border-2 border-black py-3 flex items-center justify-center gap-2 font-heading font-bold text-xs uppercase tracking-wider text-gray-900 hover:bg-gray-50 transition-colors">
            <MapPin size={14} />
            VER UBICACIÓN
          </button>
        </div>
      </div>

      {/* Cancel Token Card */}
      <div className="border-2 border-black bg-white p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-heading font-bold text-sm uppercase tracking-wide text-gray-900 mb-1">
            GESTIONAR CITA
          </p>
          <p className="font-body text-xs text-gray-500">
            Usa este código para cancelar o reprogramar sin login:
          </p>
        </div>
        <div className="text-right">
          <div className="border-2 border-dashed border-[#6B21A8] px-4 py-2 mb-1">
            <span className="font-heading font-bold text-sm text-[#6B21A8]">{tokenShort}</span>
          </div>
          <Link
            href={cancelUrl}
            className="text-xs font-body text-[#6B21A8] underline underline-offset-2"
          >
            Cancelar Cita Ahora
          </Link>
        </div>
      </div>

      {/* Calendar Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <a href={gcalUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="brutal" size="md" className="w-full text-xs">
            <CalendarDays size={14} />
            AÑADIR A GOOGLE CALENDAR
          </Button>
        </a>
        <Button variant="dark" size="md" className="w-full text-xs bg-gray-900 border-gray-900 shadow-[4px_4px_0px_#6B21A8]">
          <span className="font-bold">i05</span> AÑADIR A ICAL
        </Button>
      </div>
    </div>
  )
}
