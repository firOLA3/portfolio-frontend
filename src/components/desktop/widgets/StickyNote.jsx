import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function StickyNote() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [isVisible, setIsVisible] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isMobile, isVisible])

  return (
    <>
      {/* Flashy Mobile Toggle Button */}
      {isMobile && !isVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          type="button"
          onClick={() => setIsVisible(true)}
          className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.5)] pointer-events-auto"
          aria-label="Show Welcome Note"
        >
          <span className="relative flex h-full w-full items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative text-xl">💡</span>
          </span>
        </motion.button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ x: isMobile ? 60 : 380, y: isMobile ? 80 : 60, opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-0 w-40 md:w-64 cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-bl-xl md:rounded-bl-3xl rounded-tr-xl md:rounded-tr-3xl bg-yellow-200 p-3 pt-7 md:p-6 text-gray-800 shadow-[0_15px_30px_rgba(0,0,0,0.3)] group">
              {/* Folded corner effect */}
              <div className="absolute right-0 top-0 h-3 w-3 md:h-6 md:w-6 bg-yellow-300 shadow-sm rounded-bl-sm md:rounded-bl-lg" />
              
              {/* Close Button (Hidden on Mobile) */}
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-2 h-6 w-6 rounded-full hidden md:flex items-center justify-center bg-black/10 text-black/60 opacity-0 transition-opacity hover:bg-black/20 hover:text-black/90 group-hover:opacity-100 text-base"
                aria-label="Close Note"
              >
                ✕
              </button>

              <h3 className="mb-0.5 md:mb-2 text-sm md:text-lg font-bold font-mono">Hello there! 👋</h3>
              <p className="font-mono text-[10px] md:text-sm leading-snug md:leading-relaxed text-gray-700">
                Welcome to my OS portfolio! <br /><br />
                Double-click the <strong>About Me</strong> icon to get started, or explore the terminal if you're feeling adventurous.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default StickyNote
