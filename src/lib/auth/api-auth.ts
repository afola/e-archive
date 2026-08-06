import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, getUserFromToken, AuthUser } from './auth-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Middleware to protect API routes
 */
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou inactif' },
        { status: 401 }
      )
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user

    return handler(authenticatedRequest)
  }
}

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
export function withOptionalAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    const authenticatedRequest = request as AuthenticatedRequest

    if (token) {
      const user = await getUserFromToken(token)
      if (user) {
        authenticatedRequest.user = user
      }
    }

    return handler(authenticatedRequest)
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return (
    handler: (request: AuthenticatedRequest) => Promise<NextResponse>
  ) => {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        )
      }

      // Get user's role code
      const { db } = await import('@/lib/db')
      const userWithRole = await db.user.findUnique({
        where: { id: request.user.id },
        include: { role: true }
      })

      if (!userWithRole || !allowedRoles.includes(userWithRole.role.code)) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
      }

      return handler(request)
    })
  }
}

/**
 * Check if user has required permission
 */
export function requirePermission(permission: string) {
  return (
    handler: (request: AuthenticatedRequest) => Promise<NextResponse>
  ) => {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        )
      }

      const { db } = await import('@/lib/db')
      const userWithRole = await db.user.findUnique({
        where: { id: request.user.id },
        include: { role: true }
      })

      if (!userWithRole) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 401 }
        )
      }

      const permissions = JSON.parse(userWithRole.role.permissions || '[]')
      
      // Check for wildcard permission or specific permission
      if (!permissions.includes('*') && !permissions.includes(permission)) {
        return NextResponse.json(
          { error: 'Permission non accordée' },
          { status: 403 }
        )
      }

      return handler(request)
    })
  }
}
