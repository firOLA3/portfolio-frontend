import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '../../store/useOSStore'
import { soundService } from '../../services/soundService'
import lockWallpaper from '../../assets/FIROLA WHITE.png'

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function LockScreen() {
  const advanceStage = useOSStore((s) => s.advanceStage)
  const wallpaper = useOSStore((s) => s.wallpaper)
  const [now, setNow] = useState(new Date())
  const [isUnlocking, setIsUnlocking] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const handleUnlock = () => {
    if (!isUnlocking) {
      soundService.play('startup')
      setIsUnlocking(true)
      window.setTimeout(() => advanceStage(), 450)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key) handleUnlock()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isUnlocking, advanceStage])

  const wallpaperClass = useMemo(() => {
    const gradients = {
      bloom: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900',
      ocean: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-blue-900',
      forest: 'bg-gradient-to-br from-green-950 via-emerald-950 to-green-900',
      sunset: 'bg-gradient-to-br from-orange-950 via-red-950 to-purple-900',
      midnight: 'bg-gradient-to-br from-slate-950 to-slate-900',
      aurora: 'bg-gradient-to-br from-purple-950 via-pink-950 to-red-900',
    }
    return gradients[wallpaper] || 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
  }, [wallpaper])

  return (
    <motion.div
      className={`fixed inset-0 overflow-hidden ${wallpaperClass}`}
      style={{
        backgroundImage: `url(${lockWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      onClick={handleUnlock}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[22px]" />
      <motion.div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-white"
        animate={isUnlocking ? { y: '-100vh', opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        <div className="text-center">
          <p className="text-[5.5rem] font-thin tracking-[-0.08em] md:text-[6.5rem]">
            {formatTime(now)}
          </p>
          <p className="mt-4 text-xl tracking-[0.2em] text-white/75">
            {formatDate(now)}
          </p>
        </div>

        <div className="mt-20 rounded-3xl bg-white/10 px-6 py-3 text-sm text-white/70 shadow-xl backdrop-blur-xl animate-pulse">
          Press any key or click to unlock
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LockScreen
