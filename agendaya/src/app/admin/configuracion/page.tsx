import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BusinessSettingsForm from '@/components/admin/BusinessSettingsForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin/dashboard')

  const { data: settings } = await supabase
    .from('business_settings')
    .select('*')
    .single()

  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .order('weekday')

  return <BusinessSettingsForm settings={settings} hours={hours ?? []} />
}
