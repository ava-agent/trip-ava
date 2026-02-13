/**
 * Mock CloudBase JS SDK for testing
 */
import { vi } from 'vitest'

export const mockCloudBaseApp = {
  auth: vi.fn(() => ({
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    persistence: 'local'
  })),
  upload: vi.fn(),
  callFunction: vi.fn(),
  database: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn(),
        orderBy: vi.fn(() => ({
          get: vi.fn()
        })),
        limit: vi.fn(() => ({
          get: vi.fn()
        }))
      })),
      add: vi.fn(),
      doc: vi.fn(() => ({
        update: vi.fn(),
        remove: vi.fn()
      }))
    }))
  }))
}

export const mockCloudBase = {
  init: vi.fn(() => mockCloudBaseApp)
}

// Mock the CloudBase SDK
vi.mock('@cloudbase/js-sdk', () => ({
  default: mockCloudBase
}))

export const mockUploadResponse = {
  fileID: 'mock-file-id',
  requestId: 'mock-request-id'
}

export const mockFunctionResponse = {
  requestId: 'mock-request-id',
  result: {
    success: true,
    data: {}
  }
}
