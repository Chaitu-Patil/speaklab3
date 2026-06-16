import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#1a1a1a] text-[#666] border border-[#2a2a2a]',
    primary: 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20',
    accent: 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20',
    warning: 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px]',
    md: 'px-2 py-1 text-xs',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
