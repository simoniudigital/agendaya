'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AppointmentWithDetails } from '@/types/database'

interface WeekCalendarProps {
  appointments: AppointmentWithDetails[]
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 08:00–20:00
const APPOINTMENT_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-[#A855F7]',
]

function getColorForService(serviceId: string): string {
  let hash = 0
  for (let i = 0; i < serviceId.length; i++) {
    hash = serviceId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return APPOINTMENT_COLORS[Math.abs(hash) % APPOINTMENT_COLORS.length]
}

function getTopPercent(startsAt: string, dayStart: number = 8): number {
  const start = new Date(startsAt)
  const minutes = (start.getHours() - dayStart) * 60 + start.getMinutes()
  return Math.max(0, (minutes / (12 * 60)) * 100)
}

function getHeightPercent(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const minutes = (end.getTime() - start.getTime()) / 60000
  return Math.max(2, (minutes / (12 * 60)) * 100)
}

export default function WeekCalendar({ appointments }: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDay, setSelectedDay] = useState(new Date())

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Mon
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const displayDays = view === 'week' ? days : [selectedDay]

  const activeAppointments = appointments.filter((a) => a.status !== 'cancelled')

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="w-8 h-8 border border-[#A855F7]/30 text-white/60 hover:text-white hover:border-[#A855F7] flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-heading font-bold text-sm text-white uppercase tracking-wide border border-[#A855F7]/30 px-4 py-1.5">
            {format(weekStart, 'd MMM', { locale: es }).toUpperCase()} –{' '}
            {format(weekEnd, 'd MMM, yyyy', { locale: es }).toUpperCase()}
          </span>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="w-8 h-8 border border-[#A855F7]/30 text-white/60 hover:text-white hover:border-[#A855F7] flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex">
          {(['day', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                'px-4 py-2 text-xs font-heading font-bold uppercase tracking-wider border transition-colors',
                view === v
                  ? 'bg-[#6B21A8] text-white border-[#6B21A8]'
                  : 'bg-transparent text-white/40 border-white/10 hover:text-white',
              ].join(' ')}
            >
              {v === 'day' ? 'DÍA' : 'SEMANA'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto scrollbar-dark">
        <div className="flex">
          {/* Time gutter */}
          <div className="w-16 flex-shrink-0">
            <div className="h-10" /> {/* Header spacer */}
            {HOURS.map((h) => (
              <div key={h} className="h-16 flex items-start pt-1 pr-2">
                <span className="text-[10px] font-heading text-white/20 text-right w-full">
                  {h.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {displayDays.map((day) => {
            const dayAppointments = activeAppointments.filter((a) =>
              isSameDay(new Date(a.starts_at), day)
            )
            return (
              <div key={day.toISOString()} className="flex-1 min-w-0 border-l border-white/5">
                {/* Day header */}
                <div
                  className="h-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => { setSelectedDay(day); setView('day') }}
                >
                  <span className="text-[10px] font-heading text-white/40 uppercase tracking-wider">
                    {format(day, 'EEE', { locale: es }).toUpperCase()}
                  </span>
                  <span className={`text-sm font-heading font-bold ${isSameDay(day, new Date()) ? 'text-[#A855F7]' : 'text-white'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Time slots */}
                <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
                  {/* Hour lines */}
                  {HOURS.map((h) => (
                    <div key={h} className="absolute w-full border-t border-white/5" style={{ top: `${(h - 8) * 64}px` }} />
                  ))}

                  {/* Appointments */}
                  {dayAppointments.map((apt) => {
                    const topPct = getTopPercent(apt.starts_at)
                    const heightPct = getHeightPercent(apt.starts_at, apt.ends_at)
                    const color = getColorForService(apt.service_id)

                    return (
                      <Link key={apt.id} href={`/admin/citas/${apt.id}`}>
                        <div
                          className={`absolute left-1 right-1 ${color} border-2 border-[#A855F7] rounded-none p-1.5 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                          style={{
                            top: `${(topPct / 100) * HOURS.length * 64}px`,
                            height: `${Math.max(24, (heightPct / 100) * HOURS.length * 64)}px`,
                          }}
                        >
                          <p className="text-white text-[10px] font-heading font-bold leading-tight">
                            {format(new Date(apt.starts_at), 'HH:mm')} – {format(new Date(apt.ends_at), 'HH:mm')}
                          </p>
                          <p className="text-white text-[10px] font-body truncate">
                            {apt.client?.full_name ?? 'Cliente'}
                          </p>
                          <p className="text-white/70 text-[9px] font-body truncate">
                            {apt.service?.name ?? ''}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
