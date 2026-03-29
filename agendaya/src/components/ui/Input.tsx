'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  dark?: boolean
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, dark = false, icon, className = '', ...props }, ref) => {
    const base = dark
      ? 'bg-[#1a1225] text-white border-[#A855F7]/40 focus:border-[#A855F7] placeholder:text-white/30'
      : 'bg-white text-gray-900 border-gray-300 focus:border-[#6B21A8] placeholder:text-gray-400'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            className={`text-xs font-heading font-bold uppercase tracking-wider ${
              dark ? 'text-white/60' : 'text-gray-600'
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-[#A855F7]' : 'text-gray-400'}`}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={[
              'w-full border rounded-none px-4 py-3 text-sm font-body',
              'transition-colors duration-150 outline-none',
              'focus:ring-2 focus:ring-[#6B21A8]/30',
              icon ? 'pl-10' : '',
              dark ? 'focus:ring-[#A855F7]/30' : '',
              error ? 'border-red-500' : base,
              className,
            ].join(' ')}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-xs font-body">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
