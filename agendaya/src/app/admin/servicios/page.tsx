import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServicesManager from '@/components/admin/ServicesManager'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin/dashboard')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true })

  return <ServicesManager services={services ?? []} />
}
