import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient } from '@/services/api'
import { authApi } from '@/services/authApi'
import type { ChatRequest, VoiceRequest } from '@/services/api'

// Mock fetch
global.fetch = vi.fn()

// Mock authApi
vi.mock('@/services/authApi', () => ({
  authApi: {
    getAccessToken: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(authApi.getAccessToken).mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Chat API', () => {
    it('should send chat message successfully', async () => {
      const mockResponse = {
        reply: 'Hello! I am AVA.',
        timestamp: '2024-01-01T00:00:00Z'
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const request: ChatRequest = {
        sessionId: 'session-1',
        message: 'Hello AVA'
      }

      const result = await apiClient.chat(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/chat'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      )
    })

    it('should handle chat API error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      } as Response)

      const result = await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('500')
    })

    it('should handle network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('Voice API', () => {
    it('should upload voice file', async () => {
      const mockResponse = {
        transcription: 'Hello world',
        confidence: 0.95,
        reply: 'Hi there!'
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const request: VoiceRequest = {
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm'
      }

      const result = await apiClient.uploadVoice(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/voice'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )
    })
  })

  describe('AVA Hello API', () => {
    it('should get hello message', async () => {
      const mockResponse = { content: 'Hello! I am AVA, your travel assistant.' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await apiClient.avaHello('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/hello'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 'user-1' })
        })
      )
    })

    it('should get hello message without userId', async () => {
      const mockResponse = { content: 'Hello! I am AVA.' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await apiClient.avaHello()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('AVA Speak API', () => {
    it('should get voice synthesis URL', async () => {
      const mockResponse = { voiceUrl: 'https://example.com/voice.mp3' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await apiClient.avaSpeak('Hello world', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/speak'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: 'Hello world', userId: 'user-1' })
        })
      )
    })
  })

  describe('Session API', () => {
    it('should create new session', async () => {
      const mockResponse = { sessionId: 'new-session-123' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await apiClient.createSession('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/session/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 'user-1' })
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle non-JSON responses', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        json: async () => { throw new Error('Invalid JSON') }
      } as unknown as Response)

      const result = await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      expect(result.success).toBe(false)
    })

    it('should handle voice upload HTTP error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('500')
    })

    it('should handle voice upload network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle unknown error type in upload', async () => {
      vi.mocked(fetch).mockRejectedValueOnce('string error')

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('should upload voice with userId in FormData', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transcription: 'Hello', confidence: 0.95 })
      } as Response)

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm',
        userId: 'user-123'
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Authentication', () => {
    it('should include Authorization header when token exists', async () => {
      vi.mocked(authApi.getAccessToken).mockReturnValue('test-token')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reply: 'Hello' }),
      } as Response)

      await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
    })

    it('should not include Authorization header when no token', async () => {
      vi.mocked(authApi.getAccessToken).mockReturnValue(null)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reply: 'Hello' }),
      } as Response)

      await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      const callArgs = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit | undefined
      expect(callArgs?.headers).not.toHaveProperty('Authorization')
    })

    it('should handle 401 Unauthorized error and logout', async () => {
      const mockLogout = vi.mocked(authApi.logout)
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const result = await apiClient.chat({ sessionId: 'session-1', message: 'Hello' })

      expect(result.success).toBe(false)
      expect(mockLogout).toHaveBeenCalled()
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent))

      dispatchEventSpy.mockRestore()
    })

    it('should handle 401 on voice upload', async () => {
      const mockLogout = vi.mocked(authApi.logout)
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const mockFile = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'webm',
      })

      expect(result.success).toBe(false)
      expect(mockLogout).toHaveBeenCalled()
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent))

      dispatchEventSpy.mockRestore()
    })
  })

  describe('Generic GET and POST methods', () => {
    it('should make GET request', async () => {
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await apiClient.get('/api/test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should make POST request', async () => {
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const body = { name: 'Test' }
      const result = await apiClient.post('/api/test', body)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })

    it('should handle GET request error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiClient.get('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle POST request error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Server error'))

      const result = await apiClient.post('/api/test', { name: 'Test' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Server error')
    })
  })
})
