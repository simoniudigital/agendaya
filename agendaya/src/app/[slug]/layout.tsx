import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PublicHeader from '@/components/public/PublicHeader'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_settings')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: data?.name ? `${data.name} | AGENDAYA` : 'AGENDAYA',
  }
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('business_settings')
    .select('name')
    .eq('slug', slug)
    .single()

  return (
    <div className="min-h-screen bg-[#F8F5FF] font-body">
      <PublicHeader slug={slug} businessName={settings?.name ?? 'AGENDAYA'} />
      <main>{children}</main>
    </div>
  )
}
