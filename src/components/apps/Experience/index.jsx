import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from 'flowbite-react'

const EXPERIENCES = [
  {
    id: 'exp-1',
    company: 'John Ethel Schools',
    role: 'Media Personnel',
    type: 'work',
    icon: '💼',
    startDate: 'Aug 2026',
    endDate: 'Oct 2026',
    location: 'Ogbomoso, Oyo State',
    responsibilities: [
      'Designed and deployed a user-management ecosystem including a school portal, learning management system, school database, and employee management system.',
      "Directed printing and publishing of the school's complete-edition manuals, managing content, layout, and production timelines.",
    ],
    technologies: ['MERN Stack', 'Next.js', 'Content & Layout', 'Publishing'],
  },
  {
    id: 'exp-2',
    company: 'SQI College of ICT',
    role: 'Junior Developer (Student Internship)',
    type: 'work',
    icon: '💻',
    startDate: 'Apr 2025',
    endDate: 'Sept 2025',
    location: 'Ogbomoso, Oyo State',
    responsibilities: [
      'Contributed code and technical support to college digital initiatives while assisting instructors with full-stack development coursework.',
      'Served on the Protocol Team and led college publicity and awareness campaigns as a volunteer, coordinating institutional event logistics.',
    ],
    technologies: ['Full-Stack Development', 'Technical Support', 'Course Assistance', 'Event Coordination'],
  },
  {
    id: 'edu-1',
    company: 'Ladoke Akintola University of Technology (LAUTECH)',
    role: 'Bachelor of Technology, Computer Science',
    type: 'education',
    icon: '🎓',
    startDate: 'Jan 2022',
    endDate: 'July 2026',
    location: 'Ogbomoso, Oyo State',
    responsibilities: ['Bachelor of Technology degree in Computer Science.'],
    technologies: ['Computer Science'],
  },
  {
    id: 'edu-2',
    company: 'SQI College of ICT',
    role: 'Professional Diploma, Full Stack Software Development',
    type: 'education',
    icon: '🎓',
    startDate: '2025',
    endDate: '2026',
    location: 'Ogbomoso, Oyo State',
    responsibilities: ['Professional Diploma in Full Stack Software Development.'],
    technologies: ['Full Stack Software Development'],
  },
]

function Experience() {
  const [selectedId, setSelectedId] = useState(EXPERIENCES[0].id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const selected = EXPERIENCES.find((exp) => exp.id === selectedId)

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden rounded-b-win-lg bg-[var(--win-bg)]" style={{ color: 'var(--win-text)' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 z-10 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 absolute md:relative z-20 h-full w-[240px] shrink-0 border-r p-4 overflow-auto backdrop-blur-xl transition-transform duration-300 ease-in-out`} 
        style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--win-text-secondary)' }}>
            Experience & Education
          </h2>
          <button 
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-black/10 dark:hover:bg-white/10" 
            onClick={() => setIsSidebarOpen(false)}
            style={{ color: 'var(--win-text)', borderColor: 'var(--win-border)' }}
          >
            ✕
          </button>
        </div>
        <nav className="space-y-2">
          {EXPERIENCES.map((exp) => {
            const active = selectedId === exp.id
            const startYear = exp.startDate.split('-')[0]
            const endYear = exp.endDate.split('-')[0]

            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => {
                  setSelectedId(exp.id)
                  setIsSidebarOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-left transition"
                style={{
                  borderColor: active ? 'var(--win-accent)' : 'var(--win-border)',
                  backgroundColor: active ? 'var(--win-button-active)' : 'transparent',
                  color: active ? 'var(--win-text)' : 'var(--win-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'var(--win-border)'
                    e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'var(--win-border)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 rounded-full ${
                    exp.type === 'work' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{exp.role}</div>
                  <div className="text-xs" style={{ color: 'var(--win-text-secondary)' }}>
                    {startYear}–{endYear}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-7 relative">
        <button
          className="md:hidden mb-4 flex items-center justify-center w-10 h-10 rounded-xl border"
          style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          ☰
        </button>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold" style={{ color: 'var(--win-text)' }}>{selected.role}</h1>
                <p className="mt-2 text-lg text-win-accent">{selected.company}</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge color="blue" className="rounded-full">
                  {selected.startDate} – {selected.endDate}
                </Badge>
                <Badge color="light" className="rounded-full" style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}>
                  📍 {selected.location}
                </Badge>
              </div>

              <div className="border-t pt-6" style={{ borderColor: 'var(--win-border)' }}>
                <h2 className="mb-4 text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--win-text-secondary)' }}>
                  {selected.type === 'work' ? 'Responsibilities & Achievements' : 'Details'}
                </h2>
                <ul className="space-y-3">
                  {selected.responsibilities.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      style={{ color: 'var(--win-text)' }}
                      className="flex gap-3"
                    >
                      <span className="mt-1 shrink-0 text-win-accent">▸</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-6" style={{ borderColor: 'var(--win-border)' }}>
                <h2 className="mb-4 text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--win-text-secondary)' }}>
                  {selected.type === 'work' ? 'Skills & Tools' : 'Qualification'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selected.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      color="light"
                      className="rounded-full"
                      style={{ backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Experience
