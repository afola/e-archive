import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

export interface JWTPayload {
  sub: string
  email: string
  name: string
  roleId: string
  agencyId?: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  username: string
  email: string
  name: string
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
  department?: string | null
  position?: string | null
  agencyId?: string | null
  roleId: string
  isActive: boolean
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Decode a JWT token without verification (for extracting payload)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * Authenticate user by username or email and password
 */
export async function authenticateUser(identifier: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const normalizedIdentifier = identifier.toLowerCase()
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { email: { startsWith: `${normalizedIdentifier}@` } },
        ],
      },
      include: { role: true }
    })

    if (!user || !user.isActive) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const tokenPayload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      agencyId: user.agencyId || undefined,
    }

    const token = generateToken(tokenPayload)

    return {
      user: {
        id: user.id,
        username: user.email.split('@')[0],
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        department: user.department,
        position: user.position,
        agencyId: user.agencyId,
        roleId: user.roleId,
        isActive: user.isActive,
      },
      token,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      include: { role: true }
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      username: user.email.split('@')[0],
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      department: user.department,
      position: user.position,
      agencyId: user.agencyId,
      roleId: user.roleId,
      isActive: user.isActive,
    }
  } catch {
    return null
  }
}

/**
 * Create initial admin user if no users exist
 */
export async function createInitialAdminUser(): Promise<void> {
  try {
    const userCount = await db.user.count()
    
    if (userCount === 0) {
      // Check if admin role exists, create if not
      let adminRole = await db.role.findFirst({
        where: { code: 'ADMIN' }
      })

      if (!adminRole) {
        adminRole = await db.role.create({
          data: {
            name: 'Administrateur',
            code: 'ADMIN',
            description: 'Administrateur système avec tous les droits',
            level: 100,
            permissions: JSON.stringify(['*']),
            isSystem: true,
          }
        })
      }

      // Create default agency
      let defaultAgency = await db.agency.findFirst()
      if (!defaultAgency) {
        defaultAgency = await db.agency.create({
          data: {
            code: 'HQ',
            name: 'Siège Social',
            city: 'Paris',
            isActive: true,
          }
        })
      }

      // Create admin user
      const passwordHash = await hashPassword('Admin@2025!')
      await db.user.create({
        data: {
          email: 'admin@archives-banque.fr',
          name: 'Administrateur',
          firstName: 'Admin',
          lastName: 'System',
          passwordHash,
          roleId: adminRole.id,
          agencyId: defaultAgency.id,
          isActive: true,
        }
      })

      console.log('Initial admin user created: admin@archives-banque.fr / Admin@2025!')
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error)
  }
}
