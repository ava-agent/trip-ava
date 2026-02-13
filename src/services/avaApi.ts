// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Types
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

export interface ChatRequest {
  userId?: string
  conversationId?: string
  message: ChatMessage
  history?: ChatMessage[]
}

export interface ChatResponse {
  conversationId?: string
  message: ChatMessage
}

/**
 * AVA Backend API Service
 * Connects to the Spring Boot backend at localhost:8080
 */
class AvaApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  /**
   * Send a chat message to AVA
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ava/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: request.userId || 'anonymous',
          conversationId: request.conversationId,
          message: {
            role: request.message.role,
            content: request.message.content,
            timestamp: request.message.timestamp || Date.now(),
          },
          history: request.history || [],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        conversationId: data.conversationId,
        message: {
          role: data.message.role,
          content: data.message.content,
          timestamp: data.message.timestamp,
        },
      }
    } catch (error) {
      console.error('Chat API error:', error)
      throw error
    }
  }

  /**
   * Get AVA's greeting message
   */
  async hello(userId: string = 'anonymous'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/ava/hello`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('Hello API error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const avaApi = new AvaApiService()
