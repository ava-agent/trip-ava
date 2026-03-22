import { useState, useEffect, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useSettingsStore } from '../store/settingsStore'
import { apiService } from '../services'

// Components
import { MessageList } from '../components/chat/MessageList'
import { WelcomeScreen } from '../components/chat/WelcomeScreen'
import { ChatInput } from '../components/chat/ChatInput'
import { ErrorDisplay } from '../components/ui/ErrorDisplay'
import { AvaTyping } from '../components/ui/Loading'
import { AnimatedAvatar, AvatarState } from '../components/ui/AnimatedAvatar'
import { UserMenu } from '../components/auth/UserMenu'

/**
 * AVA AI Digital Human Guide
 * Ultra-minimalist chat interface with animated avatar
 */
export function ChatPage() {
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const {
    conversations,
    currentConversationId,
    addMessage,
    createConversation,
    setCurrentConversation
  } = useChatStore()

  const { settings } = useSettingsStore()
  const voiceEnabled = settings.voiceEnabled

  const currentConversation = conversations.find(conv => conv.id === currentConversationId)
  const messages = currentConversation?.messages || []

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Create initial conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const newId = createConversation('AVA 对话')
      setCurrentConversation(newId)
    } else if (!currentConversationId && conversations.length > 0) {
      setCurrentConversation(conversations[0].id)
    }
  }, [conversations, currentConversationId, createConversation, setCurrentConversation])

  // Update avatar state based on activity
  useEffect(() => {
    if (isTyping) {
      setAvatarState('thinking')
    } else if (isSpeaking) {
      setAvatarState('speaking')
    } else {
      setAvatarState('idle')
    }
  }, [isTyping, isSpeaking])

  const handleSend = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !currentConversationId || isTyping) return

    // Store message for potential retry
    setLastMessage(messageText)
    setError(null)

    // Add user message immediately
    addMessage(currentConversationId, {
      id: Date.now().toString(),
      content: messageText,
      type: 'text',
      sender: 'user',
      timestamp: new Date()
    })

    setIsTyping(true)
    setAvatarState('thinking')

    try {
      // Call API service with timeout and retry logic
      const response = await apiService.chat({
        sessionId: currentConversationId,
        message: messageText,
      })

      if (response.success && response.data) {
        // Add assistant response
        addMessage(currentConversationId, {
          id: (Date.now() + 1).toString(),
          content: response.data.reply,
          type: 'text',
          sender: 'assistant',
          timestamp: new Date(response.data.timestamp),
          metadata: {
            imageUrl: response.data.imageUrl || undefined,
            audioUrl: response.data.voiceUrl
          }
        })

        // Reset retry count on success
        setRetryCount(0)

        // Simulate speaking state if voice is enabled
        if (voiceEnabled) {
          setIsSpeaking(true)
          setAvatarState('speaking')
          setTimeout(() => {
            setIsSpeaking(false)
            setAvatarState('idle')
          }, 2000)
        }

        // If voice URL is returned, we could play it
        if (response.data.voiceUrl && voiceEnabled) {
          console.warn('Voice available:', response.data.voiceUrl)
        }
      } else {
        throw new Error(response.error || 'API request failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息失败'
      console.error('Failed to send message:', err)
      setError(errorMessage)
    } finally {
      setIsTyping(false)
      setAvatarState('idle')
    }
  }, [currentConversationId, isTyping, addMessage, voiceEnabled])

  // Retry last failed message
  const handleRetry = useCallback(() => {
    if (lastMessage && retryCount < 3) {
      setRetryCount(prev => prev + 1)
      handleSend(lastMessage)
    }
  }, [lastMessage, retryCount, handleSend])

  // Dismiss error
  const handleDismissError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <AvaTyping />
      </div>
    )
  }

  const hasMessages = messages.length > 0

  return (
    <div className="h-full flex flex-col bg-white" data-testid="chat-page">
      {/* Header with Avatar and User Menu */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <AnimatedAvatar
            state={avatarState}
            size="sm"
            showGlow
          />
          <div>
            <h1 className="font-semibold text-gray-900">AVA</h1>
            <p className="text-xs text-gray-500">
              {avatarState === 'thinking' ? '思考中...' :
               avatarState === 'speaking' ? '正在回复...' :
               '在线'}
            </p>
          </div>
        </div>
        <UserMenu />
      </header>

      {/* Development Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="text-xs text-center py-1 bg-gray-100 text-gray-400">
          🔧 开发模式
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorDisplay
            error={error}
            onRetry={retryCount < 3 ? handleRetry : undefined}
            onDismiss={handleDismissError}
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!hasMessages ? (
          <WelcomeScreen onPromptClick={handleSend} />
        ) : (
          <MessageList messages={messages} isTyping={isTyping} />
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        voiceEnabled={voiceEnabled}
        isTyping={isTyping}
        conversationId={currentConversationId || undefined}
      />
    </div>
  )
}
