import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

interface PublicHeaderProps {
  slug: string
  businessName?: string
}

export default function PublicHeader({ slug, businessName = 'AGENDAYA' }: PublicHeaderProps) {
  return (
    <header className="border-b-2 border-black bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href={`/${slug}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6B21A8] flex items-center justify-center rounded-sm">
            <CalendarCheck size={18} className="text-white" />
          </div>
          <span className="font-heading font-bold text-sm tracking-widest uppercase text-gray-900">
            {businessName}
          </span>
        </Link>
      </div>
    </header>
  )
}
