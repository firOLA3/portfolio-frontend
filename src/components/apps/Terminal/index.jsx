import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '../../../store/useOSStore'

const AVAILABLE_COMMANDS = [
  'help',
  'about',
  'skills',
  'projects',
  'contact',
  'resume',
  'github',
  'clear',
  'theme',
  'sudo',
  'matrix',
  'date',
  'whoami',
]

const COMMANDS_TABLE = [
  ['help', 'Show all available commands'],
  ['about', 'About me and my background'],
  ['skills', 'List top skills and technologies'],
  ['projects', 'View my projects with links'],
  ['contact', 'Contact information and social links'],
  ['resume', 'Download my resume PDF'],
  ['github', 'Open my GitHub profile'],
  ['clear', 'Clear terminal output'],
  ['theme <light|dark>', 'Switch between light and dark theme'],
  ['sudo hire-me', '🎉 Easter egg'],
  ['matrix', 'Matrix rain animation'],
  ['date', 'Show current date and time'],
  ['whoami', 'Show my name and title'],
]

const SKILLS_LIST = [
  'JavaScript / TypeScript',
  'React & Next.js',
  'Node.js & Express',
  'MongoDB & PostgreSQL',
  'Tailwind CSS',
  'Framer Motion',
  'Docker & Git',
]

const PROJECTS_LIST = [
  { name: 'OS11 Portfolio', url: 'https://github.com' },
  { name: 'E-Learning Platform', url: 'https://github.com' },
  { name: 'Task Manager App', url: 'https://github.com' },
]

function Terminal() {
  const [lines, setLines] = useState([
    { type: 'text', content: 'Welcome to Terminal 🖥️' },
    { type: 'text', content: 'Type "help" for available commands' },
    { type: 'text', content: '' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [autocompletes, setAutocompletes] = useState([])
  const outputRef = useRef(null)
  const setTheme = useOSStore((s) => s.setTheme)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  const addLine = useCallback((type, content) => {
    setLines((prev) => [...prev, { type, content }])
  }, [])

  const executeCommand = useCallback(
    (cmd) => {
      const trimmed = cmd.trim().toLowerCase()
      const parts = trimmed.split(' ')
      const command = parts[0]

      addLine('command', `C:\\Portfolio> ${cmd}`)

      if (!command) {
        return
      }

      if (command === 'help') {
        addLine('text', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        addLine('text', 'AVAILABLE COMMANDS')
        addLine('text', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        COMMANDS_TABLE.forEach(([cmd, desc]) => {
          addLine('text', `${cmd.padEnd(20)} ${desc}`)
        })
        addLine('text', '')
      } else if (command === 'about') {
        addLine('text', 'Oyelowo Olaoluwa Jonathan')
        addLine('text', 'Full-Stack Developer | React | Node.js | MongoDB')
        addLine(
          'text',
          'Building beautiful, performant web experiences with modern technologies.'
        )
        addLine('text', '')
      } else if (command === 'skills') {
        addLine('text', 'Top Skills:')
        SKILLS_LIST.forEach((skill, i) => {
          addLine('text', `  ${i + 1}. ${skill}`)
        })
        addLine('text', '')
      } else if (command === 'projects') {
        addLine('text', 'Recent Projects:')
        PROJECTS_LIST.forEach((proj, i) => {
          addLine('text', `  ${i + 1}. ${proj.name} - ${proj.url}`)
        })
        addLine('text', '')
      } else if (command === 'contact') {
        addLine('text', 'Email: oyelowojon@gmail.com')
        addLine('text', 'GitHub: https://github.com/oyelowojon')
        addLine('text', 'LinkedIn: https://linkedin.com/in/oyelowojon')
        addLine('text', 'Twitter: https://twitter.com/oyelowojon')
        addLine('text', '')
      } else if (command === 'resume') {
        addLine('text', '📥 Downloading resume...')
        const link = document.createElement('a')
        link.href = '/resume.pdf'
        link.download = 'Oyelowo_Resume.pdf'
        link.click()
        addLine('text', '')
      } else if (command === 'github') {
        addLine('text', '🔗 Opening GitHub...')
        window.open('https://github.com/oyelowojon', '_blank')
        addLine('text', '')
      } else if (command === 'clear') {
        setLines([])
      } else if (command === 'theme') {
        const theme = parts[1]
        if (theme === 'light' || theme === 'dark') {
          setTheme(theme)
          addLine('text', `Theme switched to ${theme} mode`)
          addLine('text', '')
        } else {
          addLine('error', 'Usage: theme <light|dark>')
          addLine('text', '')
        }
      } else if (command === 'sudo' && parts[1] === 'hire-me') {
        addLine('text', '')
        addLine('text', '   🎉 ✨ 🎊 ✨ 🎉')
        addLine('text', '   HIRED! Welcome aboard! 🚀')
        addLine('text', '   🎉 ✨ 🎊 ✨ 🎉')
        addLine('text', '')
      } else if (command === 'matrix') {
        addLine('text', '🟢 Initializing Matrix sequence...')
        setTimeout(() => {
          addLine('text', '💚 Matrix complete.')
          addLine('text', '')
        }, 5000)
      } else if (command === 'date') {
        addLine('text', new Date().toString())
        addLine('text', '')
      } else if (command === 'whoami') {
        addLine('text', 'Oyelowo Olaoluwa Jonathan')
        addLine('text', 'Full-Stack Developer')
        addLine('text', '')
      } else {
        addLine('error', `command not found: ${command}`)
        addLine('text', '')
      }
    },
    [addLine, setTheme]
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) {
        executeCommand(input)
        setHistory((prev) => [...prev, input])
        setHistoryIndex(-1)
      }
      setInput('')
      setAutocompletes([])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = historyIndex + 1
      if (newIndex < history.length) {
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const matches = AVAILABLE_COMMANDS.filter((cmd) =>
        cmd.startsWith(input.toLowerCase())
      )
      if (matches.length === 1) {
        setInput(matches[0])
        setAutocompletes([])
      } else if (matches.length > 1) {
        setAutocompletes(matches)
      }
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-b-win-lg bg-black text-[#00ff00] font-mono text-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-3 text-white">
        <span className="font-semibold">Windows Terminal</span>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-white/10"
        >
          +
        </button>
      </div>

      <div
        ref={outputRef}
        className="flex-1 overflow-auto p-4 space-y-1 text-xs leading-relaxed break-words whitespace-pre-wrap"
      >
        {lines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={
              line.type === 'command'
                ? 'text-white'
                : line.type === 'error'
                ? 'text-red-500'
                : 'text-[#00ff00]'
            }
            style={{ wordBreak: 'break-word' }}
          >
            {line.content || '\u00A0'}
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-black px-4 py-3">
        {autocompletes.length > 0 && (
          <div className="mb-2 text-xs text-white/70">
            {autocompletes.map((cmd) => (
              <div key={cmd}>{cmd}</div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-white">C:\Portfolio&gt; </span>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              const matches = AVAILABLE_COMMANDS.filter((cmd) =>
                cmd.startsWith(e.target.value.toLowerCase())
              )
              setAutocompletes(matches.slice(0, 5))
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent outline-none text-[#00ff00]"
            spellCheck="false"
          />
          <span className="animate-pulse">▌</span>
        </div>
      </div>
    </div>
  )
}

export default Terminal
