import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  accent?: 'primary' | 'accent' | 'warning' | 'danger'
}

export default function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-[#555] mb-1">{title}</p>
          <p className="text-xl font-semibold text-[#ddd]">{value}</p>
          {subtitle && <p className="text-[11px] text-[#444] mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-[#1a1a1a] text-[#f97316]">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
