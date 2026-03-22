import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'zh-CN' | 'en-US' | 'ja-JP'
export type Theme = 'light' | 'dark' | 'auto'

interface Settings {
  theme: Theme
  language: Language
  notifications: boolean
  soundEnabled: boolean
  voiceEnabled: boolean
  autoPlay: boolean
}

interface SettingsState {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'zh-CN',
  notifications: true,
  soundEnabled: true,
  voiceEnabled: true,
  autoPlay: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...defaultSettings },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      resetSettings: () => set({ settings: { ...defaultSettings } }),
    }),
    {
      name: 'ava-settings',
    }
  )
)
