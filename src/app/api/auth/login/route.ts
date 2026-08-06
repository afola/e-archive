import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth/auth-utils'
import { ensureMockApiEnabled } from '@/lib/mock-api-guard'

export async function POST(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  try {
    const body = await request.json()
    const username = body.username || body.email
    const { password } = body

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      )
    }

    // Authenticate user
    const result = await authenticateUser(username, password)

    if (!result) {
      return NextResponse.json(
        { message: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      token: result.token,
      refreshToken: `refresh_${result.user.id}_${Date.now()}`,
      expiresIn: 86400000, // 24 hours
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        name: result.user.name,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        avatar: result.user.avatar,
        department: result.user.department,
        position: result.user.position,
        agencyId: result.user.agencyId,
        roleId: result.user.roleId,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
