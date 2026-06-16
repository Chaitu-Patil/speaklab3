import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Users, X, ChevronRight, Copy, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'

interface ClassData {
  id: string
  name: string
  code: string
  description: string | null
  teacher_id: string
  student_count?: number
}

export default function Classes() {
  const { profile } = useAuthStore()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDesc, setNewClassDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [profile])

  const fetchClasses = async () => {
    if (!profile) return

    try {
      if (profile.role === 'teacher') {
        const { data } = await supabase.from('classes').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false })
        setClasses((data || []) as ClassData[])
      } else {
        const { data: memberships } = await supabase.from('class_memberships').select('classes(id, name, code, description, teacher_id)').eq('user_id', profile.id)
        const classList = (memberships?.map((m: any) => m.classes).filter(Boolean) || []) as unknown as ClassData[]
        setClasses(classList)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = async () => {
    if (!profile || !joinCode.trim()) return

    setJoining(true)
    setJoinError(null)

    try {
      const { data: classData, error: classError } = await supabase.from('classes').select('id, code').eq('code', joinCode.toUpperCase()).single()

      if (classError || !classData) {
        setJoinError('Invalid class code. Please check and try again.')
        setJoining(false)
        return
      }

      const { data: existing } = await supabase.from('class_memberships').select('id').eq('class_id', classData.id).eq('user_id', profile.id).single()

      if (existing) {
        setJoinError('You are already a member of this class.')
        setJoining(false)
        return
      }

      const { error: joinError } = await supabase.from('class_memberships').insert({ class_id: classData.id, user_id: profile.id })

      if (joinError) throw joinError

      setShowJoinModal(false)
      setJoinCode('')
      fetchClasses()
    } catch (error) {
      console.error('Error joining class:', error)
      setJoinError('Failed to join class. Please try again.')
    } finally {
      setJoining(false)
    }
  }

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateClass = async () => {
    if (!profile || !newClassName.trim()) return

    setCreating(true)

    try {
      const { data, error } = await supabase.from('classes').insert({
        name: newClassName,
        description: newClassDesc || null,
        code: generateClassCode(),
        teacher_id: profile.id,
      }).select().single()

      if (error) throw error

      setClasses([data as ClassData, ...classes])
      setShowCreateModal(false)
      setNewClassName('')
      setNewClassDesc('')
    } catch (error) {
      console.error('Error creating class:', error)
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-surface-600 mb-1">Classes</p>
          <h1 className="text-lg font-semibold text-surface-50">
            {profile?.role === 'teacher' ? 'Your Classes' : 'My Classes'}
          </h1>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => profile?.role === 'teacher' ? setShowCreateModal(true) : setShowJoinModal(true)}>
          {profile?.role === 'teacher' ? 'Create' : 'Join'}
        </Button>
      </div>

      {profile?.role === 'teacher' && (
        <Card className="bg-orange-500/5 border-orange-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <Users className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-surface-100 mb-1">Invite Students</h3>
              <p className="text-xs text-surface-500">Share your class code with students so they can join.</p>
            </div>
          </div>
        </Card>
      )}

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map((cls, index) => (
            <motion.div key={cls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card hoverable className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#1a1a1a] rounded-lg">
                    <BookOpen className="w-4 h-4 text-surface-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-surface-200 truncate">{cls.name}</h3>
                      <Badge variant="primary" size="sm">{cls.student_count || 0}</Badge>
                    </div>
                    {cls.description && <p className="text-xs text-surface-600 mt-1 line-clamp-2">{cls.description}</p>}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-surface-600">Code:</span>
                        <code className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[11px] text-orange-400 font-mono">{cls.code}</code>
                        {profile?.role === 'teacher' && (
                          <button onClick={() => copyToClipboard(cls.code)} className="p-1 hover:bg-[#1a1a1a] rounded transition-colors">
                            {copiedCode === cls.code ? <CheckCircle className="w-3 h-3 text-[#f97316]" /> : <Copy className="w-3 h-3 text-[#444]" />}
                          </button>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-surface-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <BookOpen className="w-8 h-8 text-surface-700 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-surface-200 mb-1">
            {profile?.role === 'teacher' ? 'No classes created yet' : 'Not enrolled in any classes'}
          </h3>
          <p className="text-xs text-surface-600 mb-4">
            {profile?.role === 'teacher' ? 'Create your first class to start tracking students' : 'Join a class using a code from your teacher'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => profile?.role === 'teacher' ? setShowCreateModal(true) : setShowJoinModal(true)}>
            {profile?.role === 'teacher' ? 'Create Class' : 'Join Class'}
          </Button>
        </Card>
      )}

      <Modal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); setJoinCode(''); setJoinError(null) }} title="Join a Class" description="Enter your class code to join" size="sm">
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] rounded-lg mb-4">
              <span className="text-[11px] text-surface-600">Format:</span>
              <code className="text-xs text-orange-400 font-mono">ABC123</code>
            </div>
          </div>
          <Input placeholder="Enter class code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="text-center font-mono tracking-wider uppercase text-sm" maxLength={6} />
          {joinError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
              <X className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">{joinError}</span>
            </div>
          )}
          <Button onClick={handleJoinClass} loading={joining} disabled={joinCode.length !== 6} className="w-full" size="sm">Join Class</Button>
        </div>
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Class" description="Set up a class for your students">
        <div className="space-y-4">
          <Input label="Class Name" placeholder="e.g., Public Speaking 101" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Description (Optional)</label>
            <textarea className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-surface-100 text-sm placeholder:text-surface-600 focus:outline-none focus:border-[#3a3a3a] transition-colors min-h-[80px]" placeholder="Brief description of your class..." value={newClassDesc} onChange={(e) => setNewClassDesc(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1" size="sm">Cancel</Button>
            <Button onClick={handleCreateClass} loading={creating} className="flex-1" size="sm">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
