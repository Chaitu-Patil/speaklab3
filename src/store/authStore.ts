import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

async function loadOrCreateProfile(user: User): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return existing

  // Profile not yet created by trigger — upsert it
  const { data: created } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? null,
      role: user.user_metadata?.role === 'teacher' ? 'teacher' : 'student',
    }, { onConflict: 'id' })
    .select()
    .maybeSingle()

  return created
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  initialize: async () => {
    if (get().initialized) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await loadOrCreateProfile(session.user)
        set({ user: session.user, session, profile, loading: false, initialized: true })
      } else {
        set({ loading: false, initialized: true })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadOrCreateProfile(session.user)
          set({ user: session.user, session, profile })
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, session: null })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, initialized: true })
    }
  },
}))
