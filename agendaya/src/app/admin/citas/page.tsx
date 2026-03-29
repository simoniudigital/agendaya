import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import WeekCalendar from '@/components/admin/WeekCalendar'
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import type { AppointmentWithDetails } from '@/types/database'

export default async function CitasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const now = new Date()
  const monthStart = subMonths(startOfMonth(now), 1).toISOString()
  const monthEnd = addMonths(endOfMonth(now), 2).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      service:services(*),
      employee:profiles(*)
    `)
    .gte('starts_at', monthStart)
    .lte('starts_at', monthEnd)
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: true })

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="font-heading font-black text-2xl uppercase text-white">CITAS (AGENDA)</h1>
          <p className="font-body text-white/40 text-sm mt-1">Vista semanal y diaria de todas las citas.</p>
        </div>
        <Link href="/admin/citas/nueva">
          <Button variant="dark" size="sm">
            <Plus size={14} />
            NUEVA CITA
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <WeekCalendar appointments={(appointments as AppointmentWithDetails[]) ?? []} />
      </div>
    </div>
  )
}
