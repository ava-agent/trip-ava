import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VoicePlayer } from '@/components/ui/VoicePlayer'

// Mock Audio constructor
class MockAudio {
  src = ''
  currentTime = 0
  paused = true
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
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
  addEventListener = vi.fn()
  removeEventListener = vi.fn()

  constructor(text: string) {
    this.text = text
  }
}

describe('VoicePlayer', () => {
  beforeEach(() => {
    // Mocking global Audio
    global.Audio = MockAudio as unknown as typeof Audio

    // Mock speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: vi.fn(),
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render play button with audio URL', () => {
    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" />)
    expect(screen.getByLabelText('播放')).toBeInTheDocument()
  })

  it('should render with empty audio URL', () => {
    render(<VoicePlayer audioUrl="" textContent="Hello" />)
    expect(screen.getByLabelText('播放')).toBeInTheDocument()
  })

  it('should be disabled when no audio and no text', () => {
    render(<VoicePlayer audioUrl="" textContent="" />)
    expect(screen.getByLabelText('播放')).toBeDisabled()
  })

  it('should use different sizes', () => {
    const { rerender } = render(
      <VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" size="sm" />
    )
    expect(screen.getByLabelText('播放').className).toContain('w-6')

    rerender(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" size="md" />)
    expect(screen.getByLabelText('播放').className).toContain('w-8')

    rerender(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" size="lg" />)
    expect(screen.getByLabelText('播放').className).toContain('w-10')
  })

  it('should apply custom className', () => {
    render(
      <VoicePlayer
        audioUrl="https://example.com/audio.mp3"
        textContent="Hello"
        className="custom-class"
      />
    )
    expect(screen.getByLabelText('播放').parentElement).toHaveClass('custom-class')
  })

  it('should toggle playback when clicking play button', async () => {
    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(screen.getByLabelText('暂停')).toBeInTheDocument()
    })
  })

  it('should show TTS button when no audio URL but has text', () => {
    render(<VoicePlayer audioUrl="" textContent="Hello World" />)
    expect(screen.getByLabelText('使用云端语音')).toBeInTheDocument()
  })

  it('should not show TTS button when audio URL exists', () => {
    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" />)
    expect(screen.queryByLabelText('使用云端语音')).not.toBeInTheDocument()
  })

  it('should call speechSynthesis when using TTS', () => {
    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('should stop playback when clicking pause', async () => {
    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(screen.getByLabelText('暂停')).toBeInTheDocument()
    })

    const pauseButton = screen.getByLabelText('暂停')
    fireEvent.click(pauseButton)

    await waitFor(() => {
      expect(screen.getByLabelText('播放')).toBeInTheDocument()
    })
  })

  it('should show loading state while fetching TTS', async () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    await waitFor(() => {
      expect(screen.getByLabelText('播放')).toBeDisabled()
    })
  })

  it('should handle TTS API success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ voiceUrl: 'https://example.com/voice.mp3' }),
    })

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/ava/hello/voice',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Hello World'),
        })
      )
    })
  })

  it('should handle TTS API failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    await waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })
  })

  it('should handle fetch error and fallback to browser TTS', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(<VoicePlayer audioUrl="" textContent="Hello World" />)

    const ttsButton = screen.getByLabelText('使用云端语音')
    fireEvent.click(ttsButton)

    await waitFor(() => {
      expect(window.speechSynthesis.speak).toHaveBeenCalled()
    })
  })

  it('should handle TTS with no text content', () => {
    render(<VoicePlayer audioUrl="" textContent="" />)

    const playButton = screen.getByLabelText('播放')
    fireEvent.click(playButton)

    expect(window.speechSynthesis.speak).not.toHaveBeenCalled()
  })

  it('should auto play when autoPlay is true', async () => {
    render(<VoicePlayer audioUrl="https://example.com/audio.mp3" textContent="Hello" autoPlay />)

    // Wait for useEffect to run
    await waitFor(() => {
      expect(screen.getByLabelText('播放')).toBeInTheDocument()
    })
  })
})
