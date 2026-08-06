import { NextRequest, NextResponse } from 'next/server'
import { mockArchives } from '@/data/mock-data'

// In-memory store for destruction requests (would be database in production)
const destructionRequests: DestructionRequest[] = []
const destructionCertificates: DestructionCertificate[] = []

interface DestructionRequest {
  id: string
  archiveIds: string[]
  archives: typeof mockArchives
  requestedBy: string
  requestedByName: string
  requestedAt: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED'
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  executedBy?: string
  executedByName?: string
  executedAt?: string
  method?: 'SHRED' | 'INCINERATE' | 'DIGITAL_DELETE' | 'PULP'
  certificateId?: string
}

interface DestructionCertificate {
  id: string
  requestId: string
  archiveIds: string[]
  archives: typeof mockArchives
  destructionDate: string
  method: 'SHRED' | 'INCINERATE' | 'DIGITAL_DELETE' | 'PULP'
  witness: string
  witnessName: string
  operator: string
  operatorName: string
  approvedBy: string
  approvedByName: string
  notes?: string
  createdAt: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')

  if (type === 'certificates') {
    return NextResponse.json({
      certificates: destructionCertificates.slice(-20).reverse()
    })
  }

  // Get pending destruction requests
  const pendingRequests = destructionRequests.filter(r => r.status === 'PENDING')
  const approvedRequests = destructionRequests.filter(r => r.status === 'APPROVED')
  const executedRequests = destructionRequests.filter(r => r.status === 'EXECUTED')

  // Get archives ready for destruction
  const now = new Date()
  const readyForDestruction = mockArchives.filter(archive => {
    const retentionEnd = new Date(archive.retentionEndDate)
    const daysLeft = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 0 && archive.status !== 'DESTROYED' && archive.status !== 'PENDING_DESTRUCTION'
  })

  return NextResponse.json({
    pendingRequests,
    approvedRequests,
    executedRequests,
    readyForDestruction,
    stats: {
      pending: pendingRequests.length,
      approved: approvedRequests.length,
      executed: executedRequests.length,
      readyCount: readyForDestruction.length
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, archiveIds, requestedBy, requestedByName, reason, requestId, method, approvedBy, approvedByName } = body

  if (action === 'create') {
    // Create new destruction request
    const archives = mockArchives.filter(a => archiveIds.includes(a.id))
    const newRequest: DestructionRequest = {
      id: `dest-${Date.now()}`,
      archiveIds,
      archives,
      requestedBy: requestedBy || 'user-1',
      requestedByName: requestedByName || 'Marie Martin',
      requestedAt: new Date().toISOString(),
      reason: reason || 'Fin de durée de conservation',
      status: 'PENDING'
    }
    destructionRequests.push(newRequest)

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: 'Demande de destruction créée avec succès'
    })
  }

  if (action === 'approve' && requestId) {
    // Approve destruction request
    const requestIndex = destructionRequests.findIndex(r => r.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    destructionRequests[requestIndex] = {
      ...destructionRequests[requestIndex],
      status: 'APPROVED',
      approvedBy: approvedBy || 'user-2',
      approvedByName: approvedByName || 'Sophie Petit',
      approvedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      request: destructionRequests[requestIndex],
      message: 'Demande approuvée avec succès'
    })
  }

  if (action === 'execute' && requestId) {
    // Execute destruction and generate certificate
    const requestIndex = destructionRequests.findIndex(r => r.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    const request = destructionRequests[requestIndex]
    const destructionMethod = method || 'SHRED'
    const now = new Date()

    // Create destruction certificate
    const certificate: DestructionCertificate = {
      id: `cert-${Date.now()}`,
      requestId: request.id,
      archiveIds: request.archiveIds,
      archives: request.archives,
      destructionDate: now.toISOString(),
      method: destructionMethod,
      witness: 'user-3',
      witnessName: 'Pierre Bernard',
      operator: request.requestedBy,
      operatorName: request.requestedByName,
      approvedBy: request.approvedBy || 'user-2',
      approvedByName: request.approvedByName || 'Sophie Petit',
      notes: request.reason,
      createdAt: now.toISOString()
    }
    destructionCertificates.push(certificate)

    // Update request
    destructionRequests[requestIndex] = {
      ...request,
      status: 'EXECUTED',
      executedBy: request.requestedBy,
      executedByName: request.requestedByName,
      executedAt: now.toISOString(),
      method: destructionMethod,
      certificateId: certificate.id
    }

    return NextResponse.json({
      success: true,
      request: destructionRequests[requestIndex],
      certificate,
      message: 'Destruction exécutée avec succès'
    })
  }

  if (action === 'reject' && requestId) {
    // Reject destruction request
    const requestIndex = destructionRequests.findIndex(r => r.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    destructionRequests[requestIndex] = {
      ...destructionRequests[requestIndex],
      status: 'REJECTED'
    }

    return NextResponse.json({
      success: true,
      request: destructionRequests[requestIndex],
      message: 'Demande rejetée'
    })
  }

  return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
}
