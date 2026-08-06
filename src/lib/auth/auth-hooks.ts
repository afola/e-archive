'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth/auth-store'
import { resolveBackendApiUrl } from '@/lib/backend-api'

// Routes that require authentication
const protectedRoutes = ['/', '/archives', '/search', '/movements', '/workflows', '/retention', '/audit', '/reports', '/users', '/settings']
// Routes that are public
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

export function useAuthRedirect() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    const hasAuth = checkAuth()
    
    // Get current path
    const currentPath = window.location.pathname
    
    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      currentPath === route || currentPath.startsWith(`${route}/`)
    )
    
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
    
    if (isProtectedRoute && !hasAuth) {
      router.push('/auth/login')
    } else if (isPublicRoute && hasAuth) {
      router.push('/')
    }
  }, [isAuthenticated, router, checkAuth])
}

// Hook to get current user info
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    isAdmin: user?.roleName === 'ADMIN' || user?.roleName === 'Administrateur SI',
    isArchivist: user?.roleName?.includes('ARCHIVIST') || user?.roleName?.includes('Archiviste'),
    isCompliance: user?.roleName === 'COMPLIANCE' || user?.roleName === 'Responsable Conformité',
    isAuditor: user?.roleName === 'AUDITOR' || user?.roleName === 'Auditeur',
    hasPermission: (permission: string) => {
      return user?.permissions?.includes('all') || user?.permissions?.includes(permission)
    },
  }
}

// Hook for API calls with auth
export function useAuthApi() {
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
