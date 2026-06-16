import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calendar, BarChart3, Award, MessageSquare, Video } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase, Session, ProgressScore } from '../lib/supabase'
import Card from '../components/ui/Card'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressChart from '../components/ui/ProgressChart'
import Badge from '../components/ui/Badge'

export default function Progress() {
  const { profile } = useAuthStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [scores, setScores] = useState<ProgressScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions'>('overview')

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    if (!profile) return

    try {
      const [sessionsRes, scoresRes] = await Promise.all([
        supabase.from('speaking_sessions').select('id, type, topic, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('progress_scores').select('*').eq('user_id', profile.id).order('created_at', { ascending: true }),
      ])

      setSessions(sessionsRes.data || [])
      setScores((scoresRes.data || []) as ProgressScore[])
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  const buddySessions = sessions.filter(s => s.type === 'buddy').length
  const coachSessions = sessions.filter(s => s.type === 'coach').length
  const latestScore = scores[scores.length - 1]
  const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + (s.overall || 0), 0) / scores.length : null

  const scoreHistory = scores.map((s, i) => ({ label: `#${i + 1}`, value: s.overall || 0 }))

  const dimensionAverages = latestScore ? [
    { label: 'Body Language', value: latestScore.body_language || 0 },
    { label: 'Eye Contact', value: latestScore.eye_contact || 0 },
    { label: 'Voice Modulation', value: latestScore.voice_modulation || 0 },
    { label: 'Pace', value: latestScore.pace || 0 },
    { label: 'Projection', value: latestScore.projection || 0 },
    { label: 'Presence', value: latestScore.presence || 0 },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-surface-600 mb-1">Analytics</p>
        <h1 className="text-lg font-semibold text-surface-50">Progress</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <MessageSquare className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{buddySessions}</p>
              <p className="text-xs text-surface-600">Buddy</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <Video className="w-4 h-4 text-[#f97316]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{coachSessions}</p>
              <p className="text-xs text-surface-600">Coach</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <Target className="w-4 h-4 text-[#f97316]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{avgScore ? avgScore.toFixed(1) : '—'}</p>
              <p className="text-xs text-surface-600">Avg Score</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <Award className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{sessions.length}</p>
              <p className="text-xs text-surface-600">Total</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg w-fit">
        <button onClick={() => setSelectedTab('overview')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedTab === 'overview' ? 'bg-[#2a2a2a] text-surface-100' : 'text-surface-500 hover:text-surface-300'}`}>Overview</button>
        <button onClick={() => setSelectedTab('sessions')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedTab === 'sessions' ? 'bg-[#2a2a2a] text-surface-100' : 'text-surface-500 hover:text-surface-300'}`}>History</button>
      </div>

      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-surface-600" />
              <h2 className="text-sm font-medium text-surface-200">Score Trend</h2>
            </div>
            {scores.length > 0 ? (
              <div className="space-y-4">
                <ProgressChart data={scoreHistory} />
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#1a1a1a]">
                  <div className="text-center">
                    <p className="text-lg font-bold text-surface-100">{latestScore?.overall?.toFixed(1) || '—'}</p>
                    <p className="text-[11px] text-surface-600">Latest</p>
                  </div>
                  <div className="w-px h-8 bg-[#1a1a1a]" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-400">{avgScore ? avgScore.toFixed(1) : '—'}</p>
                    <p className="text-[11px] text-surface-600">Average</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 text-surface-800 mx-auto mb-2" />
                <p className="text-xs text-surface-600">No score history yet</p>
                <p className="text-[11px] text-surface-700 mt-1">Complete SpeakCoach sessions to track progress</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-surface-600" />
              <h2 className="text-sm font-medium text-surface-200">Dimension Breakdown</h2>
            </div>
            {dimensionAverages.length > 0 ? (
              <ProgressChart data={dimensionAverages} />
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-surface-800 mx-auto mb-2" />
                <p className="text-xs text-surface-600">No dimension data yet</p>
                <p className="text-[11px] text-surface-700 mt-1">Upload a video to SpeakCoach for detailed analysis</p>
              </div>
            )}
          </Card>

          {latestScore && (
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-[#f97316]" />
                <h2 className="text-sm font-medium text-surface-200">Latest Analysis</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {dimensionAverages.map((dim, index) => (
                  <motion.div key={dim.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }} className="text-center">
                    <ProgressRing value={dim.value} size="sm" />
                    <p className="text-[11px] text-surface-600 mt-1.5">{dim.label}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedTab === 'sessions' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-surface-600" />
            <h2 className="text-sm font-medium text-surface-200">Session History</h2>
          </div>
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-[#1a1a1a]/30 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    {session.type === 'buddy' ? <MessageSquare className="w-4 h-4 text-[#f97316]" /> : <Video className="w-4 h-4 text-[#f97316]" />}
                    <div>
                      <p className="text-xs text-surface-300">{session.topic || `${session.type === 'buddy' ? 'Chat' : 'Video'} Session`}</p>
                      <p className="text-[11px] text-surface-600">{new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <Badge variant={session.type === 'buddy' ? 'primary' : 'accent'} size="sm">{session.type === 'buddy' ? 'Buddy' : 'Coach'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No sessions yet</p>
              <p className="text-[11px] text-surface-700 mt-1">Start with SpeakBuddy or SpeakCoach to see your history</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
