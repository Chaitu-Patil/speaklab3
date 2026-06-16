import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 28 }: LogoProps) {
  return (
    <Link to="/" className={`flex-shrink-0 ${className}`} aria-label="SpeakLab home">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flask body — conical Erlenmeyer shape */}
        <path
          d="M21 4 L21 11 L28 27 Q28 30 25 30 H7 Q4 30 4 27 L11 11 L11 4"
          stroke="#f97316"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Neck mouth line */}
        <line
          x1="11" y1="4" x2="21" y2="4"
          stroke="#f97316"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Soundwave equalizer bars inside the flask */}
        {/* Left bar — medium */}
        <rect x="10" y="21.5" width="2.5" height="5.5" rx="1.2" fill="#f97316" opacity="0.5" />
        {/* Center bar — tallest */}
        <rect x="14.75" y="17" width="2.5" height="10" rx="1.2" fill="#f97316" />
        {/* Right bar — short */}
        <rect x="19.5" y="23" width="2.5" height="4" rx="1.2" fill="#f97316" opacity="0.5" />
      </svg>
    </Link>
  )
}
