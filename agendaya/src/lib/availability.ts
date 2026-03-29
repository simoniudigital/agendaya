import { addMinutes, format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'

export interface TimeSlot {
  time: string       // "09:00 AM"
  isoStart: string   // ISO string
  isoEnd: string
  available: boolean
}

interface ComputeParams {
  date: string                                              // "YYYY-MM-DD"
  openTime: string | null | undefined                      // "09:00:00"
  closeTime: string | null | undefined                     // "18:00:00"
  isOpen: boolean
  slotDurationMin: number
  bookedRanges: { starts_at: string; ends_at: string }[]
}

export function computeAvailableSlots(params: ComputeParams): TimeSlot[] {
  if (!params.isOpen || !params.openTime || !params.closeTime) return []

  const [openH, openM] = params.openTime.split(':').map(Number)
  const [closeH, closeM] = params.closeTime.split(':').map(Number)

  const base = parseISO(params.date)

  let cursor = setMilliseconds(setSeconds(setMinutes(setHours(base, openH), openM), 0), 0)
  const closeTime = setMilliseconds(setSeconds(setMinutes(setHours(base, closeH), closeM), 0), 0)

  const slots: TimeSlot[] = []

  while (addMinutes(cursor, params.slotDurationMin) <= closeTime) {
    const slotEnd = addMinutes(cursor, params.slotDurationMin)

    const hasConflict = params.bookedRanges.some((b) => {
      const bStart = new Date(b.starts_at)
      const bEnd = new Date(b.ends_at)
      return cursor < bEnd && slotEnd > bStart
    })

    // Skip past slots
    const now = new Date()
    const isPast = cursor < now

    slots.push({
      time: format(cursor, 'hh:mm a').toUpperCase(),
      isoStart: cursor.toISOString(),
      isoEnd: slotEnd.toISOString(),
      available: !hasConflict && !isPast,
    })

    cursor = slotEnd
  }

  return slots
}
