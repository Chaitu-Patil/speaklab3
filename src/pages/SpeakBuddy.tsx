import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, Sparkles, RotateCcw, Target, Stethoscope, Dumbbell, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface CoachingPayload {
  responseType: 'coaching'
  message: string
  diagnosis: string
  drill: string
  followUp: string
}

interface ChatPayload {
  responseType: 'chat'
  message: string
}

type AssistantPayload = CoachingPayload | ChatPayload

interface Message {
  id: string
  role: 'user' | 'assistant'
  timestamp: Date
  // user messages
  content?: string
  // assistant messages
  payload?: AssistantPayload
}

const starterPrompts = [
  "I freeze up during the first 30 seconds",
  "I say 'um' and 'like' too much",
  "My voice shakes when I'm nervous",
  "I don't know what to do with my hands",
]

const tabs = [
  { key: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
  { key: 'drill', label: 'Drill', icon: Dumbbell },
  { key: 'followUp', label: 'Follow-up', icon: MessageCircle },
] as const

function CoachingCard({ payload }: { payload: CoachingPayload }) {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'drill' | 'followUp'>('diagnosis')

  const content = {
    diagnosis: payload.diagnosis,
    drill: payload.drill,
    followUp: payload.followUp,
  }

  return (
    <div className="flex-1 min-w-0 space-y-2">
      {payload.message && (
        <div className="px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#252525]">
          <p className="text-xs text-surface-300 leading-relaxed">{payload.message}</p>
        </div>
      )}
      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#1a1a1a]">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === key
                  ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/5'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="p-3"
          >
            <p className="text-xs text-surface-300 leading-relaxed whitespace-pre-wrap">
              {content[activeTab]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function SpeakBuddy() {
  const { profile } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ensureSession = async (): Promise<string | null> => {
    if (sessionId) return sessionId
    if (!profile) return null
    const { data } = await supabase
      .from('speaking_sessions')
      .insert({ user_id: profile.id, type: 'buddy', messages: [] })
      .select('id')
      .single()
    if (data?.id) {
      setSessionId(data.id)
      return data.id
    }
    return null
  }

  const persistMessages = async (sid: string, msgs: Message[]) => {
    const serialized = msgs.map((m) => {
      if (m.role === 'user') return { role: m.role, content: m.content ?? '' }
      if (m.payload?.responseType === 'chat') return { role: m.role, content: m.payload.message }
      if (m.payload?.responseType === 'coaching') {
        const p = m.payload
        return {
          role: m.role,
          content: p.message || '',
          coaching: { diagnosis: p.diagnosis, drill: p.drill, followUp: p.followUp },
        }
      }
      return { role: m.role, content: '' }
    })
    await supabase.from('speaking_sessions').update({ messages: serialized }).eq('id', sid)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !profile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const sid = await ensureSession()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: 'buddy',
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content ?? (m.payload?.responseType === 'chat' ? m.payload.message : '[coaching response]'),
          })),
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const payload: AssistantPayload = data.responseType
        ? data as AssistantPayload
        : { responseType: 'chat', message: data.message || 'Sorry, I had trouble responding.' }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        payload,
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      if (sid) await persistMessages(sid, finalMessages)
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          payload: { responseType: 'chat', message: 'Sorry, something went wrong. Please try again.' },
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewSession = () => {
    setMessages([])
    setSessionId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-surface-600 mb-1">AI Coach</p>
          <h1 className="text-lg font-semibold text-surface-50">SpeakBuddy</h1>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleNewSession} icon={<RotateCcw className="w-3 h-3" />}>
            New
          </Button>
        )}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-md"
                >
                  <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-orange-400" />
                  </div>
                  <h2 className="text-sm font-medium text-surface-100 mb-2">What's your speaking challenge?</h2>
                  <p className="text-xs text-surface-500 mb-6">
                    Describe a problem and get a diagnosis, drill, and follow-up question.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="p-3 text-left text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] transition-colors text-surface-400"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-2.5 items-start ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center ${message.role === 'user' ? 'bg-orange-500/10' : 'bg-[#1a1a1a]'}`}>
                        {message.role === 'user'
                          ? <User className="w-3.5 h-3.5 text-orange-400" />
                          : <Bot className="w-3.5 h-3.5 text-surface-500" />}
                      </div>

                      {message.role === 'user' ? (
                        <div className="max-w-[72%] px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                          <p className="text-xs text-surface-200 leading-relaxed">{message.content}</p>
                        </div>
                      ) : message.payload?.responseType === 'coaching' ? (
                        <CoachingCard payload={message.payload} />
                      ) : (
                        <div className="max-w-[72%] px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#252525]">
                          <p className="text-xs text-surface-300 leading-relaxed whitespace-pre-wrap">
                            {message.payload?.message ?? ''}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-surface-500" />
                    </div>
                    <div className="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-lg p-3">
                      <div className="flex items-center gap-2 text-surface-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-[#1a1a1a]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a challenge or ask anything..."
                className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-surface-100 text-sm placeholder:text-surface-600 focus:outline-none focus:border-[#3a3a3a] transition-colors"
                disabled={loading}
              />
              <Button type="submit" disabled={!input.trim() || loading} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="w-56 flex-shrink-0">
          <Card className="sticky top-4 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-surface-600" />
              <h3 className="text-sm font-medium text-surface-200">Session</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span className="text-xs text-surface-500">Exchanges</span>
                <span className="text-xs font-medium text-surface-300">{Math.floor(messages.length / 2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span className="text-xs text-surface-500">Drills</span>
                <span className="text-xs font-medium text-surface-300">
                  {messages.filter((m) => m.payload?.responseType === 'coaching').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-surface-500">Saved</span>
                <span className="text-xs font-medium text-surface-300">{sessionId ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
