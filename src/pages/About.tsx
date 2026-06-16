import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Award, Trophy, Mic, Users, Code } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
})

const accolades = [
  {
    icon: Award,
    title: 'US Navy Recognition',
    subtitle: 'WSSEF — Plasma Physics',
    description:
      'Received recognition from the United States Navy for a plasma physics research project presented at the Washington State Science and Engineering Fair.',
  },
  {
    icon: Trophy,
    title: 'International Finalist',
    subtitle: 'Future Problem Solvers — Storytelling',
    description:
      'Competed as an international finalist in the Storytelling division of Future Problem Solvers, representing original narrative work on a global stage.',
  },
  {
    icon: Mic,
    title: '1st Place — Area Speech Contest',
    subtitle: 'Bellevue Toastmasters',
    description:
      'Won first place at the Bellevue Toastmasters Area Speech Contest, competing against experienced speakers across multiple clubs.',
  },
  {
    icon: Users,
    title: 'ASB Board Member',
    subtitle: "Odle Middle School — '26–'27",
    description:
      'Elected to the Associated Student Body board at Odle, taking on a leadership role in school-wide programming and student representation.',
  },
  {
    icon: Code,
    title: 'Web Dev & Python',
    subtitle: 'Full-stack builder',
    description:
      'Fluent in React, TypeScript, and Python. Built SpeakLab end-to-end — backend, AI integrations, database, and UI — as a solo developer.',
  },
]

export default function About() {
  const { profile } = useAuthStore()

  return (
    <div className="max-w-2xl mx-auto py-4">
      {!profile && (
        <motion.div {...fade()}>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </motion.div>
      )}

      <motion.div {...fade(0.05)} className="space-y-1 mb-8">
        <p className="text-xs text-[#444] uppercase tracking-widest font-medium">About the Founder</p>
        <h1 className="text-2xl font-bold text-[#eee] leading-tight">
          Built by a student.<br />For students.
        </h1>
      </motion.div>

      <motion.div {...fade(0.1)} className="space-y-4 text-sm text-[#555] leading-[1.8] mb-10">
        <p>
          I'm a middle schooler from Bellevue, WA. I built SpeakLab because I know firsthand how
          much public speaking matters — and how hard it is to get real, actionable feedback without
          a $300/hour coach. So I made one.
        </p>
        <p>
          Between competitive science fairs, speech contests, and student government, I've spent a
          lot of time in front of audiences. Every credential below taught me something different
          about what it takes to communicate well under pressure — and what students actually need
          to get better.
        </p>
      </motion.div>

      <motion.div {...fade(0.15)} className="space-y-3 mb-10">
        {accolades.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 + i * 0.06 }}
            className="flex gap-4 p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl hover:border-[#2a2a2a] transition-colors"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-[#f97316]/10 border border-[#f97316]/20 rounded-lg flex items-center justify-center">
              <item.icon className="w-4 h-4 text-[#f97316]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                <span className="text-sm font-medium text-[#ddd]">{item.title}</span>
                <span className="text-xs text-[#444]">{item.subtitle}</span>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {!profile && (
        <motion.div {...fade(0.5)} className="pt-6 border-t border-[#1a1a1a]">
          <p className="text-xs text-[#444] mb-4">Ready to get better at speaking?</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#fb923c] text-black text-xs font-semibold rounded-lg transition-colors"
          >
            Get started — it's free
          </Link>
        </motion.div>
      )}
    </div>
  )
}
