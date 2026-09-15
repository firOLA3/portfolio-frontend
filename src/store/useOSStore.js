import { create } from 'zustand'

const getInitialStage = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('os-stage') || 'boot'
  }
  return 'boot'
}

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('os-theme') || 'light'
  }
  return 'light'
}

const getInitialWallpaper = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('os-wallpaper') || 'bloom'
  }
  return 'bloom'
}

export const useOSStore = create((set, get) => ({
  stage: getInitialStage(),
  theme: getInitialTheme(),
  wallpaper: getInitialWallpaper(),
  isStartMenuOpen: false,

  advanceStage: () =>
    set((state) => {
      let nextStage = 'desktop'
      if (state.stage === 'boot') nextStage = 'lock'
      if (state.stage === 'lock') nextStage = 'desktop'
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('os-stage', nextStage)
      }
      return { stage: nextStage }
    }),

  setStage: (stage) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('os-stage', stage)
    }
    set({ stage })
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os-theme', theme)
    }
    set({ theme })
  },
  setWallpaper: (wallpaper) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os-wallpaper', wallpaper)
    }
    set({ wallpaper })
  },

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  closeStartMenu: () => set({ isStartMenuOpen: false }),
}))
