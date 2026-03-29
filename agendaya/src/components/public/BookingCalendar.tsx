'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import CalendarPicker from './CalendarPicker'
import SlotGrid, { SlotHeader } from './SlotGrid'
import Button from '@/components/ui/Button'
import type { TimeSlot } from '@/lib/availability'
import type { Service } from '@/types/database'

interface BookingCalendarProps {
  service: Service
  slug: string
}

export default function BookingCalendar({ service, slug }: BookingCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true)
    setSelectedSlot(null)
    setError(null)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/availability?date=${dateStr}&serviceId=${service.id}`)
      if (!res.ok) throw new Error('Error al cargar disponibilidad')
      const data = await res.json()
      setSlots(data.slots)
    } catch {
      setError('No se pudo cargar la disponibilidad. Intenta de nuevo.')
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [service.id])

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, fetchSlots])

  const handleConfirm = () => {
    if (!selectedSlot) return
    const params = new URLSearchParams({
      starts: selectedSlot.isoStart,
      ends: selectedSlot.isoEnd,
    })
    router.push(`/${slug}/book/${service.id}/datos?${params.toString()}`)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <div>
        <CalendarPicker
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Slots */}
      <div className="border-2 border-black bg-white p-5">
        <SlotHeader />

        {!selectedDate ? (
          <p className="text-gray-400 font-body text-sm text-center py-8">
            Selecciona una fecha para ver los turnos disponibles.
          </p>
        ) : error ? (
          <div className="text-red-500 font-body text-sm text-center py-4">{error}</div>
        ) : (
          <>
            <SlotGrid
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              loading={loadingSlots}
            />

            {selectedSlot && (
              <div className="mt-5">
                <Button
                  variant="brutal"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                >
                  CONFIRMAR HORARIO →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
