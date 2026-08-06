import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const size = parseInt(searchParams.get('size') || '20')
  const status = searchParams.get('status')
  const typeId = searchParams.get('typeId')
  const agencyId = searchParams.get('agencyId')
  const search = searchParams.get('search')

  let filteredArchives = [...mockArchives]

  // Apply filters
  if (status) {
    filteredArchives = filteredArchives.filter(a => a.status === status)
  }
  if (typeId) {
    filteredArchives = filteredArchives.filter(a => a.typeId === typeId)
  }
  if (agencyId) {
    filteredArchives = filteredArchives.filter(a => a.agencyId === agencyId)
  }
  if (search) {
    const searchLower = search.toLowerCase()
    filteredArchives = filteredArchives.filter(a =>
      a.reference.toLowerCase().includes(searchLower) ||
      a.title.toLowerCase().includes(searchLower) ||
      a.clientName?.toLowerCase().includes(searchLower) ||
      a.accountNumber?.toLowerCase().includes(searchLower)
    )
  }

  // Pagination
  const total = filteredArchives.length
  const start = page * size
  const paginatedArchives = filteredArchives.slice(start, start + size)

  return NextResponse.json({
    content: paginatedArchives,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    size,
    number: page,
    first: page === 0,
    last: start + size >= total
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newArchive = {
      id: `archive_${Date.now()}`,
      ...body,
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return NextResponse.json(newArchive, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erreur lors de la création' }, { status: 500 })
  }
}
