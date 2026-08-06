import { NextRequest, NextResponse } from 'next/server'
import { mockArchives, archiveTypes, mockWorkflows, mockUsers } from '@/data/mock-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Calculate metrics
  const now = new Date()
  
  // Filter by date if provided
  const filteredArchives = mockArchives.filter(archive => {
    const archiveDate = new Date(archive.createdAt)
    if (startDate && archiveDate < new Date(startDate)) return false
    if (endDate && archiveDate > new Date(endDate)) return false
    return true
  })

  // Basic metrics
  const totalArchives = mockArchives.length
  const archivesThisMonth = mockArchives.filter(a => {
    const date = new Date(a.createdAt)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  
  const pendingWorkflows = mockWorkflows.filter(w => 
    w.status === 'SUBMITTED' || w.status === 'IN_VALIDATION'
  ).length
  
  const totalStorage = mockArchives.reduce((sum, a) => sum + (a.fileSize || 0), 0)
  
  const documentsExpiring = mockArchives.filter(a => {
    const retentionEnd = new Date(a.retentionEndDate)
    const diffDays = Math.floor((retentionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 90 && diffDays > 0
  }).length
  
  const activeUsers = mockUsers.filter(u => u.isActive).length

  // Trends (simulated)
  const trends = {
    totalArchives: 12,
    archivesThisMonth: 8,
    pendingWorkflows: -5,
    storageUsed: 15,
    documentsExpiring: -3,
    activeUsers: 5,
  }

  // Sparkline data (last 7 data points)
  const sparklines = {
    totalArchives: [850, 875, 892, 910, 925, 945, totalArchives],
    archivesThisMonth: [45, 52, 48, 61, 55, 67, archivesThisMonth],
    pendingWorkflows: [12, 15, 11, 14, 10, 8, pendingWorkflows],
    storageUsed: [120, 125, 128, 132, 138, 142, Math.round(totalStorage / (1024 * 1024 * 1024))],
    documentsExpiring: [25, 28, 22, 20, 18, 15, documentsExpiring],
    activeUsers: [5, 6, 6, 7, 7, 8, activeUsers],
  }

  // Volume chart data (last 12 months + 3 months prediction)
  const volumeData: Array<{ period: string; actual: number }> = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
    const baseCount = Math.floor(40 + Math.random() * 40)
    volumeData.push({
      period: monthName,
      actual: baseCount + Math.floor(i * 2 + Math.random() * 10),
    })
  }

  // Predictions for next 3 months
  const predictions: Array<{ period: string; predicted: number; lower: number; upper: number }> = []
  const lastActual = volumeData[volumeData.length - 1]?.actual || 50
  for (let i = 1; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })
    const predicted = Math.floor(lastActual * (1 + i * 0.05) + Math.random() * 10)
    predictions.push({
      period: monthName,
      predicted,
      lower: Math.floor(predicted * 0.85),
      upper: Math.floor(predicted * 1.15),
    })
  }

  // Type distribution
  const typeDistribution = archiveTypes.map(type => {
    const count = mockArchives.filter(a => a.type === type.code).length
    const total = mockArchives.length
    return {
      name: type.name,
      code: type.code,
      value: count,
      percentage: (count / total) * 100,
      color: type.color,
    }
  })

  // Volume predictions for predictions panel
  const volumePredictions = predictions.map((pred, index) => ({
    month: pred.period,
    predictedVolume: pred.predicted,
    confidenceInterval: {
      lower: pred.lower,
      upper: pred.upper,
    },
    trend: (index === 0 ? 'up' : index === 1 ? 'stable' : 'up') as 'up' | 'down' | 'stable',
    trendPercent: Math.floor(Math.random() * 10 + 2),
  }))

  // Storage recommendations
  const storageRecommendations = [
    {
      type: 'warning' as const,
      title: 'Capacité atteinte à 78%',
      description: 'Prévoir une expansion du stockage dans les 6 prochains mois.',
      action: 'Planifier expansion',
    },
    {
      type: 'info' as const,
      title: 'Optimisation possible',
      description: '15% des documents n\'ont pas été consultés depuis plus de 2 ans.',
      action: 'Voir les suggestions',
    },
    {
      type: 'success' as const,
      title: 'Sauvegardes à jour',
      description: 'Dernière sauvegarde effectuée hier à 23h00.',
    },
  ]

  // Workload predictions
  const workloadPredictions = [
    {
      period: 'Cette semaine',
      expectedWorkload: 145,
      category: 'high' as const,
      staffNeeded: 5,
    },
    {
      period: 'Semaine prochaine',
      expectedWorkload: 98,
      category: 'medium' as const,
      staffNeeded: 4,
    },
    {
      period: 'Dans 2 semaines',
      expectedWorkload: 67,
      category: 'low' as const,
      staffNeeded: 3,
    },
  ]

  // Staffing suggestions
  const staffingSuggestions = [
    {
      role: 'Archivistes',
      currentCount: 3,
      suggestedCount: 4,
      reason: 'Augmentation prévue des entrées',
    },
    {
      role: 'Agents de numérisation',
      currentCount: 2,
      suggestedCount: 2,
      reason: 'Charge actuelle supportable',
    },
    {
      role: 'Gestionnaires workflow',
      currentCount: 2,
      suggestedCount: 3,
      reason: 'Délais de traitement à optimiser',
    },
  ]

  // Activity heatmap data (generate for last 365 days)
  const activityData: Array<{
    date: string
    count: number
    details: {
      created: number
      viewed: number
      downloaded: number
      moved: number
    }
  }> = []
  for (let i = 365; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    // More activity on weekdays
    const baseActivity = dayOfWeek === 0 || dayOfWeek === 6 ? 2 : 10
    const randomActivity = Math.floor(Math.random() * 15)
    const count = baseActivity + randomActivity
    
    if (count > 0) {
      activityData.push({
        date: dateStr,
        count,
        details: {
          created: Math.floor(count * 0.2),
          viewed: Math.floor(count * 0.5),
          downloaded: Math.floor(count * 0.15),
          moved: Math.floor(count * 0.15),
        },
      })
    }
  }

  // Archive types for filters
  const archiveTypesList = archiveTypes.map(type => ({
    code: type.code,
    name: type.name,
    color: type.color,
  }))

  return NextResponse.json({
    metrics: {
      totalArchives,
      archivesThisMonth,
      pendingWorkflows,
      storageUsed: totalStorage,
      documentsExpiring,
      activeUsers,
      trends,
      sparklines,
    },
    volumeData,
    predictions,
    typeDistribution,
    volumePredictions,
    storageRecommendations,
    workloadPredictions,
    staffingSuggestions,
    activityData,
    archiveTypes: archiveTypesList,
  })
}
