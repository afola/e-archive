'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/lib/auth/auth-store'
import { motion } from 'framer-motion'
import { Building2, Loader2 } from 'lucide-react'

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

function LoadingScreen() {
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
          Chargement...
        </p>
      </motion.div>
    </div>
  )
}

// Custom hook for hydration - returns true only on client after hydration
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const mounted = useHydrated()
  
  // Use the auth store's persisted state
  const { token, user, isAuthenticated } = useAuthStore()
  
  // Derive auth state from store
  const hasAuth = isAuthenticated && !!(token && user)
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  // Handle navigation in useEffect
  useEffect(() => {
    if (!mounted) return
    
    if (hasAuth && isPublicRoute) {
      // Already authenticated, redirect to home
      router.push('/')
      return
    }

    if (!hasAuth && !isPublicRoute) {
      // Not authenticated, redirect to login
      router.push('/auth/login')
      return
    }
  }, [mounted, hasAuth, isPublicRoute, router])

  // Show loading during hydration
  if (!mounted) {
    return <LoadingScreen />
  }

  // Public routes don't need the app layout
  if (isPublicRoute) {
    return <>{children}</>
  }

  // If not authenticated on protected route, show loading while redirecting
  if (!hasAuth) {
    return <LoadingScreen />
  }

  // Protected routes use the app layout
  return <AppLayout>{children}</AppLayout>
}
