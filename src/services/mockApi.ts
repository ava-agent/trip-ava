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
 * Mock AI Responses for Digital Human Guide
 */
const mockAIResponses = [
  '您好！我是AVA，您的AI旅行向导。很高兴为您服务！请问有什么我可以帮助您的吗？',

  '根据您的描述，我建议您可以考虑以下几个目的地：大理古城、丽江古城，或者香格里拉。每个地方都有其独特的魅力，您更偏向哪种风格的旅行呢？',

  '关于这个行程，我为您规划了一条经典路线：第一天游览古城，感受历史文化；第二天前往洱海边，欣赏自然风光；第三天可以选择去苍山徒步。您觉得这个安排怎么样？',

  '很好！这个问题很有意思。根据我的了解，当地的最佳旅游季节是春秋两季，气候宜人，风景也最美。夏季雨水较多，冬季相对较冷，但游客较少，体验会更安静。',

  '关于美食，我强烈推荐您尝试当地的特色小吃：过桥米线、鲜花饼、烤乳扇等。这些都是不可错过的美味！',

  '好的，我已经记录下您的需求。让我为您整理一下，稍后给您一个详细的建议。',

  '如果您喜欢户外活动，我可以为您推荐一些不错的徒步路线和骑行线路。这些活动能让您更深入地体验当地的风土人情。',

  '住宿方面，古城内有很多有特色的客栈，环境优雅，服务周到。如果您喜欢安静，也可以考虑住在洱海边的民宿，早晨可以欣赏到美丽的日出。',
]

/**
 * Mock API Service Class - Simplified for Core Feature
 */
export class MockApiClient {
  /**
   * Send Chat Message - Core Feature
   */
  async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    await delay(1000)

    // Find a relevant response based on the message
    let response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]

    // Simple keyword matching for more relevant responses
    const message = request.message.toLowerCase()
    if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
      response = mockAIResponses[0]
    } else if (message.includes('推荐') || message.includes('去哪')) {
      response = mockAIResponses[1]
    } else if (message.includes('行程') || message.includes('路线')) {
      response = mockAIResponses[2]
    } else if (message.includes('季节') || message.includes('天气') || message.includes('时间')) {
      response = mockAIResponses[3]
    } else if (message.includes('吃') || message.includes('美食') || message.includes('食物')) {
      response = mockAIResponses[4]
    } else if (message.includes('住') || message.includes('酒店') || message.includes('客栈')) {
      response = mockAIResponses[7]
    }

    return {
      success: true,
      data: {
        reply: response,
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

    // Generate a relevant response
    let response = mockAIResponses[0]
    if (transcription.includes('云南')) {
      response = mockAIResponses[1]
    } else if (transcription.includes('景点') || transcription.includes('推荐')) {
      response = mockAIResponses[2]
    } else if (transcription.includes('天气')) {
      response = mockAIResponses[3]
    } else if (transcription.includes('好吃') || transcription.includes('吃')) {
      response = mockAIResponses[4]
    }

    return {
      success: true,
      data: {
        transcription,
        confidence: 0.92 + Math.random() * 0.07,
        reply: response,
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
