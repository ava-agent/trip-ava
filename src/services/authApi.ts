import { apiClient as api } from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  user?: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  email: string
  displayName: string
  avatarUrl?: string
  role: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Authentication API service
 */
class AuthApiService {
  private baseUrl = '/api/auth'

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    return response.json()
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Token refresh failed')
    }

    return response.json()
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/api/auth/me')
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get current user')
  }

  /**
   * Logout user (client-side only)
   */
  logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Store auth data
   */
  setAuthData(response: AuthResponse): void {
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user))
    }
  }

  /**
   * Get stored user
   */
  getStoredUser(): UserInfo | null {
    const userJson = localStorage.getItem('user')
    return userJson ? JSON.parse(userJson) : null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const authApi = new AuthApiService()
