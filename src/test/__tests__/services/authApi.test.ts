import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authApi, LoginRequest, RegisterRequest } from '@/services/authApi'

describe('authApi', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'USER',
  }

  const mockAuthResponse = {
    success: true,
    message: 'Success',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: mockUser,
  }

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAuthResponse),
      } as unknown as Response)

      const request: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      }

      const result = await authApi.login(request)

      expect(result).toEqual(mockAuthResponse)
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
    })

    it('should throw error when login fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Invalid credentials' }),
      } as unknown as Response)

      const request: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      }

      await expect(authApi.login(request)).rejects.toThrow('Invalid credentials')
    })

    it('should throw default error message when no message provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response)

      const request: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      }

      await expect(authApi.login(request)).rejects.toThrow('Login failed')
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAuthResponse),
      } as unknown as Response)

      const request: RegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      }

      const result = await authApi.register(request)

      expect(result).toEqual(mockAuthResponse)
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
    })

    it('should throw error when registration fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Username already exists' }),
      } as unknown as Response)

      const request: RegisterRequest = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
      }

      await expect(authApi.register(request)).rejects.toThrow('Username already exists')
    })

    it('should throw default error message when no message provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response)

      const request: RegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      }

      await expect(authApi.register(request)).rejects.toThrow('Registration failed')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAuthResponse),
      } as unknown as Response)

      const result = await authApi.refreshToken('old-refresh-token')

      expect(result).toEqual(mockAuthResponse)
      expect(fetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
      })
    })

    it('should throw error when token refresh fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Invalid refresh token' }),
      } as unknown as Response)

      await expect(authApi.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token')
    })

    it('should throw default error message when no message provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response)

      await expect(authApi.refreshToken('invalid-token')).rejects.toThrow('Token refresh failed')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        success: true,
        data: mockAuthResponse,
      }
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as unknown as Response)

      // Mock apiClient.get to return the expected format
      const { apiClient } = await import('@/services/api')
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse)

      const result = await authApi.getCurrentUser()

      expect(result).toEqual(mockAuthResponse)
    })

    it('should throw error when getting current user fails', async () => {
      const mockResponse = {
        success: false,
        error: 'Unauthorized',
      }
      const { apiClient } = await import('@/services/api')
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse)

      await expect(authApi.getCurrentUser()).rejects.toThrow('Unauthorized')
    })

    it('should throw default error message when no error provided', async () => {
      const mockResponse = {
        success: false,
      }
      const { apiClient } = await import('@/services/api')
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse)

      await expect(authApi.getCurrentUser()).rejects.toThrow('Failed to get current user')
    })
  })

  describe('logout', () => {
    it('should clear all auth data from localStorage', () => {
      localStorage.setItem('accessToken', 'token')
      localStorage.setItem('refreshToken', 'refresh')
      localStorage.setItem('user', JSON.stringify(mockUser))

      authApi.logout()

      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token')

      const result = authApi.getAccessToken()

      expect(result).toBe('test-token')
    })

    it('should return null when no access token', () => {
      const result = authApi.getAccessToken()

      expect(result).toBeNull()
    })
  })

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refreshToken', 'refresh-token')

      const result = authApi.getRefreshToken()

      expect(result).toBe('refresh-token')
    })

    it('should return null when no refresh token', () => {
      const result = authApi.getRefreshToken()

      expect(result).toBeNull()
    })
  })

  describe('setAuthData', () => {
    it('should store all auth data in localStorage', () => {
      authApi.setAuthData(mockAuthResponse)

      expect(localStorage.getItem('accessToken')).toBe('mock-access-token')
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    })

    it('should not store null values', () => {
      authApi.setAuthData({
        success: true,
        message: 'Success',
      })

      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should store only provided fields', () => {
      authApi.setAuthData({
        success: true,
        message: 'Success',
        accessToken: 'token-only',
      })

      expect(localStorage.getItem('accessToken')).toBe('token-only')
      expect(localStorage.getItem('refreshToken')).toBeNull()
    })
  })

  describe('getStoredUser', () => {
    it('should return parsed user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser))

      const result = authApi.getStoredUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when no user stored', () => {
      const result = authApi.getStoredUser()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('accessToken', 'token')

      const result = authApi.isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when no access token', () => {
      const result = authApi.isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
