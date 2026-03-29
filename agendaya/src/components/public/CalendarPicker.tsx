'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  addMonths,
  subMonths,
  startOfDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPickerProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

export default function CalendarPicker({ selectedDate, onSelectDate }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="bg-white border-2 border-black p-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-[#F8F5FF] transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} className="text-gray-700" />
        </button>
        <span className="font-heading font-bold text-sm uppercase tracking-wider text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-[#F8F5FF] transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-heading font-bold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isPastDay = isPast(startOfDay(day)) && !isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPastDay && isCurrentMonth && onSelectDate(day)}
              disabled={isPastDay || !isCurrentMonth}
              className={[
                'aspect-square flex items-center justify-center text-sm font-body transition-colors',
                !isCurrentMonth ? 'text-gray-200' : '',
                isPastDay || !isCurrentMonth ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#F8F5FF]',
                isSelected ? 'bg-[#6B21A8] text-white font-bold rounded-full hover:bg-[#6B21A8]' : '',
                isToday(day) && !isSelected ? 'border border-[#6B21A8] text-[#6B21A8] font-bold' : '',
                !isSelected && !isPastDay && isCurrentMonth ? 'text-gray-800' : '',
              ].join(' ')}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
