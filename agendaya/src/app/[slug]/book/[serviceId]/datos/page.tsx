import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientDataForm from '@/components/public/ClientDataForm'
import BookingSummary from '@/components/public/BookingSummary'

export default async function ClientDataPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; serviceId: string }>
  searchParams: Promise<{ starts?: string; ends?: string }>
}) {
  const { slug, serviceId } = await params
  const { starts, ends } = await searchParams

  if (!starts || !ends) redirect(`/${slug}/book/${serviceId}`)

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
      <h1 className="font-heading font-black text-3xl uppercase text-gray-900 mb-1">
        Tus Datos
      </h1>
      <p className="font-body text-gray-500 text-sm mb-8">
        Completa la información para finalizar tu reserva.
      </p>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form — 3 cols */}
        <div className="md:col-span-3">
          <ClientDataForm
            service={service}
            startsAt={starts}
            endsAt={ends}
            slug={slug}
          />
        </div>

        {/* Summary — 2 cols */}
        <div className="md:col-span-2">
          <BookingSummary
            service={service}
            startsAt={starts}
            endsAt={ends}
          />
        </div>
      </div>
    </div>
  )
}
