import { useState, useCallback, memo } from 'react'
import { Send, Mic, X, Loader2 } from 'lucide-react'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { avaApi } from '../../services/avaApi'
import { useChatStore } from '../../store/chatStore'

interface ChatInputProps {
  onSend: (message: string) => void;
  voiceEnabled: boolean;
  isTyping: boolean;
  conversationId?: string;
}

// Memoized ChatInput to prevent unnecessary re-renders
export const ChatInput = memo(function ChatInput({ onSend, voiceEnabled, isTyping, conversationId }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)
  const { addMessage } = useChatStore()

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !isTyping) {
      onSend(inputValue);
      setInputValue('');
    }
  }, [inputValue, isTyping, onSend])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isTyping) {
        onSend(inputValue);
        setInputValue('');
      }
    }
  }, [inputValue, isTyping, onSend])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleVoiceRecordingComplete = useCallback(async (result: { audioBlob: Blob; duration: number }) => {
    if (!conversationId || isUploadingVoice) return

    setIsUploadingVoice(true)

    try {
      // Add user voice message to UI immediately
      const tempMessageId = `voice-${Date.now()}`
      addMessage(conversationId, {
        id: tempMessageId,
        content: `🎤 语音消息 (${Math.round(result.duration)}秒)`,
        type: 'text',
        sender: 'user',
        timestamp: new Date()
      })

      // Upload voice to backend
      const response = await avaApi.voiceChat(result.audioBlob, conversationId)

      // Add assistant response
      if (response.message) {
        addMessage(conversationId, {
          id: (Date.now() + 1).toString(),
          content: response.message.content,
          type: 'text',
          sender: 'assistant',
          timestamp: new Date(response.message.timestamp || Date.now())
        })
      }
    } catch (error) {
      console.error('Voice upload failed:', error)
      // Add error message
      addMessage(conversationId, {
        id: (Date.now() + 1).toString(),
        content: '语音消息发送失败，请重试',
        type: 'text',
        sender: 'assistant',
        timestamp: new Date()
      })
    } finally {
      setIsUploadingVoice(false)
    }
  }, [conversationId, isUploadingVoice, addMessage])

  // Voice recorder hook
  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording
  } = useVoiceRecorder({
    maxDuration: 60,
    onRecordingComplete: handleVoiceRecordingComplete,
    onError: (error) => {
      console.error('Voice recording error:', error)
      alert('录音失败: ' + error.message)
    }
  })

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-end gap-2">
          {/* Voice Input Button */}
          {voiceEnabled && !isRecording && (
            <button
              onClick={startRecording}
              disabled={isTyping || isUploadingVoice}
              className={`
                flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
                ${isTyping || isUploadingVoice
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }
              `}
              aria-label="开始录音"
            >
              {isUploadingVoice ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Recording UI */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <button
                onClick={stopRecording}
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-red-500 hover:bg-red-600 text-white animate-pulse"
                aria-label="停止录音"
              >
                <Mic className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-600">
                  {formatDuration(recordingDuration)}
                </span>
                <button
                  onClick={cancelRecording}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="取消录音"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input Field */}
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "正在录音..." : "和 AVA 聊聊..."}
              disabled={isTyping || isRecording}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-white focus:bg-white rounded-2xl transition-all outline-none text-sm focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping || isRecording}
            className={`
              flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${inputValue.trim() && !isTyping && !isRecording
                ? 'bg-violet-500 hover:bg-violet-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'
