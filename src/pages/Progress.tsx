import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calendar, BarChart3, Award, MessageSquare, Video, ChevronRight, Bot, User, Stethoscope, Dumbbell, MessageCircle, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase, Session, ProgressScore } from '../lib/supabase'
import Card from '../components/ui/Card'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressChart from '../components/ui/ProgressChart'
import Badge from '../components/ui/Badge'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoredMessage {
  role: 'user' | 'assistant'
  content: string
  coaching?: {
    diagnosis: string
    drill: string
    followUp: string
  }
}

interface SessionWithDetail extends Session {
  messages?: StoredMessage[]
  analysis?: {
    scores: { body_language: number; eye_contact: number; voice_modulation: number; pace: number; projection: number; presence: number; overall: number }
    feedback: Record<string, { strength: string; improvement: string; drill: string }>
    summary: string
    encouraging_note: string
  }
}

// ---------------------------------------------------------------------------
// Session detail modal
// ---------------------------------------------------------------------------

const analysisDimensions = [
  { key: 'body_language', label: 'Body Language' },
  { key: 'eye_contact', label: 'Eye Contact' },
  { key: 'voice_modulation', label: 'Voice' },
  { key: 'pace', label: 'Pace' },
  { key: 'projection', label: 'Projection' },
  { key: 'presence', label: 'Presence' },
]

