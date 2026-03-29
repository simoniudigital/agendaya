import { type NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET: preview the appointment before cancelling
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, status,
      service:services(name),
      client:clients(full_name)
    `)
    .eq('cancel_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 404 })
  }

  if (data.status === 'cancelled') {
    return NextResponse.json({ error: 'already_cancelled' }, { status: 410 })
  }

  return NextResponse.json({ appointment: data })
}

// POST: confirm cancellation
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createServiceRoleClient()

  // First fetch to check timing
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('id, starts_at, status')
    .eq('cancel_token', token)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 404 })
  }

  if (existing.status === 'cancelled') {
    return NextResponse.json({ error: 'already_cancelled' }, { status: 410 })
  }

  if (new Date(existing.starts_at) <= new Date()) {
    return NextResponse.json({ error: 'appointment_already_passed' }, { status: 410 })
  }

  // Cancel it
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('cancel_token', token)
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }

  return NextResponse.json({ success: true, appointmentId: data.id })
}
