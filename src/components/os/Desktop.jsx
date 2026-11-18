import { useCallback, useEffect, useRef, useState } from 'react'
import { useWindowStore } from '../../store/useWindowStore'
import { useOSStore } from '../../store/useOSStore'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useLocation, useNavigate } from 'react-router-dom'
import desktopWallpaper from '../../assets/FIROLA GREEN.png'
import WindowManager from './WindowManager'
import ContextMenu from './ContextMenu'
import WindowSwitcher from './WindowSwitcher'
import Taskbar from './Taskbar'
import SpotifyWidget from '../desktop/widgets/SpotifyWidget'
import StickyNote from '../desktop/widgets/StickyNote'

const DESKTOP_ICONS = [
  { id: 'about', label: 'About Me', emoji: '👤' },
  { id: 'projects', label: 'Projects', emoji: '💼' },
  { id: 'skills', label: 'Skills', emoji: '🧠' },
  { id: 'experience', label: 'Experience', emoji: '📈' },
  { id: 'contact', label: 'Contact', emoji: '✉️' },
  { id: 'terminal', label: 'Terminal', emoji: '⌨️' },
]

function Desktop() {
  const location = useLocation()
  const navigate = useNavigate()
  const openWindow = useWindowStore((s) => s.openWindow)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const wallpaper = useOSStore((s) => s.wallpaper)
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, type: null })
  const [windowSwitcherOpen, setWindowSwitcherOpen] = useState(false)
  const [selectedIconId, setSelectedIconId] = useState(null)
  const lastClickRef = useRef({ id: null, time: 0 })
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [iconOffsets, setIconOffsets] = useState(
    () =>
      Object.fromEntries(
        DESKTOP_ICONS.map((icon) => [icon.id, { x: 0, y: 0 }]),
      ),
  )
  const dragRef = useRef(null)

  // Keyboard shortcuts
  useKeyboardShortcuts(
    () => setWindowSwitcherOpen(true),
    () => setWindowSwitcherOpen(false)
  )

  const handleIconPointerDown = useCallback(
    (event, iconId, iconLabel) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      
      setSelectedIconId(iconId)

      const startOffset = iconOffsets[iconId] || { x: 0, y: 0 }
      let hasDragged = false

      dragRef.current = {
        pointerId: event.pointerId,
        iconId,
        startX: event.clientX,
        startY: event.clientY,
        startOffset,
      }

      const onPointerMove = (moveEvent) => {
        if (
          !dragRef.current ||
          moveEvent.pointerId !== dragRef.current.pointerId
        ) {
          return
        }

        const dx = moveEvent.clientX - dragRef.current.startX
        const dy = moveEvent.clientY - dragRef.current.startY

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          hasDragged = true
        }

        setIconOffsets((prev) => ({
          ...prev,
          [iconId]: {
            x: dragRef.current.startOffset.x + dx,
            y: dragRef.current.startOffset.y + dy,
          },
        }))
      }

      const onPointerUp = (upEvent) => {
        if (
          !dragRef.current ||
          upEvent.pointerId !== dragRef.current.pointerId
        ) {
          return
        }

        if (!hasDragged) {
          const now = Date.now()
          const isDoubleClick = lastClickRef.current.id === iconId && now - lastClickRef.current.time < 500
          if (isDoubleClick) {
            navigate(`/app/${iconId}`, { state: { label: iconLabel } })
            setSelectedIconId(null)
            lastClickRef.current = { id: null, time: 0 }
          } else {
            lastClickRef.current = { id: iconId, time: now }
          }
        }

        dragRef.current = null
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
      }

      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerUp)
    },
    [iconOffsets, openWindow],
  )

  useEffect(() => {
    const handleClose = () => setContextMenu({ open: false, x: 0, y: 0, type: null })
    const handleEscape = (event) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('click', handleClose)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('click', handleClose)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) return

    if (activeWindowId) {
      if (window.location.hash !== `#app-${activeWindowId}`) {
        window.history.pushState({ windowId: activeWindowId }, '', `#app-${activeWindowId}`)
      }
    }
  }, [isMobile, activeWindowId])

  useEffect(() => {
    if (!isMobile) return

    const handlePopState = () => {
      if (
        location.pathname.startsWith('/app/projects/') ||
        window.location.pathname.startsWith('/app/projects/')
      ) {
        return
      }

      const topWin = useWindowStore.getState().activeWindowId
      if (topWin) {
        useWindowStore.getState().closeWindow(topWin)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isMobile, location.pathname])

  const wallpaperClass = {
    bloom: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900',
    ocean: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-blue-900',
    forest: 'bg-gradient-to-br from-green-950 via-emerald-950 to-green-900',
    sunset: 'bg-gradient-to-br from-orange-950 via-red-950 to-purple-900',
    midnight: 'bg-gradient-to-br from-slate-950 to-slate-900',
    aurora: 'bg-gradient-to-br from-purple-950 via-pink-950 to-red-900',
  }[wallpaper] || 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'

  const handleDesktopContextMenu = (event) => {
    event.preventDefault()
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      type: 'desktop',
    })
  }

  const handleIconContextMenu = (event, iconId) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      type: 'icon',
      iconId,
    })
  }

  const desktopContextItems = [
    {
      label: 'View',
      icon: '👁️',
      action: () => {},
    },
    {
      label: 'Sort by',
      icon: '↓',
      action: () => {},
    },
    { divider: true },
    {
      label: 'Refresh',
      icon: '🔄',
      action: () => window.location.reload(),
    },
    { divider: true },
    {
      label: 'Personalize',
      icon: '🎨',
      action: () => openWindow('personalize', 'Personalize'),
    },
  ]

  const iconContextItems = (iconId) => [
    {
      label: 'Open',
      icon: '📂',
      action: () => openWindow(iconId, DESKTOP_ICONS.find(i => i.id === iconId)?.label),
    },
    {
      label: 'Rename',
      icon: '✏️',
      action: () => alert('Rename feature coming soon!'),
    },
    {
      label: 'Pin to Taskbar',
      icon: '📌',
      action: () => alert('Pinned to taskbar!'),
    },
  ]

  return (
    <main
      className={`relative min-h-[100dvh] w-screen overflow-hidden ${wallpaperClass}`}
      style={{
        backgroundImage: `url(${desktopWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onContextMenu={handleDesktopContextMenu}
      onPointerDown={() => setSelectedIconId(null)}
    >
      <div className="relative z-10 px-6 py-8 h-full flex justify-between pointer-events-none">
        <div className="grid max-w-xs grid-cols-2 gap-4 h-fit pointer-events-auto">
          {DESKTOP_ICONS.map((icon) => (
            <div
              key={icon.id}
              className={`desktop-icon group w-28 cursor-grab select-none rounded-3xl border p-3 shadow-[0_10px_60px_rgba(0,0,0,0.15)] transition ${
                selectedIconId === icon.id
                  ? 'border-white/30 bg-white/25'
                  : 'border-white/10 bg-white/10 hover:border-white/20 hover:bg-white/15'
              }`}
              onContextMenu={(event) => handleIconContextMenu(event, icon.id)}
              onPointerDown={(event) => handleIconPointerDown(event, icon.id, icon.label)}
              style={{
                touchAction: 'none',
                transform: `translate(${iconOffsets[icon.id]?.x}px, ${iconOffsets[icon.id]?.y}px)`,
              }}
            >
              <div className="mb-3 flex h-14 items-center justify-center rounded-3xl bg-white/10 text-2xl shadow-inner shadow-black/20">
                {icon.emoji}
              </div>
              <div className="desktop-icon-label text-sm font-medium leading-tight text-white/90">
                {icon.label}
              </div>
            </div>
          ))}
        </div>

        {/* Widgets Sidebar */}
        <div className="hidden md:flex flex-col gap-4 w-72 pointer-events-auto">
          <SpotifyWidget />
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <StickyNote />
      </div>

      <WindowManager />
      <Taskbar />

      {contextMenu.open && (
        <ContextMenu
          items={contextMenu.type === 'icon' ? iconContextItems(contextMenu.iconId) : desktopContextItems}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu({ open: false, x: 0, y: 0, type: null })}
        />
      )}

      <WindowSwitcher isOpen={windowSwitcherOpen} onSelectWindow={() => setWindowSwitcherOpen(false)} />
    </main>
  )
}

export default Desktop

