import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'teacher'
  avatar_url: string | null
}

export type ClassData = {
  id: string
  name: string
  description: string | null
  code: string
  teacher_id: string
}

export type Session = {
  id: string
  user_id: string
  type: 'buddy' | 'coach'
  topic: string | null
  messages: any
  video_url: string | null
  analysis: any
  created_at: string
}

export type ProgressScore = {
  id: string
  user_id: string
  session_id: string
  body_language: number | null
  eye_contact: number | null
  voice_modulation: number | null
  pace: number | null
  projection: number | null
  presence: number | null
  overall: number | null
  created_at: string
}
