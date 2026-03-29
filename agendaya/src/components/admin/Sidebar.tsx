'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Package, Settings, LogOut, CalendarCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',       label: 'DASHBOARD',        icon: <LayoutDashboard size={18} /> },
  { href: '/admin/citas',           label: 'CITAS (AGENDA)',   icon: <CalendarDays size={18} /> },
  { href: '/admin/clientes',        label: 'CLIENTES',         icon: <Users size={18} /> },
  { href: '/admin/servicios',       label: 'SERVICIOS',        icon: <Package size={18} />, adminOnly: true },
  { href: '/admin/configuracion',   label: 'CONFIGURACIÓN',    icon: <Settings size={18} />, adminOnly: true },
]

interface SidebarProps {
  userRole: UserRole
  userName: string
  userAvatar?: string | null
}

export default function Sidebar({ userRole, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  return (
    <aside className="w-[260px] min-h-screen bg-[#0F0A14] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#6B21A8] flex items-center justify-center rounded-sm border border-[#A855F7]/30">
            <CalendarCheck size={20} className="text-white" />
          </div>
          <span className="font-heading font-bold text-sm tracking-widest text-white uppercase">
            AGENDAYA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-4 py-3 text-xs font-heading font-bold uppercase tracking-wider transition-colors',
                isActive
                  ? 'bg-[#6B21A8] text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-sm mb-2">
          <div className="w-8 h-8 bg-[#6B21A8]/40 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-heading font-bold text-[#A855F7]">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-body font-semibold truncate">{userName}</p>
            <p className="text-[#A855F7] text-[10px] font-heading uppercase tracking-wider">
              {userRole === 'admin' ? 'ADMINISTRADOR' : 'EMPLEADO'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-heading font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  )
}
