import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useSettingsStore } from '../store/settingsStore'
import { apiService } from '../services'
import avaAvatar from '../assets/ava-avatar.png'
import { VoiceInputButton } from '../components/ui/VoiceInputButton'

/**
 * AVA AI Digital Human Guide
 * Ultra-minimalist chat interface inspired by Doubao
 * Clean white background, centered avatar, simple input
 */
export function ChatPage() {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const {
    conversations,
    currentConversationId,
    addMessage,
    createConversation,
    setCurrentConversation
  } = useChatStore()

  const { voiceEnabled, apiMode } = useSettingsStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find(conv => conv.id === currentConversationId)
  const messages = currentConversation?.messages || []

  // Create initial conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const newId = createConversation('AVA 对话')
      setCurrentConversation(newId)
    } else if (!currentConversationId && conversations.length > 0) {
      setCurrentConversation(conversations[0].id)
    }
  }, [conversations, currentConversationId, createConversation, setCurrentConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim() || !currentConversationId) return

    // Clear input if not from voice
    if (!messageText) {
      setInputValue('')
    }

    // Add user message immediately
    addMessage(currentConversationId, {
      id: Date.now().toString(),
      content: textToSend,
      type: 'text',
      sender: 'user',
      timestamp: new Date()
    })

    setIsTyping(true)

    try {
      // Call API service (mock or real based on environment)
      const response = await apiService.chat({
        sessionId: currentConversationId,
        message: textToSend,
      })

      if (response.success && response.data) {
        // Add assistant response
        addMessage(currentConversationId, {
          id: (Date.now() + 1).toString(),
          content: response.data.reply,
          type: 'text',
          sender: 'assistant',
          timestamp: new Date(response.data.timestamp)
        })

        // If voice URL is returned, we could play it
        if (response.data.voiceUrl && voiceEnabled) {
          console.log('Voice available:', response.data.voiceUrl)
          // TODO: Play audio if voice feature is enabled
        }
      } else {
        throw new Error(response.error || 'API request failed')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Fallback to error message
      addMessage(currentConversationId, {
        id: (Date.now() + 1).toString(),
        content: `抱歉，我暂时无法回应。${apiMode === 'real' ? '请检查后端服务是否正常运行。' : '请稍后再试。'}`,
        type: 'text',
        sender: 'assistant',
        timestamp: new Date()
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceComplete = (text: string, audioBlob?: Blob) => {
    // Use the transcribed text from voice input
    setInputValue(text)
    // Optionally auto-send or let user review
    // handleSend(text)
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* API Mode Indicator - Development Only */}
      {import.meta.env.DEV && (
        <div className="text-xs text-center py-1 bg-gray-100 text-gray-400">
          {apiMode === 'mock' ? '🔧 Mock API 模式' : '🌐 Real API 模式'}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Welcome Screen - Large Centered Avatar */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Large AVA Avatar */}
            <div className="mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-violet-100">
                <img
                  src={avaAvatar}
                  alt="AVA - AI Travel Guide"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              我是 AVA
            </h1>
            <p className="text-base text-gray-500 mb-10">
              您的 AI 旅行向导
            </p>

            {/* Suggested Prompts - Minimal */}
            <div className="flex flex-col gap-2 max-w-md w-full">
              <button
                onClick={() => handleSend('推荐云南的旅行目的地')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
              >
                推荐云南的旅行目的地
              </button>
              <button
                onClick={() => handleSend('规划5天云南行程')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
              >
                规划5天云南行程
              </button>
              <button
                onClick={() => handleSend('云南有什么特色美食')}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors text-sm cursor-pointer"
              >
                云南特色美食
              </button>
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="max-w-2xl mx-auto py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'assistant' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2 ring-2 ring-violet-100">
                    <img
                      src={avaAvatar}
                      alt="AVA"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className={`
                  px-4 py-2.5 max-w-[85%]
                  ${message.sender === 'user'
                    ? 'bg-violet-500 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm'
                  }
                `}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ml-2">
                    <span className="text-gray-600 text-sm font-semibold">我</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2 ring-2 ring-violet-100">
                  <img
                    src={avaAvatar}
                    alt="AVA"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Clean & Minimal */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Voice Input Button */}
            {voiceEnabled && (
              <VoiceInputButton
                onRecordingComplete={handleVoiceComplete}
                disabled={isTyping}
              />
            )}

            {/* Input Field */}
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="和 AVA 聊聊..."
                disabled={isTyping}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-white focus:bg-white rounded-2xl transition-all outline-none text-sm focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className={`
                flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
                ${inputValue.trim() && !isTyping
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
    </div>
  )
}
