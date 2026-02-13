export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  type?: 'text' | 'image' | 'voice'
  metadata?: {
    imageUrl?: string
    audioUrl?: string
    duration?: number
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  avatar?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  voiceEnabled: boolean
  notifications: boolean
  autoSave: boolean
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null
}

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  isMobile: boolean
}