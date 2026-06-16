import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, MessageSquare, Video, Info } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/appStore'
import Sidebar from './Sidebar'
import Logo from './Logo'

interface LayoutProps {
  children: ReactNode
}

const topNavLinks = [
  { name: 'SpeakBuddy', href: '/buddy', icon: MessageSquare },
  { name: 'SpeakCoach', href: '/coach', icon: Video },
  { name: 'About', href: '/about', icon: Info },
]

export default function Layout({ children }: LayoutProps) {
  const { profile } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-[#080808]">
      {profile && <Sidebar />}

      {/* Top nav bar */}
      <motion.header
        initial={false}
        animate={{ marginLeft: profile && sidebarOpen ? 220 : 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed top-0 right-0 left-0 z-20 h-12 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-xl flex items-center px-4"
      >
        {/* Mobile menu + logo when sidebar closed */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors"
          >
            <Menu className="w-4 h-4 text-[#555]" />
          </button>
          <Logo />
        </div>

        <div className="flex-1" />

        {/* Top nav links — always visible */}
        <nav className="flex items-center gap-1">
          {topNavLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-100 ${
                  isActive
                    ? 'bg-[#f97316]/10 text-[#f97316]'
                    : 'text-[#555] hover:text-[#ccc] hover:bg-[#141414]'
                }`
              }
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.name}
            </NavLink>
          ))}
        </nav>
      </motion.header>

      <motion.main
        initial={false}
        animate={{ marginLeft: profile && sidebarOpen ? 220 : 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="min-h-screen pt-12"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
