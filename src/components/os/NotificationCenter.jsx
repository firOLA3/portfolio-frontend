import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNotifStore } from '../../store/useNotifStore'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildMonthGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < startDay; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function NotificationCenter() {
  const panelRef = useRef(null)
  const notifications = useNotifStore((s) => s.notifications)
  const isOpen = useNotifStore((s) => s.isOpen)
  const dismissNotification = useNotifStore((s) => s.dismissNotification)
  const togglePanel = useNotifStore((s) => s.togglePanel)
  const markAllRead = useNotifStore((s) => s.markAllRead)

  const now = new Date()
  const monthLabel = now.toLocaleDateString([], { month: 'long', year: 'numeric' })
  const days = useMemo(() => buildMonthGrid(now), [now])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        togglePanel()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') togglePanel()
    }

    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, togglePanel])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          ref={panelRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed right-0 bottom-14 top-0 z-40 w-[380px] border-l border-[var(--win-border)] bg-[var(--win-bg)] p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--win-text)]">Notification Center</h2>
              <p className="text-sm text-[var(--win-text-secondary)]">Recent alerts and updates</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-[var(--win-border)] bg-[var(--win-button-hover)] px-3 py-1 text-sm text-[var(--win-text)] transition hover:bg-[var(--win-button-active)]"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between gap-3 rounded-3xl border border-[var(--win-border)] bg-[var(--win-bg-alt)] p-4"
                >
                  <div>
                    <div className="text-xl">{notif.icon}</div>
                    <p className="mt-2 text-sm text-[var(--win-text)]">{notif.message}</p>
                  </div>
                  <button
                    type="button"
                    className="text-[var(--win-text-secondary)] transition hover:text-[var(--win-text)]"
                    onClick={() => dismissNotification(notif.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-[var(--win-border)] bg-[var(--win-bg-alt)] p-4 text-sm text-[var(--win-text-secondary)]">
                No notifications at the moment.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-3xl border border-[var(--win-border)] bg-[var(--win-bg-alt)] p-4 text-[var(--win-text)]">
            <div className="mb-4">
              <p className="text-sm text-[var(--win-text-secondary)]">{monthLabel}</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[var(--win-text-secondary)]">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="font-semibold text-[var(--win-text)]">
                  {day}
                </div>
              ))}
              {days.map((day, idx) => (
                <div
                  key={`${day ?? 'blank'}-${idx}`}
                  className={`rounded-2xl py-2 ${
                    day === now.getDate() ? 'bg-win-accent text-white' : 'bg-transparent hover:bg-[var(--win-button-hover)]'
                  }`}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}

export default NotificationCenter
