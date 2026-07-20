import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function ContextMenu({ items = [], position = { x: 0, y: 0 }, onClose }) {
  const menuRef = useRef(null)

  // Keep menu within viewport bounds
  useEffect(() => {
    if (!menuRef.current) return

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = position.x
    let adjustedY = position.y

    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10
    }

    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10
    }

    if (adjustedX !== position.x || adjustedY !== position.y) {
      menuRef.current.style.left = `${Math.max(10, adjustedX)}px`
      menuRef.current.style.top = `${Math.max(10, adjustedY)}px`
    }
  }, [position])

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      onClose?.()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  if (!items.length) return null

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[1000] min-w-[160px] rounded-win border border-[var(--win-border)] bg-[var(--win-bg)]/95 backdrop-blur-md shadow-window p-1"
      style={{ left: position.x, top: position.y }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => (
        <div key={idx}>
          {item.divider ? (
            <div className="my-1 border-t border-[var(--win-border)]" />
          ) : (
            <button
              type="button"
              disabled={item.disabled}
              className={`flex w-full items-center gap-2 rounded-win px-3 py-2 text-left text-sm transition-colors ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'text-white/90 hover:bg-[var(--win-accent)]/15'
              }`}
              onClick={() => {
                item.action?.()
                onClose?.()
              }}
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </motion.div>
  )
}

export default ContextMenu
