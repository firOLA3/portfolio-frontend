import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '../../store/useWindowStore'

const WINDOW_ICONS = {
  about: '👤',
  projects: '💼',
  skills: '🧠',
  experience: '📈',
  contact: '✉️',
  terminal: '⌨️',
  notepad: '📝',
  personalize: '🎨',
}

const WINDOW_COLORS = {
  about: 'from-blue-500 to-blue-600',
  projects: 'from-amber-500 to-amber-600',
  skills: 'from-green-500 to-green-600',
  experience: 'from-purple-500 to-purple-600',
  contact: 'from-pink-500 to-pink-600',
  terminal: 'from-green-700 to-green-800',
  notepad: 'from-orange-500 to-orange-600',
  personalize: 'from-indigo-500 to-indigo-600',
}

function WindowSwitcher({ isOpen, onSelectWindow }) {
  const windows = useWindowStore((s) => s.windows)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const visibleWindows = windows.filter((w) => !w.isMinimized).slice(0, 5)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
          setSelectedIndex((prev) =>
            prev === 0 ? visibleWindows.length - 1 : prev - 1
          )
        } else {
          setSelectedIndex((prev) =>
            prev === visibleWindows.length - 1 ? 0 : prev + 1
          )
        }
      }
    }

    const handleKeyUp = (e) => {
      if (!e.altKey) {
        if (visibleWindows[selectedIndex]) {
          focusWindow(visibleWindows[selectedIndex].id)
        }
        onSelectWindow?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isOpen, selectedIndex, visibleWindows, focusWindow, onSelectWindow])

  return (
    <AnimatePresence>
      {isOpen && visibleWindows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/60 backdrop-blur-sm"
        >
          <div className="flex gap-4 max-w-2xl overflow-x-auto px-4">
            {visibleWindows.map((win, idx) => (
              <motion.div
                key={win.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: idx === selectedIndex ? 1.1 : 1,
                  opacity: 1,
                  border:
                    idx === selectedIndex
                      ? '2px solid white'
                      : '2px solid transparent',
                }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <div
                  className={`w-24 h-24 rounded-lg bg-gradient-to-br ${WINDOW_COLORS[win.appId] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-4xl shadow-lg`}
                >
                  {WINDOW_ICONS[win.appId] || '📦'}
                </div>
                <p className="text-white text-xs text-center max-w-20 truncate font-medium">
                  {win.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WindowSwitcher
