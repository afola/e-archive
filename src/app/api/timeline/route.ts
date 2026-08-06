import { NextRequest, NextResponse } from 'next/server'
import { mockArchives, mockMovements, mockWorkflows, mockAuditLogs, mockUsers } from '@/data/mock-data'

// Timeline event types
export interface TimelineEvent {
  id: string
  type: 'document_created' | 'document_modified' | 'document_viewed' | 'document_downloaded' | 
        'document_deleted' | 'workflow_started' | 'workflow_approved' | 'workflow_rejected' | 
        'movement_created' | 'movement_executed' | 'movement_returned'
  entityType: 'archive' | 'workflow' | 'movement'
  entityId: string
  entityReference: string
  entityTitle: string
  actor: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  description: string
  metadata?: Record<string, unknown>
}

// Generate timeline events from mock data
function generateTimelineEvents(
  entityType?: string, 
  entityId?: string, 
  actorId?: string,
  startDate?: string,
  endDate?: string
): TimelineEvent[] {
  const events: TimelineEvent[] = []
  
  // Generate from archives
  mockArchives.forEach(archive => {
    // Filter by entity if specified
    if (entityType === 'archive' && entityId && archive.id !== entityId) return
    if (entityType === 'client' && archive.clientName !== entityId) return
    if (entityType === 'account' && archive.accountNumber !== entityId) return
    
    const creator = mockUsers.find(u => u.id === archive.createdBy) || mockUsers[0]
    const modifier = mockUsers.find(u => u.id === archive.lastModifiedBy) || mockUsers[1]
    
    // Document created event
    events.push({
      id: `evt-arch-create-${archive.id}`,
      type: 'document_created',
      entityType: 'archive',
      entityId: archive.id,
      entityReference: archive.reference,
      entityTitle: archive.title,
      actor: {
        id: creator.id,
        name: creator.name,
      },
      timestamp: archive.createdAt,
      description: `Document créé: ${archive.title}`,
      metadata: {
        type: archive.typeName,
        agency: archive.agencyName,
        clientName: archive.clientName,
      }
    })
    
    // Document modified event (if modified after creation)
    if (archive.updatedAt !== archive.createdAt) {
      events.push({
        id: `evt-arch-mod-${archive.id}`,
        type: 'document_modified',
        entityType: 'archive',
        entityId: archive.id,
        entityReference: archive.reference,
        entityTitle: archive.title,
        actor: {
          id: modifier.id,
          name: modifier.name,
        },
        timestamp: archive.updatedAt,
        description: `Document modifié`,
        metadata: {
          lastAction: archive.lastActionType,
        }
      })
    }
  })
  
  // Generate from workflows
  mockWorkflows.forEach(workflow => {
    if (entityType === 'workflow' && entityId && workflow.id !== entityId) return
    
    const requester = mockUsers.find(u => u.id === workflow.requesterId) || mockUsers[0]
    
    // Workflow started
    events.push({
      id: `evt-wf-start-${workflow.id}`,
      type: 'workflow_started',
      entityType: 'workflow',
      entityId: workflow.id,
      entityReference: workflow.archiveReference || workflow.id,
      entityTitle: workflow.title,
      actor: {
        id: requester.id,
        name: requester.name,
      },
      timestamp: workflow.requestedAt,
      description: `Workflow initié: ${workflow.title}`,
      metadata: {
        workflowType: workflow.type,
        priority: workflow.priority,
      }
    })
    
    // Workflow approved
    if (workflow.approvedByN1) {
      const approver = mockUsers.find(u => u.id === workflow.approvedByN1) || mockUsers[1]
      events.push({
        id: `evt-wf-approve-${workflow.id}`,
        type: 'workflow_approved',
        entityType: 'workflow',
        entityId: workflow.id,
        entityReference: workflow.archiveReference || workflow.id,
        entityTitle: workflow.title,
        actor: {
          id: approver.id,
          name: approver.name,
        },
        timestamp: workflow.approvedAtN1 || workflow.requestedAt,
        description: `Workflow approuvé (N+1)`,
        metadata: {
          comment: workflow.commentN1,
        }
      })
    }
    
    // Workflow rejected
    if (workflow.status === 'REJECTED') {
      const rejector = mockUsers[2]
      events.push({
        id: `evt-wf-reject-${workflow.id}`,
        type: 'workflow_rejected',
        entityType: 'workflow',
        entityId: workflow.id,
        entityReference: workflow.archiveReference || workflow.id,
        entityTitle: workflow.title,
        actor: {
          id: rejector.id,
          name: rejector.name,
        },
        timestamp: workflow.requestedAt,
        description: `Workflow rejeté`,
      })
    }
  })
  
  // Generate from movements
  mockMovements.forEach(movement => {
    if (entityType === 'movement' && entityId && movement.id !== entityId) return
    
    const requester = mockUsers.find(u => u.id === movement.requestedBy) || mockUsers[0]
    
    // Movement created
    events.push({
      id: `evt-mov-create-${movement.id}`,
      type: 'movement_created',
      entityType: 'movement',
      entityId: movement.id,
      entityReference: movement.archiveReference,
      entityTitle: movement.archiveTitle,
      actor: {
        id: requester.id,
        name: requester.name,
      },
      timestamp: movement.requestedAt,
      description: `Mouvement demandé: ${movement.type}`,
      metadata: {
        movementType: movement.type,
        from: movement.fromLocation,
        to: movement.toLocation,
      }
    })
    
    // Movement executed
    if (movement.status === 'EXECUTED' && movement.executedAt) {
      const executor = mockUsers.find(u => u.id === movement.executedBy) || mockUsers[2]
      events.push({
        id: `evt-mov-exec-${movement.id}`,
        type: 'movement_executed',
        entityType: 'movement',
        entityId: movement.id,
        entityReference: movement.archiveReference,
        entityTitle: movement.archiveTitle,
        actor: {
          id: executor.id,
          name: executor.name,
        },
        timestamp: movement.executedAt,
        description: `Mouvement exécuté`,
        metadata: {
          movementType: movement.type,
          receiptNumber: movement.receiptNumber,
        }
      })
    }
  })
  
  // Generate from audit logs for views and downloads
  mockAuditLogs.forEach(log => {
    if (log.action === 'VIEW') {
      events.push({
        id: `evt-view-${log.id}`,
        type: 'document_viewed',
        entityType: 'archive',
        entityId: log.archiveId || log.entityId,
        entityReference: log.archiveReference || '',
        entityTitle: `Consultation document`,
        actor: {
          id: log.userId,
          name: log.userName,
        },
        timestamp: log.createdAt,
        description: log.details,
        metadata: {
          ipAddress: log.ipAddress,
        }
      })
    } else if (log.action === 'DOWNLOAD') {
      events.push({
        id: `evt-download-${log.id}`,
        type: 'document_downloaded',
        entityType: 'archive',
        entityId: log.archiveId || log.entityId,
        entityReference: log.archiveReference || '',
        entityTitle: `Téléchargement document`,
        actor: {
          id: log.userId,
          name: log.userName,
        },
        timestamp: log.createdAt,
        description: log.details,
        metadata: {
          ipAddress: log.ipAddress,
        }
      })
    } else if (log.action === 'DELETE') {
      events.push({
        id: `evt-delete-${log.id}`,
        type: 'document_deleted',
        entityType: log.entityType.toLowerCase() as 'archive',
        entityId: log.entityId,
        entityReference: log.archiveReference || '',
        entityTitle: `Suppression`,
        actor: {
          id: log.userId,
          name: log.userName,
        },
        timestamp: log.createdAt,
        description: log.details,
      })
    }
  })
  
  // Filter by actor if specified
  let filteredEvents = events
  if (actorId) {
    filteredEvents = filteredEvents.filter(e => e.actor.id === actorId || e.actor.name.toLowerCase().includes(actorId.toLowerCase()))
  }
  
  // Filter by date range if specified
  if (startDate) {
    const start = new Date(startDate)
    filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= end)
  }
  
  // Sort by timestamp descending
  return filteredEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

// GET - Get timeline events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entityType') || undefined
    const entityId = searchParams.get('entityId') || undefined
    const actorId = searchParams.get('actor') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const eventTypes = searchParams.get('eventTypes')?.split(',') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let events = generateTimelineEvents(entityType, entityId, actorId, startDate, endDate)
    
    // Filter by event types
    if (eventTypes && eventTypes.length > 0) {
      events = events.filter(e => eventTypes.includes(e.type))
    }
    
    const total = events.length
    const paginatedEvents = events.slice(offset, offset + limit)
    
    return NextResponse.json({
      success: true,
      data: {
        events: paginatedEvents,
        total,
        limit,
        offset,
      }
    })
  } catch (error) {
    console.error('Timeline API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline events' },
      { status: 500 }
    )
  }
}
