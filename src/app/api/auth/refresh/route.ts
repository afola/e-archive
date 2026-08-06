import { NextRequest, NextResponse } from 'next/server'
import { mockUsers } from '@/data/mock-data'
import { ensureMockApiEnabled } from '@/lib/mock-api-guard'

export async function POST(request: NextRequest) {
  const disabledResponse = ensureMockApiEnabled()
  if (disabledResponse) {
    return disabledResponse
  }

  const { searchParams } = new URL(request.url)
  const refreshToken = searchParams.get('refreshToken')

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Refresh token requis' },
      { status: 400 }
    )
  }

  try {
    // Parse the refresh token (format: refresh_{userId}_{timestamp})
    const parts = refreshToken.split('_')
    if (parts.length !== 3 || parts[0] !== 'refresh') {
      return NextResponse.json(
        { message: 'Refresh token invalide' },
        { status: 401 }
      )
    }

    const userId = parts[1]
    const user = mockUsers.find(u => u.id === userId)

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Generate new token
    const newToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.roleName,
      exp: Date.now() + 86400000
    })).toString('base64')}`

    return NextResponse.json({
      token: newToken,
      refreshToken,
      expiresIn: 86400000,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roleName: user.roleName,
        agencyId: user.agencyId,
        agencyName: user.agencyName
      }
    })
  } catch {
    return NextResponse.json(
      { message: 'Erreur lors du rafraîchissement' },
      { status: 500 }
    )
  }
}
