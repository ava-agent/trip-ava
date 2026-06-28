import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api'

// Mock fetch
global.fetch = vi.fn()

type ApiClientConstructor = new (config: {
  baseURL: string
  timeout: number
}) => typeof apiClient

const createApiClient = (baseURL = 'http://localhost:8080', timeout = 30000) =>
  new (apiClient.constructor as ApiClientConstructor)({ baseURL, timeout })

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('Configuration', () => {
    it('should have default empty base URL when env is not configured', () => {
      expect(apiClient['baseURL']).toBe('')
    })

    it('should have default timeout', () => {
      expect(apiClient['timeout']).toBe(30000)
    })
  })

  describe('Request Method', () => {
    it('should make successful GET request', async () => {
      const client = createApiClient()
      const mockData = { message: 'Success' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const result = await client['request']('/test', { method: 'GET' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should make successful POST request', async () => {
      const client = createApiClient()
      const mockData = { created: true }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const result = await client['request']('/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result.success).toBe(true)
    })

    it('should handle HTTP error response', async () => {
      const client = createApiClient()
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      })

      const result = await client['request']('/test')

      expect(result.success).toBe(false)
      expect(result.error).toContain('404')
    })

    it('should handle network error', async () => {
      const client = createApiClient()
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await client['request']('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle timeout', async () => {
      ;(fetch as any).mockImplementationOnce((_: string, options: RequestInit) =>
        new Promise((_, reject) => {
          options.signal?.addEventListener('abort', () => reject(new Error('AbortError')))
        })
      )

      const shortTimeoutClient = createApiClient('http://localhost:8080', 10)

      const result = await shortTimeoutClient['request']('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('AbortError')
    })
  })

  describe('Core APIs', () => {
    it('should send a chat message', async () => {
      const client = createApiClient()
      const mockResponse = {
        reply: '您好，我是 AVA。',
        timestamp: '2026-06-28T00:00:00.000Z',
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const request = {
        sessionId: 'session-1',
        message: '你好',
      }

      const result = await client.chat(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/ava/chat',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      )
    })

    it('should upload voice file', async () => {
      const client = createApiClient()
      const mockResponse = {
        transcription: 'Hello world',
        confidence: 0.95
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const mockFile = new Blob(['audio data'], { type: 'audio/mpeg' })

      const result = await client.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'mp3'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/ava/voice',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    it('should create an AVA session', async () => {
      const client = createApiClient()
      const mockResponse = { sessionId: 'new-session' }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await client.createSession('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/ava/session/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 'user-1' }),
        })
      )
    })

    it('should get hello message', async () => {
      const client = createApiClient()
      const mockResponse = { content: 'Hello! I am AVA, your travel assistant.' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await client.avaHello('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should get voice synthesis', async () => {
      const client = createApiClient()
      const mockResponse = { voiceUrl: 'https://example.com/voice.mp3' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await client.avaSpeak('Hello world', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })
})
