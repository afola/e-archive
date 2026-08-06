import { NextRequest, NextResponse } from 'next/server'
import { mockUsers } from '@/data/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const roleId = searchParams.get('roleId')
  const agencyId = searchParams.get('agencyId')

  let filteredUsers = [...mockUsers]

  if (search) {
    const searchLower = search.toLowerCase()
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    )
  }
  if (roleId) {
    filteredUsers = filteredUsers.filter(u => u.roleId === roleId)
  }
  if (agencyId) {
    filteredUsers = filteredUsers.filter(u => u.agencyId === agencyId)
  }

  // Remove sensitive data
  const safeUsers = filteredUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.avatar,
    department: u.department,
    position: u.position,
    roleName: u.roleName,
    agencyId: u.agencyId,
    agencyName: u.agencyName,
    isActive: u.isActive
  }))

  return NextResponse.json(safeUsers)
}