function CoachingTabs({ coaching }: { coaching: { diagnosis: string; drill: string; followUp: string } }) {
  const [tab, setTab] = useState<'diagnosis' | 'drill' | 'followUp'>('diagnosis')
  const tabs = [
    { key: 'diagnosis' as const, label: 'Diagnosis', icon: Stethoscope },
    { key: 'drill' as const, label: 'Drill', icon: Dumbbell },
    { key: 'followUp' as const, label: 'Follow-up', icon: MessageCircle },
  ]
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden mt-1.5">
      <div className="flex border-b border-[#1a1a1a]">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1 flex-1 justify-center px-2 py-1.5 text-[11px] font-medium transition-colors ${
              tab === key ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5' : 'text-surface-500 hover:text-surface-300'
            }`}
          >
            <Icon className="w-2.5 h-2.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] text-surface-400 leading-relaxed">{coaching[tab]}</p>
      </div>
    </div>
  )
}

function SessionDetailModal({ session, onClose }: { session: SessionWithDetail; onClose: () => void }) {
  const messages: StoredMessage[] = Array.isArray(session.messages) ? session.messages : []
  const analysis = session.analysis

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-md ${session.type === 'buddy' ? 'bg-orange-500/10' : 'bg-[#1a1a1a]'}`}>
              {session.type === 'buddy'
                ? <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                : <Video className="w-3.5 h-3.5 text-[#f97316]" />
              }
            </div>
            <div>
              <h2 className="text-sm font-medium text-surface-100">
                {session.type === 'buddy' ? 'SpeakBuddy' : 'SpeakCoach'} Session
              </h2>
              <p className="text-[11px] text-surface-600">
                {new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-surface-600 hover:text-surface-300 hover:bg-[#1a1a1a] rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {session.type === 'buddy' ? (
            <div className="p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-surface-800 mx-auto mb-2" />
                  <p className="text-xs text-surface-600">No messages saved for this session</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-md flex items-center justify-center ${msg.role === 'user' ? 'bg-orange-500/10' : 'bg-[#1a1a1a]'}`}>
                      {msg.role === 'user'
                        ? <User className="w-3 h-3 text-orange-400" />
                        : <Bot className="w-3 h-3 text-surface-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {msg.role === 'user' ? (
                        <div className="inline-block max-w-[85%] float-right px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                          <p className="text-xs text-surface-200 leading-relaxed">{msg.content}</p>
                        </div>
                      ) : (
                        <div className="max-w-[85%]">
                          {msg.content && (
                            <div className="px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#252525]">
                              <p className="text-xs text-surface-300 leading-relaxed">{msg.content}</p>
                            </div>
                          )}
                          {msg.coaching && <CoachingTabs coaching={msg.coaching} />}
                        </div>
                      )}
                      <div className="clear-both" />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : analysis ? (
            <div className="p-4 space-y-4">
              {/* Overall score */}
              <div className="flex items-center gap-4 p-4 bg-[#1a1a1a]/40 rounded-lg">
                <ProgressRing value={analysis.scores.overall} size="lg" label="Overall" />
                <div>
                  <p className="text-sm font-medium text-surface-200 mb-1">Overall Performance</p>
                  <p className="text-xs text-surface-500 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>

              {/* Dimension scores */}
              <div className="grid grid-cols-3 gap-2">
                {analysisDimensions.map((dim) => (
                  <div key={dim.key} className="text-center p-2.5 bg-[#1a1a1a]/30 rounded-lg">
                    <ProgressRing value={analysis.scores[dim.key as keyof typeof analysis.scores] as number} size="sm" />
                    <p className="text-[10px] text-surface-600 mt-1.5">{dim.label}</p>
                  </div>
                ))}
              </div>

              {/* Feedback items */}
              <div className="space-y-2">
                {analysisDimensions.map((dim) => {
                  const fb = analysis.feedback[dim.key]
                  if (!fb) return null
                  return (
                    <div key={dim.key} className="p-3 bg-[#1a1a1a]/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-surface-300">{dim.label}</span>
                        <span className="text-xs font-semibold text-orange-400">
                          {(analysis.scores[dim.key as keyof typeof analysis.scores] as number).toFixed(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-surface-500">
                        <p><span className="text-orange-400/80">Strength:</span> {fb.strength}</p>
                        <p><span className="text-surface-600">Improve:</span> {fb.improvement}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Encouraging note */}
              <p className="text-center text-xs text-surface-600 italic px-2">&quot;{analysis.encouraging_note}&quot;</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No analysis data saved for this session</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Progress() {
  const { profile } = useAuthStore()
  const [sessions, setSessions] = useState<SessionWithDetail[]>([])
  const [scores, setScores] = useState<ProgressScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions'>('overview')
  const [selectedSession, setSelectedSession] = useState<SessionWithDetail | null>(null)

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    if (!profile) return
    try {
      const [sessionsRes, scoresRes] = await Promise.all([
        supabase
          .from('speaking_sessions')
          .select('id, type, topic, created_at, messages, analysis')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('progress_scores')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: true }),
      ])
      setSessions((sessionsRes.data || []) as SessionWithDetail[])
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
    <>
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
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedTab === 'overview' ? 'bg-[#2a2a2a] text-surface-100' : 'text-surface-500 hover:text-surface-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('sessions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedTab === 'sessions' ? 'bg-[#2a2a2a] text-surface-100' : 'text-surface-500 hover:text-surface-300'}`}
          >
            History
          </button>
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
              {sessions.length > 0 && (
                <span className="ml-auto text-[11px] text-surface-600">Click any session to view</span>
              )}
            </div>
            {sessions.length > 0 ? (
              <div className="space-y-1.5">
                {sessions.map((session) => {
                  const msgCount = Array.isArray(session.messages) ? Math.floor(session.messages.length / 2) : 0
                  const hasContent = session.type === 'buddy'
                    ? Array.isArray(session.messages) && session.messages.length > 0
                    : !!session.analysis

                  return (
                    <button
                      key={session.id}
                      onClick={() => hasContent && setSelectedSession(session)}
                      className={`w-full flex items-center justify-between p-3 bg-[#1a1a1a]/30 rounded-lg text-left transition-colors ${hasContent ? 'hover:bg-[#1a1a1a]/60 cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${session.type === 'buddy' ? 'bg-orange-500/10' : 'bg-[#1a1a1a]'}`}>
                          {session.type === 'buddy'
                            ? <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                            : <Video className="w-3.5 h-3.5 text-[#f97316]" />
                          }
                        </div>
                        <div>
                          <p className="text-xs font-medium text-surface-300">
                            {session.topic || (session.type === 'buddy' ? 'Chat Session' : 'Video Analysis')}
                          </p>
                          <p className="text-[11px] text-surface-600">
                            {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {session.type === 'buddy' && msgCount > 0 && ` · ${msgCount} exchange${msgCount !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.type === 'buddy' ? 'primary' : 'accent'} size="sm">
                          {session.type === 'buddy' ? 'Buddy' : 'Coach'}
                        </Badge>
                        {hasContent && <ChevronRight className="w-3.5 h-3.5 text-surface-600" />}
                      </div>
                    </button>
                  )
                })}
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

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  )
}
