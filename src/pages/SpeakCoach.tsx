import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2, Play, Target, TrendingUp, RefreshCw, Check, Paperclip } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressRing from '../components/ui/ProgressRing'

interface AnalysisResult {
  scores: {
    body_language: number
    eye_contact: number
    voice_modulation: number
    pace: number
    projection: number
    presence: number
    overall: number
  }
  feedback: {
    body_language: { strength: string; improvement: string; drill: string }
    eye_contact: { strength: string; improvement: string; drill: string }
    voice_modulation: { strength: string; improvement: string; drill: string }
    pace: { strength: string; improvement: string; drill: string }
    projection: { strength: string; improvement: string; drill: string }
    presence: { strength: string; improvement: string; drill: string }
  }
  summary: string
  encouraging_note: string
}

const dimensions = [
  { key: 'body_language', label: 'Body Language', idx: '1' },
  { key: 'eye_contact', label: 'Eye Contact', idx: '2' },
  { key: 'voice_modulation', label: 'Voice', idx: '3' },
  { key: 'pace', label: 'Pace', idx: '4' },
  { key: 'projection', label: 'Projection', idx: '5' },
  { key: 'presence', label: 'Presence', idx: '6' },
]

export default function SpeakCoach() {
  const { profile } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (selectedFile.size > 1024 * 1024 * 1024) {
      setError('File size must be under 1 GB')
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!file || !profile) return

    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop() || 'bin'
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('videos').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)

      const { data: sessionRecord } = await supabase
        .from('speaking_sessions')
        .insert({ user_id: profile.id, type: 'coach', video_url: urlData.publicUrl })
        .select('id')
        .single()

      setUploading(false)
      setAnalyzing(true)

      const mediaType = file.type.startsWith('audio/') ? 'audio recording' : 'video'
      const analysisPrompt = `Analyze a student's speaking performance. They submitted a ${mediaType} file named "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB). Provide constructive feedback as if you observed a typical student presentation.`

      const { data: { session: authSession } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token}`,
        },
        body: JSON.stringify({ type: 'coach', videoAnalysis: analysisPrompt }),
      })

      const data = await response.json()

      if (data.analysis) {
        setResult(data.analysis)
        if (sessionRecord) {
          await supabase.from('progress_scores').insert({
            user_id: profile.id,
            session_id: sessionRecord.id,
            ...data.analysis.scores,
          })
          await supabase.from('speaking_sessions').update({ analysis: data.analysis }).eq('id', sessionRecord.id)
        }
      } else {
        throw new Error(data.error || 'Failed to analyze')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Analysis failed. Please try again.')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-surface-600 mb-1">Performance Analysis</p>
        <h1 className="text-lg font-semibold text-surface-50">SpeakCoach</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className={!result ? 'min-h-[360px]' : ''}>
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  {!file ? (
                    <>
                      <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-sm font-medium text-surface-100 mb-2">Upload a recording</h3>
                      <p className="text-xs text-surface-500 text-center max-w-xs mb-6">
                        Record yourself presenting and get scored feedback across 6 speaking dimensions.
                      </p>
                      <label className="cursor-pointer">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="*/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          Choose File
                        </span>
                      </label>
                      <p className="text-xs text-surface-600 mt-3">Any format — max 1 GB</p>
                    </>
                  ) : uploading || analyzing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-3" />
                      <p className="text-sm font-medium text-surface-200">
                        {uploading ? 'Uploading...' : 'Analyzing...'}
                      </p>
                      <p className="text-xs text-surface-600 mt-1">This may take a moment</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center mb-3">
                        <Paperclip className="w-6 h-6 text-surface-500" />
                      </div>
                      <p className="text-sm font-medium text-surface-200 mb-1">{file.name}</p>
                      <p className="text-xs text-surface-600 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" size="sm" onClick={resetAnalysis}>Cancel</Button>
                        <Button size="sm" onClick={handleAnalyze} icon={<Play className="w-3 h-3" />}>Analyze</Button>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="mt-5 px-4 py-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <span className="text-xs text-red-400">{error}</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-surface-200">Results</h2>
                    <Button variant="ghost" size="sm" onClick={resetAnalysis} icon={<RefreshCw className="w-3 h-3" />}>
                      New
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-6 py-3">
                    <ProgressRing value={result.scores.overall} size="lg" label="Overall" />
                    <div className="grid grid-cols-3 gap-3">
                      {dimensions.slice(0, 3).map((dim) => (
                        <ProgressRing
                          key={dim.key}
                          value={result.scores[dim.key as keyof typeof result.scores]}
                          size="sm"
                          label={dim.idx}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {dimensions.slice(3).map((dim) => (
                        <ProgressRing
                          key={dim.key}
                          value={result.scores[dim.key as keyof typeof result.scores]}
                          size="sm"
                          label={dim.idx}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-center text-xs text-surface-500 italic">&quot;{result.encouraging_note}&quot;</p>

                  <div className="space-y-3">
                    {dimensions.map((dim) => {
                      const feedback = result.feedback[dim.key as keyof typeof result.feedback]
                      return (
                        <div key={dim.key} className="p-3 bg-[#1a1a1a]/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-[#1a1a1a] rounded text-xs text-surface-500">{dim.idx}</span>
                            <span className="text-xs font-medium text-surface-200">{dim.label}</span>
                            <span className="ml-auto text-sm font-semibold text-orange-400">
                              {result.scores[dim.key as keyof typeof result.scores].toFixed(1)}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-xs pl-7">
                            <div className="flex gap-2">
                              <Check className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span className="text-orange-400">Strength:</span>
                              <span className="text-surface-400">{feedback.strength}</span>
                            </div>
                            <div className="flex gap-2">
                              <Target className="w-3 h-3 text-orange-400/60 flex-shrink-0 mt-0.5" />
                              <span className="text-orange-400/60">Improve:</span>
                              <span className="text-surface-400">{feedback.improvement}</span>
                            </div>
                            <div className="flex gap-2">
                              <TrendingUp className="w-3 h-3 text-orange-300 flex-shrink-0 mt-0.5" />
                              <span className="text-orange-300">Drill:</span>
                              <span className="text-surface-400">{feedback.drill}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-surface-600" />
              <h3 className="text-sm font-medium text-surface-200">Progress</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-surface-500">Sessions</span>
                <span className="text-surface-300">{result ? 1 : 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                <span className="text-surface-500">Best Score</span>
                <span className="text-surface-300">{result ? result.scores.overall.toFixed(1) : '—'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-surface-500">Avg. Score</span>
                <span className="text-surface-300">{result ? result.scores.overall.toFixed(1) : '—'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-surface-200 mb-3">Tips</h3>
            <ul className="space-y-2 text-xs text-surface-500">
              <li className="flex gap-2"><span className="text-orange-400">1.</span>Record 2–3 minutes of yourself speaking</li>
              <li className="flex gap-2"><span className="text-orange-400">2.</span>Present to an imaginary audience</li>
              <li className="flex gap-2"><span className="text-orange-400">3.</span>Any format works — video or audio</li>
              <li className="flex gap-2"><span className="text-orange-400">4.</span>Upload weekly to track your growth</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
