import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  animate?: boolean
}

export default function Card({ children, className = '', hoverable, onClick, animate = true }: CardProps) {
  const Wrapper = animate ? motion.div : 'div'
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.15 },
      }
    : {}

  return (
    <Wrapper
      className={`
        bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-5
        ${hoverable ? 'hover:border-[#2a2a2a] transition-colors duration-150 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </Wrapper>
  )
}
