import { apiClient } from './api'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  messageType?: string
  audioUrl?: string
  imageUrl?: string
  duration?: number
}

export interface Conversation {
  conversationId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  messageCount: number
}

export interface ConversationSummary {
  conversationId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessagePreview: string
}

export interface ConversationStats {
  totalConversations: number
  recentConversations: number
  recentMessages: number
}

export interface SaveMessageRequest {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  messageType?: string
  audioUrl?: string
  imageUrl?: string
  duration?: number
}

/**
 * Chat History API Service
 */
class ChatHistoryApiService {
  private baseUrl = '/api/chat'

  /**
   * Create a new conversation
   */
  async createConversation(title?: string): Promise<Conversation> {
    const url = title
      ? `${this.baseUrl}/conversations?title=${encodeURIComponent(title)}`
      : `${this.baseUrl}/conversations`

    const response = await apiClient.request<Conversation>(url, {
      method: 'POST',
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create conversation')
    }

    return response.data
  }

  /**
   * Get all conversations
   */
  async getConversations(): Promise<ConversationSummary[]> {
    const response = await apiClient.request<ConversationSummary[]>(
      `${this.baseUrl}/conversations`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get conversations')
    }

    return response.data
  }

  /**
   * Get specific conversation with messages
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.request<Conversation>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get conversation')
    }

    return response.data
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.request<Message[]>(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get messages')
    }

    return response.data
  }

  /**
   * Save a message to conversation
   */
  async saveMessage(request: SaveMessageRequest): Promise<void> {
    const response = await apiClient.request<{ status: string; message: string }>(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to save message')
    }
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    const response = await apiClient.request<{ status: string; message: string }>(
      `${this.baseUrl}/conversations/${conversationId}/title?title=${encodeURIComponent(title)}`,
      { method: 'PUT' }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to update title')
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await apiClient.request<{ status: string; message: string }>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { method: 'DELETE' }
    )

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete conversation')
    }
  }

  /**
   * Search conversations
   */
  async searchConversations(keyword: string): Promise<ConversationSummary[]> {
    const response = await apiClient.request<ConversationSummary[]>(
      `${this.baseUrl}/conversations/search?keyword=${encodeURIComponent(keyword)}`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search conversations')
    }

    return response.data
  }

  /**
   * Search messages
   */
  async searchMessages(keyword: string): Promise<Message[]> {
    const response = await apiClient.request<Message[]>(
      `${this.baseUrl}/messages/search?keyword=${encodeURIComponent(keyword)}`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search messages')
    }

    return response.data
  }

  /**
   * Get conversation statistics
   */
  async getStats(): Promise<ConversationStats> {
    const response = await apiClient.request<ConversationStats>(
      `${this.baseUrl}/stats`,
      { method: 'GET' }
    )

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get stats')
    }

    return response.data
  }
}

export const chatHistoryApi = new ChatHistoryApiService()
