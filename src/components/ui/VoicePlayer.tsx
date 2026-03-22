import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface VoicePlayerProps {
  /** Audio URL to play */
  audioUrl: string;
  /** Optional text content for TTS fallback */
  textContent?: string;
  /** Auto play when component mounts */
  autoPlay?: boolean;
  /** Player size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Voice Player Component
 * Plays audio from URL with controls
 * Falls back to browser TTS if audio URL is not available
 */
export const VoicePlayer = memo(function VoicePlayer({
  audioUrl,
  textContent,
  autoPlay = false,
  size = 'md',
  className = ''
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useTTS, setUseTTS] = useState(!audioUrl)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Size configurations
  const sizeConfig = {
    sm: { button: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { button: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { button: 'w-10 h-10', icon: 'w-5 h-5' }
  }

  const config = sizeConfig[size]

  // Initialize audio element
  useEffect(() => {
    if (audioUrl && !useTTS) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.addEventListener('ended', () => setIsPlaying(false))
      audio.addEventListener('error', () => {
        console.warn('Audio playback failed, falling back to TTS')
        setUseTTS(true)
      })

      if (autoPlay) {
        void playAudio()
      }

      return () => {
        audio.pause()
        audio.src = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, useTTS, autoPlay])

  // Browser TTS playback
  const playTTS = useCallback(async () => {
    if (!textContent) {
      setError('No content to speak')
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textContent)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => {
      setError('Speech synthesis failed')
      setIsPlaying(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [textContent])

  // Audio playback
  const playAudio = useCallback(async () => {
    if (!audioRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Audio playback error:', err)
      // Fall back to TTS
      if (textContent) {
        setUseTTS(true)
        await playTTS()
      } else {
        setError('Playback failed')
      }
    } finally {
      setIsLoading(false)
    }
  }, [textContent, playTTS])

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (useTTS) {
      window.speechSynthesis.cancel()
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }, [useTTS])

  // Toggle play/pause
  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      stopPlayback()
    } else {
      if (useTTS) {
        await playTTS()
      } else {
        await playAudio()
      }
    }
  }, [isPlaying, useTTS, playTTS, stopPlayback, playAudio])

  // Request TTS from backend
  const requestTTS = useCallback(async () => {
    if (!textContent) return

    setIsLoading(true)
    setError(null)

    try {
      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // Call backend TTS API
      const response = await fetch('/ava/hello/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          content: textContent
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.voiceUrl) {
        setUseTTS(false)
        // Create new audio element with returned URL
        const audio = new Audio(data.voiceUrl)
        audioRef.current = audio
        audio.addEventListener('ended', () => setIsPlaying(false))
        await audio.play()
        setIsPlaying(true)
      } else {
        // Backend returned empty URL, use browser TTS
        setUseTTS(true)
        await playTTS()
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }
      console.error('TTS request failed:', err)
      // Fall back to browser TTS
      setUseTTS(true)
      await playTTS()
    } finally {
      setIsLoading(false)
    }
  }, [textContent, playTTS])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (useTTS) {
        window.speechSynthesis.cancel()
      } else if (audioRef.current) {
        audioRef.current.pause()
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [useTTS])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayback}
        disabled={isLoading || (!audioUrl && !textContent)}
        className={`
          ${config.button} rounded-full flex items-center justify-center transition-all
          ${isLoading
            ? 'bg-gray-100 text-gray-400 cursor-wait'
            : isPlaying
              ? 'bg-violet-100 text-violet-600 hover:bg-violet-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isLoading ? (
          <Loader2 className={`${config.icon} animate-spin`} />
        ) : isPlaying ? (
          <Pause className={config.icon} />
        ) : (
          <Play className={config.icon} />
        )}
      </button>

      {/* TTS Button (only show if no audio URL) */}
      {!audioUrl && textContent && (
        <button
          onClick={requestTTS}
          disabled={isLoading || isPlaying}
          className={`
            ${config.button} rounded-full flex items-center justify-center transition-all
            ${useTTS
              ? 'bg-violet-100 text-violet-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="使用 AWS Polly 播放"
          aria-label="使用云端语音"
        >
          {useTTS ? <Volume2 className={config.icon} /> : <VolumeX className={config.icon} />}
        </button>
      )}

      {/* Error indicator */}
      {error && (
        <span className="text-xs text-red-500" title={error}>
          播放失败
        </span>
      )}
    </div>
  )
})

VoicePlayer.displayName = 'VoicePlayer'

export default VoicePlayer
