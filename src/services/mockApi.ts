/**
 * Mock API Service - Simplified for AI Digital Human Guide
 * Provides simulated responses for development and testing
 */

import type {
  ApiResponse,
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
} from './api'
import { RecommenderAgent } from './agents/RecommenderAgent'
import { BookingAgent } from './agents/BookingAgent'

// Initialize agents
const recommenderAgent = new RecommenderAgent()
const bookingAgent = new BookingAgent()

/**
 * Utility to simulate network delay
 */
const delay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Generate a random ID
 */
const generateId = () => Math.random().toString(36).substring(2, 15)

/**
 * Mock API Service Class - Simplified for Core Feature
 */
export class MockApiClient {
  /**
   * Send Chat Message - Core Feature
   */
  async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    await delay(1000)

    const message = request.message.toLowerCase()
    let responseText = ''
    let imageUrl: string | null = null

    // 1. Check Booking Intent (Routes, Prices, Planning)
    if (bookingAgent.isBookingIntent(message)) {
      const result = bookingAgent.recommendRoute(message);
      responseText = result.reply;
    }
    // 2. Check Recommendation Intent (Places, Food)
    else {
      const result = recommenderAgent.recommendDestinations(message);

      if (result) {
        responseText = result.reply;
        imageUrl = result.imageUrl;
      } else {
        // Fallback / General Chat
        if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
          responseText = '您好！我是AVA，您的AI旅行向导。很高兴为您服务！请问有什么我可以帮助您的吗？';
        } else if (message.includes('季节') || message.includes('天气') || message.includes('时间')) {
          responseText = '根据我的了解，当地的最佳旅游季节是春秋两季，气候宜人，风景也最美。夏季雨水较多，冬季相对较冷，但游客较少，体验会更安静。';
        } else if (message.includes('住') || message.includes('酒店') || message.includes('客栈')) {
          responseText = '住宿方面，古城内有很多有特色的客栈，环境优雅，服务周到。如果您喜欢安静，也可以考虑住在洱海边的民宿，早晨可以欣赏到美丽的日出。';
        } else {
          responseText = '好的，我已经记录下您的需求。让我为您整理一下，稍后给您一个详细的建议。';
        }
      }
    }

    return {
      success: true,
      data: {
        reply: responseText,
        imageUrl: imageUrl,
        voiceUrl: '/mock/audio/voice.mp3',
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Upload Voice for Speech-to-Text + AI Response
   */
  async uploadVoice(
    request: VoiceRequest
  ): Promise<ApiResponse<VoiceResponse>> {
    await delay(2000)

    const mockTranscriptions = [
      '你好，AVA',
      '我想去云南旅游',
      '帮我推荐一些景点',
      '天气怎么样',
      '有什么好吃的',
      '感谢你的帮助',
    ]

    const transcription = mockTranscriptions[
      Math.floor(Math.random() * mockTranscriptions.length)
    ]

    // Reuse chat logic for simplicity in mock
    const chatResponse = await this.chat({
      sessionId: request.sessionId,
      message: transcription
    });

    return {
      success: true,
      data: {
        transcription,
        confidence: 0.92 + Math.random() * 0.07,
        reply: chatResponse.data?.reply,
        voiceUrl: '/mock/audio/voice.mp3',
      },
    }
  }

  /**
   * AVA Hello Greeting
   */
  async avaHello(): Promise<ApiResponse<{ content: string }>> {
    await delay(500)

    const greetings = [
      '您好！我是AVA，您的AI旅行向导。很高兴为您服务！',
      '欢迎回来！我是AVA，准备好开始您的旅行规划了吗？',
      '你好呀！我是AVA，今天想去哪里探索呢？',
    ]

    return {
      success: true,
      data: {
        content: greetings[Math.floor(Math.random() * greetings.length)],
      },
    }
  }

  /**
   * AVA Voice Synthesis
   */
  async avaSpeak(): Promise<ApiResponse<{ voiceUrl: string }>> {
    await delay(800)

    return {
      success: true,
      data: {
        voiceUrl: '/mock/audio/voice.mp3',
      },
    }
  }

  /**
   * Create Session
   */
  async createSession(): Promise<ApiResponse<{ sessionId: string }>> {
    await delay(200)

    return {
      success: true,
      data: {
        sessionId: generateId(),
      },
    }
  }
}

/**
 * Export singleton instance
 */
export const mockApiClient = new MockApiClient()
