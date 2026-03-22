import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { chatHistoryApi, Conversation, ConversationSummary, Message } from '@/services/chatHistoryApi'

export interface ChatHistoryState {
  // State
  conversations: ConversationSummary[]
  currentConversation: Conversation | null
  currentConversationId: string | null
  isLoading: boolean
  error: string | null
  searchResults: ConversationSummary[]
  isSearching: boolean

  // Actions
  loadConversations: () => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
  createConversation: (title?: string) => Promise<string>
  deleteConversation: (conversationId: string) => Promise<void>
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>
  saveMessage: (conversationId: string, message: Omit<Message, 'timestamp'>) => Promise<void>
  searchConversations: (keyword: string) => Promise<void>
  clearSearch: () => void
  setCurrentConversationId: (id: string | null) => void
  clearError: () => void
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversation: null,
      currentConversationId: null,
      isLoading: false,
      error: null,
      searchResults: [],
      isSearching: false,

      // Load all conversations
      loadConversations: async () => {
        set({ isLoading: true, error: null })
        try {
          const conversations = await chatHistoryApi.getConversations()
          set({ conversations, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to load conversations',
            isLoading: false,
          })
        }
      },

      // Load specific conversation with messages
      loadConversation: async (conversationId: string) => {
        set({ isLoading: true, error: null })
        try {
          const conversation = await chatHistoryApi.getConversation(conversationId)
          set({
            currentConversation: conversation,
            currentConversationId: conversationId,
            isLoading: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to load conversation',
            isLoading: false,
          })
        }
      },

      // Create new conversation
      createConversation: async (title?: string) => {
        set({ isLoading: true, error: null })
        try {
          const conversation = await chatHistoryApi.createConversation(title)
          const { conversations } = get()
          set({
            conversations: [{
              conversationId: conversation.conversationId,
              title: conversation.title,
              createdAt: conversation.createdAt,
              updatedAt: conversation.updatedAt,
              messageCount: 0,
              lastMessagePreview: '',
            }, ...conversations],
            currentConversation: conversation,
            currentConversationId: conversation.conversationId,
            isLoading: false,
          })
          return conversation.conversationId
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to create conversation',
            isLoading: false,
          })
          throw err
        }
      },

      // Delete conversation
      deleteConversation: async (conversationId: string) => {
        set({ isLoading: true, error: null })
        try {
          await chatHistoryApi.deleteConversation(conversationId)
          const { conversations, currentConversationId } = get()
          set({
            conversations: conversations.filter(c => c.conversationId !== conversationId),
            currentConversation: currentConversationId === conversationId
              ? null
              : get().currentConversation,
            currentConversationId: currentConversationId === conversationId
              ? null
              : currentConversationId,
            isLoading: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to delete conversation',
            isLoading: false,
          })
          throw err
        }
      },

      // Update conversation title
      updateConversationTitle: async (conversationId: string, title: string) => {
        set({ isLoading: true, error: null })
        try {
          await chatHistoryApi.updateConversationTitle(conversationId, title)
          const { conversations, currentConversation } = get()
          set({
            conversations: conversations.map(c =>
              c.conversationId === conversationId
                ? { ...c, title }
                : c
            ),
            currentConversation: currentConversation && currentConversation.conversationId === conversationId
              ? { ...currentConversation, title }
              : currentConversation,
            isLoading: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to update title',
            isLoading: false,
          })
          throw err
        }
      },

      // Save message to conversation
      saveMessage: async (conversationId: string, message: Omit<Message, 'timestamp'>) => {
        try {
          await chatHistoryApi.saveMessage({
            conversationId,
            ...message,
          })

          // Update local state if it's the current conversation
          const { currentConversation, currentConversationId, conversations } = get()
          if (currentConversationId === conversationId && currentConversation) {
            const newMessage: Message = {
              ...message,
              timestamp: new Date().toISOString(),
            }
            set({
              currentConversation: {
                ...currentConversation,
                messages: [...currentConversation.messages, newMessage],
                messageCount: currentConversation.messageCount + 1,
              },
            })
          }

          // Update conversation list preview
          set({
            conversations: conversations.map(c =>
              c.conversationId === conversationId
                ? {
                    ...c,
                    messageCount: c.messageCount + 1,
                    lastMessagePreview: message.content.substring(0, 50) + '...',
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          })
        } catch (err) {
          console.error('Failed to save message:', err)
          // Don't throw here to avoid blocking the chat flow
        }
      },

      // Search conversations
      searchConversations: async (keyword: string) => {
        if (!keyword.trim()) {
          get().clearSearch()
          return
        }

        set({ isSearching: true, error: null })
        try {
          const results = await chatHistoryApi.searchConversations(keyword)
          set({ searchResults: results, isSearching: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Search failed',
            isSearching: false,
          })
        }
      },

      // Clear search results
      clearSearch: () => {
        set({ searchResults: [], isSearching: false })
      },

      // Set current conversation ID
      setCurrentConversationId: (id: string | null) => {
        set({ currentConversationId: id })
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-history-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    }
  )
)
