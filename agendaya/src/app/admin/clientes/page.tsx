import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Phone, Mail } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  // Get appointment counts per client
  const { data: appointmentCounts } = await supabase
    .from('appointments')
    .select('client_id')
    .neq('status', 'cancelled')

  const countMap = new Map<string, number>()
  appointmentCounts?.forEach((a) => {
    countMap.set(a.client_id, (countMap.get(a.client_id) ?? 0) + 1)
  })

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-heading font-black text-2xl uppercase text-white">CLIENTES</h1>
        <span className="bg-[#6B21A8]/30 text-[#A855F7] text-xs font-heading px-2 py-1">
          {clients?.length ?? 0} total
        </span>
      </div>

      {clients && clients.length > 0 ? (
        <div className="border border-white/5">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-[#1a1225] border-b border-white/5">
            {['NOMBRE', 'CONTACTO', 'CITAS', 'REGISTRO'].map((h) => (
              <div key={h} className={`text-xs font-heading uppercase tracking-wider text-white/30 ${h === 'NOMBRE' ? 'col-span-4' : h === 'CONTACTO' ? 'col-span-5' : 'col-span-2'}`}>
                {h}
              </div>
            ))}
          </div>

          {clients.map((client) => (
            <div key={client.id} className="grid grid-cols-12 px-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#6B21A8]/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-heading text-[#A855F7] font-bold">
                    {client.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-body font-semibold text-white text-sm truncate">{client.full_name}</span>
              </div>
              <div className="col-span-5 space-y-0.5">
                {client.email && (
                  <p className="text-white/40 text-xs flex items-center gap-1 font-body">
                    <Mail size={10} />{client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-white/40 text-xs flex items-center gap-1 font-body">
                    <Phone size={10} />{client.phone}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <span className="text-[#A855F7] font-heading font-bold text-sm">
                  {countMap.get(client.id) ?? 0}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-white/30 text-xs font-body">
                  {format(new Date(client.created_at), 'd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1225] border border-white/5 p-12 text-center">
          <Users size={32} className="text-white/20 mx-auto mb-3" />
          <p className="font-body text-white/30 text-sm">No hay clientes registrados aún.</p>
        </div>
      )}
    </div>
  )
}
