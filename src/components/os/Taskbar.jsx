import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useOSStore } from '../../store/useOSStore'
import { useWindowStore } from '../../store/useWindowStore'
import { useNotifStore } from '../../store/useNotifStore'
import { soundService } from '../../services/soundService'
import Clock from './Clock'
import NotificationCenter from './NotificationCenter'
import StartMenu from './StartMenu'

const TASKBAR_APPS = [
  { appId: 'about', label: 'About Me', icon: '👤' },
  { appId: 'projects', label: 'Projects', icon: '💼' },
  { appId: 'skills', label: 'Skills', icon: '🧠' },
  { appId: 'experience', label: 'Experience', icon: '📈' },
  { appId: 'contact', label: 'Contact', icon: '✉️' },
  { appId: 'terminal', label: 'Terminal', icon: '⌨️' },
  { appId: 'notepad', label: 'Devlogs', icon: '📝' },
]

function Taskbar() {
  const windows = useWindowStore((s) => s.windows)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const openWindow = useWindowStore((s) => s.openWindow)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const theme = useOSStore((s) => s.theme)
  const setTheme = useOSStore((s) => s.setTheme)
  const isStartMenuOpen = useOSStore((s) => s.isStartMenuOpen)
  const toggleStartMenu = useOSStore((s) => s.toggleStartMenu)
  const notificationCount = useNotifStore((s) => s.notifications.filter((n) => !n.read).length)
  const isNotifOpen = useNotifStore((s) => s.isOpen)
  const togglePanel = useNotifStore((s) => s.togglePanel)

  const [pinnedApps, setPinnedApps] = useState(() => TASKBAR_APPS.map((app) => app.appId))
  const [contextMenu, setContextMenu] = useState(null)
  const menuRef = useRef(null)
  const touchTimer = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setContextMenu(null)
    }

    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

  useEffect(() => {
    const handleGlobalWin = (event) => {
      if (event.key === 'Meta' || event.key === 'Win') {
        event.preventDefault()
        toggleStartMenu()
      }
    }

    window.addEventListener('keydown', handleGlobalWin)
    return () => window.removeEventListener('keydown', handleGlobalWin)
  }, [toggleStartMenu])

  const openApps = useMemo(
    () =>
      windows.reduce((map, windowItem) => {
        map[windowItem.appId] = windowItem
        return map
      }, {}),
    [windows],
  )

  const displayedApps = useMemo(() => {
    const allApps = [...new Set([...pinnedApps, ...windows.map((windowItem) => windowItem.appId)])]
    return allApps.map((appId) => TASKBAR_APPS.find((app) => app.appId === appId) ?? { appId, label: appId, icon: '❔' })
  }, [pinnedApps, windows])

  const handleAppClick = (appId, label) => {
    const windowItem = openApps[appId]
    if (!windowItem) {
      soundService.play('popopen')
      openWindow(appId, label)
      return
    }

    if (windowItem.isMinimized) {
      restoreWindow(windowItem.id)
      return
    }

    if (windowItem.id === activeWindowId) {
      minimizeWindow(windowItem.id)
      return
    }

    focusWindow(windowItem.id)
  }

  const handleAppContext = (event, appId) => {
    event.preventDefault()
    setContextMenu({ appId, x: event.clientX, y: event.clientY })
  }

  const handleMenuAction = (action) => {
    if (!contextMenu) return
    const appId = contextMenu.appId
    const windowItem = openApps[appId]

    if (action === 'open') {
      if (windowItem?.isMinimized) {
        restoreWindow(windowItem.id)
      } else {
        const appEntry = TASKBAR_APPS.find((app) => app.appId === appId)
        openWindow(appId, appEntry?.label ?? appId)
      }
    }

    if (action === 'close' && windowItem) {
      closeWindow(windowItem.id)
    }

    if (action === 'pin') {
      setPinnedApps((prev) =>
        prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
      )
    }

    setContextMenu(null)
  }

  const handleTouchStart = (event, appId) => {
    const touch = event.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    touchTimer.current = setTimeout(() => {
      // Calculate a safe Y position so it doesn't spawn off-screen
      const safeY = Math.min(y, window.innerHeight - 150)
      setContextMenu({ appId, x, y: safeY })
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }, 500)
  }

  const handleTouchMove = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current)
      touchTimer.current = null
    }
  }

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current)
      touchTimer.current = null
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 h-14 bg-[var(--taskbar-bg)] backdrop-blur-taskbar border-t border-[var(--win-border)]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-3" style={{ color: 'var(--win-text)' }}>
          <div className="flex shrink-0 items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleStartMenu}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition max-[480px]:hidden"
              style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)' }
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
              aria-label="Open Start Menu"
            >
              🪟
            </motion.button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-2 overflow-x-auto px-2 mx-2 sm:px-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {displayedApps.map((app) => {
              const windowItem = openApps[app.appId]
              const isOpen = Boolean(windowItem)
              const isActive = windowItem?.id === activeWindowId
              return (
                <div key={app.appId} className={`relative group ${app.appId === 'terminal' ? 'max-[480px]:hidden' : ''}`}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleAppClick(app.appId, app.label)}
                    onContextMenu={(event) => handleAppContext(event, app.appId)}
                    onTouchStart={(e) => handleTouchStart(e, app.appId)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition ${
                      isActive ? 'ring-1' : ''
                    }`}
                    style={{
                      borderColor: 'var(--win-border)',
                      backgroundColor: 'var(--win-button-hover)',
                      ringColor: isActive ? 'var(--win-border-light)' : 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)' }
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
                  >
                    {app.icon}
                  </motion.button>
                  <span 
                    className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs shadow-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100" 
                    style={{ 
                      backgroundColor: 'var(--win-bg)', 
                      color: 'var(--win-text)', 
                      borderColor: 'var(--win-border)' 
                    }}
                  >
                    {app.label}
                  </span>
                  {isOpen ? (
                    <motion.span 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                      style={{ backgroundColor: 'var(--win-accent)' }}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition max-[480px]:hidden"
              style={{
                borderColor: 'var(--win-border)',
                backgroundColor: 'var(--win-button-hover)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)' }
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '☀️' : '🌙'}
            </motion.button>

            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-10 min-w-[44px] items-center justify-center rounded-2xl border text-sm" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                📶
              </div>
              <div className="flex h-10 min-w-[44px] items-center justify-center rounded-2xl border text-sm" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                🔋
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePanel}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition max-[480px]:hidden"
              style={{
                borderColor: 'var(--win-border)',
                backgroundColor: 'var(--win-button-hover)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-active)' }
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
              aria-label="Notification Center"
            >
              🔔
              {notificationCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </motion.button>

            <Clock />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isNotifOpen ? <NotificationCenter key="notification-center" /> : null}
      </AnimatePresence>

      <StartMenu />

      {contextMenu ? (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-3xl border bg-[var(--win-bg)] p-2 shadow-2xl backdrop-blur-xl"
          style={{ 
            left: Math.min(contextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 180 : contextMenu.x), 
            top: contextMenu.y, 
            borderColor: 'var(--win-border)' 
          }}
        >
          <button
            type="button"
            className="block w-full rounded-2xl px-4 py-2 text-left text-sm transition"
            style={{ color: 'var(--win-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent' }
            onClick={() => handleMenuAction('open')}
          >
            Open
          </button>
          <button
            type="button"
            className="block w-full rounded-2xl px-4 py-2 text-left text-sm transition"
            style={{ color: 'var(--win-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent' }
            onClick={() => handleMenuAction('close')}
          >
            Close window
          </button>
          <button
            type="button"
            className="block w-full rounded-2xl px-4 py-2 text-left text-sm transition"
            style={{ color: 'var(--win-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)' }
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent' }
            onClick={() => handleMenuAction('pin')}
          >
            {pinnedApps.includes(contextMenu.appId) ? 'Unpin from taskbar' : 'Pin to taskbar'}
          </button>
        </div>
      ) : null}
    </>
  )
}

export default Taskbar
