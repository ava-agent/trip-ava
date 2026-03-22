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
      const { settings } = useSettingsStore.getState()

      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('zh-CN')
      expect(settings.notifications).toBe(true)
      expect(settings.soundEnabled).toBe(true)
      expect(settings.voiceEnabled).toBe(true)
      expect(settings.autoPlay).toBe(false)
    })
  })

  describe('updateSettings', () => {
    it('should update single setting', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({ theme: 'light' })

      const { settings } = useSettingsStore.getState()
      expect(settings.theme).toBe('light')
    })

    it('should update multiple settings', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({
        theme: 'light',
        language: 'en-US',
        notifications: false
      })

      const { settings } = useSettingsStore.getState()
      expect(settings.theme).toBe('light')
      expect(settings.language).toBe('en-US')
      expect(settings.notifications).toBe(false)
    })

    it('should preserve unchanged settings', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({ theme: 'light' })

      const { settings } = useSettingsStore.getState()
      expect(settings.language).toBe('zh-CN') // unchanged
      expect(settings.notifications).toBe(true) // unchanged
    })

    it('should accept all valid theme values', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({ theme: 'light' })
      expect(useSettingsStore.getState().settings.theme).toBe('light')

      updateSettings({ theme: 'dark' })
      expect(useSettingsStore.getState().settings.theme).toBe('dark')

      updateSettings({ theme: 'auto' })
      expect(useSettingsStore.getState().settings.theme).toBe('auto')
    })

    it('should accept all valid language values', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({ language: 'zh-CN' })
      expect(useSettingsStore.getState().settings.language).toBe('zh-CN')

      updateSettings({ language: 'en-US' })
      expect(useSettingsStore.getState().settings.language).toBe('en-US')

      updateSettings({ language: 'ja-JP' })
      expect(useSettingsStore.getState().settings.language).toBe('ja-JP')
    })

    it('should accept boolean values', () => {
      const { updateSettings } = useSettingsStore.getState()

      updateSettings({
        notifications: false,
        soundEnabled: false,
        voiceEnabled: false,
        autoPlay: true
      })

      const { settings } = useSettingsStore.getState()
      expect(settings.notifications).toBe(false)
      expect(settings.soundEnabled).toBe(false)
      expect(settings.voiceEnabled).toBe(false)
      expect(settings.autoPlay).toBe(true)
    })
  })

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      const { updateSettings, resetSettings } = useSettingsStore.getState()

      // Update all settings
      updateSettings({
        theme: 'light',
        language: 'en-US',
        notifications: false,
        soundEnabled: false,
        voiceEnabled: false,
        autoPlay: true
      })

      // Reset
      resetSettings()

      // Should be back to defaults
      const { settings } = useSettingsStore.getState()
      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('zh-CN')
      expect(settings.notifications).toBe(true)
      expect(settings.soundEnabled).toBe(true)
      expect(settings.voiceEnabled).toBe(true)
      expect(settings.autoPlay).toBe(false)
    })
  })

  describe('Store Immutability', () => {
    it('should not mutate original settings when updating', () => {
      const { updateSettings } = useSettingsStore.getState()
      const originalSettings = { ...useSettingsStore.getState().settings }

      updateSettings({ theme: 'light' })

      // Original should be unchanged
      expect(originalSettings.theme).toBe('dark')
    })
  })
})
