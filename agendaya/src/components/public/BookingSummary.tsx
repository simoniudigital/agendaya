import { Scissors, CalendarDays, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Service } from '@/types/database'

interface BookingSummaryProps {
  service: Service
  startsAt: string
  endsAt: string
  dark?: boolean
}

export default function BookingSummary({ service, startsAt, endsAt, dark }: BookingSummaryProps) {
  const start = parseISO(startsAt)
  const end = parseISO(endsAt)

  const bg = dark ? 'bg-[#1a1225] border-[#A855F7]/30' : 'bg-[#F8F5FF] border-[#6B21A8]/20'
  const textSecondary = dark ? 'text-white/50' : 'text-gray-500'
  const textPrimary = dark ? 'text-white' : 'text-gray-900'
  const accentColor = dark ? 'text-[#A855F7]' : 'text-[#6B21A8]'

  return (
    <div className={`border ${bg} p-5 rounded-sm`}>
      <p className={`text-xs font-heading font-bold uppercase tracking-wider ${accentColor} mb-4`}>
        Resumen de Reserva
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Scissors size={16} className={`mt-0.5 ${accentColor}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${textSecondary} font-heading`}>Servicio</p>
            <p className={`font-body font-semibold text-sm ${textPrimary}`}>{service.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarDays size={16} className={`mt-0.5 ${accentColor}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${textSecondary} font-heading`}>Fecha</p>
            <p className={`font-body font-semibold text-sm ${textPrimary} capitalize`}>
              {format(start, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={16} className={`mt-0.5 ${accentColor}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${textSecondary} font-heading`}>Hora</p>
            <p className={`font-body font-semibold text-sm ${textPrimary}`}>
              {format(start, 'hh:mm a').toUpperCase()} — {format(end, 'hh:mm a').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {service.price > 0 && (
        <>
          <hr className={`my-4 border-dashed ${dark ? 'border-white/10' : 'border-gray-200'}`} />
          <div className="flex justify-between items-center">
            <span className={`text-xs font-heading uppercase tracking-wider ${textSecondary}`}>Total</span>
            <span className={`font-heading font-bold text-2xl ${accentColor}`}>
              ${service.price.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
