import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Language,
  Translations,
  getTranslations,
  detectBrowserLanguage,
} from '@/i18n'

export interface I18nState {
  // State
  language: Language
  translations: Translations

  // Actions
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: keyof Translations) => string
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      // Initial state - detect browser language
      language: detectBrowserLanguage(),
      translations: getTranslations(detectBrowserLanguage()),

      // Set language
      setLanguage: (lang: Language) => {
        set({
          language: lang,
          translations: getTranslations(lang),
        })
      },

      // Toggle between zh-CN and en-US
      toggleLanguage: () => {
        const { language } = get()
        const newLang: Language = language === 'zh-CN' ? 'en-US' : 'zh-CN'
        set({
          language: newLang,
          translations: getTranslations(newLang),
        })
      },

      // Translate function
      t: (key: keyof Translations) => {
        return get().translations[key] || key
      },
    }),
    {
      name: 'i18n-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
)

// Hook for convenient translation
export function useTranslation() {
  const { t, language, setLanguage, toggleLanguage } = useI18nStore()
  return { t, language, setLanguage, toggleLanguage }
}
