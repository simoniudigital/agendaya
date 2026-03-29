'use client'

import { Clock } from 'lucide-react'
import type { TimeSlot } from '@/lib/availability'

interface SlotGridProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  loading?: boolean
}

export default function SlotGrid({ slots, selectedSlot, onSelectSlot, loading }: SlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 font-body text-sm">
        No hay turnos disponibles para este día.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.isoStart === slot.isoStart
        return (
          <button
            key={slot.isoStart}
            onClick={() => slot.available && onSelectSlot(slot)}
            disabled={!slot.available}
            className={[
              'py-3 px-2 text-sm font-heading font-bold uppercase tracking-wide border-2 transition-all duration-75',
              slot.available
                ? isSelected
                  ? 'bg-[#6B21A8] text-white border-black shadow-[3px_3px_0px_#000] translate-x-0 translate-y-0'
                  : 'bg-white text-gray-900 border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] cursor-pointer'
                : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed',
            ].join(' ')}
          >
            {slot.time}
          </button>
        )
      })}
    </div>
  )
}

export function SlotHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Clock size={16} className="text-[#6B21A8]" />
      <span className="font-heading font-bold text-sm uppercase tracking-wider text-gray-900">
        Turnos Disponibles
      </span>
    </div>
  )
}
