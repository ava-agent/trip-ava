import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

const STORAGE_KEY = 'ava-chat-storage'

export const useChatStore = create<ChatStore>()(
  persist(
    (set, _get) => ({
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
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
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
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects
          state.conversations = state.conversations.map((conv) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }))
        }
        // Rehydration complete - state restored from localStorage
      },
    }
  )
)