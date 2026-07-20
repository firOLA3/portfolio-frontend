import { create } from 'zustand'

function generateId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export const useNotifStore = create((set, get) => ({
  notifications: [
    { id: generateId(), message: 'Welcome to my portfolio 👋', icon: '✨', read: false },
    {
      id: generateId(),
      message: 'Check out my latest project →',
      icon: '🚀',
      read: false,
    },
    {
      id: generateId(),
      message: 'Available for hire ✅',
      icon: '💼',
      read: false,
    },
  ],
  isOpen: false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { id: generateId(), read: false, ...notification },
        ...state.notifications,
      ],
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    })),

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        read: true,
      })),
    })),
}))
