import { NextRequest, NextResponse } from 'next/server'
import { mockMovements } from '@/data/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const archiveId = searchParams.get('archiveId')

  let filteredMovements = [...mockMovements]

  if (status) {
    filteredMovements = filteredMovements.filter(m => m.status === status)
  }
  if (type) {
    filteredMovements = filteredMovements.filter(m => m.type === type)
  }
  if (archiveId) {
    filteredMovements = filteredMovements.filter(m => m.archiveId === archiveId)
  }

  return NextResponse.json(filteredMovements)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newMovement = {
      id: `movement_${Date.now()}`,
      ...body,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      receiptNumber: `REC-${Date.now()}`
    }
    return NextResponse.json(newMovement, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erreur lors de la création' }, { status: 500 })
  }
}
