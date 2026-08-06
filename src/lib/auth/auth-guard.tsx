'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
}

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, token, checkAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
      
      // Check if we have stored auth
      const hasAuth = checkAuth()
      
      if (!hasAuth && !isPublicRoute) {
        // No auth and trying to access protected route
        router.push('/auth/login')
        return
      }
      
      if (hasAuth && isPublicRoute) {
        // Already authenticated and trying to access login page
        router.push('/')
        return
      }
      
      setIsLoading(false)
    }
    
    checkAuthentication()
  }, [pathname, router, checkAuth])

  // Show loading screen while checking auth
  if (isLoading) {
    return <AuthLoadingScreen />
  }

  return <>{children}</>
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-10 w-10 text-blue-600" />
          </motion.div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            Archives Bancaires
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Vérification de l'authentification...
        </p>
      </motion.div>
    </div>
  )
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
