import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SECTIONS = [
  { id: 'system', label: '🖥️ System' },
  { id: 'about', label: '👤 About' },
  { id: 'links', label: '🔗 Links' },
]

const PROFILE = {
  name: 'Oyelowo Olaoluwa Jonathan',
  role: 'Full-Stack Developer',
  languages: 'JavaScript, TypeScript',
  frameworks: 'React, Node.js, Express, Next.js',
  database: 'MongoDB, PostgreSQL',
  tools: 'Git, Figma, VS Code, Cursor, Gemini, ',
  os: 'Windows',
  status: '✅ Available for Hire',
}

const SKILLS = [
  { label: 'JavaScript', percent: 60 },
  { label: 'TypeScript', percent: 70 },
  { label: 'React', percent: 92 },
  { label: 'Node.js', percent: 59 },
  { label: 'Next.js', percent: 54},
]

const LINKS = [
  { label: 'GitHub', icon: '🐙', url: 'https://github.com/firOLA3', external: true },
  { label: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com', external: true },
  { label: 'Twitter/X', icon: '🐦', url: 'https://x.com/firOLA10', external: true },
  { label: 'Resume', icon: '📄', url: '/resume.pdf', download: true },
]

function About({ title }) {
  const [section, setSection] = useState('system')

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden rounded-b-win-lg bg-[var(--win-bg)] text-[var(--win-text)]">
      <aside className="w-full md:w-[220px] border-b md:border-b-0 md:border-r p-4 md:p-6 backdrop-blur-xl shrink-0 flex flex-row md:flex-col overflow-x-auto no-scrollbar gap-6 items-center md:items-stretch" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
        <div className="flex flex-row md:flex-col items-center gap-3 md:pb-6 text-left md:text-center shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border text-3xl" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}>
            Y
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--win-text-secondary)' }}>{title}</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--win-text)' }}>{PROFILE.name}</p>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 shrink-0">
          {SECTIONS.map((item) => {
            const isActive = section === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex shrink-0 items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm transition`}
                style={{
                  backgroundColor: isActive ? 'var(--win-button-active)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--win-accent)' : '4px solid transparent',
                  color: isActive ? 'var(--win-text)' : 'var(--win-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-7 relative">
        <AnimatePresence mode="wait">
          {section === 'system' ? (
            <motion.section
              key="system"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl font-semibold" style={{ color: 'var(--win-text)' }}>About This Developer</h1>
              <div className="mt-6 overflow-hidden rounded-3xl border p-4 md:p-6" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-active)' }}>
                <dl className="grid gap-4 text-sm">
                  {Object.entries({
                    Name: PROFILE.name,
                    Role: PROFILE.role,
                    Languages: PROFILE.languages,
                    Frameworks: PROFILE.frameworks,
                    Database: PROFILE.database,
                    Tools: PROFILE.tools,
                    OS: PROFILE.os,
                    Status: PROFILE.status,
                  }).map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b py-3 last:border-0" style={{ borderColor: 'var(--win-border)' }}>
                      <dt className="text-[var(--win-text-secondary)] font-medium">{label}</dt>
                      <dd className="text-[var(--win-text)]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 space-y-5">
                  {SKILLS.map((skill) => (
                    <div key={skill.label}>
                      <div className="mb-2 flex items-center justify-between text-sm" style={{ color: 'var(--win-text)' }}>
                        <span>{skill.label}</span>
                        <span>{skill.percent}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--win-button-hover)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percent}%` }}
                          transition={{ duration: 1.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: 'var(--win-accent)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          ) : section === 'about' ? (
            <motion.section
              key="about"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl font-semibold" style={{ color: 'var(--win-text)' }}>About This Developer</h1>
              <div className="mt-6 space-y-5 rounded-3xl border p-4 md:p-6" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-active)' }}>
                <p className="text-sm leading-7" style={{ color: 'var(--win-text)' }}>
                  I am a young full-stack developer with a passion for crafting polished web experiences that feel fast, modern, and intuitive. I enjoy turning complex problems into clean, maintainable solutions using React, Next.js, Node.js, and cloud-friendly architectures.
                </p>
                <p className="text-sm leading-7" style={{ color: 'var(--win-text)' }}>
                  My experience spans front-end design systems, backend APIs, and end-to-end deployment workflows. I love collaborating closely with product teams, designers, and engineers to ship features that users love. I also love to integrate Artificial Intelligence to increase work speed rate and efficiency.
                </p>
                <p className="text-sm leading-7" style={{ color: 'var(--win-text)' }}>
                  Outside of work, I stay curious by exploring new technologies, building side projects, and learning through mentorship and community.
                </p>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="links"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-3xl font-semibold" style={{ color: 'var(--win-text)' }}>Links</h1>
              <div className="mt-6 grid gap-4">
                {LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer' : undefined}
                    download={link.download}
                    className="flex items-center justify-between rounded-3xl border px-5 py-4 text-sm transition"
                    style={{ borderColor: 'var(--win-border)', backgroundColor: 'transparent', color: 'var(--win-text)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </span>
                    <span style={{ color: 'var(--win-text-secondary)' }}>↗</span>
                  </a>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default About
