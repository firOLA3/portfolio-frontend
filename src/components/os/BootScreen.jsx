import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '../../store/useOSStore'

const DOT_COUNT = [0, 1, 2]

function BootScreen() {
  const advanceStage = useOSStore((s) => s.advanceStage)

  useEffect(() => {
    const timer = window.setTimeout(() => advanceStage(), 3000)
    return () => window.clearTimeout(timer)
  }, [advanceStage])

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex flex-col items-center gap-14">
        <div className="grid h-28 w-28 grid-cols-2 gap-2 rounded-3xl bg-black/80 p-3 shadow-[0_0_80px_rgba(255,255,255,0.08)]">
          <div className="rounded-2xl bg-[#00a4ef]" />
          <div className="rounded-2xl bg-[#00bcf2]" />
          <div className="rounded-2xl bg-[#00ef9f]" />
          <div className="rounded-2xl bg-[#f9c80e]" />
        </div>

        <div className="flex items-center gap-3">
          {DOT_COUNT.map((index) => (
            <motion.span
              key={index}
              className="h-3 w-3 rounded-full bg-white/80"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -8, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default BootScreen
