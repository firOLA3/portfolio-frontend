import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from 'flowbite-react'

const EXPERIENCES = [
  {
    id: 'exp-1',
    company: 'Tech Startup Co',
    role: 'Full-Stack Developer',
    type: 'work',
    icon: '💼',
    startDate: '2023-06',
    endDate: '2024-12',
    location: 'Remote',
    responsibilities: [
      'Built React-based dashboard for real-time data analytics with 10k+ concurrent users',
      'Developed Node.js/Express backend APIs handling 5M+ requests/day',
      'Implemented MongoDB optimization reducing query time by 60%',
      'Led frontend migration from Vue to React, improving performance by 40%',
      'Mentored 3 junior developers on best practices and code quality',
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    id: 'exp-2',
    company: 'Digital Agency XYZ',
    role: 'Frontend Developer',
    type: 'work',
    icon: '🎨',
    startDate: '2022-01',
    endDate: '2023-05',
    location: 'Hybrid — Lagos',
    responsibilities: [
      'Developed 15+ client websites using React, Tailwind CSS, and Next.js',
      'Improved page load time by 45% through code splitting and image optimization',
      'Designed and implemented responsive UI components for reusable component library',
      'Collaborated with designers to translate Figma mockups into pixel-perfect interfaces',
    ],
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Figma'],
  },
  {
    id: 'edu-1',
    company: 'University of Lagos',
    role: 'B.Sc Computer Science',
    type: 'education',
    icon: '🎓',
    startDate: '2018-09',
    endDate: '2022-06',
    location: 'Lagos, Nigeria',
    responsibilities: [
      'GPA: 3.8/4.0',
      'Relevant coursework: Data Structures, Algorithms, Web Development, Database Design',
      'Senior capstone project: E-learning platform with real-time collaboration (React + Node.js)',
    ],
    technologies: ['Java', 'Python', 'C++', 'SQL', 'Web Technologies'],
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
                  Technologies
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
