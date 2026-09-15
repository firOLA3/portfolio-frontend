import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useOSStore } from './store/useOSStore'
import { useWindowStore } from './store/useWindowStore'
import Desktop from './components/os/Desktop'
import BootScreen from './components/os/BootScreen'
import LockScreen from './components/os/LockScreen'

function App() {
  const stage = useOSStore((s) => s.stage)
  const theme = useOSStore((s) => s.theme)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const openWindow = useWindowStore((s) => s.openWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const navigate = useNavigate()
  const location = useLocation()

  // Sync route changes with window focus
  useEffect(() => {
    const pathname = location.pathname
    // Extract appId from pathname like /app/about -> about
    if (pathname.startsWith('/app/')) {
      const appId = pathname.substring(5) // remove '/app/'
      // Use label from state if available (when navigating via desktop icon), otherwise fallback to capitalized appId
      const label = location.state?.label || appId.charAt(0).toUpperCase() + appId.slice(1)
      // Open the window if not already open
      openWindow(appId, label)
      // Focus this window
      focusWindow(appId)
    } else if (pathname === '/') {
      // Default route: no specific app focused, but we can show desktop
      // Optionally, we could focus nothing or show a default app
      // For now, do nothing special
    }
  }, [location.pathname, openWindow, focusWindow])

  // When window focus changes via user interaction (e.g., clicking taskbar), update URL
  // We'll use a ref to ignore updates that originate from URL changes to prevent loops
  const isUpdatingFromUrl = useRef(false)

  useEffect(() => {
    const unsubscribe = useWindowStore.subscribe(state => {
      if (isUpdatingFromUrl.current) {
        isUpdatingFromUrl.current = false
        return
      }
      const activeWindow = state.windows.find(w => w.id === state.activeWindowId)
      const appId = activeWindow?.appId
      try {
        isUpdatingFromUrl.current = true
        if (appId) {
          // Update URL to /app/{appId}
          navigate(`/app/${appId}`, { replace: false })
        } else {
          // No active window, go to root
          navigate('/', { replace: false })
        }
      } finally {
        isUpdatingFromUrl.current = false
      }
    })
    return unsubscribe
  }, [navigate])

  // When a window is closed, if it was the active window, we need to focus another window
  // We'll handle this in the window store or here? Let's do in store: when closing a window, if it's active, focus another.
  // We'll assume the store already handles that.

  return (
    <>
      <AnimatePresence>
        {stage === 'boot' && <BootScreen key="boot" />}
        {stage === 'lock' && <LockScreen key="lock" />}
      </AnimatePresence>

      {stage === 'desktop' && (
        <Routes>
          {/* Default route - show desktop */}
          <Route path="/" element={<Desktop />} />
          {/* App routes - these will be handled by the useEffect above to open/focus window */}
          {/* We don't need to render anything here because the Desktop is always rendered and windows are managed by WindowManager */}
          {/* But we need to have these routes so that the URL can be /app/* */}
          <Route path="/app/*" element={<Desktop />} />
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}

export default App