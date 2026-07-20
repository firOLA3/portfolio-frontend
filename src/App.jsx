import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useOSStore } from './store/useOSStore'
import BootScreen from './components/os/BootScreen'
import LockScreen from './components/os/LockScreen'
import Desktop from './components/os/Desktop'


function App() {
  const stage = useOSStore((s) => s.stage)
  const theme = useOSStore((s) => s.theme)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])



  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AnimatePresence mode="wait">
              {stage === 'boot' && <BootScreen key="boot" />}
              {stage === 'lock' && <LockScreen key="lock" />}
              {stage === 'desktop' && <Desktop key="desktop" />}
            </AnimatePresence>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
