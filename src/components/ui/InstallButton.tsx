import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
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
        <div className="bg-surface-900 border border-primary-500/30 rounded-xl p-4 shadow-2xl shadow-primary-500/20 max-w-xs">
          <div className="flex items-start gap-3">
            <img src="/image.png" alt="SpeakLab" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100">Install SpeakLab</p>
              <p className="text-xs text-surface-400 mt-0.5">Add to your home screen for quick access</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 text-surface-500 hover:text-surface-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm rounded-lg transition-all duration-200 shadow-lg shadow-primary-500/30"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
