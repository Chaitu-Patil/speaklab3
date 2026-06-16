import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Video, ChevronRight, Sparkles, Target, BookOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase, Session, ProgressScore, ClassData } from '../lib/supabase'
import Card from '../components/ui/Card'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressChart from '../components/ui/ProgressChart'
import Badge from '../components/ui/Badge'

export default function StudentDashboard() {
  const { profile } = useAuthStore()
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [scores, setScores] = useState<ProgressScore[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return

      try {
        const [sessionsRes, scoresRes, classesRes] = await Promise.all([
          supabase
            .from('speaking_sessions')
            .select('id, type, topic, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('progress_scores')
            .select('overall, created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: true })
            .limit(10),
          supabase
            .from('class_memberships')
            .select('classes(id, name, code)')
            .eq('user_id', profile.id),
        ])

        setRecentSessions(sessionsRes.data || [])
        setScores(scoresRes.data || [])
        setClasses((classesRes.data?.map((m: any) => m.classes).filter(Boolean) || []) as unknown as ClassData[])

        if (scoresRes.data && scoresRes.data.length > 0) {
          const avg = scoresRes.data.reduce((sum, s) => sum + (s.overall || 0), 0) / scoresRes.data.length
          setOverallScore(avg)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [profile])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  const scoreData = scores.slice(-6).map((s, i) => ({
    label: `W${i + 1}`,
    value: s.overall || 0,
  }))

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs text-surface-600 mb-1">Dashboard</p>
        <h1 className="text-xl font-semibold text-surface-50">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/buddy" className="block group">
          <Card hoverable className="h-full bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <MessageSquare className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-surface-100">SpeakBuddy</h3>
                <p className="text-xs text-surface-600 mt-1">
                  Chat with your AI coach
                </p>
                <div className="flex items-center gap-1 text-orange-400 text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/coach" className="block group">
          <Card hoverable className="h-full bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#f97316]/10 rounded-lg">
                <Video className="w-4 h-4 text-[#f97316]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-surface-100">SpeakCoach</h3>
                <p className="text-xs text-surface-600 mt-1">
                  Upload video for scored feedback
                </p>
                <div className="flex items-center gap-1 text-[#f97316] text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Analyze <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Card className="bg-gradient-to-br from-[#f97316]/5 to-[#f97316]/3 border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <ProgressRing value={overallScore || 0} size="md" />
            <div>
              <p className="text-xs text-surface-600">Overall Score</p>
              <p className="text-2xl font-bold text-surface-50 mt-0.5">
                {overallScore ? overallScore?.toFixed(1) : '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Progress</h2>
            <Link to="/progress" className="text-xs text-surface-600 hover:text-surface-400">
              View all
            </Link>
          </div>
          {scoreData.length > 0 ? (
            <ProgressChart data={scoreData} />
          ) : (
            <div className="text-center py-6">
              <Target className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No progress data yet</p>
              <p className="text-[11px] text-surface-700 mt-1">Complete a SpeakCoach session to start</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Recent Activity</h2>
          </div>
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2.5 bg-[#1a1a1a]/30 rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    {session.type === 'buddy' ? (
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-[#f97316]" />
                    )}
                    <div>
                      <p className="text-xs text-surface-300">
                        {session.topic || 'Chat Session'}
                      </p>
                      <p className="text-[11px] text-surface-600">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.type === 'buddy' ? 'primary' : 'accent'} size="sm">
                    {session.type === 'buddy' ? 'Buddy' : 'Coach'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No sessions yet</p>
              <p className="text-[11px] text-surface-700 mt-1">Start with SpeakBuddy or SpeakCoach</p>
            </div>
          )}
        </Card>
      </div>

      {classes.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Your Classes</h2>
            <Link to="/classes" className="text-xs text-surface-600 hover:text-surface-400">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-2.5 p-3 bg-[#1a1a1a]/30 rounded-lg"
              >
                <BookOpen className="w-4 h-4 text-surface-600" />
                <div>
                  <p className="text-xs font-medium text-surface-300">{cls.name}</p>
                  <p className="text-[11px] text-surface-600">Code: {cls.code}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
