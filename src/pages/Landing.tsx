import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Video, Sparkles, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'

const features = [
  {
    icon: MessageSquare,
    title: 'SpeakBuddy',
    subtitle: 'Your friendly AI coach',
    description: 'Tell it what freezes you up. Get an actual plan back: drills, scripts, and follow-ups.',
    gradient: 'from-orange-500/20 to-orange-600/5'
  },
  {
    icon: Video,
    title: 'SpeakCoach',
    subtitle: 'Performance analysis',
    description: 'Upload a video of yourself speaking. Get scored across six delivery dimensions in seconds.',
    gradient: 'from-[#f97316]/20 to-[#f97316]/5'
  },
]

const steps = [
  { num: '01', title: 'Name your problem', desc: 'First 30 seconds? Filler words? Eye contact? Tell SpeakBuddy what messes you up.' },
  { num: '02', title: 'Practice with purpose', desc: 'Get short, structured drills. Two minutes a day beats one hour the night before.' },
  { num: '03', title: 'Record. Score. Repeat.', desc: 'Upload a clip to SpeakCoach. Compare it to last week. Watch the numbers move.' },
]

const benefits = [
  { icon: Zap, title: 'Instant feedback', desc: 'Get analysis in seconds, not days' },
  { icon: Shield, title: 'Private by default', desc: 'Your practice videos stay yours' },
  { icon: BarChart3, title: 'Track progress', desc: 'See improvement over time' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-12">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/about" className="px-3 py-1.5 text-xs font-medium text-[#555] hover:text-[#ccc] hover:bg-[#141414] rounded-md transition-all duration-100">About</Link>
              <Link to="/auth" className="px-3 py-1.5 text-xs font-medium text-[#555] hover:text-[#ccc] hover:bg-[#141414] rounded-md transition-all duration-100 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />SpeakBuddy
              </Link>
              <Link to="/auth" className="px-3 py-1.5 text-xs font-medium text-[#555] hover:text-[#ccc] hover:bg-[#141414] rounded-md transition-all duration-100 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />SpeakCoach
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 pb-20 px-6 lg:px-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-[#f97316]/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-xs text-surface-500 mb-8">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Free for students and teachers</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-4xl md:text-5xl font-bold text-surface-50 mb-5 leading-[1.1] tracking-tight"
          >
            Public speaking is a craft,
            <br />
            <span className="text-surface-400">not a talent.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base text-surface-500 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Two personalized AI tools. Talk it out with{' '}
            <span className="text-orange-400">SpeakBuddy</span> or upload a video to{' '}
            <span className="text-[#f97316]">SpeakCoach</span> when you're ready for honest, scored feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">Learn More</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group relative p-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#2a2a2a] transition-colors duration-200"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`inline-flex p-2.5 rounded-lg mb-4 bg-[#f97316]/10`}>
                    <feature.icon className={`w-5 h-5 text-[#f97316]`} />
                  </div>
                  <h3 className="text-lg font-semibold text-surface-100 mb-1">{feature.title}</h3>
                  <p className="text-xs text-surface-600 mb-3">{feature.subtitle}</p>
                  <p className="text-sm text-surface-500 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-surface-50 mb-3">Simple by design</h2>
            <p className="text-surface-500 text-sm">The best feedback is specific, kind, and actionable.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-orange-400 font-mono text-sm font-medium mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-medium text-surface-200 mb-2">{step.title}</h3>
                <p className="text-sm text-surface-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-surface-50 mb-3">Six dimensions of delivery</h2>
            <p className="text-surface-500 text-sm">Each dimension gets a score, one strength, one fix, and a drill for the week.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2">
            {['Body Language', 'Eye Contact', 'Voice Modulation', 'Pace', 'Projection', 'Presence'].map((dim, i) => (
              <motion.div
                key={dim}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-xs text-surface-400"
              >
                {dim}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-[#1a1a1a] mb-3">
                  <benefit.icon className="w-4 h-4 text-surface-500" />
                </div>
                <h3 className="text-sm font-medium text-surface-200 mb-1">{benefit.title}</h3>
                <p className="text-xs text-surface-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-surface-50 mb-3">Ready to find your voice?</h2>
          <p className="text-surface-500 text-sm mb-6">
            Just two personalized AI tools made by a student who got tired of being scared of presentations.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-[#1a1a1a] py-6 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-surface-700">Made with love for students everywhere</p>
        </div>
      </footer>
    </div>
  )
}
