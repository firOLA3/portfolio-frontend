import { create } from 'zustand'

const TASKBAR_HEIGHT = 48
const DEFAULT_SIZE = { w: 720, h: 480 }
const MIN_SIZE = { w: 320, h: 200 }
const CASCADE_OFFSET = 32

function generateId() {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getViewportSize() {
  return {
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h:
      typeof window !== 'undefined'
        ? window.innerHeight - TASKBAR_HEIGHT
        : 720,
  }
}

function getSnapBounds(layout) {
  const { w: vw, h: vh } = getViewportSize()
  const halfW = Math.floor(vw / 2)
  const halfH = Math.floor(vh / 2)

  const layouts = {
    full: { position: { x: 0, y: 0 }, size: { w: vw, h: vh } },
    left: { position: { x: 0, y: 0 }, size: { w: halfW, h: vh } },
    right: { position: { x: halfW, y: 0 }, size: { w: vw - halfW, h: vh } },
    'top-left': { position: { x: 0, y: 0 }, size: { w: halfW, h: halfH } },
    'top-right': {
      position: { x: halfW, y: 0 },
      size: { w: vw - halfW, h: halfH },
    },
  }

  return layouts[layout] ?? layouts.full
}

function getNextCascadePosition(windows) {
  const index = windows.length
  return {
    x: 80 + (index % 8) * CASCADE_OFFSET,
    y: 48 + (index % 8) * CASCADE_OFFSET,
  }
}

function getMaxZIndex(windows) {
  return windows.reduce((max, w) => Math.max(max, w.zIndex), 0)
}

export const useWindowStore = create((set, get) => ({
  windows: [],
  activeWindowId: null,

  openWindow: (appId, title) => {
    const existing = get().windows.find((w) => w.appId === appId)
    if (existing) {
      if (existing.isMinimized) {
        get().restoreWindow(existing.id)
      }
      get().focusWindow(existing.id)
      return existing.id
    }

    const id = generateId()
    const windows = get().windows
    const zIndex = getMaxZIndex(windows) + 1

    set({
      activeWindowId: id,
      windows: [
        ...windows,
        {
          id,
          appId,
          title,
          isMinimized: false,
          isMaximized: false,
          position: getNextCascadePosition(windows),
          size: { ...DEFAULT_SIZE },
          zIndex,
          restoreBounds: null,
        },
      ],
    })

    return id
  },

  closeWindow: (id) => {
    set((state) => {
      const nextWindows = state.windows.filter((w) => w.id !== id)
      return {
        windows: nextWindows,
        activeWindowId:
          state.activeWindowId === id
            ? nextWindows[nextWindows.length - 1]?.id ?? null
            : state.activeWindowId,
      }
    })
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w,
      ),
      activeWindowId:
        state.activeWindowId === id ? null : state.activeWindowId,
    }))
  },

  minimizeAllWindows: () => {
    set((state) => ({
      windows: state.windows.map((w) => ({ ...w, isMinimized: true })),
      activeWindowId: null,
    }))
  },

  maximizeWindow: (id, snapLayout = 'full') => {
    const { position, size } = getSnapBounds(snapLayout)

    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w

        const restoreBounds = w.isMaximized
          ? w.restoreBounds
          : { position: { ...w.position }, size: { ...w.size } }

        return {
          ...w,
          isMaximized: true,
          restoreBounds,
          position: { ...position },
          size: { ...size },
        }
      }),
      activeWindowId: id,
    }))

    get().focusWindow(id)
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w

        if (w.isMinimized) {
          return { ...w, isMinimized: false }
        }

        if (w.isMaximized && w.restoreBounds) {
          return {
            ...w,
            isMaximized: false,
            position: { ...w.restoreBounds.position },
            size: { ...w.restoreBounds.size },
            restoreBounds: null,
          }
        }

        return w
      }),
      activeWindowId: id,
    }))
  },

  focusWindow: (id) => {
    set((state) => {
      const target = state.windows.find((w) => w.id === id)
      if (!target) return state

      const maxZ = getMaxZIndex(state.windows)
      if (target.zIndex >= maxZ && state.activeWindowId === id) {
        return state
      }

      const nextZ = maxZ + 1

      return {
        activeWindowId: id,
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: nextZ } : w,
        ),
      }
    })
  },

  updatePosition: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position: { ...position } } : w,
      ),
    }))
  },

  updateSize: (id, size, position) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w
        return {
          ...w,
          size: {
            w: Math.max(MIN_SIZE.w, size.w),
            h: Math.max(MIN_SIZE.h, size.h),
          },
          ...(position ? { position: { ...position } } : {}),
        }
      }),
    }))
  },
}))
