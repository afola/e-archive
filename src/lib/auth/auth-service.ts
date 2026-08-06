import { useAuthStore } from './auth-store'
import type { User } from './auth-store'
import { resolveBackendApiUrl } from '@/lib/backend-api'

export interface LoginResponse {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Authentication service
export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(resolveBackendApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }))
      throw new Error(error.message || 'Échec de l\'authentification')
    }

    return response.json()
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch(resolveBackendApiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Session expirée')
    }

    return response.json()
  },

  logout: async (): Promise<void> => {
    const token = useAuthStore.getState().token
    
    if (token) {
      await fetch(resolveBackendApiUrl('/auth/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {
        // Ignore logout errors
      })
    }
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(resolveBackendApiUrl('/auth/me'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Impossible de récupérer le profil')
    }

    return response.json()
  },
}

// Generic API service with auth
export const apiService = {
  get: async <T>(endpoint: string, token?: string): Promise<T> => {
    const authToken = token || useAuthStore.getState().token
    
    const response = await fetch(resolveBackendApiUrl(endpoint), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        throw new Error('Session expirée')
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    return response.json()
  },

  post: async <T>(endpoint: string, data: unknown, token?: string): Promise<T> => {
    const authToken = token || useAuthStore.getState().token
    
    const response = await fetch(resolveBackendApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        throw new Error('Session expirée')
      }
      const error = await response.json().catch(() => ({ message: 'Erreur' }))
      throw new Error(error.message || `Erreur API: ${response.status}`)
    }

    return response.json()
  },

  put: async <T>(endpoint: string, data: unknown, token?: string): Promise<T> => {
    const authToken = token || useAuthStore.getState().token
    
    const response = await fetch(resolveBackendApiUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        throw new Error('Session expirée')
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    return response.json()
  },

  delete: async <T>(endpoint: string, token?: string): Promise<T> => {
    const authToken = token || useAuthStore.getState().token
    
    const response = await fetch(resolveBackendApiUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout()
        throw new Error('Session expirée')
      }
      throw new Error(`Erreur API: ${response.status}`)
    }

    return response.json()
  },
}
