import { motion } from 'framer-motion'

interface ProgressChartProps {
  data: {
    label: string
    value: number
    max?: number
  }[]
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = Math.min(100, (item.value / (item.max || 10)) * 100)
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666]">{item.label}</span>
              <span className="text-xs font-medium text-[#aaa]">{item.value.toFixed(1)}</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="h-full rounded-full bg-[#f97316]"
                style={{ opacity: 0.4 + (percentage / 100) * 0.6 }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
