import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, X } from 'lucide-react'

interface VoiceInputButtonProps {
  onRecordingComplete: (text: string, audioBlob?: Blob) => void
  disabled?: boolean
  className?: string
}

/**
 * Voice Input Button Component
 * Records voice input and converts to text
 */
export function VoiceInputButton({ onRecordingComplete, disabled, className = '' }: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // For now, just pass placeholder text
        // In real implementation, send to backend for transcription
        onRecordingComplete('语音消息已录制', audioBlob)

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('无法访问麦克风，请检查浏览器权限设置')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setRecordingTime(0)
  }

  const cancelRecording = () => {
    stopRecording()
    audioChunksRef.current = []
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isRecording) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleClick}
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-red-500 hover:bg-red-600 text-white animate-pulse"
          aria-label="停止录音"
        >
          <Mic className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
          <span className="text-sm font-medium text-red-600">{formatTime(recordingTime)}</span>
          <button
            onClick={cancelRecording}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="取消录音"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
        ${disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }
        ${className}
      `}
      aria-label="语音输入"
    >
      <Mic className="w-5 h-5" />
    </button>
  )
}
