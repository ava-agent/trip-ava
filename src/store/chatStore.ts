import { create } from 'zustand'
import { ChatState, Conversation, Message } from '../types'

interface ChatStore extends ChatState {
  addMessage: (conversationId: string, message: Message) => void
  createConversation: (title?: string) => string
  setCurrentConversation: (id: string | null) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  deleteConversation: (id: string) => void
  clearAll: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,

  addMessage: (conversationId: string, message: Message) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
            }
          : conv
      ),
    }))
  },

  createConversation: (title = '新对话') => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }))

    return newConversation.id
  },

  setCurrentConversation: (id: string | null) => {
    set({ currentConversationId: id })
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv
      ),
    }))
  },

  deleteConversation: (id: string) => {
    set((state) => {
      const newConversations = state.conversations.filter((conv) => conv.id !== id)
      const newCurrentId = 
        state.currentConversationId === id 
          ? newConversations[0]?.id || null 
          : state.currentConversationId

      return {
        conversations: newConversations,
        currentConversationId: newCurrentId,
      }
    })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearAll: () => {
    set({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,
    })
  },
}))