import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Spinner } from 'flowbite-react'
import { useNotifStore } from '../../../store/useNotifStore'
import { api } from '../../../services/index'

const WELCOME_MESSAGE = {
  id: 'welcome',
  from: 'Oyelowo Olaoluwa',
  to: 'You',
  subject: 'Welcome to my portfolio!',
  date: new Date().toLocaleDateString(),
  preview: 'Thanks for stopping by. Feel free to reach out...',
  body: `Hi there! 👋

Thanks for visiting my portfolio. I'm a full-stack developer passionate about building beautiful, performant web experiences.

Whether you have a project opportunity, want to collaborate, or just want to chat about tech—I'd love to hear from you. Feel free to reach out using the contact form below.

Looking forward to connecting with you!

Best regards,
Oyelowo Olaoluwa
Full-Stack Developer
`,
}

function Contact() {
  const [currentView, setCurrentView] = useState('welcome')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const addNotification = useNotifStore((s) => s.addNotification)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      const response = await api.post('/api/contact', formData)
      if (response.data.success) {
        addNotification({
          id: `notif-${Date.now()}`,
          message: response.data.message,
          icon: '✉️',
          read: false,
        })
        setFormData({ name: '', email: '', subject: '', message: '' })
        setCurrentView('welcome')
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Failed to send message. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden rounded-b-win-lg bg-[var(--win-bg)]" style={{ color: 'var(--win-text)' }}>
      <aside className="w-full md:w-[160px] border-b md:border-b-0 md:border-r p-3 md:p-4 flex flex-row md:flex-col backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar gap-4 md:gap-0 items-center md:items-stretch" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
        <h2 className="md:mb-6 text-xs uppercase tracking-[0.24em] flex items-center gap-2 shrink-0" style={{ color: 'var(--win-text-secondary)' }}>
          <span>✉️</span> Mail
        </h2>
        <nav className="flex flex-row md:flex-col gap-2 md:space-y-2 mb-0 md:mb-auto shrink-0">
          <button
            type="button"
            className="flex shrink-0 w-auto md:w-full items-center gap-2 rounded-3xl px-4 py-2 md:py-3 text-sm font-medium transition bg-win-accent/10 border border-win-accent"
            style={{ color: 'var(--win-text)' }}
          >
            Inbox
            <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-win-accent text-[10px] font-bold text-white">
              1
            </span>
          </button>
          <button
            type="button"
            className="flex shrink-0 w-auto md:w-full items-center gap-2 rounded-3xl px-4 py-2 md:py-3 text-sm transition"
            style={{ color: 'var(--win-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Sent
          </button>
          <button
            type="button"
            className="flex shrink-0 w-auto md:w-full items-center gap-2 rounded-3xl px-4 py-2 md:py-3 text-sm transition"
            style={{ color: 'var(--win-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--win-button-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Drafts
          </button>
        </nav>
        <button
          type="button"
          onClick={() => setCurrentView('compose')}
          className="shrink-0 w-auto md:w-full rounded-3xl bg-win-accent px-4 py-2 md:py-3 text-sm font-medium text-white transition hover:bg-win-accent/90"
        >
          ✏️ Compose
        </button>
      </aside>

      <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col shrink-0 backdrop-blur-xl no-scrollbar" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-bg)' }}>
        <div
          onClick={() => setCurrentView('welcome')}
          className="w-[200px] md:w-full shrink-0 p-4 border-r md:border-r-0 md:border-b cursor-pointer transition"
          style={{
            borderColor: currentView === 'welcome' ? 'var(--win-accent)' : 'var(--win-border)',
            backgroundColor: currentView === 'welcome' ? 'var(--win-button-hover)' : 'transparent',
          }}
        >
          <div className="text-sm font-medium truncate" style={{ color: 'var(--win-text)' }}>
            {WELCOME_MESSAGE.subject}
          </div>
          <div className="text-xs truncate mt-1" style={{ color: 'var(--win-text-secondary)' }}>
            {WELCOME_MESSAGE.preview}
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--win-text-secondary)', opacity: 0.6 }}>{WELCOME_MESSAGE.date}</div>
        </div>
      </div>

      <main className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {currentView === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-2 rounded-3xl border p-6" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)' }}>
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--win-border)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--win-text-secondary)' }}>From:</p>
                    <p className="font-semibold" style={{ color: 'var(--win-text)' }}>{WELCOME_MESSAGE.from}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--win-text-secondary)' }}>{WELCOME_MESSAGE.date}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm mb-2" style={{ color: 'var(--win-text-secondary)' }}>To:</p>
                  <p className="font-semibold" style={{ color: 'var(--win-text)' }}>{WELCOME_MESSAGE.to}</p>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-semibold" style={{ color: 'var(--win-text)' }}>{WELCOME_MESSAGE.subject}</p>
                </div>
              </div>

              <div className="rounded-3xl border p-6 whitespace-pre-wrap leading-relaxed text-sm" style={{ borderColor: 'var(--win-border)', backgroundColor: 'var(--win-button-hover)', color: 'var(--win-text)' }}>
                {WELCOME_MESSAGE.body}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="compose"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 max-w-2xl"
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--win-text)' }}>New Message</h2>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--win-text-secondary)' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full rounded-3xl border px-4 py-3 outline-none transition focus:ring-2"
                  style={{
                    borderColor: errors.name ? '#ff6b6b' : 'var(--win-border)',
                    backgroundColor: 'var(--win-button-hover)',
                    color: 'var(--win-text)',
                  }}
                />
                {errors.name && <p className="text-xs text-red-400 mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--win-text-secondary)' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full rounded-3xl border px-4 py-3 outline-none transition focus:ring-2"
                  style={{
                    borderColor: errors.email ? '#ff6b6b' : 'var(--win-border)',
                    backgroundColor: 'var(--win-button-hover)',
                    color: 'var(--win-text)',
                  }}
                />
                {errors.email && <p className="text-xs text-red-400 mt-2">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--win-text-secondary)' }}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Message subject"
                  className="w-full rounded-3xl border px-4 py-3 outline-none transition focus:ring-2"
                  style={{
                    borderColor: errors.subject ? '#ff6b6b' : 'var(--win-border)',
                    backgroundColor: 'var(--win-button-hover)',
                    color: 'var(--win-text)',
                  }}
                />
                {errors.subject && (
                  <p className="text-xs text-red-400 mt-2">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'var(--win-text-secondary)' }}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message (min 10 characters)"
                  rows={6}
                  className="w-full rounded-3xl border px-4 py-3 outline-none transition resize-none focus:ring-2"
                  style={{
                    borderColor: errors.message ? '#ff6b6b' : 'var(--win-border)',
                    backgroundColor: 'var(--win-button-hover)',
                    color: 'var(--win-text)',
                  }}
                />
                {errors.message && (
                  <p className="text-xs text-red-400 mt-2">{errors.message}</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-3xl border p-4 text-sm text-red-300" style={{ borderColor: 'var(--win-border)', backgroundColor: 'rgba(255,0,0,0.1)' }}>
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-win-accent px-6 py-3 font-medium text-white transition hover:bg-win-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="light" /> Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Contact
