import { NextRequest, NextResponse } from 'next/server'
import { mockArchives, archiveTypes } from '@/data/mock-data'

// In-memory store for extension history (would be database in production)
const extensionHistory: ExtensionRecord[] = []

interface ExtensionRecord {
  id: string
  archiveIds: string[]
  previousDate: string
  newDate: string
  reason: string
  extendedBy: string
  extendedByName: string
  extendedAt: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const now = new Date()
  const currentMonth = month ? parseInt(month) : now.getMonth()
  const currentYear = year ? parseInt(year) : now.getFullYear()

  // Calculate retention calendar data
  const calendarData: Record<string, {
    expiring: typeof mockArchives
    expiringThisMonth: number
    expiringIn3Months: number
    expiringIn6Months: number
  }> = {}

  // Get archives by retention status
  const archivesWithDaysLeft = mockArchives.map(archive => {
    const retentionEnd = new Date(archive.retentionEndDate)
    const daysLeft = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { ...archive, daysLeft }
  })

  // Group archives by month for calendar
  archivesWithDaysLeft.forEach(archive => {
    const date = new Date(archive.retentionEndDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!calendarData[key]) {
      calendarData[key] = {
        expiring: [],
        expiringThisMonth: 0,
        expiringIn3Months: 0,
        expiringIn6Months: 0
      }
    }
    calendarData[key].expiring.push(archive)
  })

  // Calculate stats for each month
  Object.keys(calendarData).forEach(key => {
    const [y, m] = key.split('-').map(Number)
    const monthDate = new Date(y, m - 1, 1)
    
    calendarData[key].expiringThisMonth = calendarData[key].expiring.length
    calendarData[key].expiringIn3Months = archivesWithDaysLeft.filter(a => {
      const retentionEnd = new Date(a.retentionEndDate)
      const daysDiff = Math.floor((retentionEnd.getTime() - monthDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff <= 90
    }).length
    calendarData[key].expiringIn6Months = archivesWithDaysLeft.filter(a => {
      const retentionEnd = new Date(a.retentionEndDate)
      const daysDiff = Math.floor((retentionEnd.getTime() - monthDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff <= 180
    }).length
  })

  // Archives expiring soon (by category)
  const expiringThisMonth = archivesWithDaysLeft.filter(a => a.daysLeft > 0 && a.daysLeft <= 30)
  const expiringIn3Months = archivesWithDaysLeft.filter(a => a.daysLeft > 30 && a.daysLeft <= 90)
  const expiringIn6Months = archivesWithDaysLeft.filter(a => a.daysLeft > 90 && a.daysLeft <= 180)
  const expiredArchives = archivesWithDaysLeft.filter(a => a.daysLeft <= 0)

  // Archives ready for destruction
  const readyForDestruction = expiredArchives.filter(a => 
    a.status !== 'DESTROYED' && a.status !== 'PENDING_DESTRUCTION'
  )

  // Upcoming destructions (pending approval)
  const pendingDestruction = archivesWithDaysLeft.filter(a =>
    a.status === 'PENDING_DESTRUCTION'
  )

  // Retention rules by type
  const retentionRules = archiveTypes.map(type => ({
    id: type.id,
    type: type.code,
    typeName: type.name,
    retentionYears: type.retentionYears,
    category: type.category,
    color: type.color,
    archiveCount: mockArchives.filter(a => a.type === type.code).length,
    expiringCount: archivesWithDaysLeft.filter(a => 
      a.type === type.code && a.daysLeft > 0 && a.daysLeft <= 90
    ).length
  }))

  // Statistics
  const stats = {
    totalArchives: mockArchives.length,
    expiringThisMonth: expiringThisMonth.length,
    expiringIn3Months: expiringIn3Months.length,
    expiringIn6Months: expiringIn6Months.length,
    expired: expiredArchives.length,
    readyForDestruction: readyForDestruction.length,
    pendingDestruction: pendingDestruction.length,
    destroyedThisMonth: Math.floor(Math.random() * 10) + 5,
    transferredThisMonth: Math.floor(Math.random() * 8) + 2,
    extendedThisMonth: extensionHistory.filter(e => {
      const extDate = new Date(e.extendedAt)
      return extDate.getMonth() === now.getMonth() && extDate.getFullYear() === now.getFullYear()
    }).length
  }

  return NextResponse.json({
    calendarData,
    archivesWithDaysLeft,
    expiringThisMonth,
    expiringIn3Months,
    expiringIn6Months,
    expiredArchives,
    readyForDestruction,
    pendingDestruction,
    retentionRules,
    extensionHistory: extensionHistory.slice(-10).reverse(),
    stats,
    currentMonth,
    currentYear
  })
}

// POST: Request destruction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { archiveIds, reason, requestedBy, requestedByName } = body

    if (!archiveIds || !Array.isArray(archiveIds) || archiveIds.length === 0) {
      return NextResponse.json({ error: 'archiveIds requis' }, { status: 400 })
    }

    // Find the archives
    const archives = mockArchives.filter(a => archiveIds.includes(a.id))
    
    if (archives.length === 0) {
      return NextResponse.json({ error: 'Aucune archive trouvée' }, { status: 404 })
    }

    // In production, this would create a destruction request in the database
    // and update archive status to PENDING_DESTRUCTION
    
    const destructionRequest = {
      id: `dest-${Date.now()}`,
      archiveIds,
      archives,
      reason: reason || 'Fin de durée de conservation',
      requestedBy: requestedBy || 'user-1',
      requestedByName: requestedByName || 'Marie Martin',
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    }

    return NextResponse.json({
      success: true,
      request: destructionRequest,
      message: 'Demande de destruction créée avec succès'
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT: Extend retention
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { archiveIds, newDate, reason, extendedBy, extendedByName } = body

    if (!archiveIds || !Array.isArray(archiveIds) || archiveIds.length === 0) {
      return NextResponse.json({ error: 'archiveIds requis' }, { status: 400 })
    }

    if (!newDate) {
      return NextResponse.json({ error: 'newDate requis' }, { status: 400 })
    }

    // Find the archives
    const archives = mockArchives.filter(a => archiveIds.includes(a.id))
    
    if (archives.length === 0) {
      return NextResponse.json({ error: 'Aucune archive trouvée' }, { status: 404 })
    }

    // Create extension records
    const extensionRecords: ExtensionRecord[] = archives.map(archive => ({
      id: `ext-${Date.now()}-${archive.id}`,
      archiveIds: [archive.id],
      previousDate: archive.retentionEndDate,
      newDate,
      reason: reason || 'Prolongation de conservation',
      extendedBy: extendedBy || 'user-1',
      extendedByName: extendedByName || 'Marie Martin',
      extendedAt: new Date().toISOString()
    }))

    // In production, this would update the database
    extensionHistory.push(...extensionRecords)

    return NextResponse.json({
      success: true,
      extensions: extensionRecords,
      message: `${archiveIds.length} archive(s) prolongée(s) avec succès`,
      newRetentionDate: newDate
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
