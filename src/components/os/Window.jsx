import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useWindowStore } from '../../store/useWindowStore'

const SNAP_LAYOUTS = [
  { id: 'top-left', label: 'Top left quarter' },
  { id: 'top-right', label: 'Top right quarter' },
  { id: 'left', label: 'Left half' },
  { id: 'right', label: 'Right half' },
]

const RESIZE_HANDLES = [
  { dir: 'n', className: 'top-0 left-2 right-2 h-1 cursor-n-resize' },
  { dir: 's', className: 'bottom-0 left-2 right-2 h-1 cursor-s-resize' },
  { dir: 'e', className: 'right-0 top-2 bottom-2 w-1 cursor-e-resize' },
  { dir: 'w', className: 'left-0 top-2 bottom-2 w-1 cursor-w-resize' },
  { dir: 'ne', className: 'right-0 top-0 h-3 w-3 cursor-ne-resize' },
  { dir: 'nw', className: 'left-0 top-0 h-3 w-3 cursor-nw-resize' },
  { dir: 'se', className: 'right-0 bottom-0 h-3 w-3 cursor-se-resize' },
  { dir: 'sw', className: 'left-0 bottom-0 h-3 w-3 cursor-sw-resize' },
]

const windowVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exitClose: { opacity: 0, scale: 0.95, y: 10 },
  exitMinimize: { scale: 0.1, y: 200, opacity: 0 },
}

function Window({
  id,
  title,
  icon,
  position,
  size,
  zIndex,
  isMaximized,
  children,
}) {
  const nodeRef = useRef(null)
  const controls = useAnimation()
  const [showSnapGrid, setShowSnapGrid] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const updatePosition = useWindowStore((s) => s.updatePosition)
  const updateSize = useWindowStore((s) => s.updateSize)

  useEffect(() => {
    controls.start('visible')
  }, [controls])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMaximizeClick = () => {
    if (isMobile) return
    if (isMaximized) {
      restoreWindow(id)
    } else {
      maximizeWindow(id, 'full')
    }
  }

  const handleMinimize = async () => {
    await controls.start('exitMinimize')
    minimizeWindow(id)
  }

  const handleClose = async () => {
    await controls.start('exitClose')
    closeWindow(id)
  }

  const handleMobileBack = () => {
    if (window.history.state?.windowId === id) {
      window.history.back()
    } else {
      handleClose()
    }
  }

  const handleResizeStart = useCallback(
    (event, direction) => {
      if (isMaximized || isMobile) return
      event.preventDefault()
      event.stopPropagation()

      const startX = event.clientX
      const startY = event.clientY
      const startW = size.w
      const startH = size.h
      const startPosX = position.x
      const startPosY = position.y

      const onMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        let nextW = startW
        let nextH = startH
        let nextX = startPosX
        let nextY = startPosY

        if (direction.includes('e')) nextW = startW + dx
        if (direction.includes('w')) {
          nextW = startW - dx
          nextX = startPosX + dx
        }
        if (direction.includes('s')) nextH = startH + dy
        if (direction.includes('n')) {
          nextH = startH - dy
          nextY = startPosY + dy
        }

        updateSize(id, { w: nextW, h: nextH }, { x: nextX, y: nextY })
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [id, isMaximized, position.x, position.y, size.h, size.w, updateSize],
  )

  const dragState = useRef(null)

  const handleDragStart = useCallback(
    (event) => {
      if (isMaximized || isMobile || event.button !== 0) return
      event.preventDefault()
      focusWindow(id)

      dragState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startPosX: position.x,
        startPosY: position.y,
      }

      const onPointerMove = (moveEvent) => {
        if (!dragState.current || moveEvent.pointerId !== dragState.current.pointerId) return

        const dx = moveEvent.clientX - dragState.current.startX
        const dy = moveEvent.clientY - dragState.current.startY

        updatePosition(id, {
          x: Math.max(0, dragState.current.startPosX + dx),
          y: Math.max(0, dragState.current.startPosY + dy),
        })
      }

      const onPointerUp = (upEvent) => {
        if (!dragState.current || upEvent.pointerId !== dragState.current.pointerId) return
        dragState.current = null
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
      }

      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerUp)
    },
    [focusWindow, id, isMaximized, position.x, position.y, updatePosition],
  )

  return (
    <motion.div
      ref={nodeRef}
      className={`pointer-events-auto absolute flex flex-col overflow-hidden border border-[var(--win-border)] bg-[var(--win-bg)] shadow-window backdrop-blur-win ${isMobile ? '' : 'rounded-win-lg'}`}
      style={{ 
        zIndex, 
        left: isMobile ? 0 : position.x, 
        top: isMobile ? 0 : position.y,
        width: isMobile ? '100%' : undefined,
        height: isMobile ? '100%' : undefined,
      }}
      variants={windowVariants}
      initial="hidden"
      animate={controls}
      exit="exitClose"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseDownCapture={() => focusWindow(id)}
    >
      <motion.div
        className="relative flex flex-col h-full w-full"
        animate={{ width: isMobile ? '100%' : size.w, height: isMobile ? '100%' : size.h }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
          {!isMaximized && !isMobile &&
            RESIZE_HANDLES.map(({ dir, className }) => (
              <div
                key={dir}
                role="presentation"
                className={`absolute z-20 ${className}`}
                onMouseDown={(event) => handleResizeStart(event, dir)}
              />
            ))}

          <div
            className="win-titlebar flex h-10 shrink-0 cursor-default select-none items-center gap-2 border-b border-[var(--win-border)] px-3"
            onPointerDown={handleDragStart}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isMobile ? (
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--win-button-hover)] mr-1"
                  onClick={handleMobileBack}
                  aria-label="Back"
                >
                  <span className="text-lg leading-none mb-0.5">‹</span>
                </button>
              ) : icon ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {icon}
                </span>
              ) : null}
              <span className="truncate text-sm font-medium text-[var(--win-text)]">
                {title}
              </span>
            </div>

            <div className={`flex items-center gap-1 ${isMobile ? 'hidden' : ''}`}>
              <button
                type="button"
                aria-label="Minimize"
                className="win-chrome-btn"
                onClick={handleMinimize}
              >
                —
              </button>

              <div
                className={`relative ${isMobile ? 'hidden' : ''}`}
                onMouseEnter={() => setShowSnapGrid(true)}
                onMouseLeave={() => setShowSnapGrid(false)}
              >
                <button
                  type="button"
                  aria-label={isMaximized ? 'Restore' : 'Maximize'}
                  className="win-chrome-btn"
                  onClick={handleMaximizeClick}
                >
                  {isMaximized ? '❐' : '⬜'}
                </button>

                {showSnapGrid && !isMaximized ? (
                  <div className="absolute right-0 top-full z-50 mt-2 rounded-win border border-[var(--win-border)] bg-[var(--start-bg)] p-2 shadow-window backdrop-blur-win">
                    <p className="mb-2 px-1 text-xs text-[var(--win-text-secondary)]">
                      Snap layout
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {SNAP_LAYOUTS.map((layout) => (
                        <button
                          key={layout.id}
                          type="button"
                          title={layout.label}
                          aria-label={layout.label}
                          className="h-8 w-12 rounded border border-[var(--win-border)] bg-[var(--win-bg)] transition-colors hover:border-[var(--win-accent)] hover:bg-[var(--win-accent)]/10"
                          onClick={() => maximizeWindow(id, layout.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Close"
                className="win-chrome-btn win-chrome-btn-close"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </motion.div>
      </motion.div>
  )
}

export default Window
