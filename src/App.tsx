import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/ui/Layout'
import Auth from './pages/Auth'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import SpeakBuddy from './pages/SpeakBuddy'
import SpeakCoach from './pages/SpeakCoach'
import Classes from './pages/Classes'
import Progress from './pages/Progress'
import About from './pages/About'
import Landing from './pages/Landing'
import InstallButton from './components/ui/InstallButton'

function App() {
  const { session, profile, loading, initialize, initialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-5 h-5 border border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <InstallButton />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={profile.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />} />
          <Route path="/buddy" element={<SpeakBuddy />} />
          <Route path="/coach" element={<SpeakCoach />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <InstallButton />
    </BrowserRouter>
  )
}

export default App
