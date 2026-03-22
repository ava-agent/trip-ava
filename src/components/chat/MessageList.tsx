import { useRef, useEffect, memo } from 'react'
import type { Message } from '../../types'
import { VoicePlayer } from '../ui/VoicePlayer'
import { ChatAvatar, TypingIndicator } from '../ui/AnimatedAvatar'

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
}

// Memoized Message Item for better performance
const MessageItem = memo(({ message }: { message: Message }) => {
    const isUser = message.sender === 'user'

    return (
        <div
            key={message.id}
            data-testid={isUser ? 'user-message' : 'assistant-message'}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="flex-shrink-0 mr-2">
                    <ChatAvatar state="idle" />
                </div>
            )}

            <div className="flex flex-col max-w-[85%]">
                <div className={`
                    px-4 py-2.5
                    ${isUser
                        ? 'bg-violet-500 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm'
                    }
                `}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                    </p>
                </div>

                {/* Voice Player for Assistant Messages */}
                {!isUser && (
                    <div className="mt-1 self-start">
                        <VoicePlayer
                            audioUrl={message.metadata?.audioUrl || ''}
                            textContent={message.content}
                            size="sm"
                        />
                    </div>
                )}

                {/* Image Rendering */}
                {message.metadata?.imageUrl && (
                    <div className={`mt-2 rounded-xl overflow-hidden shadow-sm border border-gray-100 ${isUser ? 'self-end' : 'self-start'}`}>
                        <img
                            src={message.metadata.imageUrl}
                            alt="Destination"
                            className="max-w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ml-2">
                    <span className="text-gray-600 text-sm font-semibold">我</span>
                </div>
            )}
        </div>
    )
})

MessageItem.displayName = 'MessageItem'

// Memoized MessageList to prevent unnecessary re-renders
export const MessageList = memo(function MessageList({ messages, isTyping }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-4">
            {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
            ))}

            {/* Typing Indicator with Animated Avatar */}
            {isTyping && (
                <div className="flex justify-start">
                    <TypingIndicator />
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )
})

MessageList.displayName = 'MessageList'
