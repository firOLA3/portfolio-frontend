import { useEffect, useRef } from 'react'
import { useWindowStore } from '../store/useWindowStore'
import { useOSStore } from '../store/useOSStore'

export const useKeyboardShortcuts = (onAltTab, onEscape) => {
  const openWindow = useWindowStore((s) => s.openWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const windows = useWindowStore((s) => s.windows)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)

  const toggleStartMenu = useOSStore((s) => s.toggleStartMenu)
  const closeStartMenu = useOSStore((s) => s.closeStartMenu)
  const setStage = useOSStore((s) => s.setStage)
  const isStartMenuOpen = useOSStore((s) => s.isStartMenuOpen)

  const altPressed = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Track Alt key
      if (e.altKey) {
        altPressed.current = true
      }

      // Win / Meta key - toggle Start Menu
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault()
        toggleStartMenu()
        return
      }

      // Win + D - minimize all windows
      if ((e.metaKey || e.key === 'Meta') && e.key === 'd') {
        e.preventDefault()
        windows.forEach((w) => {
          if (!w.isMinimized) {
            minimizeWindow(w.id)
          }
        })
        return
      }

      // Win + E - open Projects
      if ((e.metaKey || e.key === 'Meta') && e.key === 'e') {
        e.preventDefault()
        openWindow('projects', 'Projects')
        return
      }

      // Win + I - open Experience
      if ((e.metaKey || e.key === 'Meta') && e.key === 'i') {
        e.preventDefault()
        openWindow('experience', 'Experience')
        return
      }

      // Win + R - open Terminal
      if ((e.metaKey || e.key === 'Meta') && e.key === 'r') {
        e.preventDefault()
        openWindow('terminal', 'Terminal')
        return
      }

      // Win + L - lock screen
      if ((e.metaKey || e.key === 'Meta') && e.key === 'l') {
        e.preventDefault()
        setStage('lock')
        return
      }

      // Alt + F4 - close active window
      if (e.altKey && e.key === 'F4') {
        e.preventDefault()
        if (activeWindowId) {
          closeWindow(activeWindowId)
        }
        return
      }

      // Alt + Tab - trigger window switcher
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault()
        onAltTab?.()
        return
      }

      // F11 - toggle maximize on active window
      if (e.key === 'F11') {
        e.preventDefault()
        if (activeWindowId) {
          const window = windows.find((w) => w.id === activeWindowId)
          if (window?.isMaximized) {
            restoreWindow(activeWindowId)
          } else {
            maximizeWindow(activeWindowId, 'full')
          }
        }
        return
      }

      // Ctrl + Alt + Delete - security options easter egg
      if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault()
        const options = ['Lock', 'Sign out', 'Task Manager']
        const choice = prompt(
          `Security Options:\n\n${options
            .map((o, i) => `${i + 1}. ${o}`)
            .join('\n')}\n\nSelect option (1-3):`,
        )

        if (choice === '1') {
          alert('🔐 Screen locked. Nice try!')
          setStage('lock')
        } else if (choice === '2') {
          alert('👋 Thanks for visiting!')
        } else if (choice === '3') {
          alert(
            '⚙️ Task Manager would appear here. Seems like everything is running smoothly!',
          )
        }
        return
      }

      // Escape - close menus and close window switcher
      if (e.key === 'Escape') {
        closeStartMenu()
        onEscape?.()
        return
      }
    }

    const handleKeyUp = (e) => {
      if (!e.altKey) {
        altPressed.current = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    toggleStartMenu,
    closeStartMenu,
    setStage,
    windows,
    activeWindowId,
    onAltTab,
    onEscape,
  ])

  return { altPressed: altPressed.current }
}
