import { create } from 'zustand'

export const useOSStore = create((set, get) => ({
  stage: 'boot',
  theme: 'light',
  wallpaper: 'bloom',
  isStartMenuOpen: false,

  advanceStage: () =>
    set((state) => {
      if (state.stage === 'boot') return { stage: 'lock' }
      if (state.stage === 'lock') return { stage: 'desktop' }
      return { stage: 'desktop' }
    }),

  setStage: (stage) => set({ stage }),
  setTheme: (theme) => set({ theme }),
  setWallpaper: (wallpaper) => set({ wallpaper }),

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  closeStartMenu: () => set({ isStartMenuOpen: false }),
}))
