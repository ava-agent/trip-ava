/**
 * API Configuration - Simplified for AI Digital Human Guide
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Core Chat Types - AI Digital Human Guide
 */
export interface ChatRequest {
  sessionId: string
  message: string
  userId?: string
}

export interface ChatResponse {
  reply: string
  voiceUrl?: string
  timestamp: string
}

export interface VoiceRequest {
  sessionId: string
  audioData: Blob
  format: string
  userId?: string
}

export interface VoiceResponse {
  transcription: string
  confidence: number
  reply?: string
  voiceUrl?: string
}

/**
 * API Client Class - Simplified for Core Feature
 */
class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
  }

  /**
   * Generic request method with timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Upload file (multipart/form-data)
   */
  private async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send Chat Message - Core Feature
   */
  async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/ava/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Upload Voice for Speech-to-Text + AI Response
   */
  async uploadVoice(
    request: VoiceRequest
  ): Promise<ApiResponse<VoiceResponse>> {
    const formData = new FormData()
    formData.append('sessionId', request.sessionId)
    formData.append('audio', request.audioData, `audio.${request.format}`)
    if (request.userId) {
      formData.append('userId', request.userId)
    }

    return this.uploadFile<VoiceResponse>('/ava/voice', formData)
  }

  /**
   * AVA Hello Greeting
   */
  async avaHello(userId?: string): Promise<ApiResponse<{ content: string }>> {
    return this.request('/ava/hello', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  /**
   * AVA Voice Synthesis
   */
  async avaSpeak(
    content: string,
    userId?: string
  ): Promise<ApiResponse<{ voiceUrl: string }>> {
    return this.request('/ava/speak', {
      method: 'POST',
      body: JSON.stringify({ content, userId }),
    })
  }

  /**
   * Create Session
   */
  async createSession(
    userId?: string
  ): Promise<ApiResponse<{ sessionId: string }>> {
    return this.request('/ava/session/create', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }
}

/**
 * Export singleton instance
 */
export const apiClient = new ApiClient(API_CONFIG)

/**
 * Export types
 */
export default apiClient
