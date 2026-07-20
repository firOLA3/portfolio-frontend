import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tooltip } from 'flowbite-react'
import { useOSStore } from '../../store/useOSStore'
import { useWindowStore } from '../../store/useWindowStore'

const APPS = [
  { appId: 'about', label: 'About Me', icon: '👤' },
  { appId: 'browser', label: 'Browser', icon: '🌐' },
  { appId: 'projects', label: 'Projects', icon: '💼' },
  { appId: 'skills', label: 'Skills', icon: '🧠' },
  { appId: 'experience', label: 'Experience', icon: '📈' },
  { appId: 'contact', label: 'Contact', icon: '✉️' },
  { appId: 'terminal', label: 'Terminal', icon: '⌨️' },
  { appId: 'notepad', label: 'Devlogs', icon: '📝' },
]

const RECOMMENDED = [
  { icon: '📄', label: 'Resume.pdf', time: '2h ago' },
  { icon: '🐙', label: 'GitHub', time: '5h ago' },
  { icon: '🚀', label: 'Latest Project', time: 'Yesterday' },
]

function StartMenu() {
  const isOpen = useOSStore((s) => s.isStartMenuOpen)
  const closeStartMenu = useOSStore((s) => s.closeStartMenu)
  const toggleStartMenu = useOSStore((s) => s.toggleStartMenu)
  const setStage = useOSStore((s) => s.setStage)
  const openWindow = useWindowStore((s) => s.openWindow)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const windows = useWindowStore((s) => s.windows)
  const [search, setSearch] = useState('')
  const [showAllApps, setShowAllApps] = useState(false)
  const [shuttingDown, setShuttingDown] = useState(false)
  const menuRef = useRef(null)

  const openApps = useMemo(
    () =>
      windows.reduce((map, win) => {
        map[win.appId] = win
        return map
      }, {}),
    [windows],
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeStartMenu()
      }

      if (event.key === 'Meta' || event.key === 'Win') {
        event.preventDefault()
        toggleStartMenu()
      }
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeStartMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeStartMenu, isOpen, toggleStartMenu])

  const normalizedSearch = search.trim().toLowerCase()

  const filteredApps = useMemo(() => {
    const list = showAllApps ? APPS : APPS
    return list.filter((app) => app.label.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, showAllApps])

  const handleAppClick = (app) => {
    const appWindow = openApps[app.appId]

    if (!appWindow) {
      openWindow(app.appId, app.label)
    } else if (appWindow.isMinimized) {
      restoreWindow(appWindow.id)
    } else if (appWindow.id === windows.find((w) => w.id === appWindow.id)?.id) {
      if (appWindow.id === useWindowStore.getState().activeWindowId) {
        minimizeWindow(appWindow.id)
      } else {
        focusWindow(appWindow.id)
      }
    }

    closeStartMenu()
    setShowAllApps(false)
  }

  const handleShutdown = () => {
    closeStartMenu()
    windows.forEach((windowItem) => minimizeWindow(windowItem.id))
    setShuttingDown(true)

    window.setTimeout(() => {
      setStage('boot')
      setShuttingDown(false)
    }, 2500)
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed left-1/2 bottom-20 z-40 w-[min(92vw,620px)] -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          ref={menuRef}
        >
          <div 
            className="rounded-win-lg border p-6 shadow-window backdrop-blur-win max-h-[80vh] overflow-y-auto no-scrollbar"
            style={{ 
              backgroundColor: 'var(--start-bg)', 
              borderColor: 'var(--win-border)', 
              color: 'var(--win-text)' 
            }}
          >
            <div className="mb-6">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search apps and files..."
                className="w-full rounded-3xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: 'var(--win-button-active)',
                  borderColor: 'var(--win-border)',
                  color: 'var(--win-text)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--win-text-secondary)' }}>
                Pinned
              </h3>
              <button
                type="button"
                onClick={() => setShowAllApps((prev) => !prev)}
                className="rounded-full px-3 py-1 text-xs font-semibold transition hover:bg-[var(--win-button-hover)]"
                style={{ color: 'var(--win-text-secondary)' }}
              >
                {showAllApps ? 'Back to pinned' : 'All apps →'}
              </button>
            </div>

            {showAllApps ? (
              <div className="space-y-2">
                {filteredApps.length ? (
                  filteredApps
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((app) => (
                      <button
                        key={app.appId}
                        type="button"
                        onClick={() => handleAppClick(app)}
                        className="flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left text-sm transition hover:bg-[var(--win-button-hover)]"
                        style={{ backgroundColor: 'transparent', borderColor: 'var(--win-border)', color: 'var(--win-text)' }}
                      >
                        <span className="text-xl">{app.icon}</span>
                        <span>{app.label}</span>
                      </button>
                    ))
                ) : (
                  <div className="rounded-3xl p-4 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                    No apps found.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {filteredApps.slice(0, 8).map((app) => (
                  <button
                    key={app.appId}
                    type="button"
                    onClick={() => handleAppClick(app)}
                    className="group flex flex-col items-center gap-2 rounded-3xl p-3 text-center transition hover:bg-[var(--win-button-hover)]"
                  >
                    <span 
                      className="flex h-14 w-14 items-center justify-center rounded-[20px] text-3xl transition group-hover:scale-105"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      {app.icon}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--win-text)' }}>{app.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--win-border)' }}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--win-text)' }}>Recommended</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {RECOMMENDED.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border p-3 cursor-default transition hover:bg-[var(--win-button-hover)]"
                    style={{ backgroundColor: 'transparent', borderColor: 'var(--win-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: 'var(--win-button-active)' }}>
                        {item.icon}
                      </span>
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-medium" style={{ color: 'var(--win-text)' }}>{item.label}</p>
                        <p className="text-xs" style={{ color: 'var(--win-text-secondary)' }}>{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--win-border)' }}>
              <div className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 transition hover:bg-[var(--win-button-hover)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-active)', color: 'var(--win-text)' }}>
                  👤
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: 'var(--win-text)' }}>Your Name</p>
                  <p className="text-xs" style={{ color: 'var(--win-text-secondary)' }}>Signed in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleShutdown}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border text-sm transition hover:bg-[var(--win-button-hover)]"
                style={{ borderColor: 'var(--win-border)', backgroundColor: 'transparent', color: 'var(--win-text)' }}
                title="Power"
              >
                ⏻
              </button>
            </div>
          </div>

          <AnimatePresence>
            {shuttingDown ? (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 text-5xl">🪟</div>
                  <p className="text-xl font-semibold">Shutting down...</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default StartMenu
