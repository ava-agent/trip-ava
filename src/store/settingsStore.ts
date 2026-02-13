import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'zh' | 'en'
export type Theme = 'light' | 'dark'
export type ApiMode = 'mock' | 'real'

interface SettingsState {
  // API Settings
  apiMode: ApiMode
  apiBaseUrl: string

  // Feature Flags
  voiceEnabled: boolean
  imageEnabled: boolean
  videoEnabled: boolean

  // User Preferences
  language: Language
  theme: Theme

  // Actions
  setApiMode: (mode: ApiMode) => void
  setApiBaseUrl: (url: string) => void
  setVoiceEnabled: (enabled: boolean) => void
  setImageEnabled: (enabled: boolean) => void
  setVideoEnabled: (enabled: boolean) => void
  setLanguage: (lang: Language) => void
  setTheme: (theme: Theme) => void
  resetSettings: () => void
}

const defaultSettings = {
  apiMode: (import.meta.env.VITE_USE_MOCK_API === 'true' ? 'mock' : 'real') as ApiMode,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  voiceEnabled: import.meta.env.VITE_ENABLE_VOICE_FEATURES === 'true',
  imageEnabled: import.meta.env.VITE_ENABLE_IMAGE_FEATURES === 'true',
  videoEnabled: import.meta.env.VITE_ENABLE_VIDEO_FEATURES === 'true',
  language: 'zh' as Language,
  theme: 'light' as Theme,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setApiMode: (mode) => set({ apiMode: mode }),
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setImageEnabled: (enabled) => set({ imageEnabled: enabled }),
      setVideoEnabled: (enabled) => set({ videoEnabled: enabled }),
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'ava-settings',
    }
  )
)
