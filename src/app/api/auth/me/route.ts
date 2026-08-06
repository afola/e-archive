import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, getUserFromToken } from '@/lib/auth/auth-utils'
import { ensureMockApiEnabled } from '@/lib/mock-api-guard'

export async function GET(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      { message: 'Token d\'authentification requis' },
      { status: 401 }
    )
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json(
      { message: 'Token invalide ou expiré' },
      { status: 401 }
    )
  }

  // Get full user data
  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json(
      { message: 'Utilisateur non trouvé ou inactif' },
      { status: 404 }
    )
  }

  // Get role info
  const { db } = await import('@/lib/db')
  const userWithRole = await db.user.findUnique({
    where: { id: user.id },
    include: { 
      role: true,
      agency: true 
    }
  })

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    department: user.department,
    position: user.position,
    roleId: user.roleId,
    roleName: userWithRole?.role?.name,
    agencyId: user.agencyId,
    agencyName: userWithRole?.agency?.name,
    isActive: user.isActive
  })
}
