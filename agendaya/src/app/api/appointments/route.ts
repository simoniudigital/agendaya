import { type NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { bookingSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { clientData, serviceId, employeeId, startsAt, endsAt, notes, sendReminder } = parsed.data
  const rawBody = body as Record<string, unknown>
  const supabase = createServiceRoleClient()

  // Support manual appointment creation with existing clientId
  if (rawBody._clientIdOverride && typeof rawBody._clientIdOverride === 'string') {
    const { data, error } = await supabase.rpc('book_appointment', {
      p_client_id: rawBody._clientIdOverride,
      p_service_id: serviceId,
      p_employee_id: employeeId,
      p_starts_at: startsAt,
      p_ends_at: endsAt,
      p_notes: notes || null,
      p_send_reminder: sendReminder,
    })
    if (error) {
      if (error.message.includes('SLOT_TAKEN')) return NextResponse.json({ error: 'slot_taken' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to book' }, { status: 500 })
    }
    return NextResponse.json({ appointment: data }, { status: 201 })
  }

  // Upsert client by email (or insert if no email)
  let clientId: string

  if (clientData.email) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientData.email)
      .single()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          full_name: clientData.full_name,
          phone: clientData.phone || null,
          email: clientData.email,
        })
        .select('id')
        .single()

      if (clientError || !newClient) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
      }
      clientId = newClient.id
    }
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        full_name: clientData.full_name,
        phone: clientData.phone || null,
        email: null,
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
    clientId = newClient.id
  }

  // Call atomic booking function (race-condition safe)
  const { data, error } = await supabase.rpc('book_appointment', {
    p_client_id: clientId,
    p_service_id: serviceId,
    p_employee_id: employeeId,
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_notes: notes || null,
    p_send_reminder: sendReminder,
  })

  if (error) {
    if (error.message.includes('SLOT_TAKEN')) {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 })
    }
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 })
  }

  return NextResponse.json({ appointment: data }, { status: 201 })
}
