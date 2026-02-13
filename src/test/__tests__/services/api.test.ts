import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api'
import { ApiResponse, TravelNoteRequest, TravelNoteResponse } from '@/services/api'

// Mock fetch
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Set default environment
    // @ts-ignore - setting env var for testing
    process.env.VITE_API_BASE_URL = 'http://localhost:8080'
  })

  describe('Configuration', () => {
    it('should have default base URL', () => {
      // @ts-ignore - accessing private property for testing
      expect(apiClient['baseURL']).toBe('http://localhost:8080')
    })

    it('should have default timeout', () => {
      // @ts-ignore - accessing private property for testing
      expect(apiClient['timeout']).toBe(30000)
    })
  })

  describe('Request Method', () => {
    it('should make successful GET request', async () => {
      const mockData = { message: 'Success' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      // @ts-ignore - testing private method
      const result = await apiClient.request('/test', { method: 'GET' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('should make successful POST request', async () => {
      const mockData = { created: true }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      // @ts-ignore - testing private method
      const result = await apiClient.request('/test', {
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
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      })

      // @ts-ignore - testing private method
      const result = await apiClient.request('/test')

      expect(result.success).toBe(false)
      expect(result.error).toContain('404')
    })

    it('should handle network error', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      // @ts-ignore - testing private method
      const result = await apiClient.request('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle timeout', async () => {
      ;(fetch as any).mockImplementationOnce(() =>
        new Promise((resolve) => setTimeout(resolve, 5000))
      )

      // @ts-ignore - testing private method with short timeout
      const shortTimeoutClient = new (apiClient.constructor as any)({
        baseURL: 'http://localhost:8080',
        timeout: 100
      })

      // @ts-ignore
      const result = await shortTimeoutClient.request('/test')

      expect(result.success).toBe(false)
    })
  })

  describe('Travel Note API', () => {
    it('should generate travel note', async () => {
      const mockResponse: TravelNoteResponse = {
        noteId: '123',
        title: 'Test Trip',
        content: 'Test content',
        htmlContent: '<p>Test</p>',
        generatedAt: '2024-01-01'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const request: TravelNoteRequest = {
        sessionId: 'session-1',
        content: 'Test trip content',
        style: 'casual',
        length: 'medium'
      }

      const result = await apiClient.generateTravelNote(request)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/ava/generate/travel-note',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      )
    })
  })

  describe('Poetry API', () => {
    it('should generate poetry', async () => {
      const mockResponse = {
        poemId: '456',
        title: 'Test Poem',
        content: 'Roses are red',
        style: 'modern'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.generatePoetry({
        sessionId: 'session-1',
        theme: 'Love',
        style: 'modern'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('File Upload API', () => {
    it('should upload voice file', async () => {
      const mockResponse = {
        transcription: 'Hello world',
        confidence: 0.95
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const mockFile = new Blob(['audio data'], { type: 'audio/mpeg' })

      const result = await apiClient.uploadVoice({
        sessionId: 'session-1',
        audioData: mockFile,
        format: 'mp3'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should upload image file', async () => {
      const mockResponse = {
        description: 'A beautiful landscape',
        tags: ['mountain', 'lake'],
        landmarks: [],
        suggestions: ['Visit this place']
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const mockFile = new Blob(['image data'], { type: 'image/jpeg' })

      const result = await apiClient.uploadImage({
        sessionId: 'session-1',
        imageData: mockFile,
        position: { lat: 40.7128, lng: -74.0060 }
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('Text and Session APIs', () => {
    it('should submit text', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' })
      })

      const result = await apiClient.submitText('session-1', 'Test text')

      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/upload/text',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ sessionId: 'session-1', text: 'Test text' })
        })
      )
    })

    it('should get trip session', async () => {
      const mockSession = { sessionId: 'session-1', notes: [] }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      })

      const result = await apiClient.getTripSession('session-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSession)
    })

    it('should create trip session', async () => {
      const mockResponse = { sessionId: 'new-session' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.createTripSession('Paris', 'user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('AVA Hello API', () => {
    it('should get hello message', async () => {
      const mockResponse = { content: 'Hello! I am AVA, your travel assistant.' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.avaHello('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should get voice synthesis', async () => {
      const mockResponse = { voiceUrl: 'https://example.com/voice.mp3' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await apiClient.avaSpeak('user-1', 'Hello world')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })
})
