import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, LoginRequest, RegisterRequest, UserInfo } from '@/services/authApi'

export interface AuthState {
  // State
  user: UserInfo | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setUser: (user: UserInfo | null) => void
  refreshAccessToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(credentials)

          if (response.success && response.accessToken) {
            authApi.setAuthData(response)
            set({
              user: response.user || null,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({
              error: response.message || 'Login failed',
              isLoading: false,
            })
            return false
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Login failed',
            isLoading: false,
          })
          return false
        }
      },

      // Register action
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.register(data)

          if (response.success && response.accessToken) {
            authApi.setAuthData(response)
            set({
              user: response.user || null,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({
              error: response.message || 'Registration failed',
              isLoading: false,
            })
            return false
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Registration failed',
            isLoading: false,
          })
          return false
        }
      },

      // Logout action
      logout: () => {
        authApi.logout()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set user
      setUser: (user) => set({ user }),

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) {
          return false
        }

        try {
          const response = await authApi.refreshToken(refreshToken)

          if (response.success && response.accessToken) {
            authApi.setAuthData(response)
            set({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken || refreshToken,
              isAuthenticated: true,
            })
            return true
          } else {
            // Refresh failed, logout user
            get().logout()
            return false
          }
        } catch {
          // Refresh failed, logout user
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize auth state from localStorage on app load
export const initAuth = () => {
  const user = authApi.getStoredUser()
  const token = authApi.getAccessToken()

  if (user && token) {
    useAuthStore.setState({
      user,
      accessToken: token,
      refreshToken: authApi.getRefreshToken(),
      isAuthenticated: true,
    })
  }
}
