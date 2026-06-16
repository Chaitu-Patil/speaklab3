interface ProgressRingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function ProgressRing({ value, max = 10, size = 'md', label }: ProgressRingProps) {
  const percentage = Math.min(100, (value / max) * 100)
  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const sizes = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-lg',
  }

  const opacity = 0.3 + (percentage / 100) * 0.7

  return (
    <div className={`relative ${sizes[size]} flex flex-col items-center`}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#1a1a1a"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="#f97316"
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            opacity,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-semibold text-[#ddd] ${textSizes[size]}`}>
          {value.toFixed(1)}
        </span>
      </div>
      {label && (
        <span className="mt-1.5 text-[11px] text-[#555] text-center">{label}</span>
      )}
    </div>
  )
}
