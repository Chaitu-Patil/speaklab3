import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function FlaskIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 4 L21 11 L28 27 Q28 30 25 30 H7 Q4 30 4 27 L11 11 L11 4" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="4" x2="21" y2="4" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="21.5" width="2.5" height="5.5" rx="1.2" fill="#f97316" opacity="0.5" />
      <rect x="14.75" y="17" width="2.5" height="10" rx="1.2" fill="#f97316" />
      <rect x="19.5" y="23" width="2.5" height="4" rx="1.2" fill="#f97316" opacity="0.5" />
    </svg>
  )
}

export default function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setInstallEvent(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  if (!installEvent || dismissed || installed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 shadow-2xl max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <FlaskIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100">Install SpeakLab</p>
              <p className="text-xs text-surface-500 mt-0.5">Add to your home screen for quick access</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 text-surface-600 hover:text-surface-300 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
