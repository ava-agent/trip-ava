import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset to default settings before each test
    const { resetSettings } = useSettingsStore.getState()
    resetSettings()
  })

  describe('Initial State', () => {
    it('should have default settings', () => {
      const state = useSettingsStore.getState()

      expect(state.apiMode).toBe('real')
      expect(state.apiBaseUrl).toBe('')
      expect(state.theme).toBe('light')
      expect(state.language).toBe('zh')
      expect(state.voiceEnabled).toBe(false)
      expect(state.imageEnabled).toBe(false)
      expect(state.videoEnabled).toBe(false)
    })
  })

  describe('setters', () => {
    it('should update API settings', () => {
      const { setApiMode, setApiBaseUrl } = useSettingsStore.getState()

      setApiMode('mock')
      setApiBaseUrl('https://api.example.com')

      const state = useSettingsStore.getState()
      expect(state.apiMode).toBe('mock')
      expect(state.apiBaseUrl).toBe('https://api.example.com')
    })

    it('should update feature flags', () => {
      const { setVoiceEnabled, setImageEnabled, setVideoEnabled } = useSettingsStore.getState()

      setVoiceEnabled(true)
      setImageEnabled(true)
      setVideoEnabled(true)

      const state = useSettingsStore.getState()
      expect(state.voiceEnabled).toBe(true)
      expect(state.imageEnabled).toBe(true)
      expect(state.videoEnabled).toBe(true)
    })

    it('should update user preferences', () => {
      const { setLanguage, setTheme } = useSettingsStore.getState()

      setLanguage('en')
      setTheme('dark')

      const state = useSettingsStore.getState()
      expect(state.language).toBe('en')
      expect(state.theme).toBe('dark')
    })
  })

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      const {
        setApiMode,
        setApiBaseUrl,
        setVoiceEnabled,
        setImageEnabled,
        setVideoEnabled,
        setLanguage,
        setTheme,
        resetSettings,
      } = useSettingsStore.getState()

      setApiMode('mock')
      setApiBaseUrl('https://api.example.com')
      setVoiceEnabled(true)
      setImageEnabled(true)
      setVideoEnabled(true)
      setLanguage('en')
      setTheme('dark')

      resetSettings()

      const state = useSettingsStore.getState()
      expect(state.apiMode).toBe('real')
      expect(state.apiBaseUrl).toBe('')
      expect(state.theme).toBe('light')
      expect(state.language).toBe('zh')
      expect(state.voiceEnabled).toBe(false)
      expect(state.imageEnabled).toBe(false)
      expect(state.videoEnabled).toBe(false)
    })
  })

  describe('Store Immutability', () => {
    it('should not mutate previous state snapshots when updating', () => {
      const { setTheme } = useSettingsStore.getState()
      const originalState = { ...useSettingsStore.getState() }

      setTheme('dark')

      expect(originalState.theme).toBe('light')
      expect(useSettingsStore.getState().theme).toBe('dark')
    })
  })
})
