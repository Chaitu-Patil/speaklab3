import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  MessageSquare,
  Video,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  GraduationCap,
  User,
  Info,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/appStore'
import Logo from './Logo'

const studentNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'SpeakBuddy', href: '/buddy', icon: MessageSquare },
  { name: 'SpeakCoach', href: '/coach', icon: Video },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Classes', href: '/classes', icon: Users },
  { name: 'About', href: '/about', icon: Info },
]

const teacherNav = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Classes', href: '/classes', icon: GraduationCap },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'About', href: '/about', icon: Info },
]

export default function Sidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()

  const navItems = profile?.role === 'teacher' ? teacherNav : studentNav

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed top-3.5 left-3.5 z-30 p-1.5 bg-[#0f0f0f] border border-[#1f1f1f] rounded-md lg:hidden transition-all duration-150 ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Menu className="w-4 h-4 text-[#666]" />
      </button>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 220 : 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed left-0 top-0 h-full bg-[#080808] z-40 overflow-hidden flex flex-col"
      >
        <div className="w-[220px] h-full flex flex-col border-r border-[#1a1a1a]">
          <div className="h-12 flex items-center justify-between px-3.5 border-b border-[#1a1a1a]">
            <Logo />
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-[#1a1a1a] rounded-md transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#444]" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all duration-100 ${
                    isActive
                      ? 'bg-[#f97316]/10 text-[#f97316]'
                      : 'text-[#555] hover:text-[#ccc] hover:bg-[#141414]'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="p-2 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-0.5">
              <div className="w-5 h-5 rounded-full bg-[#f97316] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-black">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#bbb] truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-[11px] text-[#444] truncate">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[#555] hover:text-[#f97316] hover:bg-[#141414] rounded-md text-sm font-medium transition-all duration-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
