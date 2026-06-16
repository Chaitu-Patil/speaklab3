import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, Briefcase, GraduationCap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Logo from '../components/ui/Logo'

type AuthView = 'signin' | 'signup' | 'forgot-password' | 'check-email'

function parseAuthError(err: unknown): string {
  if (!err) return 'Something went wrong. Please try again.'
  if (typeof err === 'string') return err || 'Something went wrong. Please try again.'
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    const msg = e.message
    if (typeof msg === 'string' && msg.trim() && msg !== '{}') return msg
    const status = e.status ?? e.statusCode
    if (status === 422) return 'Invalid email or password format.'
    if (status === 429) return 'Too many attempts. Please wait a moment.'
    if (status === 400) return 'Invalid request. Check your email and password.'
  }
  return 'Something went wrong. Please try again.'
}

export default function Auth() {
  const [view, setView] = useState<AuthView>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = parseAuthError(error)
        if (msg.includes('Email not confirmed') || msg.includes('not confirmed')) {
          setError('Please verify your email before signing in. Check your inbox.')
        } else if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
          setError('Incorrect email or password.')
        } else {
          setError(msg)
        }
      }
    } catch (err) {
      setError(parseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), role },
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) {
        setError(parseAuthError(error))
      } else if (data.session) {
        // Auto-confirmed — onAuthStateChange in authStore handles navigation
        return
      } else if (data.user) {
        // Email confirmation required
        setView('check-email')
      } else {
        setError('Signup failed. Please try again.')
      }
    } catch (err) {
      setError(parseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) { setError('Please enter your email address.'); return }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      })
      if (error) {
        setError(parseAuthError(error))
      } else {
        setView('check-email')
      }
    } catch (err) {
      setError(parseAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const switchView = (next: AuthView) => {
    setError(null)
    setView(next)
  }

  const renderContent = () => {
    switch (view) {
      case 'signin':
        return (
          <motion.form
            key="signin"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSignIn}
            className="space-y-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[30px] text-[#444] hover:text-[#888] transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchView('forgot-password')}
                className="text-xs text-[#555] hover:text-[#888] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
            <p className="text-center text-xs text-[#444]">
              No account?{' '}
              <button
                type="button"
                onClick={() => switchView('signup')}
                className="text-[#f97316] hover:text-[#fb923c] font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </motion.form>
        )

      case 'signup':
        return (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[30px] text-[#444] hover:text-[#888] transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#555]">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-all duration-100 text-sm ${
                    role === 'student'
                      ? 'border-[#f97316]/40 bg-[#f97316]/5 text-[#ddd]'
                      : 'border-[#1f1f1f] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-all duration-100 text-sm ${
                    role === 'teacher'
                      ? 'border-[#f97316]/40 bg-[#f97316]/5 text-[#ddd]'
                      : 'border-[#1f1f1f] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]'
                  }`}
                >
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  Teacher
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
            <button
              type="button"
              onClick={() => switchView('signin')}
              className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] mx-auto transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </button>
          </motion.form>
        )

      case 'forgot-password':
        return (
          <motion.form
            key="forgot"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleForgotPassword}
            className="space-y-4"
          >
            <p className="text-xs text-[#555]">
              Enter your email and we'll send a reset link.
            </p>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
            <button
              type="button"
              onClick={() => switchView('signin')}
              className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#888] mx-auto transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </button>
          </motion.form>
        )

      case 'check-email':
        return (
          <motion.div
            key="check-email"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-[#f97316]" />
            </div>
            <h3 className="text-sm font-medium text-[#ddd] mb-2">Check your email</h3>
            <p className="text-xs text-[#555] mb-6">
              We sent a link to <span className="text-[#aaa]">{email}</span>
            </p>
            <p className="text-[11px] text-[#444]">
              Didn't get it? Check spam or{' '}
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="text-[#f97316] hover:text-[#fb923c] transition-colors"
              >
                try again
              </button>
            </p>
          </motion.div>
        )

      default:
        return null
    }
  }

  const titles: Record<AuthView, { title: string; subtitle: string }> = {
    signin: { title: 'Welcome back', subtitle: 'Sign in to continue' },
    signup: { title: 'Create account', subtitle: 'Start your journey' },
    'forgot-password': { title: 'Reset password', subtitle: "We'll help you get back in" },
    'check-email': { title: '', subtitle: '' },
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-5">
            <Logo size={36} />
          </div>
          {view !== 'check-email' && (
            <>
              <h1 className="text-base font-semibold text-[#eee] mb-1">{titles[view].title}</h1>
              <p className="text-xs text-[#444]">{titles[view].subtitle}</p>
            </>
          )}
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          {error && (
            <div className="mb-4 p-2.5 bg-red-500/5 border border-red-500/15 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
