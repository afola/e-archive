import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { resolveBackendApiUrl } from '@/lib/backend-api'

export interface User {
  id: string
  username?: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  phone?: string
  department?: string
  position?: string
  agencyId?: string
  agencyName?: string
  roleId?: string
  roleName?: string
  isActive?: boolean
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null, refreshToken?: string | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  refreshAuth: () => Promise<boolean>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token, refreshToken) => set({ 
        token, 
        refreshToken: refreshToken || get().refreshToken,
        isAuthenticated: !!token 
      }),

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(resolveBackendApiUrl('/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || 'Échec de l\'authentification')
          }

          const data = await response.json()
          
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de connexion'
          set({ 
            isLoading: false, 
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
          })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false

        try {
          const response = await fetch(resolveBackendApiUrl('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })

          if (!response.ok) {
            get().logout()
            return false
          }

          const data = await response.json()
          set({
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user,
            isAuthenticated: true,
          })
          return true
        } catch {
          get().logout()
          return false
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      checkAuth: () => {
        const { token, user } = get()
        return !!(token && user)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)

// Helper hook for authenticated API calls
export const useApiClient = () => {
  const { token, logout } = useAuthStore()

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {})
    const targetUrl = /^https?:\/\//i.test(url) ? url : resolveBackendApiUrl(url)
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(targetUrl, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      logout()
      throw new Error('Session expirée')
    }

    return response
  }

  return { fetchWithAuth }
}

export const fetchWithCurrentAuth = async (url: string, options: RequestInit = {}) => {
  const { token, logout } = useAuthStore.getState()
  const headers = new Headers(options.headers || {})
  const targetUrl = /^https?:\/\//i.test(url) ? url : resolveBackendApiUrl(url)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(targetUrl, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    logout()
    throw new Error('Session expirée')
  }

  return response
}
