import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { Tooltip } from 'flowbite-react'

const TAB_ITEMS = [
  { key: 'languages', label: 'Languages' },
  { key: 'frameworks', label: 'Frameworks' },
  { key: 'tools', label: 'Tools' },
]

const LANGUAGES = [
  { name: 'JavaScript', level: 92, color: '#f7df1e' },
  { name: 'TypeScript', level: 85, color: '#3178c6' },
  { name: 'Python', level: 78, color: '#3572A5' },
  { name: 'HTML/CSS', level: 95, color: '#e34c26' },
  { name: 'SQL', level: 70, color: '#336791' },
]

const FRAMEWORKS = [
  { name: 'React', value: 90 },
  { name: 'Node.js', value: 85 },
  { name: 'Express', value: 82 },
  { name: 'Next.js', value: 75 },
  { name: 'MongoDB', value: 80 },
  { name: 'Tailwind', value: 95 },
]

const TOOLS = [
  { name: 'VS Code', icon: '🧑‍💻', level: 'Expert' },
  { name: 'Git', icon: '🔧', level: 'Expert' },
  { name: 'GitHub', icon: '🐙', level: 'Expert' },
  { name: 'Docker', icon: '🐳', level: 'Proficient' },
  { name: 'Figma', icon: '🎨', level: 'Proficient' },
  { name: 'Postman', icon: '📬', level: 'Proficient' },
  { name: 'Linux', icon: '🐧', level: 'Proficient' },
  { name: 'MongoDB Compass', icon: '🧭', level: 'Familiar' },
  { name: 'Vercel', icon: '☁️', level: 'Familiar' },
  { name: 'Netlify', icon: '🌐', level: 'Familiar' },
  { name: 'Cloudinary', icon: '☁️', level: 'Familiar' },
  { name: 'Jest', icon: '🧪', level: 'Proficient' },
]

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

function useCountUp(target) {
  const motionValue = useMotionValue(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(motionValue, target, {
      duration: 0.6,
      ease: 'easeOut',
    })
    const unsubscribe = motionValue.on('change', (latest) => {
      setCount(Math.round(latest))
    })

    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [motionValue, target])

  return count
}

function LanguageRow({ language, index }) {
  const count = useCountUp(language.level)

  return (
    <motion.div
      className="overflow-hidden rounded-3xl border p-4"
      style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <div className="grid grid-cols-[2fr_5fr_1fr] items-center gap-4">
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--win-text)' }}>
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: language.color }}
          />
          <span>{language.name}</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--win-button-hover)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${language.level}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: language.color }}
            />
          </div>
        </div>
        <div className="text-right text-sm font-semibold" style={{ color: 'var(--win-text)' }}>
          {count}%
        </div>
      </div>
    </motion.div>
  )
}

function Skills() {
  const [activeTab, setActiveTab] = useState('languages')

  const tabContent = useMemo(() => {
    if (activeTab === 'languages') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-[2fr_5fr_1fr] gap-4 rounded-3xl px-4 py-3 text-xs uppercase tracking-[0.3em]" style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
            <div>Language</div>
            <div>Proficiency</div>
            <div className="text-right">Level</div>
          </div>

          <div className="space-y-3">
            {LANGUAGES.map((language, index) => (
              <LanguageRow
                key={language.name}
                language={language}
                index={index}
              />
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'frameworks') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {FRAMEWORKS.map((framework) => (
            <motion.div
              key={framework.name}
              className="rounded-3xl border p-4"
              style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 flex items-center justify-between text-sm" style={{ color: 'var(--win-text-secondary)' }}>
                <span>{framework.name}</span>
                <span style={{ color: 'var(--win-text)' }}>{framework.value}%</span>
              </div>
              <div className="mb-4 h-24 overflow-hidden rounded-3xl p-3" style={{ backgroundColor: 'var(--win-button-hover)' }}>
                <svg viewBox="0 0 120 60" className="h-full w-full">
                  <motion.path
                    d="M5 45 C25 40 35 20 45 25 C55 30 65 50 75 35 C85 20 95 40 115 15"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.75)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
              </div>
              <div className="rounded-3xl p-3 text-sm" style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text-secondary)' }}>
                Usage trend is stable and increasing.
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <motion.div
            key={tool.name}
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl border p-4 text-center"
            style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}
          >
            <Tooltip content={tool.level} placement="top">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-3xl text-2xl" style={{ backgroundColor: 'var(--win-button-hover)' }}>
                {tool.icon}
              </div>
            </Tooltip>
            <div className="text-sm font-semibold" style={{ color: 'var(--win-text)' }}>{tool.name}</div>
            <div className="mt-2 text-xs" style={{ color: 'var(--win-text-secondary)' }}>{tool.level}</div>
          </motion.div>
        ))}
      </div>
    )
  }, [activeTab])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-b-win-lg shadow-inner shadow-black/5" style={{ backgroundColor: 'var(--win-bg)', color: 'var(--win-text)' }}>
      <div className="flex items-center gap-2 border-b p-4 backdrop-blur-xl" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="rounded-3xl px-4 py-2 text-sm font-medium transition shadow-lg"
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--win-accent)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--win-text-secondary)',
              boxShadow: activeTab === tab.key ? '0 0 0 3px rgba(0, 120, 212, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            {tabContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Skills
