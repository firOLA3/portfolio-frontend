import { AnimatePresence } from 'framer-motion'
import { useWindowStore } from '../../store/useWindowStore'
import { APP_REGISTRY } from '../apps/registry'
import Window from './Window'

const APP_ICONS = {
  test: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      T
    </span>
  ),
  about: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      A
    </span>
  ),
  projects: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      P
    </span>
  ),
  skills: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      S
    </span>
  ),
  experience: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      E
    </span>
  ),
  contact: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      C
    </span>
  ),
  terminal: (
    <span className="flex h-5 w-5 items-center justify-center rounded bg-win-accent text-[10px] font-bold text-white">
      
    </span>
  ),
}

function WindowManager() {
  const windows = useWindowStore((s) => s.windows)
  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <AnimatePresence initial={false}>
        {visibleWindows.map((win) => {
          const AppComponent = APP_REGISTRY[win.appId]

          return (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              icon={APP_ICONS[win.appId]}
              position={win.position}
              size={win.size}
              zIndex={win.zIndex}
              isMaximized={win.isMaximized}
            >
              {AppComponent ? (
                <AppComponent
                  windowId={win.id}
                  title={win.title}
                  appId={win.appId}
                />
              ) : null}
            </Window>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default WindowManager
