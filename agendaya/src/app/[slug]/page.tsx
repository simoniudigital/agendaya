import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServiceCard from '@/components/public/ServiceCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default async function BusinessLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('business_settings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!settings) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="pt-12 pb-10 border-b-2 border-black">
        <div className="inline-block bg-[#6B21A8] text-white text-xs font-heading font-bold px-3 py-1 uppercase tracking-widest mb-6">
          BOOKING 2.0
        </div>
        <h1 className="font-heading font-black text-5xl md:text-6xl text-gray-900 leading-none mb-2">
          RESERVA TU
          <br />
          CITA
        </h1>
        <h2 className="font-heading font-black text-5xl md:text-6xl text-[#6B21A8] leading-none mb-6">
          EN SEGUNDOS
        </h2>
        <p className="font-body text-gray-600 text-sm max-w-sm mb-8">
          Simplificamos tu agenda con una experiencia brutalista y minimalista. Sin fricciones, solo estilo.
        </p>
        <Link href="#servicios">
          <Button variant="brutal" size="lg">
            AGENDAR AHORA
          </Button>
        </Link>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-10">
        <h2 className="font-heading font-bold text-base uppercase tracking-widest text-gray-900 mb-6 pb-3 border-b-2 border-black">
          SERVICIOS
        </h2>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} slug={slug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 font-body">
            <p>No hay servicios disponibles en este momento.</p>
          </div>
        )}
      </section>
    </div>
  )
}
