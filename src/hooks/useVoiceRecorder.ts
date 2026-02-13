import { useState, useRef, useCallback } from 'react'

export interface VoiceRecordingResult {
  audioBlob: Blob
  audioUrl: string
  duration: number
  format: string
}

export interface UseVoiceRecorderOptions {
  maxDuration?: number // in seconds
  onRecordingComplete?: (result: VoiceRecordingResult) => void
  onError?: (error: Error) => void
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}) {
  const {
    maxDuration = 60,
    onRecordingComplete,
    onError,
  } = options

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    try {
      // Check if browser supports MediaRecorder
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording')
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Create MediaRecorder with supported MIME type
      let mimeType = 'audio/webm'
      let format = 'webm'

      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
        format = 'mp4'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else {
        // Fallback to default
        mimeType = ''
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        })

        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        const result: VoiceRecordingResult = {
          audioBlob,
          audioUrl: url,
          duration,
          format,
        }

        onRecordingComplete?.(result)
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)

      // Start duration timer
      startTimeRef.current = Date.now()
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000)
        setDuration(elapsed)

        // Auto-stop if max duration reached
        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording')
      onError?.(err)
    }
  }, [maxDuration, onRecordingComplete, onError])

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }

    setIsRecording(false)
    setIsPaused(false)
    startTimeRef.current = null
  }, [])

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [])

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume duration timer
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000)
        setDuration(elapsed)

        if (elapsed >= maxDuration) {
          stopRecording()
        }
      }, 100)
    }
  }, [maxDuration, stopRecording])

  /**
   * Cancel recording and clean up
   */
  const cancelRecording = useCallback(() => {
    stopRecording()
    setAudioUrl(null)
    setDuration(0)
    audioChunksRef.current = []
  }, [stopRecording])

  /**
   * Reset recording state
   */
  const resetRecording = useCallback(() => {
    setAudioUrl(null)
    setDuration(0)
    audioChunksRef.current = []
  }, [])

  /**
   * Format duration as MM:SS
   */
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    isRecording,
    isPaused,
    duration,
    audioUrl,
    formatDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
  }
}

/**
 * Utility function to convert audio blob to base64
 */
export async function audioBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Utility function to get audio file extension
 */
export function getAudioFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/ogg': 'ogg',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
  }

  return extensions[mimeType] || 'webm'
}
