'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brutal' | 'brutal-purple' | 'ghost' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<string, string> = {
  brutal:
    'bg-[#6B21A8] text-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
  'brutal-purple':
    'bg-white text-[#6B21A8] border-2 border-[#6B21A8] shadow-[4px_4px_0px_#6B21A8] hover:shadow-[2px_2px_0px_#6B21A8] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
  ghost:
    'bg-transparent text-current border-2 border-current hover:bg-current/10',
  dark:
    'bg-[#1a1225] text-white border-2 border-[#A855F7] shadow-[4px_4px_0px_#A855F7] hover:shadow-[2px_2px_0px_#A855F7] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'brutal', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center gap-2',
          'font-heading font-bold uppercase tracking-widest',
          'rounded-none transition-all duration-75',
          'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
