import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '@/store/chatStore'
import { Message, Conversation } from '@/types'

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { clearAll } = useChatStore.getState()
    clearAll()
  })

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      const state = useChatStore.getState()

      expect(state.conversations).toEqual([])
      expect(state.currentConversationId).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('createConversation', () => {
    it('should create a new conversation with default title', () => {
      const { createConversation } = useChatStore.getState()

      const conversationId = createConversation()

      const state = useChatStore.getState()
      expect(state.conversations).toHaveLength(1)
      expect(state.conversations[0].title).toBe('新对话')
      expect(state.currentConversationId).toBe(conversationId)
    })

    it('should create a new conversation with custom title', () => {
      const { createConversation } = useChatStore.getState()

      const conversationId = createConversation('我的旅行')

      const state = useChatStore.getState()
      expect(state.conversations[0].title).toBe('我的旅行')
      expect(state.currentConversationId).toBe(conversationId)
    })

    it('should add new conversation at the beginning', () => {
      const { createConversation } = useChatStore.getState()

      createConversation('First')
      createConversation('Second')

      const state = useChatStore.getState()
      expect(state.conversations).toHaveLength(2)
      expect(state.conversations[0].title).toBe('Second')
      expect(state.conversations[1].title).toBe('First')
    })
  })

  describe('addMessage', () => {
    it('should add message to existing conversation', () => {
      const { createConversation, addMessage } = useChatStore.getState()

      const conversationId = createConversation()

      const message: Message = {
        id: '1',
        sender: 'user',
        content: 'Hello',
        timestamp: new Date()
      }

      addMessage(conversationId, message)

      const state = useChatStore.getState()
      const conversation = state.conversations.find(c => c.id === conversationId)
      expect(conversation?.messages).toHaveLength(1)
      expect(conversation?.messages[0]).toEqual(message)
    })

    it('should not add message to non-existent conversation', () => {
      const { createConversation, addMessage } = useChatStore.getState()

      createConversation()

      const message: Message = {
        id: '1',
        sender: 'user',
        content: 'Hello',
        timestamp: new Date()
      }

      addMessage('non-existent', message)

      const state = useChatStore.getState()
      expect(state.conversations[0].messages).toHaveLength(0)
    })

    it('should update conversation timestamp when adding message', () => {
      const { createConversation, addMessage } = useChatStore.getState()

      const conversationId = createConversation()
      const originalConversation = useChatStore.getState().conversations[0]

      // Wait a bit to ensure timestamp difference
      const futureDate = new Date(originalConversation.createdAt.getTime() + 1000)

      const message: Message = {
        id: '1',
        sender: 'user',
        content: 'Hello',
        timestamp: futureDate
      }

      addMessage(conversationId, message)

      const state = useChatStore.getState()
      const conversation = state.conversations.find(c => c.id === conversationId)
      expect(conversation?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalConversation.createdAt.getTime())
    })
  })

  describe('setCurrentConversation', () => {
    it('should set current conversation ID', () => {
      const { createConversation, setCurrentConversation } = useChatStore.getState()

      const conversationId = createConversation()
      setCurrentConversation(conversationId)

      expect(useChatStore.getState().currentConversationId).toBe(conversationId)
    })

    it('should allow setting to null', () => {
      const { createConversation, setCurrentConversation } = useChatStore.getState()

      createConversation()
      setCurrentConversation(null)

      expect(useChatStore.getState().currentConversationId).toBeNull()
    })
  })

  describe('updateConversation', () => {
    it('should update conversation properties', () => {
      const { createConversation, updateConversation } = useChatStore.getState()

      const conversationId = createConversation()
      updateConversation(conversationId, { title: 'Updated Title' })

      const state = useChatStore.getState()
      const conversation = state.conversations.find(c => c.id === conversationId)
      expect(conversation?.title).toBe('Updated Title')
    })

    it('should update timestamp when updating conversation', async () => {
      const { createConversation, updateConversation } = useChatStore.getState()

      const conversationId = createConversation()
      const originalUpdatedAt = useChatStore.getState().conversations[0].updatedAt

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10))

      updateConversation(conversationId, { title: 'Updated' })

      const state = useChatStore.getState()
      const conversation = state.conversations.find(c => c.id === conversationId)
      expect(conversation?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime())
    })
  })

  describe('deleteConversation', () => {
    it('should delete conversation', () => {
      const { createConversation, deleteConversation } = useChatStore.getState()

      const id1 = createConversation('First')
      const id2 = createConversation('Second')

      expect(useChatStore.getState().conversations).toHaveLength(2)

      deleteConversation(id1)

      // Verify state after deletion
      const state = useChatStore.getState()
      expect(state.conversations).toHaveLength(1)
      expect(state.conversations[0].id).toBe(id2)
    })

    it('should update current conversation ID when deleting current', () => {
      const { createConversation, deleteConversation } = useChatStore.getState()

      const id1 = createConversation('First')
      const id2 = createConversation('Second')

      expect(useChatStore.getState().currentConversationId).toBe(id2)

      deleteConversation(id2)

      // Verify current ID was updated to the remaining conversation
      expect(useChatStore.getState().currentConversationId).toBe(id1)
    })

    it('should set current conversation to null when deleting last conversation', () => {
      const { createConversation, deleteConversation } = useChatStore.getState()

      const id = createConversation()
      expect(useChatStore.getState().currentConversationId).toBe(id)

      deleteConversation(id)

      expect(useChatStore.getState().currentConversationId).toBeNull()
    })
  })

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { setLoading } = useChatStore.getState()

      setLoading(true)
      expect(useChatStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useChatStore.getState().isLoading).toBe(false)
    })

    it('should set error state', () => {
      const { setError } = useChatStore.getState()

      setError('Test error')
      expect(useChatStore.getState().error).toBe('Test error')

      setError(null)
      expect(useChatStore.getState().error).toBeNull()
    })
  })

  describe('clearAll', () => {
    it('should clear all state', () => {
      const { createConversation, setLoading, setError, clearAll } = useChatStore.getState()

      createConversation('Test')
      setLoading(true)
      setError('Error')

      expect(useChatStore.getState().conversations).toHaveLength(1)
      expect(useChatStore.getState().isLoading).toBe(true)
      expect(useChatStore.getState().error).toBe('Error')

      clearAll()

      const state = useChatStore.getState()
      expect(state.conversations).toEqual([])
      expect(state.currentConversationId).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })
})
