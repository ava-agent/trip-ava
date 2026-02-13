/**
 * Services Index
 * Simplified for AI Digital Human Guide core functionality
 */

export { apiClient } from './api'
export { mockApiClient } from './mockApi'

export * from './api'
export * from './mockApi'

/**
 * Service factory - returns appropriate client based on environment
 */
import { apiClient } from './api'
import { mockApiClient } from './mockApi'

type ApiClientType = typeof apiClient | typeof mockApiClient

export const getService = (useMock: boolean = false): ApiClientType => {
  // Check if we should use mock service
  if (useMock || import.meta.env.VITE_USE_MOCK_API === 'true') {
    console.log('🔧 Using Mock API Service')
    return mockApiClient as ApiClientType
  }

  // Check if API base URL is configured
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn('⚠️ No API_BASE_URL configured, using Mock API')
    return mockApiClient as ApiClientType
  }

  console.log('🌐 Using Real API Service')
  return apiClient
}

// Export default service instance
export const apiService = getService()

// Re-export all types
export type {
  ApiResponse,
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
} from './api'
