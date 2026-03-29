interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple'
  className?: string
}

const variantClasses: Record<string, string> = {
  default:  'bg-gray-100 text-gray-700',
  success:  'bg-emerald-100 text-emerald-700',
  warning:  'bg-amber-100 text-amber-700',
  error:    'bg-red-100 text-red-700',
  purple:   'bg-[#6B21A8] text-white',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 text-xs font-heading font-bold uppercase tracking-wider rounded-none',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
