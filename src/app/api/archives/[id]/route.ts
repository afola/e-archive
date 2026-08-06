import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Try to find by ID first, then by reference
  const archive = mockArchives.find(a => a.id === id || a.reference === id)
  
  if (!archive) {
    return NextResponse.json(
      { message: 'Archive non trouvée' },
      { status: 404 }
    )
  }

  return NextResponse.json(archive)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const archive = mockArchives.find(a => a.id === id)
  
  if (!archive) {
    return NextResponse.json({ message: 'Archive non trouvée' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const updatedArchive = {
      ...archive,
      ...body,
      version: archive.version + 1,
      updatedAt: new Date().toISOString()
    }
    return NextResponse.json(updatedArchive)
  } catch {
    return NextResponse.json({ message: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  return NextResponse.json({ message: 'Archive supprimée', id })
}
