import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { avaApi } from '@/services/avaApi'

describe('avaApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('chat', () => {
    it('should send chat message successfully', async () => {
      const mockResponse = {
        conversationId: 'test-conv',
        message: {
          role: 'assistant',
          content: 'Hello!',
          timestamp: Date.now(),
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await avaApi.chat({
        message: {
          role: 'user',
          content: 'Hi',
        },
      })

      expect(result.message.content).toBe('Hello!')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should throw error when API fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(
        avaApi.chat({
          message: { role: 'user', content: 'Hi' },
        })
      ).rejects.toThrow('API error')
    })

    it('should use anonymous userId when not provided', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversationId: 'test',
          message: { role: 'assistant', content: 'Hi', timestamp: Date.now() },
        }),
      })

      await avaApi.chat({
        message: { role: 'user', content: 'Hello' },
      })

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.userId).toBe('anonymous')
    })

    it('should include conversation history', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          conversationId: 'test',
          message: { role: 'assistant', content: 'Hi', timestamp: Date.now() },
        }),
      })

      const history = [
        { role: 'user' as const, content: 'Previous message', timestamp: Date.now() },
      ]

      await avaApi.chat({
        message: { role: 'user', content: 'Hello' },
        history,
      })

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.history).toEqual(history)
    })
  })

  describe('hello', () => {
    it('should get greeting message', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'Hello! I am AVA' }),
      })

      const result = await avaApi.hello('user-1')

      expect(result).toBe('Hello! I am AVA')
    })

    it('should throw error when API fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Error',
      })

      await expect(avaApi.hello()).rejects.toThrow()
    })
  })

  describe('voiceChat', () => {
    it('should upload audio and get response', async () => {
      const mockResponse = {
        conversationId: 'test-conv',
        message: {
          role: 'assistant',
          content: 'Voice message received',
          timestamp: Date.now(),
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const result = await avaApi.voiceChat(audioBlob, 'conv-1', 'user-1')

      expect(result.message.content).toBe('Voice message received')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ava/voice'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    it('should throw error when voice chat fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Error',
      })

      const audioBlob = new Blob(['audio'], { type: 'audio/webm' })
      await expect(avaApi.voiceChat(audioBlob)).rejects.toThrow()
    })
  })

  describe('helloVoice', () => {
    it('should get voice greeting URL', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voiceUrl: 'https://example.com/voice.mp3' }),
      })

      const result = await avaApi.helloVoice('user-1', 'Hello!')

      expect(result).toBe('https://example.com/voice.mp3')
    })

    it('should throw error when API fails', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(avaApi.helloVoice('user-1', 'Hello')).rejects.toThrow()
    })
  })
})
