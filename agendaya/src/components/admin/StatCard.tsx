interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: boolean
}

export default function StatCard({ label, value, icon, accent = false }: StatCardProps) {
  return (
    <div className="bg-[#1a1225] border border-white/5 p-5 flex justify-between items-start">
      <div>
        <p className="text-xs font-heading uppercase tracking-wider text-white/40 mb-2">{label}</p>
        <p className={`font-heading font-bold text-4xl ${accent ? 'text-[#A855F7]' : 'text-white'}`}>
          {value}
        </p>
      </div>
      <div className="text-[#A855F7]/60">{icon}</div>
    </div>
  )
}
