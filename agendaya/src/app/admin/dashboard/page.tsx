import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarCheck, Clock, TrendingUp, Pencil } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()

  // Stats
  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', todayStart)
    .lte('starts_at', todayEnd)
    .neq('status', 'cancelled')

  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: monthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('starts_at', monthStart)
    .lte('starts_at', monthEnd)
    .neq('status', 'cancelled')

  // Today's appointments
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, status,
      client:clients(full_name),
      service:services(name)
    `)
    .gte('starts_at', todayStart)
    .lte('starts_at', todayEnd)
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: true })

  const statusColors: Record<string, 'success' | 'warning' | 'purple' | 'default'> = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'purple',
    cancelled: 'default',
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-2xl uppercase text-white mb-1">
          DASHBOARD STAFF
        </h1>
        <p className="font-body text-white/40 text-sm">
          Bienvenido de vuelta, {profile?.full_name ?? 'Usuario'}.
          {todayCount ? ` Tienes ${todayCount} citas programadas para hoy.` : ' No tienes citas para hoy.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="CITAS HOY"
          value={todayCount ?? 0}
          icon={<CalendarCheck size={24} />}
        />
        <StatCard
          label="PENDIENTES"
          value={pendingCount ?? 0}
          icon={<Clock size={24} />}
        />
        <StatCard
          label="TOTAL MES"
          value={monthCount ?? 0}
          icon={<TrendingUp size={24} />}
          accent
        />
      </div>

      {/* Today's appointments */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-white">
            CITAS DE HOY
          </h2>
          <Link href="/admin/citas" className="text-xs font-heading text-[#A855F7] hover:underline uppercase tracking-wide">
            VER CALENDARIO COMPLETO
          </Link>
        </div>

        {todayAppointments && todayAppointments.length > 0 ? (
          <div className="border-l-2 border-[#6B21A8] pl-4 space-y-2">
            {todayAppointments.map((apt) => {
              const client = apt.client as { full_name: string } | null
              const service = apt.service as { name: string } | null
              return (
                <div key={apt.id} className="flex items-center gap-4 bg-[#1a1225] border border-white/5 p-4">
                  <div className="w-2 h-2 rounded-full bg-[#6B21A8] flex-shrink-0" />
                  <span className="text-[#A855F7] text-xs font-heading font-bold w-20 flex-shrink-0">
                    {format(new Date(apt.starts_at), 'hh:mm a').toUpperCase()}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-[#6B21A8]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-heading text-[#A855F7] font-bold">
                      {client?.full_name?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-body font-semibold truncate">
                      {client?.full_name ?? 'Cliente'}
                    </p>
                    <p className="text-white/40 text-xs font-heading uppercase tracking-wide truncate">
                      {service?.name ?? 'Servicio'}
                    </p>
                  </div>

                  <Badge variant={statusColors[apt.status] ?? 'default'} className="text-[10px]">
                    {apt.status}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/citas/${apt.id}`}>
                      <button className="text-white/30 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                    </Link>
                    <Link href={`/admin/citas/${apt.id}`}>
                      <button className="border border-white/20 text-white/60 hover:text-white hover:border-white text-[10px] font-heading px-3 py-1.5 uppercase tracking-wide transition-colors">
                        DETALLES
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#1a1225] border border-white/5 p-8 text-center">
            <p className="text-white/30 font-body text-sm">No hay citas programadas para hoy.</p>
            <Link href="/admin/citas/nueva" className="mt-3 inline-block">
              <Button variant="dark" size="sm">CREAR CITA MANUAL</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
