import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login page doesn't need the sidebar
  return <AdminLayoutInner>{children}</AdminLayoutInner>
}

async function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-[#0F0A14]">
      <Sidebar
        userRole={profile?.role ?? 'employee'}
        userName={profile?.full_name ?? user.email ?? 'Usuario'}
        userAvatar={profile?.avatar_url}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
