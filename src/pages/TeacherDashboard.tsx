import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Plus, ChevronRight, BarChart3, UserCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

interface ClassData {
  id: string
  name: string
  code: string
  description: string | null
  created_at: string
  student_count?: number
}

interface StudentProgress {
  user_id: string
  full_name: string | null
  sessions_count: number
  avg_score: number | null
}

export default function TeacherDashboard() {
  const { profile } = useAuthStore()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassDesc, setNewClassDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    if (!profile) return

    try {
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })

      setClasses((classesData || []) as ClassData[])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClassName,
          description: newClassDesc || null,
          code: generateClassCode(),
          teacher_id: profile.id,
        })
        .select()
        .single()

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-surface-700 border-t-surface-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-surface-600 mb-1">Dashboard</p>
          <h1 className="text-xl font-semibold text-surface-50">Teacher Dashboard</h1>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
          New Class
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <BookOpen className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{classes.length}</p>
              <p className="text-xs text-surface-600">Classes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <Users className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{students.length}</p>
              <p className="text-xs text-surface-600">Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <UserCheck className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">{students.filter(s => s.sessions_count > 0).length}</p>
              <p className="text-xs text-surface-600">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a1a1a] rounded-lg">
              <BarChart3 className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">—</p>
              <p className="text-xs text-surface-600">Avg Score</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Your Classes</h2>
          </div>
          {classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((cls) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-[#1a1a1a]/30 rounded-lg hover:bg-[#1a1a1a]/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#1a1a1a] rounded-md">
                      <BookOpen className="w-4 h-4 text-surface-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{cls.name}</p>
                      <p className="text-xs text-surface-600">Code: {cls.code}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-600" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No classes yet</p>
              <p className="text-[11px] text-surface-700 mt-1">Create your first class to get started</p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-surface-200">Student Progress</h2>
          </div>
          {students.length > 0 ? (
            <div className="space-y-2">
              {students.slice(0, 5).map((student) => (
                <div
                  key={student.user_id}
                  className="flex items-center justify-between p-3 bg-[#1a1a1a]/30 rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-surface-300">
                        {student.full_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-surface-300">{student.full_name || 'Unknown'}</p>
                      <p className="text-[11px] text-surface-600">{student.sessions_count} sessions</p>
                    </div>
                  </div>
                  {student.avg_score !== null && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-surface-100">{student.avg_score.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-surface-800 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No students yet</p>
              <p className="text-[11px] text-surface-700 mt-1">Share your class code to invite students</p>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Class"
        description="Set up a new class for your students"
      >
        <div className="space-y-4">
          <Input
            label="Class Name"
            placeholder="e.g., Public Speaking 101"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-surface-100 placeholder:text-surface-600 focus:outline-none focus:border-[#3a3a3a] transition-colors min-h-[80px] text-sm"
              placeholder="Brief description of your class..."
              value={newClassDesc}
              onChange={(e) => setNewClassDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreateClass} loading={creating} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
