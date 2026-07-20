import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function pad(number) {
  return number.toString().padStart(2, '0')
}

function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatFullDate(date) {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Clock() {
  const [now, setNow] = useState(new Date())
  const [popoverOpen, setPopoverOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (event) => {
      if (popoverOpen && ref.current && !ref.current.contains(event.target)) {
        setPopoverOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPopoverOpen(false)
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [popoverOpen])

  return (
    <div className="relative max-[480px]:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setPopoverOpen((open) => !open)}
        className="flex h-10 min-w-[80px] items-center justify-center rounded-2xl border px-3 text-sm transition hover:bg-[var(--win-button-hover)]"
        style={{ borderColor: 'var(--win-border)', backgroundColor: 'transparent', color: 'var(--win-text)' }}
      >
        {formatTime(now)}
      </button>

      <AnimatePresence>
        {popoverOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-3xl border p-4 text-sm shadow-2xl backdrop-blur-xl"
            style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--start-bg)', color: 'var(--win-text)' }}
          >
            <p className="text-lg font-semibold" style={{ color: 'var(--win-text)' }}>{formatTime(now)}</p>
            <p className="mt-2 text-xs" style={{ color: 'var(--win-text-secondary)' }}>{formatFullDate(now)}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default Clock
