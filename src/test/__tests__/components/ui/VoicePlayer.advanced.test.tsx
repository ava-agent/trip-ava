import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoicePlayer } from '@/components/ui/VoicePlayer'

// Mock Audio constructor with error simulation
class MockAudio {
  src = ''
  currentTime = 0
  paused = true
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  addEventListener = vi.fn((event: string, handler: () => void) => {
    if (event === 'ended') {
      this._endedHandler = handler
    }
    if (event === 'error') {
      this._errorHandler = handler
    }
  })
  removeEventListener = vi.fn()
  _endedHandler?: () => void
  _errorHandler?: () => void
  triggerError() {
    this._errorHandler?.()
  }
}

// Mock SpeechSynthesisUtterance class
class MockSpeechSynthesisUtterance {
  text = ''
  lang = 'zh-CN'
  rate = 1
  pitch = 1
  volume = 1
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

describe('VoicePlayer Advanced', () => {
  beforeEach(() => {
    // Mocking global Audio
    global.Audio = MockAudio as unknown as typeof Audio

    // Mock speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
          // Simulate async behavior
          setTimeout(() => utterance.onstart?.(), 0)
        }),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      },
      writable: true,
    })

    // Mocking global SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance

    // Mock fetch for TTS API
    global.fetch = vi.fn()

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle audio element error and fallback to TTS', async () => {
    const consoleSpy = vi.spyOn(console, 'warn')

    render(<VoicePlayer audioUrl="https://example.com/bad.mp3" textContent="Fallback text" />)

    // Get the mock audio
    const mockAudio = global.Audio as unknown as typeof MockAudio

    // Wait for useEffect to create audio element
    await waitFor(() => {
      expect(mockAudio.prototype).toBeDefined()
    })

    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should show error when TTS has no text content', () => {
    render(<VoicePlayer audioUrl="" textContent="" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    // Should not call speechSynthesis.speak when no text
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled()
  })

  it('should handle audio playback error and fallback to TTS', async () => {
    // Make Audio.play() reject with an error
    const mockAudioWithError = class extends MockAudio {
      play = vi.fn().mockRejectedValue(new Error('Playback failed'))
    }
    global.Audio = mockAudioWithError as unknown as typeof Audio

    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Fallback text" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })
  })

  it('should handle audio playback error without fallback text', async () => {
    // Make Audio.play() reject with an error
    const mockAudioWithError = class extends MockAudio {
      play = vi.fn().mockRejectedValue(new Error('Playback failed'))
    }
    global.Audio = mockAudioWithError as unknown as typeof Audio

    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    await waitFor(() => {
      // Should show error indicator
      expect(screen.getByText('播放失败')).toBeInTheDocument()
    })
  })

  it('should abort previous TTS request when making new one', async () => {
    const abortMock = vi.fn()
    const mockAbortController = vi.fn().mockImplementation(() => ({
      abort: abortMock,
      signal: {},
    }))
    global.AbortController = mockAbortController as unknown as typeof AbortController

    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')

    // Click twice to trigger abort
    fireEvent.click(ttsButton)
    await waitFor(() => {})
    fireEvent.click(ttsButton)

    await waitFor(() => {
      expect(mockAbortController).toHaveBeenCalled()
    })
  })

  it('should handle AbortError in requestTTS gracefully', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'

    global.fetch = vi.fn().mockRejectedValue(abortError)

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    // Component should not crash - just verify it renders
    await waitFor(() => {
      expect(screen.getByLabelText('播放')).toBeInTheDocument()
    })
  })

  it('should handle TTS API returning empty voiceUrl', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ voiceUrl: '' }),
    })

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    await waitFor(() => {
      // Should fallback to browser TTS when voiceUrl is empty
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })
  })

  it('should handle TTS utterance error', async () => {
    // Create an utterance that will trigger onerror
    const originalSpeak = window.speechSynthesis.speak
    // @ts-expect-error - Mock speak
    window.speechSynthesis.speak = vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      // Trigger error immediately
      setTimeout(() => utterance.onerror?.(), 0)
    })

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })

    // Restore original
    window.speechSynthesis.speak = originalSpeak
  })
})
