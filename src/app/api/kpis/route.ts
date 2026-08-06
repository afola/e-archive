import { NextResponse } from 'next/server'
import { mockKPIData, mockArchives, archiveVolumeByType, archivesByAgency, monthlyMovements } from '@/data/mock-data'

export async function GET() {
  // Calculate real-time KPIs from mock data
  const activeArchives = mockArchives.filter(a => a.status === 'ACTIVE').length
  const onLoanArchives = mockArchives.filter(a => a.status === 'ON_LOAN').length
  const inTransferArchives = mockArchives.filter(a => a.status === 'IN_TRANSFER').length
  const destroyedArchives = mockArchives.filter(a => a.status === 'DESTROYED').length

  // Archives expiring in next 90 days
  const now = new Date()
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const expiringArchives = mockArchives.filter(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    return retentionEnd >= now && retentionEnd <= ninetyDaysFromNow
  }).length

  return NextResponse.json({
    totalArchives: mockArchives.length,
    activeArchives,
    onLoanArchives,
    expiringArchives,
    pendingValidation: mockKPIData.pendingValidation,
    destroyedArchives,
    transferredArchives: inTransferArchives,
    totalMovements: mockKPIData.totalMovements,
    pendingRequests: mockKPIData.pendingRequests,
    archivesByType: archiveVolumeByType,
    archivesByAgency,
    monthlyMovements
  })
}
