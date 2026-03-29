import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingCalendar from '@/components/public/BookingCalendar'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string; serviceId: string }>
}) {
  const { slug, serviceId } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('is_active', true)
    .single()

  if (!service) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-heading font-black text-3xl md:text-4xl uppercase text-gray-900 mb-1">
        SELECCIONA FECHA Y HORA
      </h1>
      <p className="font-body text-gray-500 text-sm mb-8">
        {service.name} · {service.duration_min} min
        {service.price > 0 ? ` · $${service.price.toFixed(2)}` : ''}
      </p>

      <BookingCalendar service={service} slug={slug} />
    </div>
  )
}
