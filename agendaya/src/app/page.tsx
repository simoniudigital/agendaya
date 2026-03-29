import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('business_settings')
    .select('slug')
    .single()

  if (settings?.slug) {
    redirect(`/${settings.slug}`)
  }

  // Fallback: show login for setup
  redirect('/admin/login')
}
