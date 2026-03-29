import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeAvailableSlots } from '@/lib/availability'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'date and serviceId are required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch service duration
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('duration_min')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single()

  if (serviceError || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // Fetch business hours for the weekday (0=Sun, 6=Sat)
  const weekday = new Date(date + 'T12:00:00').getDay()
  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('weekday', weekday)
    .single()

  // Fetch existing appointments for that day
  const dayStart = `${date}T00:00:00.000Z`
  const dayEnd = `${date}T23:59:59.999Z`

  const { data: booked } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd)
    .not('status', 'eq', 'cancelled')

  const slots = computeAvailableSlots({
    date,
    openTime: hours?.open_time ?? null,
    closeTime: hours?.close_time ?? null,
    isOpen: hours?.is_open ?? false,
    slotDurationMin: service.duration_min,
    bookedRanges: booked ?? [],
  })

  return NextResponse.json(
    { slots },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
