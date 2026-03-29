import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ManualAppointmentForm from '@/components/admin/ManualAppointmentForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NuevaCitaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_min, price')
    .eq('is_active', true)
    .order('name')

  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, phone, email')
    .order('full_name')
    .limit(100)

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/citas" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-heading text-xs uppercase tracking-wider mb-6 transition-colors">
        <ArrowLeft size={14} />
        VOLVER A AGENDA
      </Link>

      <h1 className="font-heading font-black text-2xl uppercase text-white mb-1">
        NUEVA CITA MANUAL
      </h1>
      <p className="font-body text-white/40 text-sm mb-8">
        Crea una cita directamente desde el panel de administración.
      </p>

      <ManualAppointmentForm
        services={services ?? []}
        employees={employees ?? []}
        existingClients={clients ?? []}
      />
    </div>
  )
}
