import { NextRequest, NextResponse } from 'next/server'
import { mockWorkflows } from '@/data/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const requesterId = searchParams.get('requesterId')

  let filteredWorkflows = [...mockWorkflows]

  if (status) {
    filteredWorkflows = filteredWorkflows.filter(w => w.status === status)
  }
  if (type) {
    filteredWorkflows = filteredWorkflows.filter(w => w.type === type)
  }
  if (requesterId) {
    filteredWorkflows = filteredWorkflows.filter(w => w.requesterId === requesterId)
  }

  return NextResponse.json(filteredWorkflows)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newWorkflow = {
      id: `workflow_${Date.now()}`,
      ...body,
      status: 'DRAFT',
      currentStep: 1,
      totalSteps: 3,
      requestedAt: new Date().toISOString()
    }
    return NextResponse.json(newWorkflow, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erreur lors de la création' }, { status: 500 })
  }
}
