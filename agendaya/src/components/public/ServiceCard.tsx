import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { Service } from '@/types/database'

interface ServiceCardProps {
  service: Service
  slug: string
}

export default function ServiceCard({ service, slug }: ServiceCardProps) {
  return (
    <div className="border-2 border-black bg-white flex flex-col overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-[#F8F5FF] to-[#e9d5ff] flex items-center justify-center overflow-hidden">
        {service.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl font-heading font-black text-[#6B21A8]/20">
            {service.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-gray-900">
            {service.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-gray-500">
            <Clock size={12} />
            <span className="text-xs font-body">{service.duration_min} min</span>
          </div>
          {service.price > 0 && (
            <p className="text-xs font-body text-gray-600 mt-0.5">
              ${service.price.toFixed(2)}
            </p>
          )}
        </div>

        <Link
          href={`/${slug}/book/${service.id}`}
          className="mt-auto inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#6B21A8] text-white text-xs font-heading font-bold uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-75"
        >
          ELEGIR
        </Link>
      </div>
    </div>
  )
}
