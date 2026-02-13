import { create } from 'zustand'
import { UIState } from '../types'

interface UIStore extends UIState {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setIsMobile: (isMobile: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  isMobile: false,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme })
  },

  setIsMobile: (isMobile: boolean) => {
    set({ isMobile })
  },
}))